/* ============================================
   KSN Cricket — storefront logic
   ============================================ */

const FREE_DELIVERY_THRESHOLD = 150;
const STORAGE_KEY = "ksn-cricket-cart";

const products = [
  {
    id: "bat-master-blaster",
    name: "Master Blaster Pro",
    category: "Bats",
    price: 189,
    oldPrice: 229,
    rating: 4.9,
    reviews: 214,
    badge: "Sale",
    image: "assets/products/bat-master-blaster.webp",
    desc: "Grade 1 English willow, 1180 g, mid-to-low sweet spot for front-foot players.",
  },
  {
    id: "bat-willow-classic",
    name: "Willow Classic Grade 1",
    category: "Bats",
    price: 249,
    rating: 4.8,
    reviews: 96,
    badge: "Bestseller",
    image: "assets/products/bat-willow-classic.webp",
    desc: "Hand-selected cleft, 8–10 straight grains, pre-knocked in and ready for the middle.",
  },
  {
    id: "bat-t20-slogger",
    name: "T20 Slogger",
    category: "Bats",
    price: 129,
    rating: 4.5,
    reviews: 148,
    badge: "New",
    image: "assets/products/bat-t20-slogger.webp",
    desc: "Grade 2 willow with a low sweet spot and thick edges built for clearing the ropes.",
  },
  {
    id: "ball-match-leather",
    name: "Match Leather Ball",
    category: "Balls",
    price: 54,
    rating: 4.9,
    reviews: 320,
    badge: "Bestseller",
    image: "assets/products/ball-match-leather.webp",
    desc: "Four hand-stitched red leather balls, 156 g, aligned seam for genuine swing.",
  },
  {
    id: "ball-training-pack",
    name: "Training Ball Pack",
    category: "Balls",
    price: 29,
    oldPrice: 39,
    rating: 4.4,
    reviews: 187,
    badge: "Sale",
    image: "assets/products/ball-training-pack.webp",
    desc: "Six synthetic practice balls that hold their shape through a full winter nets block.",
  },
  {
    id: "gloves-keeper-pro",
    name: "Pro Keeper Gloves",
    category: "Gloves",
    price: 79,
    rating: 4.7,
    reviews: 64,
    image: "assets/products/gloves-keeper-pro.webp",
    desc: "Pittard palm with reinforced webbing and a wide cuff for confident standing back.",
  },
  {
    id: "gloves-batting-grip",
    name: "Batting Gloves ProGrip",
    category: "Gloves",
    price: 45,
    rating: 4.6,
    reviews: 132,
    image: "assets/products/gloves-batting-progrip.webp",
    desc: "Sausage-finger padding with a sheepskin palm that stays cool through a long innings.",
  },
  {
    id: "helm-titan",
    name: "Titan Helmet",
    category: "Protective",
    price: 119,
    rating: 4.8,
    reviews: 88,
    badge: "New",
    image: "assets/products/helmet-titan.webp",
    desc: "BS7928:2013 compliant, adjustable titanium grille and a moisture-wicking liner.",
  },
  {
    id: "pads-leg-guard",
    name: "Leg Guard Combo",
    category: "Protective",
    price: 89,
    oldPrice: 110,
    rating: 4.5,
    reviews: 74,
    badge: "Sale",
    image: "assets/products/pads-leg-guard.webp",
    desc: "Lightweight cane-and-foam pads, shaped for lateral movement and quick singles.",
  },
  {
    id: "helm-junior",
    name: "Junior Pro Helmet",
    category: "Protective",
    price: 75,
    rating: 4.6,
    reviews: 53,
    image: "assets/products/helmet-junior.webp",
    desc: "Small-shell junior lid with a fixed grille, sized for under-15 club cricketers.",
  },
  {
    id: "gear-tour-bag",
    name: "Tour Edition Kit Bag",
    category: "Gear",
    price: 139,
    rating: 4.7,
    reviews: 59,
    image: "assets/products/bag-tour.webp",
    desc: "90-litre wheeled bag with a padded bat sleeve and separate wet-boot compartment.",
  },
  {
    id: "gear-club-bag",
    name: "Club Duffle Bag",
    category: "Gear",
    price: 69,
    rating: 4.4,
    reviews: 38,
    image: "assets/products/bag-club.webp",
    desc: "Roomy canvas duffle that swallows pads, whites and a bat without breaking stride.",
  },
  {
    id: "gear-starter-kit",
    name: "Club Starter Kit",
    category: "Gear",
    price: 165,
    oldPrice: 199,
    rating: 4.6,
    reviews: 112,
    badge: "Sale",
    image: "assets/products/kit-starter.webp",
    desc: "Everything for a first season: bat, gloves, pads, helmet and a padded kit bag.",
  },
];

/* ---------- State ---------- */

const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: loadCart(),
};

const categories = ["All", ...new Set(products.map((p) => p.category))];

/* ---------- DOM ---------- */

const els = {
  grid: document.getElementById("product-grid"),
  filters: document.getElementById("filters"),
  results: document.getElementById("results-line"),
  empty: document.getElementById("empty-state"),
  clearFilters: document.getElementById("clear-filters"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  sortSelect: document.getElementById("sort-select"),
  cartCount: document.getElementById("cart-count"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartBody: document.getElementById("cart-body"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartNote: document.getElementById("cart-note"),
  cartOpen: document.getElementById("cart-open"),
  cartClose: document.getElementById("cart-close"),
  cartContinue: document.getElementById("cart-continue"),
  checkout: document.getElementById("checkout-btn"),
  toast: document.getElementById("toast"),
  newsletter: document.getElementById("newsletter-form"),
  newsletterEmail: document.getElementById("newsletter-email"),
  year: document.getElementById("year"),
};

/* ---------- Helpers ---------- */

const money = (value) =>
  value.toLocaleString("en-IN", { style: "currency", currency: "INR" });

const stars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
};

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => products.some((p) => p.id === item.id) && item.qty > 0)
      : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    /* storage may be unavailable — cart still works for this session */
  }
}

let toastTimer;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
}

/* ---------- Catalogue ---------- */

function visibleProducts() {
  const query = state.search.trim().toLowerCase();

  let list = products.filter((product) => {
    const inCategory = state.category === "All" || product.category === state.category;
    const inSearch =
      !query ||
      `${product.name} ${product.category} ${product.desc}`.toLowerCase().includes(query);
    return inCategory && inSearch;
  });

  switch (state.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
    default:
      list = [...list].sort((a, b) => b.reviews - a.reviews);
  }

  return list;
}

function renderFilters() {
  els.filters.innerHTML = categories
    .map(
      (category) => `
        <button
          class="chip${category === state.category ? " is-active" : ""}"
          data-category="${category}"
          aria-pressed="${category === state.category}"
        >${category}</button>`
    )
    .join("");
}

function renderProducts() {
  const list = visibleProducts();

  els.results.textContent = list.length
    ? `Showing ${list.length} of ${products.length} products${
        state.category !== "All" ? ` in ${state.category}` : ""
      }${state.search ? ` for “${state.search}”` : ""}`
    : "";

  els.empty.hidden = list.length > 0;
  els.grid.hidden = list.length === 0;

  els.grid.innerHTML = list
    .map((product) => {
      const badgeClass =
        product.badge === "Sale"
          ? " badge--sale"
          : product.badge === "New"
            ? " badge--new"
            : "";

      return `
        <article class="product-card">
          <div class="product-card__media">
            ${product.badge ? `<span class="badge${badgeClass}">${product.badge}</span>` : ""}
            <img
              class="product-card__photo"
              src="${product.image}"
              alt="${product.name} — ${product.category.toLowerCase()} gear"
              width="800"
              height="600"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="product-card__body">
            <span class="product-card__cat">${product.category}</span>
            <h3 class="product-card__name">${product.name}</h3>
            <p class="product-card__desc">${product.desc}</p>
            <p class="product-card__rating">
              <span class="stars" aria-hidden="true">${stars(product.rating)}</span>
              <span>${product.rating.toFixed(1)} · ${product.reviews} reviews</span>
            </p>
            <div class="product-card__foot">
              <p class="price">
                ${money(product.price)}
                ${product.oldPrice ? `<s>${money(product.oldPrice)}</s>` : ""}
              </p>
              <button class="add-btn" data-add="${product.id}" aria-label="Add ${product.name} to cart">
                Add to cart
              </button>
            </div>
          </div>
        </article>`;
    })
    .join("");
}

/* ---------- Cart ---------- */

function cartDetails() {
  return state.cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return { ...product, qty: item.qty };
  });
}

function cartTotals() {
  const items = cartDetails();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return { count, subtotal };
}

function addToCart(id) {
  const existing = state.cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }

  saveCart();
  renderCart();

  const product = products.find((p) => p.id === id);
  showToast(`${product.name} added to your kit bag`);

  const button = els.grid.querySelector(`[data-add="${id}"]`);
  if (button) {
    button.classList.add("is-added");
    button.textContent = "Added ✓";
    setTimeout(() => {
      button.classList.remove("is-added");
      button.textContent = "Add to cart";
    }, 1200);
  }
}

function changeQty(id, delta) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }

  saveCart();
  renderCart();
}

function removeItem(id) {
  state.cart = state.cart.filter((entry) => entry.id !== id);
  saveCart();
  renderCart();
  showToast("Item removed from your kit bag");
}

function renderCart() {
  const items = cartDetails();
  const { count, subtotal } = cartTotals();

  els.cartCount.textContent = count;
  els.cartCount.classList.toggle("is-empty", count === 0);

  els.cartSubtotal.textContent = money(subtotal);

  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;
  if (items.length === 0) {
    els.cartNote.textContent = `Add ${money(FREE_DELIVERY_THRESHOLD)} more for free delivery.`;
    els.cartNote.classList.remove("is-free");
  } else if (remaining > 0) {
    els.cartNote.textContent = `Add ${money(remaining)} more for free delivery.`;
    els.cartNote.classList.remove("is-free");
  } else {
    els.cartNote.textContent = "Free delivery unlocked ✓";
    els.cartNote.classList.add("is-free");
  }

  els.checkout.disabled = items.length === 0;

  if (items.length === 0) {
    els.cartBody.innerHTML = `
      <div class="cart-empty">
        <span aria-hidden="true">🏏</span>
        <p>Your kit bag is empty.</p>
        <p>Add a bat, a ball or a full starter kit to get going.</p>
      </div>`;
    return;
  }

  els.cartBody.innerHTML = items
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item__media">
          <img src="${item.image}" alt="" width="58" height="58" loading="lazy" />
        </div>
        <div>
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__price">${money(item.price)} each</p>
          <div class="cart-item__controls">
            <button class="qty-btn" data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity of ${item.name}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-qty="${item.id}" data-delta="1" aria-label="Increase quantity of ${item.name}">+</button>
          </div>
        </div>
        <div class="cart-item__right">
          <span class="cart-item__line">${money(item.price * item.qty)}</span>
          <button class="remove-btn" data-remove="${item.id}">Remove</button>
        </div>
      </div>`
    )
    .join("");
}

/* ---------- Drawer ---------- */

let lastFocused = null;

function openCart() {
  lastFocused = document.activeElement;
  els.cartOverlay.hidden = false;
  requestAnimationFrame(() => {
    els.cartOverlay.classList.add("is-open");
    els.cartDrawer.classList.add("is-open");
  });
  els.cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  els.cartClose.focus();
}

function closeCart() {
  els.cartOverlay.classList.remove("is-open");
  els.cartDrawer.classList.remove("is-open");
  els.cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  setTimeout(() => {
    els.cartOverlay.hidden = true;
  }, 260);
  if (lastFocused) lastFocused.focus();
}

/* ---------- Events ---------- */

els.grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

els.filters.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  state.category = chip.dataset.category;
  renderFilters();
  renderProducts();
});

els.cartBody.addEventListener("click", (event) => {
  const qtyButton = event.target.closest("[data-qty]");
  if (qtyButton) {
    changeQty(qtyButton.dataset.qty, Number(qtyButton.dataset.delta));
    return;
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) removeItem(removeButton.dataset.remove);
});

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

els.searchForm.addEventListener("submit", (event) => event.preventDefault());

els.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

els.clearFilters.addEventListener("click", () => {
  state.category = "All";
  state.search = "";
  state.sort = "featured";
  els.searchInput.value = "";
  els.sortSelect.value = "featured";
  renderFilters();
  renderProducts();
});

document.querySelectorAll(".category-card[data-category]").forEach((card) => {
  card.addEventListener("click", () => {
    state.category = card.dataset.category;
    renderFilters();
    renderProducts();
  });
});

els.cartOpen.addEventListener("click", openCart);
els.cartClose.addEventListener("click", closeCart);
els.cartContinue.addEventListener("click", closeCart);
els.cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.cartDrawer.classList.contains("is-open")) {
    closeCart();
  }
});

els.checkout.addEventListener("click", () => {
  const { subtotal } = cartTotals();
  state.cart = [];
  saveCart();
  renderCart();
  closeCart();
  showToast(`Order placed — ${money(subtotal)} · delivery within 24h`);
});

els.newsletter.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast(`You're on the list — confirmation sent to ${els.newsletterEmail.value}`);
  els.newsletter.reset();
});

/* ---------- Init ---------- */

els.year.textContent = new Date().getFullYear();
renderFilters();
renderProducts();
renderCart();