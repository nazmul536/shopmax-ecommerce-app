// ========================================
// API
// ========================================

const API_URL =
    "https://fakestoreapi.com/products";


// ========================================
// DOM ELEMENTS
// ========================================

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


// ========================================
// CART ELEMENTS
// ========================================

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


// ========================================
// PRODUCT MODAL ELEMENTS
// ========================================

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


// ========================================
// APP DATA
// ========================================

let products = [];

let cart = [];

let selectedProduct = null;

let modalQuantityValue = 1;


// ========================================
// FETCH PRODUCTS
// ========================================

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


        console.log(
            "Products loaded:",
            products
        );


        // =================================
        // FLASH SALE
        // =================================

        displayProducts(
            products.slice(0, 4),
            flashProducts,
            true
        );


        // =================================
        // TRENDING PRODUCTS
        // =================================

        displayProducts(
            products.slice(4, 8),
            trendingProducts,
            false
        );


    } catch (error) {

        console.error(
            "Error fetching products:",
            error
        );

    }

}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts(
    productList,
    container,
    isFlashSale = false
) {

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

            // =================================
            // CREATE CARD
            // =================================

            const productCard =
                document.createElement(
                    "div"
                );


            productCard.className =
                "product-card";


            // =================================
            // DISCOUNT
            // =================================

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


            // =================================
            // BADGE
            // =================================

            const badge =
                isFlashSale
                    ? `

                        <span
                            class="product-badge"
                        >

                            -${discount}%

                        </span>

                    `
                    : "";


            // =================================
            // CARD HTML
            // =================================

            productCard.innerHTML = `

                ${badge}


                <div
                    class="product-image product-clickable"
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
                        class="product-title product-clickable"
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


            // ========================================
            // PRODUCT CARD CLICK
            // ========================================

            productCard.addEventListener(
                "click",
                () => {

                    openProductModal(
                        product
                    );

                }
            );


            // ========================================
            // ADD TO CART BUTTON
            // ========================================

            const addButton =
                productCard.querySelector(
                    ".add-cart-btn"
                );


            addButton.addEventListener(
                "click",
                event => {

                    // IMPORTANT:
                    // Prevent card click
                    // so modal doesn't open.

                    event.stopPropagation();


                    addToCart(
                        product,
                        1
                    );

                }
            );


            // =================================
            // ADD CARD TO CONTAINER
            // =================================

            container.appendChild(
                productCard
            );

        }
    );

}


// ========================================
// ADD TO CART
// ========================================

function addToCart(
    product,
    quantity = 1
) {

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


    console.log(
        "Cart:",
        cart
    );

}


// ========================================
// UPDATE CART
// ========================================

function updateCart() {

    renderCart();

    updateCartCount();

    updateCartTotal();

}


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (
                total,
                product
            ) => {

                return (
                    total +
                    product.quantity
                );

            },
            0
        );


    cartCount.textContent =
        totalItems;

}


// ========================================
// UPDATE CART TOTAL
// ========================================

function updateCartTotal() {

    const total =
        cart.reduce(
            (
                sum,
                product
            ) => {

                return (
                    sum +
                    product.price *
                    product.quantity
                );

            },
            0
        );


    cartTotal.textContent =
        `$${total.toFixed(2)}`;

}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    cartItems.innerHTML = "";


    // =================================
    // EMPTY CART
    // =================================

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">

                    🛒

                </div>


                <p>

                    Your cart is empty.

                </p>


                <small>

                    Add some products
                    to your cart.

                </small>

            </div>

        `;

        return;

    }


    // =================================
    // CART PRODUCTS
    // =================================

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

                        $${product.price.toFixed(2)}

                    </p>


                    <div
                        class="cart-item-bottom"
                    >


                        <div
                            class="quantity-controls"
                        >


                            <button
                                class="quantity-btn decrease"
                                type="button"
                            >

                                −

                            </button>


                            <span>

                                ${product.quantity}

                            </span>


                            <button
                                class="quantity-btn increase"
                                type="button"
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


            // =================================
            // INCREASE
            // =================================

            const increaseBtn =
                cartItem.querySelector(
                    ".increase"
                );


            increaseBtn.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    product.quantity++;


                    updateCart();

                }
            );


            // =================================
            // DECREASE
            // =================================

            const decreaseBtn =
                cartItem.querySelector(
                    ".decrease"
                );


            decreaseBtn.addEventListener(
                "click",
                event => {

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


            // =================================
            // REMOVE
            // =================================

            const removeBtn =
                cartItem.querySelector(
                    ".remove-btn"
                );


            removeBtn.addEventListener(
                "click",
                event => {

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


            // =================================
            // ADD CART ITEM
            // =================================

            cartItems.appendChild(
                cartItem
            );

        }
    );

}


// ========================================
// OPEN CART
// ========================================

function openCart() {

    // Close product modal
    closeProductModalFunc();


    cartDrawer.classList.add(
        "open"
    );


    cartOverlay.classList.add(
        "show"
    );


    document.body.classList.add(
        "cart-open"
    );

}


// ========================================
// CLOSE CART
// ========================================

function closeCart() {

    cartDrawer.classList.remove(
        "open"
    );


    cartOverlay.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "cart-open"
    );

}


// ========================================
// CART BUTTON
// ========================================

cartBtn.addEventListener(
    "click",
    event => {

        event.preventDefault();

        openCart();

    }
);


// ========================================
// CLOSE CART BUTTON
// ========================================

closeCartBtn.addEventListener(
    "click",
    closeCart
);


// ========================================
// CART OVERLAY
// ========================================

cartOverlay.addEventListener(
    "click",
    closeCart
);


// ========================================
// OPEN PRODUCT MODAL
// ========================================

function openProductModal(
    product
) {

    selectedProduct =
        product;


    // =================================
    // RESET QUANTITY
    // =================================

    modalQuantityValue =
        1;


    modalQuantity.textContent =
        modalQuantityValue;


    // =================================
    // IMAGE
    // =================================

    modalProductImage.src =
        product.image;


    modalProductImage.alt =
        product.title;


    // =================================
    // CATEGORY
    // =================================

    modalProductCategory.textContent =
        product.category;


    // =================================
    // TITLE
    // =================================

    modalProductTitle.textContent =
        product.title;


    // =================================
    // RATING
    // =================================

    modalProductRating.textContent =
        `⭐ ${product.rating.rate} (${product.rating.count} reviews)`;


    // =================================
    // PRICE
    // =================================

    modalProductPrice.textContent =
        `$${product.price.toFixed(2)}`;


    // =================================
    // DESCRIPTION
    // =================================

    modalProductDescription.textContent =
        product.description;


    // =================================
    // CLOSE CART FIRST
    // =================================

    closeCart();


    // =================================
    // OPEN MODAL
    // =================================

    productModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


// ========================================
// CLOSE PRODUCT MODAL
// ========================================

function closeProductModalFunc() {

    productModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );


    selectedProduct =
        null;

}


// ========================================
// MODAL CLOSE BUTTON
// ========================================

closeProductModal.addEventListener(
    "click",
    closeProductModalFunc
);


// ========================================
// MODAL OVERLAY
// ========================================

productModalOverlay.addEventListener(
    "click",
    closeProductModalFunc
);


// ========================================
// MODAL INCREASE
// ========================================

modalIncrease.addEventListener(
    "click",
    () => {

        modalQuantityValue++;


        modalQuantity.textContent =
            modalQuantityValue;

    }
);


// ========================================
// MODAL DECREASE
// ========================================

modalDecrease.addEventListener(
    "click",
    () => {

        if (
            modalQuantityValue > 1
        ) {

            modalQuantityValue--;

        }


        modalQuantity.textContent =
            modalQuantityValue;

    }
);


// ========================================
// MODAL ADD TO CART
// ========================================

modalAddToCart.addEventListener(
    "click",
    () => {

        if (!selectedProduct) {

            return;

        }


        addToCart(
            selectedProduct,
            modalQuantityValue
        );


        // Close modal
        closeProductModalFunc();

    }
);


// ========================================
// SEARCH PRODUCTS
// ========================================

function searchProducts() {

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


    // =================================
    // SHOW SEARCH RESULT
    // =================================

    displayProducts(
        filteredProducts,
        trendingProducts,
        false
    );

}


// ========================================
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener(
    "click",
    event => {

        event.preventDefault();

        searchProducts();

    }
);


// ========================================
// SEARCH WHILE TYPING
// ========================================

searchInput.addEventListener(
    "input",
    searchProducts
);


// ========================================
// CATEGORY FILTER
// ========================================

categorySelect.addEventListener(
    "change",
    searchProducts
);


// ========================================
// CHECKOUT
// ========================================

checkoutBtn.addEventListener(
    "click",
    () => {

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


// ========================================
// ESC KEY
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeProductModalFunc();

            closeCart();

        }

    }
);


// ========================================
// INITIALIZE
// ========================================

updateCart();

fetchProducts();