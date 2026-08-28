/* =========================================================
   SHOPMAX E-COMMERCE
   COMPLETE FINAL JAVASCRIPT
   HOME PAGE

   Features:
   - Fake Store API
   - Flash Sale Products
   - Trending Products
   - Search
   - Category Filter
   - Category Menu
   - Cart
   - Wishlist
   - Product Quick View Modal
   - Recently Viewed
   - Countdown
   - LocalStorage
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


/* =========================================================
   CART STATE
========================================================= */

let cart =
    JSON.parse(
        localStorage.getItem(
            "shopmax-cart"
        )
    ) || [];


/* =========================================================
   WISHLIST STATE
========================================================= */

let wishlist =
    JSON.parse(
        localStorage.getItem(
            "shopmax-wishlist"
        )
    ) || [];


/*
   Normalize wishlist IDs
*/

wishlist = [
    ...new Set(
        wishlist.map(Number)
    )
];


/* =========================================================
   RECENTLY VIEWED STATE
========================================================= */

let recentlyViewed =
    JSON.parse(
        localStorage.getItem(
            "shopmax-recently-viewed"
        )
    ) || [];


/*
   Normalize Recently Viewed IDs
*/

recentlyViewed = [
    ...new Set(
        recentlyViewed.map(Number)
    )
];


/* =========================================================
   MODAL STATE
========================================================= */

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
   RECENTLY VIEWED DOM
========================================================= */

const recentlyViewedSection =
    document.getElementById(
        "recentlyViewedSection"
    );


const recentlyViewedProducts =
    document.getElementById(
        "recentlyViewedProducts"
    );


const clearRecentlyViewedBtn =
    document.getElementById(
        "clearRecentlyViewed"
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

        setupRecentlyViewed();

        loadRecentlyViewed();

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


        const data =
            await response.json();


        /*
           Normalize product data
        */

        products =
            data.map(
                product => ({

                    ...product,

                    id:
                        Number(
                            product.id
                        ),

                    price:
                        Number(
                            product.price
                        )

                })
            );


        /*
           Keep only valid wishlist IDs
        */

        wishlist =
            wishlist.filter(
                id =>
                    products.some(
                        product =>
                            product.id === id
                    )
            );


        saveWishlist();


        /*
           Keep only valid Recently Viewed IDs
        */

        recentlyViewed =
            recentlyViewed.filter(
                id =>
                    products.some(
                        product =>
                            product.id === id
                    )
            );


        saveRecentlyViewedState();


        /*
           Render products
        */

        renderFlashProducts(
            products.slice(
                0,
                4
            )
        );


        renderTrendingProducts(
            products.slice(
                4,
                8
            )
        );


        renderWishlist();

        renderRecentlyViewed();

    }

    catch (error) {

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


    container.innerHTML =
        "";


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        container.innerHTML += `

            <div
                class="product-card"
            >

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


                <div
                    class="product-info"
                >

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
        Number(
            product.rating?.rate || 4.2
        );


    const reviewCount =
        Number(
            product.rating?.count || 100
        );


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
        Number(
            product.price
        ) /
        (
            1 -
            discount / 100
        );


    const liked =
        wishlist.includes(
            Number(
                product.id
            )
        );


    return `

        <article
            class="product-card"
            data-product-id="${product.id}"
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
                        class="
                            product-action-btn
                            quick-view-btn
                        "
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

                    ${rating.toFixed(1)}


                    <span>
                        (${reviewCount})
                    </span>

                </div>


                <div
                    class="product-price"
                >

                    <strong>
                        $${Number(
                            product.price
                        ).toFixed(2)}
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
   Event delegation
========================================================= */

function attachProductEvents(
    container
) {

    if (!container) {
        return;
    }


    /*
       Remove any previous delegated handler.
    */

    container.onclick =
        handleProductContainerClick;

}


/* =========================================================
   PRODUCT CONTAINER CLICK
========================================================= */

function handleProductContainerClick(
    event
) {

    const actionElement =
        event.target.closest(
            "[data-action]"
        );


    if (!actionElement) {
        return;
    }


    if (
        !this.contains(
            actionElement
        )
    ) {
        return;
    }


    event.preventDefault();

    event.stopPropagation();


    const action =
        actionElement.dataset.action;


    const id =
        Number(
            actionElement.dataset.id
        );


    if (!id) {
        return;
    }


    const product =
        products.find(
            item =>
                Number(
                    item.id
                ) === id
        );


    if (!product) {
        return;
    }


    /* =====================================================
       CART
    ===================================================== */

    if (
        action === "cart"
    ) {

        addToCart(
            product,
            1
        );


        return;

    }


    /* =====================================================
       WISHLIST
    ===================================================== */

    if (
        action === "wishlist"
    ) {

        toggleWishlist(
            id
        );


        return;

    }


    /* =====================================================
       VIEW / EYE
    ===================================================== */

    if (
        action === "view"
    ) {

        openProductModal(
            product
        );


        return;

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
   FILTER PRODUCTS
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
                    String(
                        product.title || ""
                    )
                        .toLowerCase();


                const categoryName =
                    String(
                        product.category || ""
                    )
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
        filtered.slice(
            0,
            4
        )
    );


    renderTrendingProducts(
        filtered.slice(
            4,
            8
        )
    );

}


/* =========================================================
   CATEGORY MENU
========================================================= */

function setupCategoryMenu() {

    if (
        !categoriesBtn ||
        !categoryDropdown
    ) {
        return;
    }


    categoriesBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                categoryDropdown.classList.contains(
                    "show"
                );


            if (
                isOpen
            ) {

                closeCategoryMenu();

            }

            else {

                categoryDropdown.classList.add(
                    "show"
                );


                categoriesBtn.classList.add(
                    "active"
                );

            }

        }
    );


    /*
       Parent categories
    */

    categoryDropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const categoryButton =
                event.target.closest(
                    ".category-item > button"
                );


            if (
                categoryButton
            ) {

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


                /*
                   Mobile submenu
                */

                if (
                    submenu &&
                    window.innerWidth <= 768
                ) {

                    event.preventDefault();


                    categoryDropdown
                        .querySelectorAll(
                            ".category-item.mobile-open"
                        )
                        .forEach(
                            otherItem => {

                                if (
                                    otherItem !== item
                                ) {

                                    otherItem.classList.remove(
                                        "mobile-open"
                                    );

                                }

                            }
                        );


                    item.classList.toggle(
                        "mobile-open"
                    );


                    return;

                }


                /*
                   Desktop category
                */

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


            /*
               Submenu link
            */

            const submenuLink =
                event.target.closest(
                    ".category-submenu a[data-category]"
                );


            if (
                submenuLink
            ) {

                event.preventDefault();


                const category =
                    submenuLink.dataset.category;


                if (
                    category
                ) {

                    selectHomeCategory(
                        category
                    );

                }


                closeCategoryMenu();

            }

        }
    );


    /*
       Outside click
    */

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


    /*
       Resize
    */

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
   SELECT CATEGORY
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


    document
        .getElementById(
            "flashSale"
        )
        ?.scrollIntoView({
            behavior:
                "smooth",
            block:
                "start"
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
   CART SETUP
========================================================= */

function setupCart() {

    cartBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            openCart();

        }
    );


    closeCartBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeCart();

        }
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


    const id =
        Number(
            product.id
        );


    const qty =
        Math.max(
            1,
            Number(
                quantity
            ) || 1
        );


    const existing =
        cart.find(
            item =>
                Number(
                    item.id
                ) === id
        );


    if (existing) {

        existing.quantity =
            Number(
                existing.quantity
            ) +
            qty;

    }

    else {

        cart.push({

            id:
                id,

            title:
                product.title,

            price:
                Number(
                    product.price
                ),

            image:
                product.image,

            quantity:
                qty

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
                    item.quantity ||
                    0
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


    updateCartTotal();

}


/* =========================================================
   CART ITEM
========================================================= */

function createCartItem(
    item
) {

    const total =
        Number(
            item.price
        ) *
        Number(
            item.quantity
        );


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


    event.preventDefault();

    event.stopPropagation();


    const action =
        button.dataset.cartAction;


    const id =
        Number(
            button.dataset.id
        );


    const item =
        cart.find(
            product =>
                Number(
                    product.id
                ) === id
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
                        Number(
                            product.id
                        ) !== id
                );

        }

    }


    if (
        action === "remove"
    ) {

        cart =
            cart.filter(
                product =>
                    Number(
                        product.id
                    ) !== id
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
   CART TOTAL
========================================================= */

function updateCartTotal() {

    if (!cartTotal) {
        return;
    }


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


    cartTotal.textContent =
        `$${total.toFixed(2)}`;

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    closeWishlist();


    if (
        productModal &&
        productModal.classList.contains(
            "show"
        )
    ) {

        closeProductModalWindow();

    }


    cartDrawer?.classList.add(
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
        event => {

            event.preventDefault();

            event.stopPropagation();


            closeWishlist();

        }
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
   WISHLIST COUNT
========================================================= */

function updateWishlistCount() {

    if (!wishlistHeader) {
        return;
    }


    let badge =
        document.getElementById(
            "wishlistCount"
        );


    if (!badge) {

        badge =
            document.createElement(
                "span"
            );


        badge.id =
            "wishlistCount";


        const wrapper =
            wishlistHeader.querySelector(
                ".wishlist-icon-wrap"
            );


        if (wrapper) {

            wrapper.appendChild(
                badge
            );

        }

        else {

            wishlistHeader.appendChild(
                badge
            );

        }

    }


    badge.textContent =
        wishlist.length;


    badge.style.display =
        wishlist.length === 0
            ? "none"
            : "grid";


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

    id =
        Number(
            id
        );


    if (
        wishlist.includes(
            id
        )
    ) {

        wishlist =
            wishlist.filter(
                item =>
                    Number(
                        item
                    ) !== id
            );


        showToast(
            "Removed from wishlist",
            "heart-crack"
        );

    }

    else {

        wishlist.push(
            id
        );


        showToast(
            "Added to wishlist ❤️",
            "heart"
        );

    }


    wishlist =
        [
            ...new Set(
                wishlist
            )
        ];


    saveWishlist();

    updateWishlistCount();

    renderWishlist();

    rerenderHomeProducts();

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
   RERENDER HOME PRODUCTS
========================================================= */

function rerenderHomeProducts() {

    if (
        !products ||
        products.length === 0
    ) {
        return;
    }


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
                    String(
                        product.title ||
                        ""
                    )
                        .toLowerCase();


                const categoryName =
                    String(
                        product.category ||
                        ""
                    )
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
        filtered.slice(
            0,
            4
        )
    );


    renderTrendingProducts(
        filtered.slice(
            4,
            8
        )
    );

}


/* =========================================================
   OPEN WISHLIST
========================================================= */

function openWishlist() {

    closeCart();


    if (
        productModal &&
        productModal.classList.contains(
            "show"
        )
    ) {

        closeProductModalWindow();

    }


    renderWishlist();


    wishlistDrawer?.classList.add(
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


    const items =
        wishlist
            .map(
                id =>
                    products.find(
                        product =>
                            Number(
                                product.id
                            ) ===
                            Number(
                                id
                            )
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


                <p>
                    Save your favorite products here.
                </p>

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
   WISHLIST ITEM
========================================================= */

function createWishlistItem(
    product
) {

    return `

        <div
            class="wishlist-item"
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
                    $${Number(
                        product.price
                    ).toFixed(2)}
                </strong>


                <div
                    class="
                        wishlist-item-actions
                    "
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


    event.preventDefault();

    event.stopPropagation();


    const action =
        button.dataset.wishlistAction;


    const id =
        Number(
            button.dataset.id
        );


    const product =
        products.find(
            item =>
                Number(
                    item.id
                ) === id
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

        toggleWishlist(
            id
        );

    }

}


/* =========================================================
   RECENTLY VIEWED SETUP
========================================================= */

function setupRecentlyViewed() {

    clearRecentlyViewedBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            clearRecentlyViewed();

        }
    );

}


/* =========================================================
   SAVE RECENTLY VIEWED
========================================================= */

function saveRecentlyViewed(
    productId
) {

    const id =
        Number(
            productId
        );


    if (!id) {
        return;
    }


    /*
       Remove previous occurrence
       so newest product goes first.
    */

    recentlyViewed =
        recentlyViewed.filter(
            item =>
                Number(
                    item
                ) !== id
        );


    recentlyViewed.unshift(
        id
    );


    /*
       Keep only latest four.
    */

    recentlyViewed =
        recentlyViewed.slice(
            0,
            4
        );


    saveRecentlyViewedState();

}


/* =========================================================
   SAVE RECENTLY VIEWED STATE
========================================================= */

function saveRecentlyViewedState() {

    localStorage.setItem(
        "shopmax-recently-viewed",
        JSON.stringify(
            recentlyViewed
        )
    );

}


/* =========================================================
   LOAD RECENTLY VIEWED
========================================================= */

function loadRecentlyViewed() {

    renderRecentlyViewed();

}


/* =========================================================
   RENDER RECENTLY VIEWED
========================================================= */

function renderRecentlyViewed() {

    if (
        !recentlyViewedSection ||
        !recentlyViewedProducts
    ) {
        return;
    }


    /*
       Wait for API data.
    */

    if (
        !products ||
        products.length === 0
    ) {

        recentlyViewedSection.hidden =
            true;

        recentlyViewedProducts.innerHTML =
            "";

        return;

    }


    /*
       Resolve saved IDs.
    */

    const viewedProducts =
        recentlyViewed
            .map(
                id =>
                    products.find(
                        product =>
                            Number(
                                product.id
                            ) ===
                            Number(
                                id
                            )
                    )
            )
            .filter(Boolean);


    /*
       Clean invalid IDs.
    */

    recentlyViewed =
        viewedProducts.map(
            product =>
                Number(
                    product.id
                )
        );


    saveRecentlyViewedState();


    /*
       Hide section when empty.
    */

    if (
        viewedProducts.length === 0
    ) {

        recentlyViewedSection.hidden =
            true;

        recentlyViewedProducts.innerHTML =
            "";

        return;

    }


    /*
       Show section.
    */

    recentlyViewedSection.hidden =
        false;


    /*
       Reuse normal product cards.
    */

    recentlyViewedProducts.innerHTML =
        viewedProducts
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


    /*
       Same click system as Flash
       and Trending.
    */

    attachProductEvents(
        recentlyViewedProducts
    );

}


/* =========================================================
   CLEAR RECENTLY VIEWED
========================================================= */

function clearRecentlyViewed() {

    recentlyViewed =
        [];


    localStorage.removeItem(
        "shopmax-recently-viewed"
    );


    renderRecentlyViewed();

}


/* =========================================================
   PRODUCT MODAL SETUP
========================================================= */

function setupModal() {

    closeProductModalBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            closeProductModalWindow();

        }
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
                event.key === "Escape"
            ) {

                closeProductModalWindow();

                closeCart();

                closeWishlist();

                closeCategoryMenu();

            }

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


    /*
       Save to Recently Viewed
    */

    saveRecentlyViewed(
        product.id
    );


    /*
       Update section immediately
    */

    renderRecentlyViewed();


    currentModalProduct =
        product;


    modalQuantity =
        1;


    closeCart();

    closeWishlist();

    closeCategoryMenu();


    /*
       IMAGE
    */

    if (
        modalProductImage
    ) {

        modalProductImage.src =
            product.image;

        modalProductImage.alt =
            product.title;

    }


    /*
       CATEGORY
    */

    if (
        modalProductCategory
    ) {

        modalProductCategory.textContent =
            formatCategory(
                product.category
            );

    }


    /*
       TITLE
    */

    if (
        modalProductTitle
    ) {

        modalProductTitle.textContent =
            product.title;

    }


    /*
       RATING
    */

    const rating =
        Number(
            product.rating?.rate ||
            4.2
        );


    const reviewCount =
        Number(
            product.rating?.count ||
            100
        );


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
                ${rating.toFixed(1)}
            </span>


            <span>
                (${reviewCount} reviews)
            </span>

        `;

    }


    /*
       PRICE
    */

    if (
        modalProductPrice
    ) {

        modalProductPrice.textContent =
            `$${Number(
                product.price
            ).toFixed(2)}`;

    }


    /*
       DESCRIPTION
    */

    if (
        modalProductDescription
    ) {

        modalProductDescription.textContent =
            product.description ||
            "No description available.";

    }


    /*
       QUANTITY
    */

    updateModalQuantity();


    /*
       SHOW
    */

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

    if (
        !productModal
    ) {
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
                ) /
                3600
            );


        const minutes =
            Math.floor(
                (
                    totalSeconds %
                    3600
                ) /
                60
            );


        const seconds =
            totalSeconds %
            60;


        countdown.textContent =

            `${String(
                days
            ).padStart(
                2,
                "0"
            )} : ` +

            `${String(
                hours
            ).padStart(
                2,
                "0"
            )} : ` +

            `${String(
                minutes
            ).padStart(
                2,
                "0"
            )} : ` +

            `${String(
                seconds
            ).padStart(
                2,
                "0"
            )}`;


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


/* =========================================================
   EMPTY PRODUCT STATE
========================================================= */

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


/* =========================================================
   ESCAPE HTML
========================================================= */

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


window.clearRecentlyViewed =
    clearRecentlyViewed;


/* =========================================================
   END SHOPMAX
========================================================= */