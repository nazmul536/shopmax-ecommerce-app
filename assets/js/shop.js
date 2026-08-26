/* =========================================================
   SHOPMAX
   SHOP PAGE - COMPLETE FINAL JAVASCRIPT
   Search + Filter + Sort + Cart + Wishlist + Modal
   Toast Removed
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
    ...new Set(
        wishlist.map(Number)
    )
];


let currentModalProduct = null;

let modalQuantity = 1;


/* =========================================================
   SHOP STATE
========================================================= */

let currentSearch = "";

let currentCategory = "all";

let currentSort = "default";


/* =========================================================
   SHOP DOM
========================================================= */

const shopProducts =
    document.getElementById(
        "shopProducts"
    );


const shopSearch =
    document.getElementById(
        "shopSearch"
    ) ||
    document.getElementById(
        "searchInput"
    );


const shopSearchBtn =
    document.getElementById(
        "shopSearchBtn"
    ) ||
    document.getElementById(
        "searchBtn"
    );


const shopCategory =
    document.getElementById(
        "shopCategory"
    ) ||
    document.getElementById(
        "categorySelect"
    );


const shopSort =
    document.getElementById(
        "shopSort"
    );


const shopResultCount =
    document.getElementById(
        "shopResultCount"
    );


const shopActiveFilter =
    document.getElementById(
        "shopActiveFilter"
    );


const shopNoResults =
    document.getElementById(
        "shopNoResults"
    );


const clearShopFilters =
    document.getElementById(
        "clearShopFilters"
    );


/* =========================================================
   HEADER CATEGORY
========================================================= */

const shopHeaderCategory =
    document.getElementById(
        "shopHeaderCategory"
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


const modalDecrease =
    document.getElementById(
        "modalDecrease"
    );


const modalIncrease =
    document.getElementById(
        "modalIncrease"
    );


const modalQuantityEl =
    document.getElementById(
        "modalQuantity"
    );


const modalAddToCart =
    document.getElementById(
        "modalAddToCart"
    );


const modalBuyNow =
    document.getElementById(
        "modalBuyNow"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupShop();

        setupCart();

        setupWishlist();

        setupModal();

        updateCart();

        updateWishlistCount();

        renderWishlist();

        loadProducts();

    }
);


/* =========================================================
   SHOP SETUP
========================================================= */

function setupShop() {

    /*
       Search typing
    */

    shopSearch?.addEventListener(
        "input",
        () => {

            currentSearch =
                shopSearch.value
                    .trim()
                    .toLowerCase();

            applyShopFilters();

        }
    );


    /*
       Search button
    */

    shopSearchBtn?.addEventListener(
        "click",
        () => {

            currentSearch =
                shopSearch?.value
                    .trim()
                    .toLowerCase() ||
                "";

            applyShopFilters();

        }
    );


    /*
       Enter search
    */

    shopSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                currentSearch =
                    shopSearch.value
                        .trim()
                        .toLowerCase();

                applyShopFilters();

            }

        }
    );


    /*
       Category
    */

    shopCategory?.addEventListener(
        "change",
        () => {

            currentCategory =
                shopCategory.value;

            if (
                shopHeaderCategory
            ) {

                shopHeaderCategory.value =
                    currentCategory;

            }

            applyShopFilters();

        }
    );


    /*
       Header category
    */

    shopHeaderCategory?.addEventListener(
        "change",
        () => {

            currentCategory =
                shopHeaderCategory.value;

            if (
                shopCategory
            ) {

                shopCategory.value =
                    currentCategory;

            }

            applyShopFilters();

        }
    );


    /*
       Sort
    */

    setupSortOptions();


    shopSort?.addEventListener(
        "change",
        () => {

            currentSort =
                shopSort.value;

            applyShopFilters();

        }
    );


    /*
       Clear filters
    */

    clearShopFilters?.addEventListener(
        "click",
        clearAllShopFilters
    );

}


/* =========================================================
   SORT OPTIONS
========================================================= */

function setupSortOptions() {

    if (!shopSort) {
        return;
    }


    const popularExists =
        [
            ...shopSort.options
        ].some(
            option =>
                option.value ===
                "popular"
        );


    if (
        !popularExists
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "popular";

        option.textContent =
            "Popular";

        shopSort.appendChild(
            option
        );

    }

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    showShopLoading();


    try {

        const response =
            await fetch(
                API_URL
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );

        }


        products =
            await response.json();


        products =
            products.map(
                product => ({
                    ...product,
                    id: Number(
                        product.id
                    )
                })
            );


        /*
           Remove invalid wishlist IDs
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
           Initial render
        */

        applyShopFilters();

        updateCart();

        updateWishlistCount();

        renderWishlist();

    }

    catch (error) {

        console.error(
            "ShopMax API Error:",
            error
        );


        showShopError();

    }

}


/* =========================================================
   LOADING
========================================================= */

function showShopLoading() {

    if (!shopProducts) {
        return;
    }


    if (shopNoResults) {

        shopNoResults.hidden =
            true;

    }


    shopProducts.innerHTML = `

        ${Array.from(
            { length: 8 },
            () => `

                <article
                    class="product-card shop-loading-card"
                >

                    <div
                        class="product-image"
                        style="
                            background:#eef2f7;
                            animation:
                                shopmaxPulse
                                1.2s
                                infinite;
                        "
                    ></div>


                    <div
                        class="product-info"
                    >

                        <div
                            style="
                                height:8px;
                                width:40%;
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
                                margin-bottom:10px;
                            "
                        ></div>


                        <div
                            style="
                                height:35px;
                                width:100%;
                                background:#e2e8f0;
                                border-radius:6px;
                            "
                        ></div>

                    </div>

                </article>

            `
        ).join("")}

    `;

}


/* =========================================================
   ERROR
========================================================= */

function showShopError() {

    if (!shopProducts) {
        return;
    }


    shopProducts.innerHTML = `

        <div
            class="shop-error-state"
            style="
                grid-column:1/-1;
                text-align:center;
                padding:70px 20px;
            "
        >

            <i
                class="
                    fa-solid
                    fa-triangle-exclamation
                "
                style="
                    font-size:36px;
                    color:#ef4444;
                    margin-bottom:15px;
                "
            ></i>


            <h2>
                Unable to load products
            </h2>


            <p
                style="
                    margin-top:8px;
                    color:#64748b;
                "
            >
                Please check your internet connection.
            </p>


            <button
                type="button"
                onclick="loadProducts()"
                style="
                    margin-top:18px;
                    border:0;
                    background:#2563eb;
                    color:#fff;
                    padding:11px 20px;
                    border-radius:7px;
                    cursor:pointer;
                    font-weight:700;
                "
            >
                Try Again
            </button>

        </div>

    `;

}


/* =========================================================
   APPLY SHOP FILTERS
========================================================= */

function applyShopFilters() {

    if (
        !products ||
        products.length === 0
    ) {
        return;
    }


    let result =
        [...products];


    /*
       Search
    */

    const search =
        currentSearch
            .trim()
            .toLowerCase();


    if (search) {

        result =
            result.filter(
                product => {

                    const title =
                        String(
                            product.title || ""
                        ).toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    return (
                        title.includes(search) ||
                        category.includes(search) ||
                        description.includes(search)
                    );

                }
            );

    }


    /*
       Category
    */

    const category =
        currentCategory
            .trim()
            .toLowerCase();


    if (
        category &&
        category !== "all"
    ) {

        result =
            result.filter(
                product =>
                    String(
                        product.category
                    ).toLowerCase() ===
                    category
            );

    }


    /*
       Sort
    */

    result =
        sortProducts(
            result,
            currentSort
        );


    renderShopProducts(
        result
    );


    updateShopResultCount(
        result.length
    );


    renderActiveFilters();

}


/* =========================================================
   SORT PRODUCTS
========================================================= */

function sortProducts(
    list,
    sortType
) {

    const sorted =
        [...list];


    switch (
        sortType
    ) {

        case "default":

            return sorted;


        case "price-low":

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.price
                    ) -
                    Number(
                        b.price
                    )
            );


        case "price-high":

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.price
                    ) -
                    Number(
                        a.price
                    )
            );


        case "rating":

            return sorted.sort(
                (
                    a,
                    b
                ) => {

                    const ratingA =
                        Number(
                            a.rating?.rate || 0
                        );


                    const ratingB =
                        Number(
                            b.rating?.rate || 0
                        );


                    if (
                        ratingB !==
                        ratingA
                    ) {

                        return (
                            ratingB -
                            ratingA
                        );

                    }


                    return (
                        Number(
                            b.rating?.count || 0
                        ) -
                        Number(
                            a.rating?.count || 0
                        )
                    );

                }
            );


        case "name":

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.title
                    ).localeCompare(
                        String(
                            b.title
                        )
                    )
            );


        case "popular":

            return sorted.sort(
                (
                    a,
                    b
                ) => {

                    const ratingA =
                        Number(
                            a.rating?.rate || 0
                        );


                    const ratingB =
                        Number(
                            b.rating?.rate || 0
                        );


                    const reviewsA =
                        Number(
                            a.rating?.count || 0
                        );


                    const reviewsB =
                        Number(
                            b.rating?.count || 0
                        );


                    const scoreA =
                        (
                            ratingA * 20
                        ) +
                        Math.log10(
                            reviewsA + 1
                        );


                    const scoreB =
                        (
                            ratingB * 20
                        ) +
                        Math.log10(
                            reviewsB + 1
                        );


                    return (
                        scoreB -
                        scoreA
                    );

                }
            );


        default:

            return sorted;

    }

}


/* =========================================================
   RENDER SHOP PRODUCTS
========================================================= */

function renderShopProducts(
    list
) {

    if (!shopProducts) {
        return;
    }


    if (
        !list ||
        list.length === 0
    ) {

        shopProducts.innerHTML =
            "";


        if (shopNoResults) {

            shopNoResults.hidden =
                false;

        }


        return;

    }


    if (shopNoResults) {

        shopNoResults.hidden =
            true;

    }


    shopProducts.innerHTML =
        list
            .map(
                (
                    product,
                    index
                ) =>
                    createShopProductCard(
                        product,
                        index
                    )
            )
            .join("");


    attachShopProductEvents();

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createShopProductCard(
    product,
    index
) {

    const rating =
        Number(
            product.rating?.rate || 0
        );


    const reviewCount =
        Number(
            product.rating?.count || 0
        );


    const discountList = [
        12,
        20,
        15,
        10,
        19,
        11,
        17,
        23,
        14,
        18,
        13,
        22
    ];


    const discount =
        discountList[
            (
                Number(
                    product.id
                ) +
                index
            ) %
            discountList.length
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
                data-shop-action="view"
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
                            ${liked ? "wishlisted" : ""}
                        "
                        data-shop-action="wishlist"
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
                        data-shop-action="view"
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
                    data-shop-action="view"
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
                    data-shop-action="cart"
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
   PRODUCT EVENTS
========================================================= */

function attachShopProductEvents() {

    if (!shopProducts) {
        return;
    }


    shopProducts
        .querySelectorAll(
            "[data-shop-action]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    handleShopProductAction
                );

            }
        );

}


/* =========================================================
   PRODUCT ACTION
========================================================= */

function handleShopProductAction(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const action =
        this.dataset.shopAction;


    const id =
        Number(
            this.dataset.id
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


    switch (
        action
    ) {

        case "cart":

            addToCart(
                product,
                1
            );

            break;


        case "wishlist":

            toggleWishlist(
                id
            );

            break;


        case "view":

            openProductModal(
                product
            );

            break;

    }

}


/* =========================================================
   RESULT COUNT
========================================================= */

function updateShopResultCount(
    count
) {

    if (!shopResultCount) {
        return;
    }


    shopResultCount.textContent =
        count;

}


/* =========================================================
   ACTIVE FILTERS
========================================================= */

function renderActiveFilters() {

    if (!shopActiveFilter) {
        return;
    }


    const chips = [];


    if (
        currentSearch
    ) {

        chips.push(`

            <button
                type="button"
                class="shop-filter-chip"
                data-clear-filter="search"
            >

                Search:
                <strong>
                    ${escapeHTML(
                        currentSearch
                    )}
                </strong>

                <i
                    class="
                        fa-solid
                        fa-xmark
                    "
                ></i>

            </button>

        `);

    }


    if (
        currentCategory &&
        currentCategory !== "all"
    ) {

        chips.push(`

            <button
                type="button"
                class="shop-filter-chip"
                data-clear-filter="category"
            >

                ${formatCategory(
                    currentCategory
                )}

                <i
                    class="
                        fa-solid
                        fa-xmark
                    "
                ></i>

            </button>

        `);

    }


    if (
        currentSort &&
        currentSort !== "default"
    ) {

        chips.push(`

            <button
                type="button"
                class="shop-filter-chip"
                data-clear-filter="sort"
            >

                ${getSortLabel(
                    currentSort
                )}

                <i
                    class="
                        fa-solid
                        fa-xmark
                    "
                ></i>

            </button>

        `);

    }


    if (
        chips.length === 0
    ) {

        shopActiveFilter.innerHTML =
            "";

        return;

    }


    shopActiveFilter.innerHTML =
        chips.join("");


    shopActiveFilter
        .querySelectorAll(
            "[data-clear-filter]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    handleActiveFilterClear
                );

            }
        );

}


/* =========================================================
   FILTER CHIP ACTION
========================================================= */

function handleActiveFilterClear(
    event
) {

    const type =
        event.currentTarget
            .dataset
            .clearFilter;


    if (
        type === "search"
    ) {

        currentSearch =
            "";


        if (shopSearch) {

            shopSearch.value =
                "";

        }

    }


    if (
        type === "category"
    ) {

        currentCategory =
            "all";


        if (shopCategory) {

            shopCategory.value =
                "all";

        }


        if (
            shopHeaderCategory
        ) {

            shopHeaderCategory.value =
                "all";

        }

    }


    if (
        type === "sort"
    ) {

        currentSort =
            "default";


        if (shopSort) {

            shopSort.value =
                "default";

        }

    }


    applyShopFilters();

}


/* =========================================================
   SORT LABEL
========================================================= */

function getSortLabel(
    value
) {

    const labels = {

        "price-low":
            "Price: Low → High",

        "price-high":
            "Price: High → Low",

        "rating":
            "Rating: High → Low",

        "name":
            "Name: A → Z",

        "popular":
            "Popular"

    };


    return (
        labels[value] ||
        value
    );

}


/* =========================================================
   CLEAR ALL
========================================================= */

function clearAllShopFilters() {

    currentSearch =
        "";

    currentCategory =
        "all";

    currentSort =
        "default";


    if (shopSearch) {

        shopSearch.value =
            "";

    }


    if (shopCategory) {

        shopCategory.value =
            "all";

    }


    if (
        shopHeaderCategory
    ) {

        shopHeaderCategory.value =
            "all";

    }


    if (shopSort) {

        shopSort.value =
            "default";

    }


    applyShopFilters();

}


/* =========================================================
   CART SETUP
========================================================= */

function setupCart() {

    cartBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openCart();

        }
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

            ...product,

            id: id,

            quantity: qty

        });

    }


    saveCart();

    updateCart();

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

    renderCart();

    updateCartCount();

    updateCartTotal();

    saveCart();

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


                <h3>
                    Your cart is empty
                </h3>


                <p>
                    Add some products to get started.
                </p>

            </div>

        `;

        return;

    }


    cartItems.innerHTML =
        cart
            .map(
                createCartItem
            )
            .join("");

}


/* =========================================================
   CART ITEM
========================================================= */

function createCartItem(
    item
) {

    return `

        <div
            class="cart-item"
            data-id="${item.id}"
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


                <strong>
                    $${Number(
                        item.price
                    ).toFixed(2)}
                </strong>


                <div
                    class="cart-item-controls"
                >

                    <button
                        type="button"
                        data-cart-action="decrease"
                        data-id="${item.id}"
                        aria-label="Decrease quantity"
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
                        aria-label="Increase quantity"
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

    }


    updateCart();

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

        closeProductModal();

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
   CHECKOUT
========================================================= */

function checkout() {

    if (
        cart.length === 0
    ) {

        return;

    }


    /*
       Checkout page will be added later.
    */

}


/* =========================================================
   WISHLIST SETUP
========================================================= */

function setupWishlist() {

    wishlistHeader?.addEventListener(
        "click",
        event => {

            event.preventDefault();

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
   UPDATE WISHLIST COUNT
========================================================= */

function updateWishlistCount() {

    if (!wishlistHeader) {
        return;
    }


    let badge =
        document.getElementById(
            "wishlistCount"
        );


    /*
       Create badge if missing
    */

    if (!badge) {

        badge =
            document.createElement(
                "b"
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


    if (
        wishlist.length === 0
    ) {

        badge.style.display =
            "none";

    }

    else {

        badge.style.display =
            "grid";

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

    id =
        Number(
            id
        );


    const exists =
        wishlist.includes(
            id
        );


    if (exists) {

        wishlist =
            wishlist.filter(
                item =>
                    Number(
                        item
                    ) !== id
            );

    }

    else {

        wishlist.push(
            id
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

    applyShopFilters();

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
   OPEN WISHLIST
========================================================= */

function openWishlist() {

    closeCart();


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
                    $${Number(
                        product.price
                    ).toFixed(2)}
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


        /*
           Wishlist stays.
        */

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
   PRODUCT MODAL SETUP
========================================================= */

function setupModal() {

    closeProductModalBtn?.addEventListener(
        "click",
        closeProductModal
    );


    productModalOverlay?.addEventListener(
        "click",
        closeProductModal
    );


    modalDecrease?.addEventListener(
        "click",
        decreaseModalQuantity
    );


    modalIncrease?.addEventListener(
        "click",
        increaseModalQuantity
    );


    modalAddToCart?.addEventListener(
        "click",
        modalAddCart
    );


    modalBuyNow?.addEventListener(
        "click",
        modalBuyNowAction
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeProductModal();

                closeCart();

                closeWishlist();

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


    currentModalProduct =
        product;


    modalQuantity =
        1;


    closeCart();

    closeWishlist();


    /*
       Image
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
       Category
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
       Title
    */

    if (
        modalProductTitle
    ) {

        modalProductTitle.textContent =
            product.title;

    }


    /*
       Rating
    */

    const rating =
        Number(
            product.rating?.rate || 0
        );


    const reviewCount =
        Number(
            product.rating?.count || 0
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
       Price
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
       Description
    */

    if (
        modalProductDescription
    ) {

        modalProductDescription.textContent =
            product.description ||
            "No description available.";

    }


    updateModalQuantity();


    productModal.classList.add(
        "show"
    );


    productModal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE PRODUCT MODAL
========================================================= */

function closeProductModal() {

    productModal?.classList.remove(
        "show"
    );


    productModal?.classList.remove(
        "active"
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

function increaseModalQuantity() {

    if (
        !currentModalProduct
    ) {
        return;
    }


    modalQuantity++;


    updateModalQuantity();

}


/* =========================================================
   DECREASE MODAL QUANTITY
========================================================= */

function decreaseModalQuantity() {

    if (
        !currentModalProduct
    ) {
        return;
    }


    if (
        modalQuantity > 1
    ) {

        modalQuantity--;

    }


    updateModalQuantity();

}


/* =========================================================
   UPDATE MODAL QUANTITY
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
   MODAL ADD CART
========================================================= */

function modalAddCart() {

    if (
        !currentModalProduct
    ) {
        return;
    }


    addToCart(
        currentModalProduct,
        modalQuantity
    );


    closeProductModal();


    setTimeout(
        () => {

            openCart();

        },
        50
    );

}


/* =========================================================
   MODAL BUY NOW
========================================================= */

function modalBuyNowAction() {

    if (
        !currentModalProduct
    ) {
        return;
    }


    addToCart(
        currentModalProduct,
        modalQuantity
    );


    closeProductModal();


    setTimeout(
        () => {

            openCart();

        },
        50
    );

}


/* =========================================================
   FORMAT CATEGORY
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


window.openCart =
    openCart;


window.closeCart =
    closeCart;


window.toggleWishlist =
    toggleWishlist;


window.openWishlist =
    openWishlist;


window.closeWishlist =
    closeWishlist;


window.openProductModal =
    openProductModal;


window.closeProductModal =
    closeProductModal;


/* =========================================================
   END SHOPMAX JS
========================================================= */