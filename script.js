let cart = [];
let currentPaymentRef = null;
let timerInterval = null;
// shared/data.js
// Default seed data for ChopNow Nigerian Restaurant Menu
const initialMenuItems = [
    
    {
        id: "item_1",
        name: "Party Jollof Rice",
        description: "A classic West African dish made with rice, tomatoes, and spices.",
        vendor: "ChopNow",
        category: "Jollof Rice",
        price:3500,
        rating: 4.5,
        prepTime: "30 minutes",
        description: "A flavorful and spicy rice dish that is perfect for parties and gatherings.",
        image: "images/jollof.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_2",
        name: "Egusi Soup & Pounded Yam",
        vendor: "ChopNow",
        category: "Pounded Yam",
        price: 4000,
        rating: 4.9,
        prepTime: "45 minutes",
        description: "Rich melon seed soup with assorted meats, served with smooth pounded yam.",
        image: "images/egusi.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_3",
        name: "jollof Rice & Chicken",
        vendor: "ChopNow Express",
        category: "Jollof Rice",
        price: 7500,
        rating: 5.0,
        prepTime: "40 minutes",
        description: "Spicy jollof rice served with grilled chicken, a favorite for any occasion.",
        image: "images/jollof and chicken.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_4",
        name: "Special Beef Suya",
        vendor: "ChopNow",
        category: "Suya",
        price: 3000,
        rating: 4.8,
        prepTime: "20 minutes",
        description: "Tender beef skewers marinated in a spicy sauce, perfect for meat lovers.",
        image: "images/suya.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_5",
        name: "Assorted Goat meat & Pepper Soup",
        vendor: "ChopNow",
        category: "Pepper Soup",
        price: 4500,
        rating: 4.7,
        prepTime: "35 minutes",
        description: "A hearty soup made with assorted goat meat and a blend of spices.",
        image: "images/peppersoup.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_6",
        name: "Special Egg Moi Moi",
        vendor: "ChopNow",
        category: "Moi Moi",
        price: 2500,
        rating: 4.6,
        prepTime: "25 minutes",
        description: "Steamed bean pudding with a special egg filling, a traditional Nigerian delicacy.",
        image: "images/moi moi.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_7",
        name: "Special Fried Rice & Salad",
        vendor: "ChopNow",
        category: "Fried Rice",
        price: 5000,
        rating: 4.9,
        prepTime: "30 minutes",
        description: "Delicious fried rice served with a fresh salad, perfect for a light meal.",  
        image: "images/fried Rice.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_8",
        name: "Sweet Fried Plantain",
        vendor: "ChopNow",
        category: "Fried Plantain",
        price: 2000,
        rating: 4.5,
        prepTime: "15 minutes",
        description: "Crispy fried plantain served with a side of your choice.",
        image: "./images/plaintain.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_9",
        name: "Chilled Nigerian Champman",
        vendor: "ChopNow",
        category: "Champman",
        price: 2500,
        rating: 4.8,
        prepTime: "10 minutes",
        description: "A refreshing chilled version of the traditional Nigerian champman.",
        image: "images/chapman.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    },
    {
        id: "item_10",
        name: "Flame BBQ Grilled Chicken",
        vendor: "ChopNow",
        category: "BBQ",
        price: 4500,
        rating: 4.9,
        prepTime: "25 minutes",
        description: "Juicy grilled chicken seasoned with a blend of spices and cooked to perfection.",
        image: "images/BBQ.jpg",
        isFeatured: true,
        isPopular: true,
        status: "available",
        inStock: true
    }
];
// Helper functions for shared local storage managements
const STORAGE_KEY = "chopnow_menu_items";

// Get current menu items (from localStorage if present, else initialize with seed data)
function getMenuItems() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMenuItems));
        return [...initialMenuItems];
    }
    return JSON.parse(data);
}

// Save menu items to localStorage
function saveMenuItems(menuItems) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
}

// Helper to format currency in Nigerian Naira
function formatNaira(amount) {
    return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

document.addEventListener("DOMContentLoaded", () => {
    const foodGrid = document.getElementById("foodGrid");
    if (foodGrid) {
        foodGrid.innerHTML = initialMenuItems.map(item => `
            <div class="food-card">
              <div class="food-img-wrapper">
                <img src="${item.image}" alt="${item.name}">
                <span class="badge">${item.category}</span>
              </div>
              <div class="food-info">
                <h3>${item.name}</h3>
                <p class="desc">${item.description}</p>
                <div class="price-row">
                  <span class="price">₦${Number(item.price).toLocaleString()}</span>
                  <button onclick="addToCart('${item.id}')" class="add-btn">Add to Cart</button>
                </div>
              </div>
            </div>
        `).join("");
    }
});

// script.js - Customer Website Interactivity & Cart Logic
document.addEventListener("DOMContentLoaded", () => {
    // 1. STATE & STORAGE
    let menuItems = getMenuItems();
    let currentCategory = "All";
    let searchQuery = "";

    // DOM Elements
    const foodGrid = document.getElementById("foodGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryPillsContainer = document.getElementById("categoryPills");
    const searchBtn = document.getElementById("searchBtn");
    const openCartBtn = document.getElementById("openCartBtn");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartTotalPrice = document.getElementById("cartTotalPrice");
    const checkoutBtn = document.getElementById("checkoutBtn");

    function openCartDrawer() {
        if (cartOverlay) {
            cartOverlay.classList.add("open");
        }
    }

    function closeCartDrawer() {
        if (cartOverlay) {
            cartOverlay.classList.remove("open");
        }
    }

    if (openCartBtn) {
        openCartBtn.addEventListener("click", openCartDrawer);
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", closeCartDrawer);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", (event) => {
            if (event.target === cartOverlay) {
                closeCartDrawer();
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            handleCheckout();
        });
    }

    // 2. INITIALIZE PAGE
    renderCategories();
    renderMenu();

    // 3. LISTEN FOR LIVE ADMIN UPDATE (Storage Event)
    // This ensures if you edit prices in admin.html, this customer tab updates automatically!
    window.addEventListener("storage", (event) => {
        if (event.key === "chopnow_menu_items") {
            menuItems = getMenuItems();
            renderCategories();
            renderMenu();
        }
    });

    // 4. RENDER CATEGORY PILLS
    function renderCategories() {
        if (!categoryPillsContainer) return;

        const categories = ["All", ...new Set(menuItems.map(item => item.category))];
        categoryPillsContainer.innerHTML = "";

        categories.forEach(cat => {
            const count = cat === "All" ? menuItems.length : menuItems.filter(i => i.category === cat).length;
            const pill = document.createElement("button");
            pill.className = `cat-pill ${currentCategory === cat ? "active" : ""}`;
            pill.innerHTML = `<span>${cat}</span> <span class="count-badge">${count}</span>`;
            pill.addEventListener("click", () => {
                currentCategory = cat;
                renderCategories();
                renderMenu();
            });
            categoryPillsContainer.appendChild(pill);
        });
    }

    // 5. RENDER FOOD CARDS GRID
    function renderMenu() {
        if (!foodGrid) return;

        foodGrid.innerHTML = "";

        const filtered = menuItems.filter(item => {
            if (item.status === "Hidden" || !item.inStock) return false;

            const matchesCategory = currentCategory === "All" || item.category === currentCategory;
            const searchTerm = searchQuery.toLowerCase();
            const matchesSearch = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.vendor.toLowerCase().includes(searchTerm);

            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            foodGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6B7280; padding: 3rem 0;">No delicious meals found matching your search.</p>';
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement("div");
            card.className = "food-card";

            let badgeHTML = "";
            if (item.isFeatured) {
                badgeHTML = '<span class="card-badge">Best Seller</span>';
            } else if (item.isPopular) {
                badgeHTML = '<span class="card-badge popular">Popular</span>';
            }

            card.innerHTML = `
              <div class="food-img-wrapper">
                <img src="${item.image}" alt="${item.name}">
                ${badgeHTML}
              </div>
              <div class="food-info">
                <span class="food-vendor">${item.vendor}</span>
                <h3 class="food-title">${item.name}</h3>
                <p class="food-desc">${item.description}</p>
                <div class="food-footer">
                  <span class="food-price">${formatNaira(item.price)}</span>
                  <div class="food-meta">
                    <span><i class="fa-solid fa-star"></i> ${item.rating}</span>
                    <span><i class="fa-regular fa-clock"></i> ${item.prepTime}</span>
                  </div>
                  <button class="add-to-cart-btn" data-id="${item.id}">Add</button>
                </div>
              </div>
            `;
    // Add to Cart event listener with visual feedback
    const addBtn = card.querySelector(".add-to-cart-btn");
    addBtn.addEventListener("click", () => {
        addToCart(item.id);
        // Change text and background to green temporarily
        addBtn.textContent = "Added👌";
        addBtn.style.backgroundColor = "#10B981";
        //Revert back after 1 second
        setTimeout(() => {
            addBtn.textContent = "Add";
            addBtn.style.backgroundColor = "";
        }, 1000);
            });

            foodGrid.appendChild(card);
        });
    }

    // 6. SEARCH FUNCTIONALITY
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            searchQuery = searchInput.value.trim();
            renderMenu();
        });

        searchInput.addEventListener("keyup", () => {
            searchQuery = searchInput.value.trim();
            renderMenu();
        });
    }

    // 7. SHOPPING CART LOGIC
    function addToCart(itemId) {
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;

        const existing = cart.find(c => c.id === itemId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        updateCartUI();
        openCartDrawer();
    }

    function updateCartUI() {
        if (cartCount) {
            const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalCount;
        }

        if (cartTotalPrice) {
            const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            cartTotalPrice.textContent = formatNaira(totalPrice);
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = "";

            cart.forEach(cartItem => {
                const div = document.createElement("div");
                div.className = "cart-item";
                div.innerHTML = `
                  <img src="${cartItem.image}" alt="${cartItem.name}">
                  <div class="cart-item-details">
                    <div class="cart-item-title">${cartItem.name}</div>
                    <div class="cart-item-price">${formatNaira(cartItem.price)}</div>
                    <div class="cart-item-controls">
                      <button class="qty-btn decrease-btn" data-id="${cartItem.id}">-</button>
                      <span>${cartItem.quantity}</span>
                      <button class="qty-btn increase-btn" data-id="${cartItem.id}">+</button>
                    </div>
                  </div>
                `;

                div.querySelector(".decrease-btn").addEventListener("click", () => {
                    const existingIndex = cart.findIndex(c => c.id === cartItem.id);
                    if (existingIndex !== -1) {
                        cart[existingIndex].quantity -= 1;
                        if (cart[existingIndex].quantity <= 0) {
                            cart.splice(existingIndex, 1);
                        }
                    }
                    updateCartUI();
                });

                div.querySelector(".increase-btn").addEventListener("click", () => {
                    const existingIndex = cart.findIndex(c => c.id === cartItem.id);
                    if (existingIndex !== -1) {
                        cart[existingIndex].quantity += 1;
                    }
                    updateCartUI();
                });

                cartItemsContainer.appendChild(div);
            });
        }
    }
});

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalPrice.textContent = formatNaira(totalPrice);

    cartItemsContainer.innerHTML = "";

    cart.forEach(cartItem => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${cartItem.image}" alt="${cartItem.name}">
          <div class="cart-item-details">
            <div class="cart-item-title">${cartItem.name}</div>
            <div class="cart-item-price">${formatNaira(cartItem.price)}</div>
            <div class="cart-item-controls">
              <button class="qty-btn decrease-btn" data-id="${cartItem.id}">-</button>
              <span>${cartItem.quantity}</span>
              <button class="qty-btn increase-btn" data-id="${cartItem.id}">+</button>
            </div>
          </div>
        `;

        div.querySelector(".decrease-btn").addEventListener("click", () => {
            const existingIndex = cart.findIndex(c => c.id === cartItem.id);
            if (existingIndex !== -1) {
                cart[existingIndex].quantity -= 1;
                if (cart[existingIndex].quantity <= 0) {
                    cart.splice(existingIndex, 1);
                }
            }
            updateCartUI();
        });

        div.querySelector(".increase-btn").addEventListener("click", () => {
            const existingIndex = cart.findIndex(c => c.id === cartItem.id);
            if (existingIndex !== -1) {
                cart[existingIndex].quantity += 1;
            }
            updateCartUI();
        });
        cartItemsContainer.appendChild(div);
    });
    cartTotalPrice.textContent = formatNaira(totalPrice);
}
//Drawer Open/Close Controls
openCartBtn.addEventListener("click", () => openCartDrawer());
closeCartBtn.addEventListener("click", () => closeCartDrawer());
cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) closeCartDrawer();
});
function openCartDrawer() {
    cartOverlay.classList.add("active");
}
function closeCartDrawer() {
    cartOverlay.classList.remove("active");
}
//Checkout Demo Action 
async function handleCheckout() {
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const calculatedTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    try {
        const response = await fetch('/api/initiate-transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                total: calculatedTotal
            })
        });

        const data = await response.json();

        if (data.success) {
            currentPaymentRef = data.refId;
            document.getElementById('payAmount').textContent = `₦${data.amount.toLocaleString()}`;
            document.getElementById('payBank').textContent = data.bankName;
            document.getElementById('payAcctNum').textContent = data.accountNumber;
            document.getElementById('payAcctName').textContent = data.accountName;

            closeCartDrawer();
            document.getElementById('paymentModal').style.display = 'flex';
            startPaymentTimer(data.expiresInSeconds);
        } else {
            alert("Could not initialize transfer.");
        }
    } catch (error) {
        console.error("Error initiating transfer:", error);
        alert("Could not connect to payment server.");
    }
}

function startPaymentTimer(durationSeconds) {
    clearInterval(timerInterval);
    let remaining = durationSeconds;
    const timerEl = document.getElementById('payTimer');

    timerInterval = setInterval(() => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            alert("Payment session expired! Please try checking out again.");
            closePaymentModal();
        }
        remaining--;
    }, 1000);
}

async function confirmBankTransfer() {
    if (!currentPaymentRef) return;

    const btn = document.getElementById('confirmPaymentBtn');
    btn.textContent = "Verifying Transfer...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/confirm-transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refId: currentPaymentRef })
        });

        const data = await response.json();

        if (data.success) {
            clearInterval(timerInterval);
            closePaymentModal();
            alert(`Payment Confirmed!\nYour Order ID is: ${data.orderId}\nUse this ID in 'Track Order' to follow your delivery.`);
            cart = [];
            updateCartUI();
        } else {
            alert(data.error || "Verification failed.");
        }
    } catch (error) {
        console.error("Error confirming payment:", error);
        alert("Could not verify payment with server.");
    } finally {
        btn.textContent = "I Have Sent the Money";
        btn.disabled = false;
    }
}

function closePaymentModal() {
    clearInterval(timerInterval);
    document.getElementById('paymentModal').style.display = 'none';
    currentPaymentRef = null;
}