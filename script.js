// OUTSTATE — storefront interactions (product grid, filters, bag, newsletter)

// Campaign and product imagery generated with Higgsfield (Z Image).
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3K8xpl0r4adeNSaBL33nZZjExIv/";
const IMAGES = {
  hero: CDN + "hf_20261002_151119_f147db79-05b0-4471-aaf7-49d9dd04636e.png",
  porto: CDN + "hf_20261002_151118_1dcf8435-ac97-49ce-80e0-9e06f01aa643.png",
  tejo: CDN + "hf_20261002_151118_c8a03cf1-b16b-4771-9584-f01fe4d7f153.png",
  nazare: CDN + "hf_20261002_151118_02242106-8daa-41bc-836a-c2353cf8d934.png",
  hoodie: CDN + "hf_20261002_151118_ccaf6b45-9fd6-4ec9-8a0e-1e0df9dfd75f.png",
  tee: CDN + "hf_20261002_151118_e4962753-6161-4902-8512-772469f0a4d1.png",
  cargo: CDN + "hf_20261002_151204_b5d82b52-0765-43ca-9c12-da5b7b5c5825.png",
  track: CDN + "hf_20261002_151118_d8d4d905-1487-4ed1-9b52-b6cf3eaa1460.png",
};

const PRODUCTS = [
  { id: "alfama-hoodie", name: "Alfama Heavyweight Hoodie", color: "Azulejo Cobalt", price: 95, cat: "tops", img: "hoodie", tag: ["New", "new"], swatches: ["#1b3fa0", "#0e0e0c", "#e8e1d3"] },
  { id: "azulejo-tee", name: "Azulejo Back-Print Tee", color: "Cal White", price: 48, cat: "tops", img: "tee", tag: ["Bestseller", ""], swatches: ["#f2ede3", "#0e0e0c"] },
  { id: "tejo-cargo", name: "Tejo Ripstop Cargo", color: "Noite Black", price: 110, cat: "bottoms", img: "cargo", tag: null, swatches: ["#0e0e0c", "#6b6450"] },
  { id: "selecao-track", name: "Seleção Track Jacket", color: "Verde / Vermelho", price: 125, cat: "outer", img: "track", tag: ["Low stock", "low"], swatches: ["#0f5b3a", "#d2342a"] },
];

const SIZES = ["XS", "S", "M", "L", "XL"];
const FREE_SHIP = 150;
const STORE_KEY = "outstate-bag";

const $ = (s, el = document) => el.querySelector(s);
const eur = (n) => "€" + n.toLocaleString("pt-PT");

// Images -------------------------------------------------------------------
document.querySelectorAll("img[data-img]").forEach((img) => {
  img.src = IMAGES[img.dataset.img];
});

// Product grid -------------------------------------------------------------
const grid = $("#productGrid");
grid.innerHTML = PRODUCTS.map((p) => `
  <article class="card reveal" data-cat="${p.cat}">
    <div class="card__media">
      <img src="${IMAGES[p.img]}" alt="${p.name} in ${p.color}" loading="lazy" />
      ${p.tag ? `<span class="card__tag ${p.tag[1] ? "card__tag--" + p.tag[1] : ""}">${p.tag[0]}</span>` : ""}
      <div class="card__sizes" aria-label="Add ${p.name} — choose size">
        ${SIZES.map((s) => `<button data-add="${p.id}" data-size="${s}" aria-label="Add size ${s}">${s}</button>`).join("")}
      </div>
    </div>
    <div class="card__info">
      <h3 class="card__name">${p.name}</h3>
      <span class="card__price">${eur(p.price)}</span>
      <div class="card__sub mono">
        <span>${p.color}</span>
        <span class="swatches">${p.swatches.map((c) => `<i style="background:${c}"></i>`).join("")}</span>
      </div>
    </div>
  </article>`).join("");

// Filters ------------------------------------------------------------------
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    const f = chip.dataset.filter;
    grid.querySelectorAll(".card").forEach((card) => {
      card.hidden = f !== "all" && card.dataset.cat !== f;
    });
  });
});

// Bag ----------------------------------------------------------------------
let bag = [];
try { bag = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { bag = []; }
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(bag)); } catch (e) {} };

const drawer = $("#drawer");
const scrim = $("#scrim");

function openBag() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  scrim.hidden = false;
}
function closeBag() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  scrim.hidden = true;
}

function renderBag() {
  const count = bag.reduce((n, l) => n + l.qty, 0);
  const total = bag.reduce((n, l) => n + l.qty * PRODUCTS.find((p) => p.id === l.id).price, 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = eur(total);
  $("#cartShip").innerHTML = total === 0 ? ""
    : total >= FREE_SHIP ? "<b>✓ Free EU shipping unlocked</b>"
    : `${eur(FREE_SHIP - total)} away from free EU shipping`;

  $("#cartList").innerHTML = bag.length === 0
    ? `<li class="drawer__empty"><p>O saco está vazio.</p><span class="mono">Your bag is empty.</span></li>`
    : bag.map((l, i) => {
        const p = PRODUCTS.find((x) => x.id === l.id);
        return `<li class="line">
          <img src="${IMAGES[p.img]}" alt="" />
          <div>
            <p class="line__name">${p.name}</p>
            <span class="line__meta mono">${p.color} · ${l.size}</span>
            <div class="qty">
              <button data-qty="${i}" data-d="-1" aria-label="Decrease">−</button>
              <span>${l.qty}</span>
              <button data-qty="${i}" data-d="1" aria-label="Increase">+</button>
            </div>
            <button class="line__remove mono" data-remove="${i}">Remove</button>
          </div>
          <span class="mono">${eur(p.price * l.qty)}</span>
        </li>`;
      }).join("");
}

function addToBag(id, size) {
  const line = bag.find((l) => l.id === id && l.size === size);
  if (line) line.qty++;
  else bag.push({ id, size, qty: 1 });
  save();
  renderBag();
  const counter = $("#cartCount");
  counter.classList.remove("bump");
  void counter.offsetWidth;
  counter.classList.add("bump");
  toast(`Added — ${PRODUCTS.find((p) => p.id === id).name}, ${size}`);
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) return addToBag(add.dataset.add, add.dataset.size);

  const q = e.target.closest("[data-qty]");
  if (q) {
    const line = bag[+q.dataset.qty];
    line.qty += +q.dataset.d;
    if (line.qty <= 0) bag.splice(+q.dataset.qty, 1);
    save(); renderBag();
    return;
  }
  const rm = e.target.closest("[data-remove]");
  if (rm) { bag.splice(+rm.dataset.remove, 1); save(); renderBag(); }
});

$("#cartOpen").addEventListener("click", openBag);
$("#cartClose").addEventListener("click", closeBag);
scrim.addEventListener("click", closeBag);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeBag(); });

// Toast --------------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2200);
}

// Newsletter ---------------------------------------------------------------
$("#crewForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#crewNote").textContent = "Obrigado — you're on the list for Drop 04.";
  e.target.reset();
});

// Reveal on scroll ---------------------------------------------------------
document.querySelectorAll(".section-head, .manifesto__inner, .look__item, .story__left, .stats > div, .crew__inner")
  .forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

renderBag();
