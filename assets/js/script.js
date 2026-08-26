// =========================================================
// SHOPMAX E-COMMERCE
// CART + PRODUCT MODAL + SEARCH + LOCAL STORAGE
// =========================================================


// =========================================================
// API
// =========================================================

const API_URL =
    "https://fakestoreapi.com/products";

const CART_STORAGE_KEY =
    "shopmax_cart";


// =========================================================
// DOM ELEMENTS
// =========================================================

const flashProducts =
    document.getElementById("flashProducts");

const trendingProducts =
    document.getElementById("trendingProducts");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const categorySelect =
    document.getElementById("categorySelect");


// =========================================================
// CART ELEMENTS
// =========================================================

const cartBtn =
    document.getElementById("cartBtn");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCartBtn =
    document.getElementById("closeCartBtn");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");

const checkoutBtn =
    document.getElementById("checkoutBtn");


// =========================================================
// PRODUCT MODAL ELEMENTS
// =========================================================

const productModal =
    document.getElementById("productModal");

const productModalOverlay =
    document.querySelector(
        ".product-modal-overlay"
    );

const closeProductModal =
    document.getElementById(
        "closeProductModal"
    );

const modalProductImage =
    document.getElementById(
        "modalProductImage"
    );

const modalProductCategory =
    document.getElementById(
        "modalProductCategory"
    );

const modalProductTitle =
    document.getElementById(
        "modalProductTitle"
    );

const modalProductRating =
    document.getElementById(
        "modalProductRating"
    );

const modalProductPrice =
    document.getElementById(
        "modalProductPrice"
    );

const modalProductDescription =
    document.getElementById(
        "modalProductDescription"
    );

const modalQuantity =
    document.getElementById(
        "modalQuantity"
    );

const modalDecrease =
    document.getElementById(
        "modalDecrease"
    );

const modalIncrease =
    document.getElementById(
        "modalIncrease"
    );

const modalAddToCart =
    document.getElementById(
        "modalAddToCart"
    );


// =========================================================
// STATE
// =========================================================

let products = [];

let cart = [];

let selectedProduct = null;

let modalQuantityValue = 1;


// =========================================================
// LOAD CART FROM LOCAL STORAGE
// =========================================================

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_STORAGE_KEY
            );

        if (!saved) {

            return [];

        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        return [];

    }

}


cart = loadCart();


// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Cart saving error:",
            error
        );

    }

}


// =========================================================
// BODY SCROLL CONTROL
// =========================================================

function updateBodyScroll() {

    const modalIsOpen =
        productModal &&
        productModal.classList.contains(
            "show"
        );

    const cartIsOpen =
        cartDrawer &&
        cartDrawer.classList.contains(
            "open"
        );

    if (
        modalIsOpen ||
        cartIsOpen
    ) {

        document.body.style.overflow =
            "hidden";

    } else {

        document.body.style.overflow =
            "";

    }

}


// =========================================================
// FETCH PRODUCTS
// =========================================================

async function fetchProducts() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Failed to fetch products"
            );

        }

        products =
            await response.json();


        // Flash Sale

        displayProducts(
            products.slice(0, 4),
            flashProducts,
            true
        );


        // Trending

        displayProducts(
            products.slice(4, 8),
            trendingProducts,
            false
        );


    } catch (error) {

        console.error(
            "Product fetch error:",
            error
        );


        showProductError(
            flashProducts
        );

        showProductError(
            trendingProducts
        );

    }

}


// =========================================================
// PRODUCT ERROR
// =========================================================

function showProductError(
    container
) {

    if (!container) {

        return;

    }

    container.innerHTML = `

        <p class="no-products">

            Failed to load products.

        </p>

    `;

}


// =========================================================
// DISPLAY PRODUCTS
// =========================================================

function displayProducts(
    productList,
    container,
    isFlashSale = false
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !productList ||
        productList.length === 0
    ) {

        container.innerHTML = `

            <p class="no-products">

                No products found.

            </p>

        `;

        return;

    }


    productList.forEach(
        product => {

            const productCard =
                document.createElement(
                    "article"
                );


            productCard.className =
                "product-card";


            // Random discount

            const discount =
                isFlashSale
                    ? Math.floor(
                        Math.random() * 30
                    ) + 10
                    : 0;


            const oldPrice =
                isFlashSale
                    ? (
                        product.price /
                        (
                            1 -
                            discount / 100
                        )
                    ).toFixed(2)
                    : null;


            productCard.innerHTML = `

                ${
                    isFlashSale
                        ? `

                            <span
                                class="product-badge"
                            >
                                -${discount}%
                            </span>

                        `
                        : ""
                }


                <div
                    class="
                        product-image
                        product-clickable
                    "
                >

                    <img
                        src="${product.image}"
                        alt="${product.title}"
                    >

                </div>


                <div class="product-info">


                    <span
                        class="product-category"
                    >

                        ${product.category}

                    </span>


                    <h3
                        class="
                            product-title
                            product-clickable
                        "
                    >

                        ${product.title}

                    </h3>


                    <div
                        class="product-rating"
                    >

                        ⭐ ${product.rating.rate}

                        <span>

                            (${product.rating.count})

                        </span>

                    </div>


                    <div
                        class="product-price"
                    >

                        <strong>

                            $${product.price.toFixed(2)}

                        </strong>


                        ${
                            oldPrice
                                ? `

                                    <del>

                                        $${oldPrice}

                                    </del>

                                `
                                : ""
                        }

                    </div>


                    <button
                        class="add-cart-btn"
                        type="button"
                    >

                        🛒 Add To Cart

                    </button>


                </div>

            `;


            // =================================================
            // OPEN PRODUCT MODAL
            // =================================================

            productCard.addEventListener(
                "click",
                function () {

                    openProductModal(
                        product
                    );

                }
            );


            // =================================================
            // ADD TO CART BUTTON
            // =================================================

            const addButton =
                productCard.querySelector(
                    ".add-cart-btn"
                );


            if (addButton) {

                addButton.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        addToCart(
                            product,
                            1
                        );

                    }
                );

            }


            container.appendChild(
                productCard
            );

        }
    );

}


// =========================================================
// ADD TO CART
// =========================================================

function addToCart(
    product,
    quantity = 1
) {

    if (!product) {

        return;

    }


    const existingProduct =
        cart.find(
            item =>
                item.id === product.id
        );


    if (existingProduct) {

        existingProduct.quantity +=
            quantity;

    } else {

        cart.push({

            ...product,

            quantity: quantity

        });

    }


    updateCart();

}


// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    renderCart();

    updateCartCount();

    updateCartTotal();

    saveCart();

}


// =========================================================
// UPDATE CART COUNT
// =========================================================

function updateCartCount() {

    if (!cartCount) {

        return;

    }


    const totalItems =
        cart.reduce(
            (
                total,
                product
            ) => {

                return (
                    total +
                    Number(
                        product.quantity || 0
                    )
                );

            },
            0
        );


    cartCount.textContent =
        totalItems;

}


// =========================================================
// UPDATE CART TOTAL
// =========================================================

function updateCartTotal() {

    if (!cartTotal) {

        return;

    }


    const total =
        cart.reduce(
            (
                sum,
                product
            ) => {

                return (
                    sum +
                    (
                        Number(
                            product.price
                        ) *
                        Number(
                            product.quantity
                        )
                    )
                );

            },
            0
        );


    cartTotal.textContent =
        `$${total.toFixed(2)}`;

}


// =========================================================
// RENDER CART
// =========================================================

function renderCart() {

    if (!cartItems) {

        return;

    }


    cartItems.innerHTML = "";


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">


                <div
                    class="empty-cart-icon"
                >

                    🛒

                </div>


                <p>

                    Your cart is empty

                </p>


                <small>

                    Add some products
                    to your cart.

                </small>


            </div>

        `;

        return;

    }


    // =====================================================
    // CART PRODUCTS
    // =====================================================

    cart.forEach(
        product => {

            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div
                    class="cart-item-image"
                >

                    <img
                        src="${product.image}"
                        alt="${product.title}"
                    >

                </div>


                <div
                    class="cart-item-info"
                >


                    <h4>

                        ${product.title}

                    </h4>


                    <p
                        class="cart-item-price"
                    >

                        $${Number(
                            product.price
                        ).toFixed(2)}

                    </p>


                    <div
                        class="
                            cart-item-bottom
                        "
                    >


                        <div
                            class="
                                quantity-controls
                            "
                        >


                            <button
                                class="
                                    quantity-btn
                                    decrease
                                "
                                type="button"
                                aria-label="
                                    Decrease quantity
                                "
                            >

                                −

                            </button>


                            <span>

                                ${product.quantity}

                            </span>


                            <button
                                class="
                                    quantity-btn
                                    increase
                                "
                                type="button"
                                aria-label="
                                    Increase quantity
                                "
                            >

                                +

                            </button>


                        </div>


                        <button
                            class="remove-btn"
                            type="button"
                        >

                            Remove

                        </button>


                    </div>


                </div>

            `;


            // =================================================
            // INCREASE
            // =================================================

            const increaseBtn =
                cartItem.querySelector(
                    ".increase"
                );


            increaseBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    product.quantity++;


                    updateCart();

                }
            );


            // =================================================
            // DECREASE
            // =================================================

            const decreaseBtn =
                cartItem.querySelector(
                    ".decrease"
                );


            decreaseBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        product.quantity > 1
                    ) {

                        product.quantity--;

                    } else {

                        cart =
                            cart.filter(
                                item =>
                                    item.id !==
                                    product.id
                            );

                    }


                    updateCart();

                }
            );


            // =================================================
            // REMOVE
            // =================================================

            const removeBtn =
                cartItem.querySelector(
                    ".remove-btn"
                );


            removeBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    cart =
                        cart.filter(
                            item =>
                                item.id !==
                                product.id
                        );


                    updateCart();

                }
            );


            cartItems.appendChild(
                cartItem
            );

        }
    );

}


// =========================================================
// OPEN CART DRAWER
// =========================================================

function openCart() {

    if (!cartDrawer) {

        return;

    }


    // Close modal first

    closeProductModalFunc();


    cartDrawer.classList.add(
        "open"
    );


    if (cartOverlay) {

        cartOverlay.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "cart-open"
    );


    updateBodyScroll();

}


// =========================================================
// CLOSE CART DRAWER
// =========================================================

function closeCart() {

    if (!cartDrawer) {

        return;

    }


    cartDrawer.classList.remove(
        "open"
    );


    if (cartOverlay) {

        cartOverlay.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "cart-open"
    );


    updateBodyScroll();

}


// =========================================================
// CART BUTTON
// =========================================================

if (cartBtn) {

    cartBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            openCart();

        }
    );

}


// =========================================================
// CLOSE CART BUTTON
// =========================================================

if (closeCartBtn) {

    closeCartBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            closeCart();

        }
    );

}


// =========================================================
// CART OVERLAY
// =========================================================

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        function () {

            closeCart();

        }
    );

}


// =========================================================
// OPEN PRODUCT MODAL
// =========================================================

function openProductModal(
    product
) {

    if (
        !productModal ||
        !product
    ) {

        return;

    }


    selectedProduct =
        product;


    modalQuantityValue =
        1;


    // Quantity

    if (modalQuantity) {

        modalQuantity.textContent =
            "1";

    }


    // Image

    if (modalProductImage) {

        modalProductImage.src =
            product.image;

        modalProductImage.alt =
            product.title;

    }


    // Category

    if (modalProductCategory) {

        modalProductCategory.textContent =
            product.category;

    }


    // Title

    if (modalProductTitle) {

        modalProductTitle.textContent =
            product.title;

    }


    // Rating

    if (modalProductRating) {

        modalProductRating.innerHTML = `

            ⭐ ${product.rating.rate}

            <span>

                (${product.rating.count}
                reviews)

            </span>

        `;

    }


    // Price

    if (modalProductPrice) {

        modalProductPrice.textContent =
            `$${product.price.toFixed(2)}`;

    }


    // Description

    if (modalProductDescription) {

        modalProductDescription.textContent =
            product.description;

    }


    // Close drawer

    closeCart();


    // Open modal

    productModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );


    updateBodyScroll();

}


// =========================================================
// CLOSE PRODUCT MODAL
// =========================================================

function closeProductModalFunc() {

    if (!productModal) {

        return;

    }


    productModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );


    selectedProduct =
        null;


    updateBodyScroll();

}


// =========================================================
// CLOSE MODAL BUTTON
// =========================================================

if (closeProductModal) {

    closeProductModal.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            closeProductModalFunc();

        }
    );

}


// =========================================================
// MODAL OVERLAY
// =========================================================

if (productModalOverlay) {

    productModalOverlay.addEventListener(
        "click",
        function () {

            closeProductModalFunc();

        }
    );

}


// =========================================================
// MODAL INCREASE
// =========================================================

if (modalIncrease) {

    modalIncrease.addEventListener(
        "click",
        function () {

            if (!selectedProduct) {

                return;

            }


            modalQuantityValue++;


            if (modalQuantity) {

                modalQuantity.textContent =
                    modalQuantityValue;

            }

        }
    );

}


// =========================================================
// MODAL DECREASE
// =========================================================

if (modalDecrease) {

    modalDecrease.addEventListener(
        "click",
        function () {

            if (!selectedProduct) {

                return;

            }


            if (
                modalQuantityValue > 1
            ) {

                modalQuantityValue--;

            }


            if (modalQuantity) {

                modalQuantity.textContent =
                    modalQuantityValue;

            }

        }
    );

}


// =========================================================
// MODAL ADD TO CART
// =========================================================

if (modalAddToCart) {

    modalAddToCart.addEventListener(
        "click",
        function () {

            if (!selectedProduct) {

                return;

            }


            addToCart(
                selectedProduct,
                modalQuantityValue
            );


            closeProductModalFunc();


            // Open cart after modal closes

            setTimeout(
                function () {

                    openCart();

                },
                100
            );

        }
    );

}


// =========================================================
// SEARCH PRODUCTS
// =========================================================

function searchProducts() {

    if (
        !searchInput ||
        !categorySelect
    ) {

        return;

    }


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categorySelect.value;


    const filteredProducts =
        products.filter(
            product => {

                const matchesSearch =
                    product.title
                        .toLowerCase()
                        .includes(
                            searchText
                        );


                const matchesCategory =
                    selectedCategory ===
                        "all" ||
                    product.category ===
                        selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displayProducts(
        filteredProducts,
        trendingProducts,
        false
    );

}


// =========================================================
// SEARCH BUTTON
// =========================================================

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            searchProducts();

        }
    );

}


// =========================================================
// SEARCH INPUT
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


// =========================================================
// CATEGORY SELECT
// =========================================================

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        searchProducts
    );

}


// =========================================================
// CHECKOUT
// =========================================================

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        function () {

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty!"
                );

                return;

            }


            alert(
                "Checkout feature coming soon!"
            );

        }
    );

}


// =========================================================
// ESC KEY
// =========================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        // Modal open

        if (
            productModal &&
            productModal.classList.contains(
                "show"
            )
        ) {

            closeProductModalFunc();

            return;

        }


        // Cart open

        if (
            cartDrawer &&
            cartDrawer.classList.contains(
                "open"
            )
        ) {

            closeCart();

        }

    }
);


// =========================================================
// INITIALIZE
// =========================================================

updateCart();

fetchProducts();