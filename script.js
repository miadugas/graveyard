const products = [
  {
    id: "stkr-midnight-moth",
    name: "Midnight Moth Sticker",
    type: "sticker",
    price: 4,
    description: "Glossy vinyl moth decal with weatherproof laminate.",
    details: "Approx. 3 inches tall. Dishwasher-safe vinyl with matte-protective finish.",
  },
  {
    id: "stkr-bone-bouquet",
    name: "Bone Bouquet Sticker",
    type: "sticker",
    price: 5,
    description: "Floral skeleton art for laptops, journals, and water bottles.",
    details: "Approx. 3.5 inches. Printed in rich black with subtle ivory highlights.",
  },
  {
    id: "btn-hollow-heart",
    name: "Hollow Heart Button",
    type: "button",
    price: 3,
    description: "1.5-inch glossy pinback button with crimson line art.",
    details: "Steel pinback. Sealed mylar top coat for scratch resistance.",
  },
  {
    id: "btn-ghost-smile",
    name: "Ghost Smile Button",
    type: "button",
    price: 3,
    description: "Cute haunt-core icon button for bags and denim jackets.",
    details: "1.25-inch pinback. Ultra-lightweight and durable.",
  },
  {
    id: "bundle-night-shift",
    name: "Night Shift Bundle",
    type: "bundle",
    price: 16,
    description: "4 sticker set + 2 buttons curated from this month's drop.",
    details: "Best value pack. Limited batch; once sold out, designs rotate.",
  },
  {
    id: "bundle-gift-pack",
    name: "Tiny Grave Gift Pack",
    type: "bundle",
    price: 22,
    description: "Gift-ready bundle with 6 stickers, 3 buttons, and card insert.",
    details: "Hand-packed in black tissue with signature branded seal.",
  },
];

const state = {
  filter: "all",
  cart: JSON.parse(localStorage.getItem("graveGoodsCart") || "{}"),
};

const productGrid = document.getElementById("product-grid");
const template = document.getElementById("product-card-template");
const filterButtons = document.querySelectorAll(".filter");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartDrawer = document.getElementById("cart-drawer");
const modal = document.getElementById("product-modal");
const modalContent = document.getElementById("modal-content");

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function filteredProducts() {
  if (state.filter === "all") {
    return products;
  }
  return products.filter((product) => product.type === state.filter);
}

function renderProducts() {
  productGrid.innerHTML = "";

  filteredProducts().forEach((product) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".product-type").textContent = product.type;
    node.querySelector("h3").textContent = product.name;
    node.querySelector(".product-desc").textContent = product.description;
    node.querySelector(".product-price").textContent = money(product.price);

    node.querySelector(".quick-view").addEventListener("click", () => openModal(product));
    node.querySelector(".add-cart").addEventListener("click", () => {
      addToCart(product.id, 1);
      openCart();
    });

    productGrid.appendChild(node);
  });
}

function addToCart(id, amount) {
  const current = state.cart[id] || 0;
  const next = current + amount;
  if (next <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = next;
  }
  persistCart();
  renderCart();
}

function persistCart() {
  localStorage.setItem("graveGoodsCart", JSON.stringify(state.cart));
}

function cartRows() {
  return Object.entries(state.cart)
    .map(([id, qty]) => {
      const product = products.find((item) => item.id === id);
      if (!product) {
        return null;
      }
      return {
        id,
        qty,
        product,
        total: product.price * qty,
      };
    })
    .filter(Boolean);
}

function renderCart() {
  const rows = cartRows();
  const count = rows.reduce((sum, row) => sum + row.qty, 0);
  const subtotal = rows.reduce((sum, row) => sum + row.total, 0);

  cartCount.textContent = String(count);
  cartSubtotal.textContent = money(subtotal);

  if (rows.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty. Add something spooky.</p>";
    return;
  }

  cartItems.innerHTML = rows
    .map(
      (row) => `
      <article class="cart-item">
        <strong>${row.product.name}</strong>
        <span>${money(row.product.price)} each</span>
        <div class="qty-controls">
          <button data-id="${row.id}" data-step="-1" aria-label="Decrease quantity">-</button>
          <span>${row.qty}</span>
          <button data-id="${row.id}" data-step="1" aria-label="Increase quantity">+</button>
        </div>
      </article>
    `
    )
    .join("");

  cartItems.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.id, Number(button.dataset.step));
    });
  });
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openModal(product) {
  modalContent.innerHTML = `
    <p class="eyebrow" id="modal-title">${product.type}</p>
    <h3>${product.name}</h3>
    <p>${product.details}</p>
    <p><strong>${money(product.price)}</strong></p>
    <button class="btn btn-primary" id="modal-add">Add to Cart</button>
  `;

  const addButton = modalContent.querySelector("#modal-add");
  addButton.addEventListener("click", () => {
    addToCart(product.id, 1);
    modal.close();
    openCart();
  });

  modal.showModal();
}

function closeModal() {
  modal.close();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderProducts();
  });
});

document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("close-modal").addEventListener("click", closeModal);

document.getElementById("checkout-btn").addEventListener("click", () => {
  alert("Checkout is demo-only right now. Connect Stripe or Shopify to go live.");
});

modal.addEventListener("click", (event) => {
  const box = modal.getBoundingClientRect();
  const inDialog =
    event.clientX >= box.left &&
    event.clientX <= box.right &&
    event.clientY >= box.top &&
    event.clientY <= box.bottom;

  if (!inDialog) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

renderProducts();
renderCart();
