/* =========================================================
   SHOPMAX E-COMMERCE
   COMPLETE FINAL JAVASCRIPT
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://fakestoreapi.com/products";


/* =========================================================
   STATE
========================================================= */

let products = [];

let cart =
    JSON.parse(
        localStorage.getItem("shopmax-cart")
    ) || [];


let wishlist =
    JSON.parse(
        localStorage.getItem("shopmax-wishlist")
    ) || [];


/*
   Remove duplicate wishlist IDs
*/

wishlist = [
    ...new Set(wishlist)
];


let modalQuantity = 1;

let currentModalProduct = null;


/* =========================================================
   PRODUCT DOM
========================================================= */

const flashProducts =
    document.getElementById(
        "flashProducts"
    );


const trendingProducts =
    document.getElementById(
        "trendingProducts"
    );


/* =========================================================
   SEARCH DOM
========================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


const searchBtn =
    document.getElementById(
        "searchBtn"
    );


const categorySelect =
    document.getElementById(
        "categorySelect"
    );


/* =========================================================
   CATEGORY DOM
========================================================= */

const categoriesBtn =
    document.getElementById(
        "categoriesBtn"
    );


const categoryDropdown =
    document.getElementById(
        "categoryDropdown"
    );


/* =========================================================
   CART DOM
========================================================= */

const cartBtn =
    document.getElementById(
        "cartBtn"
    );


const cartCount =
    document.getElementById(
        "cartCount"
    );


const cartDrawer =
    document.getElementById(
        "cartDrawer"
    );


const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );


const closeCartBtn =
    document.getElementById(
        "closeCartBtn"
    );


const cartItems =
    document.getElementById(
        "cartItems"
    );


const cartTotal =
    document.getElementById(
        "cartTotal"
    );


const checkoutBtn =
    document.getElementById(
        "checkoutBtn"
    );


/* =========================================================
   WISHLIST DOM
========================================================= */

const wishlistHeader =
    document.getElementById(
        "wishlistHeader"
    );


const wishlistDrawer =
    document.getElementById(
        "wishlistDrawer"
    );


const wishlistOverlay =
    document.getElementById(
        "wishlistOverlay"
    );


const closeWishlistBtn =
    document.getElementById(
        "closeWishlistBtn"
    );


const wishlistItems =
    document.getElementById(
        "wishlistItems"
    );


const wishlistCountText =
    document.getElementById(
        "wishlistCountText"
    );


/* =========================================================
   PRODUCT MODAL DOM
========================================================= */

const productModal =
    document.getElementById(
        "productModal"
    );


const productModalOverlay =
    document.getElementById(
        "productModalOverlay"
    );


const closeProductModalBtn =
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


const modalQuantityEl =
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


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        updateCart();

        updateWishlistCount();

        renderWishlist();

        setupSearch();

        setupCategoryMenu();

        setupCategoryCards();

        setupCart();

        setupWishlist();

        setupModal();

        startCountdown();

    }
);


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    showLoading(
        flashProducts
    );

    showLoading(
        trendingProducts
    );


    try {

        const response =
            await fetch(
                API_URL
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch products"
            );

        }


        products =
            await response.json();


        renderFlashProducts(
            products.slice(0, 4)
        );


        renderTrendingProducts(
            products.slice(4, 8)
        );


        renderWishlist();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        showError(
            flashProducts
        );

        showError(
            trendingProducts
        );

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        container.innerHTML += `

            <div class="product-card">

                <div
                    class="product-image"
                    style="
                        background:#f1f5f9;
                        animation:
                            shopmaxPulse
                            1.3s
                            infinite;
                    "
                ></div>


                <div class="product-info">

                    <div
                        style="
                            height:8px;
                            width:45%;
                            background:#e2e8f0;
                            border-radius:5px;
                            margin-bottom:10px;
                        "
                    ></div>


                    <div
                        style="
                            height:10px;
                            width:90%;
                            background:#e2e8f0;
                            border-radius:5px;
                            margin-bottom:8px;
                        "
                    ></div>


                    <div
                        style="
                            height:34px;
                            width:100%;
                            background:#e2e8f0;
                            border-radius:5px;
                        "
                    ></div>

                </div>

            </div>

        `;

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            style="
                grid-column:1/-1;
                padding:60px 20px;
                text-align:center;
            "
        >

            <i
                class="
                    fa-solid
                    fa-circle-exclamation
                "
                style="
                    color:#ef4444;
                    font-size:32px;
                    margin-bottom:12px;
                "
            ></i>


            <h3>
                Unable to load products
            </h3>


            <p
                style="
                    color:#64748b;
                    font-size:12px;
                    margin-top:6px;
                "
            >
                Please refresh the page.
            </p>

        </div>

    `;

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(
    product,
    index
) {

    const rating =
        product.rating?.rate || 4.2;


    const reviewCount =
        product.rating?.count || 100;


    const discounts = [
        25,
        21,
        19,
        14,
        27,
        18,
        22,
        16
    ];


    const discount =
        discounts[
            index %
            discounts.length
        ];


    const oldPrice =
        product.price /
        (
            1 -
            discount / 100
        );


    const liked =
        wishlist.includes(
            product.id
        );


    return `

        <article
            class="product-card"
        >

            <div
                class="product-image"
                data-action="view"
                data-id="${product.id}"
            >

                <span
                    class="product-badge"
                >
                    -${discount}%
                </span>


                <img
                    src="${product.image}"
                    alt="${escapeHTML(
                        product.title
                    )}"
                    loading="lazy"
                >


                <div
                    class="product-actions"
                >

                    <button
                        type="button"
                        class="
                            product-action-btn
                            ${
                                liked
                                    ? "wishlisted"
                                    : ""
                            }
                        "
                        data-action="wishlist"
                        data-id="${product.id}"
                        aria-label="${
                            liked
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                        }"
                    >

                        <i
                            class="
                                ${
                                    liked
                                        ? "fa-solid"
                                        : "fa-regular"
                                }
                                fa-heart
                            "
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="product-action-btn"
                        data-action="view"
                        data-id="${product.id}"
                        aria-label="View product"
                    >

                        <i
                            class="
                                fa-regular
                                fa-eye
                            "
                        ></i>

                    </button>

                </div>

            </div>


            <div
                class="product-info"
            >

                <span
                    class="product-category"
                >
                    ${formatCategory(
                        product.category
                    )}
                </span>


                <h3
                    class="product-title"
                    data-action="view"
                    data-id="${product.id}"
                >
                    ${escapeHTML(
                        product.title
                    )}
                </h3>


                <div
                    class="product-rating"
                >

                    <i
                        class="
                            fa-solid
                            fa-star
                        "
                    ></i>

                    ${rating}


                    <span>
                        (${reviewCount})
                    </span>

                </div>


                <div
                    class="product-price"
                >

                    <strong>
                        $${product.price.toFixed(2)}
                    </strong>


                    <del>
                        $${oldPrice.toFixed(2)}
                    </del>

                </div>


                <button
                    type="button"
                    class="add-cart-btn"
                    data-action="cart"
                    data-id="${product.id}"
                >

                    <i
                        class="
                            fa-solid
                            fa-cart-plus
                        "
                    ></i>

                    Add To Cart

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   FLASH PRODUCTS
========================================================= */

function renderFlashProducts(
    list
) {

    if (!flashProducts) {
        return;
    }


    if (
        !list ||
        list.length === 0
    ) {

        flashProducts.innerHTML =
            noProductsHTML();

        return;

    }


    flashProducts.innerHTML =
        list
            .map(
                (
                    product,
                    index
                ) =>
                    createProductCard(
                        product,
                        index
                    )
            )
            .join("");


    attachProductEvents(
        flashProducts
    );

}


/* =========================================================
   TRENDING PRODUCTS
========================================================= */

function renderTrendingProducts(
    list
) {

    if (!trendingProducts) {
        return;
    }


    if (
        !list ||
        list.length === 0
    ) {

        trendingProducts.innerHTML =
            noProductsHTML();

        return;

    }


    trendingProducts.innerHTML =
        list
            .map(
                (
                    product,
                    index
                ) =>
                    createProductCard(
                        product,
                        index + 4
                    )
            )
            .join("");


    attachProductEvents(
        trendingProducts
    );

}


/* =========================================================
   PRODUCT EVENTS
========================================================= */

function attachProductEvents(
    container
) {

    if (!container) {
        return;
    }


    container
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    handleProductAction
                );

            }
        );

}


/* =========================================================
   PRODUCT ACTION
========================================================= */

function handleProductAction(
    event
) {

    event.stopPropagation();


    const action =
        this.dataset.action;


    const id =
        Number(
            this.dataset.id
        );


    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {
        return;
    }


    if (
        action === "cart"
    ) {

        addToCart(
            product,
            1
        );

    }


    if (
        action === "wishlist"
    ) {

        toggleWishlist(
            id
        );

    }


    if (
        action === "view"
    ) {

        openProductModal(
            product
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    searchInput?.addEventListener(
        "input",
        filterProducts
    );


    searchInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                filterProducts();

            }

        }
    );


    searchBtn?.addEventListener(
        "click",
        filterProducts
    );


    categorySelect?.addEventListener(
        "change",
        filterProducts
    );

}


/* =========================================================
   FILTER
========================================================= */

function filterProducts() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        categorySelect
            ? categorySelect.value
            : "all";


    const filtered =
        products.filter(
            product => {

                const title =
                    product.title
                        .toLowerCase();


                const categoryName =
                    product.category
                        .toLowerCase();


                const searchMatch =
                    !search ||
                    title.includes(
                        search
                    ) ||
                    categoryName.includes(
                        search
                    );


                const categoryMatch =
                    category === "all" ||
                    product.category ===
                        category;


                return (
                    searchMatch &&
                    categoryMatch
                );

            }
        );


    renderFlashProducts(
        filtered.slice(0, 4)
    );


    renderTrendingProducts(
        filtered.slice(4, 8)
    );

}


/* =========================================================
   CATEGORY MENU
   DESKTOP:
   - All Categories click opens main menu
   - Submenu hover handled by CSS

   MOBILE:
   - All Categories click opens menu
   - Electronics/Fashion click opens submenu below
========================================================= */

function setupCategoryMenu() {

    if (
        !categoriesBtn ||
        !categoryDropdown
    ) {
        return;
    }


    /* =====================================================
       ALL CATEGORIES BUTTON
    ===================================================== */

    categoriesBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();


            const isOpen =
                categoryDropdown.classList.contains(
                    "show"
                );


            if (isOpen) {

                closeCategoryMenu();

            } else {

                categoryDropdown.classList.add(
                    "show"
                );

                categoriesBtn.classList.add(
                    "active"
                );

            }

        }
    );


    /* =====================================================
       CATEGORY DROPDOWN
    ===================================================== */

    categoryDropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            /*
               Parent category button
            */

            const categoryButton =
                event.target.closest(
                    ".category-item > button"
                );


            if (categoryButton) {

                const item =
                    categoryButton.closest(
                        ".category-item"
                    );


                if (!item) {
                    return;
                }


                const submenu =
                    item.querySelector(
                        ":scope > .category-submenu"
                    );


                /* =========================================
                   MOBILE SUBMENU
                ========================================= */

                if (
                    submenu &&
                    window.innerWidth <= 768
                ) {

                    event.preventDefault();


                    /*
                       Close other open submenus
                    */

                    categoryDropdown
                        .querySelectorAll(
                            ".category-item.mobile-open"
                        )
                        .forEach(
                            openItem => {

                                if (
                                    openItem !== item
                                ) {

                                    openItem.classList.remove(
                                        "mobile-open"
                                    );

                                }

                            }
                        );


                    /*
                       Toggle current submenu
                    */

                    item.classList.toggle(
                        "mobile-open"
                    );


                    return;

                }


                /* =========================================
                   CATEGORY WITH NO SUBMENU
                ========================================= */

                const category =
                    categoryButton.dataset.category;


                if (
                    category &&
                    category !== "all"
                ) {

                    selectHomeCategory(
                        category
                    );

                    closeCategoryMenu();

                }

                return;

            }


            /* =================================================
               SUBMENU LINKS
            ================================================= */

            const submenuLink =
                event.target.closest(
                    ".category-submenu a[data-category]"
                );


            if (submenuLink) {

                event.preventDefault();


                const category =
                    submenuLink.dataset.category;


                if (!category) {
                    return;
                }


                selectHomeCategory(
                    category
                );


                closeCategoryMenu();

            }

        }
    );


    /* =====================================================
       OUTSIDE CLICK
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                categoryDropdown.contains(
                    event.target
                )
            ) {
                return;
            }


            if (
                categoriesBtn.contains(
                    event.target
                )
            ) {
                return;
            }


            closeCategoryMenu();

        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 768
            ) {

                closeAllMobileSubmenus();

            }

        }
    );

}


/* =========================================================
   SELECT HOME CATEGORY
========================================================= */

function selectHomeCategory(
    category
) {

    if (!category) {
        return;
    }


    if (
        categorySelect
    ) {

        categorySelect.value =
            category;

    }


    filterProducts();


    /*
       Scroll to product section
    */

    document
        .getElementById(
            "flashSale"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =========================================================
   CLOSE CATEGORY MENU
========================================================= */

function closeCategoryMenu() {

    categoryDropdown?.classList.remove(
        "show"
    );


    categoriesBtn?.classList.remove(
        "active"
    );


    closeAllMobileSubmenus();

}


/* =========================================================
   CLOSE MOBILE SUBMENUS
========================================================= */

function closeAllMobileSubmenus() {

    categoryDropdown
        ?.querySelectorAll(
            ".category-item.mobile-open"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "mobile-open"
                );

            }
        );

}


/* =========================================================
   POPULAR CATEGORY CARDS
========================================================= */

function setupCategoryCards() {

    document
        .querySelectorAll(
            ".category-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const category =
                            card.dataset.category;


                        if (
                            !category
                        ) {
                            return;
                        }


                        if (
                            categorySelect
                        ) {

                            categorySelect.value =
                                category;

                        }


                        filterProducts();


                        document
                            .getElementById(
                                "flashSale"
                            )
                            ?.scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                    }
                );

            }
        );

}


/* =========================================================
   CART
========================================================= */

function setupCart() {

    cartBtn?.addEventListener(
        "click",
        openCart
    );


    closeCartBtn?.addEventListener(
        "click",
        closeCart
    );


    cartOverlay?.addEventListener(
        "click",
        closeCart
    );


    cartItems?.addEventListener(
        "click",
        handleCartAction
    );


    checkoutBtn?.addEventListener(
        "click",
        checkout
    );

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(
    product,
    quantity = 1
) {

    if (!product) {
        return;
    }


    const existing =
        cart.find(
            item =>
                item.id ===
                product.id
        );


    if (existing) {

        existing.quantity +=
            quantity;

    } else {

        cart.push({

            id:
                product.id,

            title:
                product.title,

            price:
                product.price,

            image:
                product.image,

            quantity:
                quantity

        });

    }


    saveCart();

    updateCart();


    showToast(
        "Added to cart ✓",
        "cart-shopping"
    );


    openCart();

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "shopmax-cart",
        JSON.stringify(
            cart
        )
    );

}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    updateCartCount();

    renderCart();

}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    if (!cartCount) {
        return;
    }


    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    cartCount.textContent =
        count;

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    if (!cartItems) {
        return;
    }


    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <div
                class="empty-cart"
            >

                <i
                    class="
                        fa-solid
                        fa-cart-shopping
                    "
                ></i>


                <p>
                    Your cart is empty.
                </p>


                <small>
                    Add some products to your cart.
                </small>

            </div>

        `;


        if (cartTotal) {

            cartTotal.textContent =
                "$0.00";

        }


        return;

    }


    cartItems.innerHTML =
        cart
            .map(
                createCartItem
            )
            .join("");


    const total =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                (
                    Number(
                        item.price
                    ) *
                    Number(
                        item.quantity
                    )
                ),
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            `$${total.toFixed(2)}`;

    }

}


/* =========================================================
   CART ITEM
========================================================= */

function createCartItem(
    item
) {

    const total =
        Number(item.price) *
        Number(item.quantity);


    return `

        <div
            class="cart-item"
        >

            <div
                class="cart-item-image"
            >

                <img
                    src="${item.image}"
                    alt="${escapeHTML(
                        item.title
                    )}"
                >

            </div>


            <div
                class="cart-item-info"
            >

                <h4>
                    ${escapeHTML(
                        item.title
                    )}
                </h4>


                <div
                    class="cart-item-price"
                >
                    $${total.toFixed(2)}
                </div>


                <div
                    class="cart-item-bottom"
                >

                    <div
                        class="quantity-controls"
                    >

                        <button
                            type="button"
                            data-cart-action="decrease"
                            data-id="${item.id}"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-minus
                                "
                            ></i>

                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            type="button"
                            data-cart-action="increase"
                            data-id="${item.id}"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-plus
                                "
                            ></i>

                        </button>

                    </div>


                    <button
                        type="button"
                        class="remove-btn"
                        data-cart-action="remove"
                        data-id="${item.id}"
                    >

                        <i
                            class="
                                fa-regular
                                fa-trash-can
                            "
                        ></i>

                        Remove

                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   CART ACTION
========================================================= */

function handleCartAction(
    event
) {

    const button =
        event.target.closest(
            "[data-cart-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.cartAction;


    const id =
        Number(
            button.dataset.id
        );


    const item =
        cart.find(
            product =>
                product.id === id
        );


    if (!item) {
        return;
    }


    if (
        action === "increase"
    ) {

        item.quantity++;

    }


    if (
        action === "decrease"
    ) {

        item.quantity--;


        if (
            item.quantity <= 0
        ) {

            cart =
                cart.filter(
                    product =>
                        product.id !== id
                );

        }

    }


    if (
        action === "remove"
    ) {

        cart =
            cart.filter(
                product =>
                    product.id !== id
            );


        showToast(
            "Removed from cart",
            "trash"
        );

    }


    saveCart();

    updateCart();

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    if (!cartDrawer) {
        return;
    }


    closeWishlist();


    cartDrawer.classList.add(
        "open"
    );


    cartOverlay?.classList.add(
        "show"
    );


    document.body.classList.add(
        "cart-open"
    );

}


/* =========================================================
   CLOSE CART
========================================================= */

function closeCart() {

    cartDrawer?.classList.remove(
        "open"
    );


    cartOverlay?.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "cart-open"
    );

}


/* =========================================================
   WISHLIST SETUP
========================================================= */

function setupWishlist() {

    wishlistHeader?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            openWishlist();

        }
    );


    closeWishlistBtn?.addEventListener(
        "click",
        closeWishlist
    );


    wishlistOverlay?.addEventListener(
        "click",
        closeWishlist
    );


    wishlistItems?.addEventListener(
        "click",
        handleWishlistAction
    );

}


/* =========================================================
   WISHLIST BADGE STYLE
========================================================= */

function ensureWishlistBadgeStyles() {

    if (
        document.getElementById(
            "shopmaxWishlistBadgeStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "shopmaxWishlistBadgeStyles";


    style.textContent = `

        #wishlistHeader {
            position: relative !important;
        }


        #wishlistHeader .wishlist-icon-wrap {
            position: relative !important;

            width: 22px;
            height: 22px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            flex: 0 0 22px;
        }


        #wishlistHeader .wishlist-icon-wrap > i {
            display: block;

            line-height: 1;
        }


        #wishlistHeader #wishlistHeaderCount {

            position: absolute !important;

            top: -8px !important;
            right: -8px !important;

            left: auto !important;

            min-width: 17px !important;
            height: 17px !important;

            padding: 0 4px !important;

            display: flex !important;

            align-items: center !important;
            justify-content: center !important;

            box-sizing: border-box;

            background:
                #ef4444 !important;

            color:
                #ffffff !important;

            border:
                2px solid #ffffff !important;

            border-radius:
                50% !important;

            font-family:
                Arial,
                sans-serif !important;

            font-size:
                9px !important;

            font-weight:
                700 !important;

            line-height:
                1 !important;

            white-space:
                nowrap;

            z-index:
                999 !important;

            pointer-events:
                none;
        }


        #wishlistHeader
        #wishlistHeaderCount.hidden {

            display: none !important;

        }


        @media (max-width: 768px) {

            #wishlistHeader
            .wishlist-icon-wrap {

                width: 20px;
                height: 20px;

                flex-basis: 20px;
            }


            #wishlistHeader
            #wishlistHeaderCount {

                top: -7px !important;
                right: -7px !important;

                min-width: 15px !important;
                height: 15px !important;

                padding: 0 3px !important;

                font-size: 8px !important;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   UPDATE WISHLIST COUNT
========================================================= */

function updateWishlistCount() {

    if (!wishlistHeader) {
        return;
    }


    ensureWishlistBadgeStyles();


    let heartIcon =
        wishlistHeader.querySelector(
            "i.fa-heart"
        );


    if (!heartIcon) {

        heartIcon =
            wishlistHeader.querySelector(
                "i"
            );

    }


    let iconWrapper =
        wishlistHeader.querySelector(
            ".wishlist-icon-wrap"
        );


    if (
        heartIcon &&
        !iconWrapper
    ) {

        iconWrapper =
            document.createElement(
                "span"
            );


        iconWrapper.className =
            "wishlist-icon-wrap";


        heartIcon.parentNode.insertBefore(
            iconWrapper,
            heartIcon
        );


        iconWrapper.appendChild(
            heartIcon
        );

    }


    let badge =
        document.getElementById(
            "wishlistHeaderCount"
        );


    if (!badge) {

        badge =
            document.createElement(
                "span"
            );


        badge.id =
            "wishlistHeaderCount";


        badge.className =
            "wishlist-header-count";

    }


    if (
        iconWrapper
    ) {

        iconWrapper.appendChild(
            badge
        );

    } else {

        wishlistHeader.appendChild(
            badge
        );

    }


    badge.textContent =
        wishlist.length;


    if (
        wishlist.length === 0
    ) {

        badge.classList.add(
            "hidden"
        );

    } else {

        badge.classList.remove(
            "hidden"
        );

    }


    if (
        wishlistCountText
    ) {

        wishlistCountText.textContent =
            wishlist.length === 1
                ? "1 item"
                : `${wishlist.length} items`;

    }

}


/* =========================================================
   TOGGLE WISHLIST
========================================================= */

function toggleWishlist(
    id
) {

    wishlist =
        [
            ...new Set(
                wishlist
            )
        ];


    const exists =
        wishlist.includes(
            id
        );


    if (exists) {

        wishlist =
            wishlist.filter(
                item =>
                    item !== id
            );


        showToast(
            "Removed from wishlist",
            "heart-crack"
        );

    } else {

        wishlist.push(
            id
        );


        showToast(
            "Added to wishlist ❤️",
            "heart"
        );

    }


    saveWishlist();


    updateWishlistCount();


    renderWishlist();


    rerenderProducts();

}


/* =========================================================
   SAVE WISHLIST
========================================================= */

function saveWishlist() {

    localStorage.setItem(
        "shopmax-wishlist",
        JSON.stringify(
            wishlist
        )
    );

}


/* =========================================================
   RERENDER PRODUCTS
========================================================= */

function rerenderProducts() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        categorySelect
            ? categorySelect.value
            : "all";


    const filtered =
        products.filter(
            product => {

                const title =
                    product.title
                        .toLowerCase();


                const categoryName =
                    product.category
                        .toLowerCase();


                const searchMatch =
                    !search ||
                    title.includes(
                        search
                    ) ||
                    categoryName.includes(
                        search
                    );


                const categoryMatch =
                    category === "all" ||
                    product.category ===
                        category;


                return (
                    searchMatch &&
                    categoryMatch
                );

            }
        );


    renderFlashProducts(
        filtered.slice(0, 4)
    );


    renderTrendingProducts(
        filtered.slice(4, 8)
    );

}


/* =========================================================
   OPEN WISHLIST
========================================================= */

function openWishlist() {

    if (!wishlistDrawer) {
        return;
    }


    closeCart();


    renderWishlist();


    wishlistDrawer.classList.add(
        "open"
    );


    wishlistOverlay?.classList.add(
        "show"
    );


    document.body.classList.add(
        "wishlist-open"
    );

}


/* =========================================================
   CLOSE WISHLIST
========================================================= */

function closeWishlist() {

    wishlistDrawer?.classList.remove(
        "open"
    );


    wishlistOverlay?.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "wishlist-open"
    );

}


/* =========================================================
   RENDER WISHLIST
========================================================= */

function renderWishlist() {

    updateWishlistCount();


    if (!wishlistItems) {
        return;
    }


    if (
        wishlist.length === 0
    ) {

        wishlistItems.innerHTML = `

            <div
                class="empty-wishlist"
            >

                <i
                    class="
                        fa-regular
                        fa-heart
                    "
                ></i>


                <h3>
                    Your wishlist is empty
                </h3>


                <p>
                    Save your favorite products here.
                </p>

            </div>

        `;

        return;

    }


    const items =
        wishlist
            .map(
                id =>
                    products.find(
                        product =>
                            product.id === id
                    )
            )
            .filter(Boolean);


    if (
        items.length === 0
    ) {

        wishlistItems.innerHTML = `

            <div
                class="empty-wishlist"
            >

                <i
                    class="
                        fa-regular
                        fa-heart
                    "
                ></i>


                <h3>
                    Your wishlist is empty
                </h3>

            </div>

        `;

        return;

    }


    wishlistItems.innerHTML =
        items
            .map(
                createWishlistItem
            )
            .join("");

}


/* =========================================================
   CREATE WISHLIST ITEM
========================================================= */

function createWishlistItem(
    product
) {

    return `

        <div
            class="wishlist-item"
            data-id="${product.id}"
        >

            <div
                class="wishlist-item-image"
            >

                <img
                    src="${product.image}"
                    alt="${escapeHTML(
                        product.title
                    )}"
                >

            </div>


            <div
                class="wishlist-item-info"
            >

                <h4>
                    ${escapeHTML(
                        product.title
                    )}
                </h4>


                <strong>
                    $${product.price.toFixed(2)}
                </strong>


                <div
                    class="wishlist-item-actions"
                >

                    <button
                        type="button"
                        data-wishlist-action="cart"
                        data-id="${product.id}"
                    >

                        <i
                            class="
                                fa-solid
                                fa-cart-plus
                            "
                        ></i>

                        Add To Cart

                    </button>


                    <button
                        type="button"
                        data-wishlist-action="remove"
                        data-id="${product.id}"
                        aria-label="Remove from wishlist"
                    >

                        <i
                            class="
                                fa-regular
                                fa-trash-can
                            "
                        ></i>

                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   WISHLIST ACTION
========================================================= */

function handleWishlistAction(
    event
) {

    const button =
        event.target.closest(
            "[data-wishlist-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.wishlistAction;


    const id =
        Number(
            button.dataset.id
        );


    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {
        return;
    }


    if (
        action === "cart"
    ) {

        addToCart(
            product,
            1
        );

        return;

    }


    if (
        action === "remove"
    ) {

        wishlist =
            wishlist.filter(
                item =>
                    item !== id
            );


        saveWishlist();

        updateWishlistCount();

        renderWishlist();

        rerenderProducts();


        showToast(
            "Removed from wishlist",
            "heart-crack"
        );

    }

}


/* =========================================================
   PRODUCT MODAL SETUP
========================================================= */

function setupModal() {

    closeProductModalBtn?.addEventListener(
        "click",
        closeProductModalWindow
    );


    productModalOverlay?.addEventListener(
        "click",
        closeProductModalWindow
    );


    modalDecrease?.addEventListener(
        "click",
        () => {

            if (
                modalQuantity > 1
            ) {

                modalQuantity--;

                updateModalQuantity();

            }

        }
    );


    modalIncrease?.addEventListener(
        "click",
        () => {

            modalQuantity++;

            updateModalQuantity();

        }
    );


    modalAddToCart?.addEventListener(
        "click",
        () => {

            if (
                !currentModalProduct
            ) {
                return;
            }


            const product =
                currentModalProduct;


            const quantity =
                modalQuantity;


            closeProductModalWindow();


            addToCart(
                product,
                quantity
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            closeProductModalWindow();

            closeCart();

            closeWishlist();


            closeCategoryMenu();

        }
    );

}


/* =========================================================
   OPEN PRODUCT MODAL
========================================================= */

function openProductModal(
    product
) {

    if (
        !productModal ||
        !product
    ) {
        return;
    }


    currentModalProduct =
        product;


    modalQuantity =
        1;


    closeCart();

    closeWishlist();

    closeCategoryMenu();


    if (
        modalProductImage
    ) {

        modalProductImage.src =
            product.image;

        modalProductImage.alt =
            product.title;

    }


    if (
        modalProductCategory
    ) {

        modalProductCategory.textContent =
            formatCategory(
                product.category
            );

    }


    if (
        modalProductTitle
    ) {

        modalProductTitle.textContent =
            product.title;

    }


    const rating =
        product.rating?.rate || 4.2;


    const reviewCount =
        product.rating?.count || 100;


    if (
        modalProductRating
    ) {

        modalProductRating.innerHTML = `

            <i
                class="
                    fa-solid
                    fa-star
                "
            ></i>


            <span>
                ${rating}
            </span>


            <span>
                (${reviewCount} reviews)
            </span>

        `;

    }


    if (
        modalProductPrice
    ) {

        modalProductPrice.textContent =
            `$${product.price.toFixed(2)}`;

    }


    if (
        modalProductDescription
    ) {

        modalProductDescription.textContent =
            product.description;

    }


    updateModalQuantity();


    productModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE PRODUCT MODAL
========================================================= */

function closeProductModalWindow() {

    if (!productModal) {
        return;
    }


    productModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );


    currentModalProduct =
        null;


    modalQuantity =
        1;

}


/* =========================================================
   MODAL QUANTITY
========================================================= */

function updateModalQuantity() {

    if (
        modalQuantityEl
    ) {

        modalQuantityEl.textContent =
            modalQuantity;

    }

}


/* =========================================================
   COUNTDOWN
========================================================= */

function startCountdown() {

    const countdown =
        document.getElementById(
            "countdown"
        );


    if (!countdown) {
        return;
    }


    let totalSeconds =
        (
            2 * 24 * 60 * 60
        )
        +
        (
            15 * 60 * 60
        )
        +
        (
            30 * 60
        )
        +
        45;


    function updateCountdown() {

        const days =
            Math.floor(
                totalSeconds /
                86400
            );


        const hours =
            Math.floor(
                (
                    totalSeconds %
                    86400
                ) / 3600
            );


        const minutes =
            Math.floor(
                (
                    totalSeconds %
                    3600
                ) / 60
            );


        const seconds =
            totalSeconds %
            60;


        countdown.textContent =

            `${String(
                days
            ).padStart(2, "0")} : ` +

            `${String(
                hours
            ).padStart(2, "0")} : ` +

            `${String(
                minutes
            ).padStart(2, "0")} : ` +

            `${String(
                seconds
            ).padStart(2, "0")}`;


        if (
            totalSeconds > 0
        ) {

            totalSeconds--;

        }

    }


    updateCountdown();


    setInterval(
        updateCountdown,
        1000
    );

}


/* =========================================================
   CHECKOUT
========================================================= */

function checkout() {

    if (
        cart.length === 0
    ) {

        showToast(
            "Your cart is empty",
            "cart-shopping"
        );

        return;

    }


    showToast(
        "Checkout feature coming soon",
        "credit-card"
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    icon = "circle-check"
) {

    let toast =
        document.getElementById(
            "shopmaxToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "shopmaxToast";


        toast.className =
            "shopmax-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.innerHTML = `

        <i
            class="
                fa-solid
                fa-${icon}
            "
        ></i>


        <span>
            ${escapeHTML(
                message
            )}
        </span>

    `;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.shopmaxToastTimer
    );


    window.shopmaxToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   HELPERS
========================================================= */

function formatCategory(
    value
) {

    if (!value) {
        return "";
    }


    return String(
        value
    )
        .replace(
            /'/g,
            ""
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


function noProductsHTML() {

    return `

        <div
            style="
                grid-column:1/-1;
                padding:60px 20px;
                text-align:center;
            "
        >

            <i
                class="
                    fa-solid
                    fa-box-open
                "
                style="
                    font-size:30px;
                    color:#94a3b8;
                    margin-bottom:12px;
                "
            ></i>


            <h3>
                No products found
            </h3>


            <p
                style="
                    color:#64748b;
                    font-size:12px;
                    margin-top:6px;
                "
            >
                Try another search or category.
            </p>

        </div>

    `;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadProducts =
    loadProducts;


window.addToCart =
    addToCart;


window.toggleWishlist =
    toggleWishlist;


window.openCart =
    openCart;


window.closeCart =
    closeCart;


window.openWishlist =
    openWishlist;


window.closeWishlist =
    closeWishlist;


window.openProductModal =
    openProductModal;


window.closeProductModalWindow =
    closeProductModalWindow;