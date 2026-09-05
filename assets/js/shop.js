/* =========================================================
   SHOPMAX
   SHOP PAGE - COMPLETE JAVASCRIPT
   Search + Filter + Sort + Cart + Wishlist + Modal
   Shared Header + Mobile Category Submenu
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://dummyjson.com/products?limit=0";


/* =========================================================
   STATE
========================================================= */

let products = [];

let cart =
    JSON.parse(
        localStorage.getItem(
            "shopmax-cart"
        )
    ) || [];

let wishlist =
    JSON.parse(
        localStorage.getItem(
            "shopmax-wishlist"
        )
    ) || [];

wishlist = [
    ...new Set(
        wishlist.map(Number)
    )
];

let currentSearch = "";

let currentCategory = "all";

let currentSort = "default";

let currentModalProduct = null;

let modalQuantity = 1;


//pagination
const PRODUCTS_PER_PAGE = 12;

let currentPage = 1;

let currentFilteredProducts = [];


/* =========================================================
   SHOP DOM
========================================================= */

const shopProducts =
    document.getElementById(
        "shopProducts"
    );

const shopSearch =
    document.getElementById(
        "searchInput"
    );

const shopSearchBtn =
    document.getElementById(
        "searchBtn"
    );

const shopCategory =
    document.getElementById(
        "shopCategory"
    );

const shopHeaderCategory =
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
   CATEGORY MENU DOM
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

const wishlistCount =
    document.getElementById(
        "wishlistCount"
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
   MOBILE NAVIGATION DOM
========================================================= */

let mobileMenuToggle = null;

let mobileNav = null;

let mobileNavOverlay = null;

let mobileNavClose = null;


//pagination DOM
const shopPagination =
    document.getElementById(
        "shopPagination"
    );

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupShop();

        setupCustomSelects();

        setupMobileNavigation();

        setupCategoryMenu();

        setupCart();

        setupWishlist();

        setupModal();

        updateCart();

        updateWishlistUI();

        loadProducts();

    }
);


/* =========================================================
   SHOP SETUP
========================================================= */

function setupShop() {

    setupSearchSuggestions();


    /* =====================================================
       SEARCH
    ===================================================== */

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


    /* =====================================================
       SEARCH BUTTON
    ===================================================== */

    shopSearchBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            currentSearch =
                shopSearch
                    ?.value
                    .trim()
                    .toLowerCase() || "";

            applyShopFilters();

        }
    );


    /* =====================================================
       SEARCH ENTER
    ===================================================== */

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


    /* =====================================================
       SHOP CATEGORY
    ===================================================== */

    shopCategory?.addEventListener(
        "change",
        () => {

            currentCategory =
                shopCategory.value ||
                "all";


            /* ---------------------------------------------
               SYNC HEADER CATEGORY
            --------------------------------------------- */

            if (
                shopHeaderCategory
            ) {

                shopHeaderCategory.value =
                    currentCategory;

            }


            /* ---------------------------------------------
               UPDATE URL
               Example:
               shop.html?category=beauty
               shop.html?category=furniture
            --------------------------------------------- */

            const url =
                new URL(
                    window.location.href
                );


            if (
                currentCategory &&
                currentCategory !== "all"
            ) {

                url.searchParams.set(
                    "category",
                    currentCategory
                );

            }

            else {

                url.searchParams.delete(
                    "category"
                );

            }


            window.history.replaceState(
                {},
                "",
                url
            );


            /* ---------------------------------------------
               APPLY FILTER
            --------------------------------------------- */

            applyShopFilters();

        }
    );


    /* =========================================================
       HEADER CATEGORY → SHOP CATEGORY SYNC
    ========================================================= */

    shopHeaderCategory?.addEventListener(
        "change",
        () => {

            currentCategory =
                shopHeaderCategory.value ||
                "all";


            if (
                shopCategory
            ) {

                shopCategory.value =
                    currentCategory;


                /*
                   IMPORTANT:
                   Custom dropdown needs the
                   change event to update its
                   visible button text.

                   This also triggers the
                   Shop Category change handler,
                   which updates the URL.
                */

                shopCategory.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles: true
                        }
                    )
                );

            }


            /*
               Keep existing filtering behavior.
            */

            applyShopFilters();

        }
    );


    /* =====================================================
       SORT
    ===================================================== */

    shopSort?.addEventListener(
        "change",
        () => {

            currentSort =
                shopSort.value;

            applyShopFilters();

        }
    );


    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    clearShopFilters?.addEventListener(
        "click",
        clearAllShopFilters
    );


    /* =====================================================
       SORT OPTIONS
    ===================================================== */

    setupSortOptions();

}



/* =========================================================
   LIVE SEARCH SUGGESTIONS
   Added without changing existing search/filter logic
========================================================= */

let shopSearchSuggestions = null;
let activeSearchSuggestion = -1;


/* =========================================================
   SETUP SEARCH SUGGESTIONS
========================================================= */

function setupSearchSuggestions() {

    if (!shopSearch) {
        return;
    }

    createShopSearchSuggestions();


    /* ---------------------------------------------------------
       INPUT
    --------------------------------------------------------- */

    shopSearch.addEventListener(
        "input",
        () => {

            const value =
                shopSearch.value
                    .trim();

            activeSearchSuggestion = -1;

            if (value) {

                showShopSearchSuggestions(
                    value
                );

            } else {

                hideShopSearchSuggestions();

            }

        }
    );


    /* ---------------------------------------------------------
       FOCUS
    --------------------------------------------------------- */

    shopSearch.addEventListener(
        "focus",
        () => {

            const value =
                shopSearch.value
                    .trim();

            if (value) {

                showShopSearchSuggestions(
                    value
                );

            }

        }
    );


    /* ---------------------------------------------------------
       KEYBOARD
    --------------------------------------------------------- */

    shopSearch.addEventListener(
        "keydown",
        event => {

            if (
                !shopSearchSuggestions ||
                shopSearchSuggestions.style.display ===
                    "none"
            ) {
                return;
            }


            const items =
                shopSearchSuggestions
                    .querySelectorAll(
                        ".shop-search-suggestion-item"
                    );


            if (!items.length) {
                return;
            }


            /* Arrow Down */

            if (
                event.key === "ArrowDown"
            ) {

                event.preventDefault();

                activeSearchSuggestion++;

                if (
                    activeSearchSuggestion >=
                    items.length
                ) {

                    activeSearchSuggestion = 0;

                }

                updateActiveSearchSuggestion(
                    items
                );

            }


            /* Arrow Up */

            else if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();

                activeSearchSuggestion--;

                if (
                    activeSearchSuggestion < 0
                ) {

                    activeSearchSuggestion =
                        items.length - 1;

                }

                updateActiveSearchSuggestion(
                    items
                );

            }


            /* Enter */

            else if (
                event.key === "Enter"
            ) {

                if (
                    activeSearchSuggestion >= 0 &&
                    items[
                        activeSearchSuggestion
                    ]
                ) {

                    event.preventDefault();

                    items[
                        activeSearchSuggestion
                    ].click();

                }

            }


            /* Escape */

            else if (
                event.key === "Escape"
            ) {

                hideShopSearchSuggestions();

            }

        }
    );


    /* ---------------------------------------------------------
       OUTSIDE CLICK
    --------------------------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            if (
                !shopSearchSuggestions
            ) {
                return;
            }


            if (
                event.target === shopSearch ||
                shopSearchSuggestions.contains(
                    event.target
                )
            ) {

                return;

            }


            hideShopSearchSuggestions();

        }
    );


    /* ---------------------------------------------------------
       RESIZE
    --------------------------------------------------------- */

    window.addEventListener(
        "resize",
        positionShopSearchSuggestions
    );


    /* ---------------------------------------------------------
       SCROLL
    --------------------------------------------------------- */

    window.addEventListener(
        "scroll",
        positionShopSearchSuggestions,
        true
    );

}


/* =========================================================
   CREATE SEARCH SUGGESTION BOX
========================================================= */

function createShopSearchSuggestions() {

    if (
        shopSearchSuggestions
    ) {

        return;

    }


    shopSearchSuggestions =
        document.createElement(
            "div"
        );


    shopSearchSuggestions.id =
        "shopSearchSuggestions";


    shopSearchSuggestions.className =
        "shop-search-suggestions";


    shopSearchSuggestions.setAttribute(
        "role",
        "listbox"
    );


    document.body.appendChild(
        shopSearchSuggestions
    );


    addShopSearchSuggestionStyles();

}


/* =========================================================
   SHOW SEARCH SUGGESTIONS
========================================================= */

function showShopSearchSuggestions(
    value
) {

    if (
        !shopSearchSuggestions ||
        !products.length
    ) {

        return;

    }


    const search =
        String(value)
            .trim()
            .toLowerCase();


    if (!search) {

        hideShopSearchSuggestions();

        return;

    }


    let matches =
        products.filter(
            product => {

                const title =
                    String(
                        product.title || ""
                    )
                        .toLowerCase();


                const category =
                    String(
                        product.category || ""
                    )
                        .toLowerCase();


                const brand =
                    String(
                        product.brand || ""
                    )
                        .toLowerCase();


                const description =
                    String(
                        product.description || ""
                    )
                        .toLowerCase();


                return (

                    title.includes(
                        search
                    ) ||

                    category.includes(
                        search
                    ) ||

                    brand.includes(
                        search
                    ) ||

                    description.includes(
                        search
                    )

                );

            }
        );


    /* ---------------------------------------------------------
       CURRENT CATEGORY FILTER
    --------------------------------------------------------- */

    if (
        currentCategory &&
        currentCategory !== "all"
    ) {

        const selectedCategory =
            normalizeCategory(
                currentCategory
            );


        matches =
            matches.filter(
                product =>
                    normalizeCategory(
                        product.category
                    ) ===
                    selectedCategory
            );

    }


    /* ---------------------------------------------------------
       MAXIMUM 6 SUGGESTIONS
    --------------------------------------------------------- */

    matches =
        matches.slice(
            0,
            6
        );


    activeSearchSuggestion =
        -1;


    /* ---------------------------------------------------------
       NO RESULTS
    --------------------------------------------------------- */

    if (
        !matches.length
    ) {

        shopSearchSuggestions.innerHTML = `

            <div
                class="
                    shop-search-no-results
                "
            >

                <i
                    class="
                        fa-solid
                        fa-magnifying-glass
                    "
                ></i>

                <span>
                    No products found
                </span>

            </div>

        `;

    }


    /* ---------------------------------------------------------
       RESULTS
    --------------------------------------------------------- */

    else {

        shopSearchSuggestions.innerHTML =
            matches
                .map(
                    product =>
                        createShopSearchSuggestion(
                            product
                        )
                )
                .join("");


        shopSearchSuggestions
            .querySelectorAll(
                ".shop-search-suggestion-item"
            )
            .forEach(
                item => {

                    item.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            event.stopPropagation();


                            /* ---------------------------------
                               PRODUCT ID
                            --------------------------------- */

                            const id =
                                Number(
                                    item.dataset.productId
                                );


                            const product =
                                products.find(
                                    product =>
                                        Number(
                                            product.id
                                        ) === id
                                );


                            if (!product) {

                                return;

                            }


                            /* ---------------------------------
                               HIDE SEARCH SUGGESTIONS
                            --------------------------------- */

                            hideShopSearchSuggestions();


                            /* ---------------------------------
                               OPEN PRODUCT DETAILS PAGE
                               NO MODAL
                            --------------------------------- */

                            window.location.href =
                                `productDetails.html?id=${product.id}`;

                        }
                    );

                }
            );

    }


    /* ---------------------------------------------------------
       SHOW DROPDOWN
    --------------------------------------------------------- */

    shopSearchSuggestions.style.display =
        "block";


    /* ---------------------------------------------------------
       POSITION DROPDOWN
    --------------------------------------------------------- */

    positionShopSearchSuggestions();

}

/* =========================================================
   CREATE SINGLE SEARCH SUGGESTION
========================================================= */

function createShopSearchSuggestion(
    product
) {

    const rating =
        Number(
            product.rating?.rate || 0
        );


    const reviewCount =
        Number(
            product.rating?.count || 0
        );


    return `

        <button
            type="button"
            class="
                shop-search-suggestion-item
            "
            data-product-id="${product.id}"
            role="option"
        >

            <div
                class="
                    shop-search-suggestion-image
                "
            >

                <img
                    src="${escapeHTML(
                        product.image
                    )}"
                    alt="${escapeHTML(
                        product.title
                    )}"
                >

            </div>


            <div
                class="
                    shop-search-suggestion-info
                "
            >

                <strong
                    class="
                        shop-search-suggestion-title
                    "
                >
                    ${escapeHTML(
                        product.title
                    )}
                </strong>


                <span
                    class="
                        shop-search-suggestion-category
                    "
                >
                    ${formatCategory(
                        product.category
                    )}
                </span>


                <div
                    class="
                        shop-search-suggestion-meta
                    "
                >

                    <span
                        class="
                            shop-search-suggestion-price
                        "
                    >
                        $${Number(
                            product.price
                        ).toFixed(2)}
                    </span>


                    <span
                        class="
                            shop-search-suggestion-rating
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-star
                            "
                        ></i>

                        ${rating.toFixed(1)}

                        <small>
                            (${reviewCount})
                        </small>

                    </span>

                </div>

            </div>


            <i
                class="
                    fa-solid
                    fa-chevron-right
                    shop-search-suggestion-arrow
                "
            ></i>

        </button>

    `;

}


/* =========================================================
   POSITION SEARCH SUGGESTIONS
========================================================= */

function positionShopSearchSuggestions() {

    if (
        !shopSearchSuggestions ||
        shopSearchSuggestions.style.display === "none" ||
        !shopSearch
    ) {
        return;
    }


    /*
       IMPORTANT:
       Search suggestion width should match
       the FULL .search-box

       .search-box contains:
       Category + Search Input + Search Button
    */

    const searchBox =
        shopSearch.closest(".search-box") ||
        shopSearch.parentElement;


    if (!searchBox) {
        return;
    }


    const rect =
        searchBox.getBoundingClientRect();


    const viewportWidth =
        window.innerWidth;


    const viewportHeight =
        window.innerHeight;


    /* =====================================================
       DESKTOP
    ===================================================== */

    if (
        viewportWidth > 768
    ) {

        shopSearchSuggestions.style.position =
            "fixed";

        shopSearchSuggestions.style.left =
            `${rect.left}px`;

        shopSearchSuggestions.style.top =
            `${rect.bottom + 8}px`;

        shopSearchSuggestions.style.width =
            `${rect.width}px`;

        shopSearchSuggestions.style.maxWidth =
            `${rect.width}px`;

    }


    /* =====================================================
       MOBILE
    ===================================================== */

    else {

        const horizontalSpace =
            10;


        let left =
            rect.left;


        let width =
            rect.width;


        if (
            width >
            viewportWidth -
            horizontalSpace * 2
        ) {

            width =
                viewportWidth -
                horizontalSpace * 2;

        }


        left =
            Math.max(
                horizontalSpace,
                Math.min(
                    left,
                    viewportWidth -
                        width -
                        horizontalSpace
                )
            );


        const maxHeight =
            350;


        let top =
            rect.bottom + 6;


        if (
            top + maxHeight >
            viewportHeight -
            horizontalSpace
        ) {

            top =
                rect.top -
                maxHeight -
                6;

        }


        if (
            top < horizontalSpace
        ) {

            top =
                horizontalSpace;

        }


        shopSearchSuggestions.style.position =
            "fixed";

        shopSearchSuggestions.style.left =
            `${left}px`;

        shopSearchSuggestions.style.top =
            `${top}px`;

        shopSearchSuggestions.style.width =
            `${width}px`;

        shopSearchSuggestions.style.maxWidth =
            `${width}px`;

    }

}

/* =========================================================
   HIDE SEARCH SUGGESTIONS
========================================================= */

function hideShopSearchSuggestions() {

    if (
        !shopSearchSuggestions
    ) {

        return;

    }


    shopSearchSuggestions.style.display =
        "none";


    activeSearchSuggestion =
        -1;

}


/* =========================================================
   KEYBOARD ACTIVE ITEM
========================================================= */

function updateActiveSearchSuggestion(
    items
) {

    items.forEach(
        (
            item,
            index
        ) => {

            item.classList.toggle(
                "active",
                index ===
                    activeSearchSuggestion
            );

        }
    );


    if (
        activeSearchSuggestion >= 0 &&
        items[
            activeSearchSuggestion
        ]
    ) {

        items[
            activeSearchSuggestion
        ].scrollIntoView({
            block: "nearest"
        });

    }

}


/* =========================================================
   SEARCH SUGGESTION STYLES
========================================================= */

function addShopSearchSuggestionStyles() {

    if (
        document.getElementById(
            "shopSearchSuggestionStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "shopSearchSuggestionStyles";


    style.textContent = `

        /* =====================================================
           SEARCH BOX
        ===================================================== */

        .shop-search-suggestions {

            position: fixed;

            display: none;

            z-index: 99999;

            background: #ffffff;

            border:
                1px solid
                #e2e8f0;

            border-radius: 10px;

            box-shadow:
                0 15px 40px
                rgba(
                    15,
                    23,
                    42,
                    .15
                );

            overflow-x: hidden;

            overflow-y: auto;

            max-height: 420px;

            scrollbar-width: thin;

            scrollbar-color:
                #cbd5e1
                transparent;

        }


        /* =====================================================
           ITEM
        ===================================================== */

        .shop-search-suggestion-item {

            width: 100%;

            min-height: 72px;

            display: flex;

            align-items: center;

            gap: 12px;

            padding:
                10px 12px;

            margin: 0;

            border: 0;

            border-bottom:
                1px solid
                #f1f5f9;

            background: #ffffff;

            color: #172033;

            text-align: left;

            cursor: pointer;

            transition:
                background .18s ease;

        }


        .shop-search-suggestion-item:last-child {

            border-bottom: 0;

        }


        .shop-search-suggestion-item:hover,
        .shop-search-suggestion-item.active {

            background:
                #f8fafc;

        }


        /* =====================================================
           IMAGE
        ===================================================== */

        .shop-search-suggestion-image {

            width: 48px;

            height: 48px;

            flex:
                0 0 48px;

            display: flex;

            align-items: center;

            justify-content: center;

            background:
                #f8fafc;

            border-radius: 7px;

            overflow: hidden;

        }


        .shop-search-suggestion-image img {

            width: 100%;

            height: 100%;

            object-fit: contain;

        }


        /* =====================================================
           INFO
        ===================================================== */

        .shop-search-suggestion-info {

            min-width: 0;

            flex: 1;

        }


        .shop-search-suggestion-title {

            display: block;

            width: 100%;

            overflow: hidden;

            white-space: nowrap;

            text-overflow: ellipsis;

            color:
                #172033;

            font-size: 13px;

            font-weight: 700;

            line-height: 1.35;

        }


        .shop-search-suggestion-category {

            display: block;

            margin-top: 3px;

            color:
                #94a3b8;

            font-size: 11px;

            line-height: 1.3;

        }


        /* =====================================================
           META
        ===================================================== */

        .shop-search-suggestion-meta {

            display: flex;

            align-items: center;

            gap: 9px;

            margin-top: 4px;

        }


        .shop-search-suggestion-price {

            color:
                #16a34a;

            font-size: 12px;

            font-weight: 800;

        }


        .shop-search-suggestion-rating {

            display: inline-flex;

            align-items: center;

            gap: 3px;

            color:
                #f59e0b;

            font-size: 11px;

            font-weight: 700;

        }


        .shop-search-suggestion-rating i {

            font-size: 9px;

        }


        .shop-search-suggestion-rating small {

            color:
                #94a3b8;

            font-size: 10px;

            font-weight: 500;

        }


        /* =====================================================
           ARROW
        ===================================================== */

        .shop-search-suggestion-arrow {

            flex:
                0 0 auto;

            color:
                #94a3b8;

            font-size: 10px;

            margin-left: 3px;

        }


        /* =====================================================
           NO RESULTS
        ===================================================== */

        .shop-search-no-results {

            min-height: 85px;

            display: flex;

            align-items: center;

            justify-content: center;

            flex-direction: column;

            gap: 7px;

            padding: 18px;

            color:
                #64748b;

            font-size: 12px;

        }


        .shop-search-no-results i {

            color:
                #94a3b8;

            font-size: 18px;

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

            .shop-search-suggestions {

                max-height: 350px;

                border-radius: 9px;

            }


            .shop-search-suggestion-item {

                min-height: 62px;

                padding:
                    8px 10px;

                gap: 9px;

            }


            .shop-search-suggestion-image {

                width: 44px;

                height: 44px;

                flex:
                    0 0 44px;

            }


            .shop-search-suggestion-title {

                font-size: 12px;

            }


            .shop-search-suggestion-category {

                font-size: 10px;

            }


            .shop-search-suggestion-price {

                font-size: 11px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   CUSTOM SHOP DROPDOWNS
========================================================= */

function setupCustomSelects() {

    document
        .querySelectorAll(
            ".shop-control .select-wrap"
        )
        .forEach(
            selectWrap => {

                const select =
                    selectWrap.querySelector(
                        "select"
                    );

                if (!select) {
                    return;
                }


                /* Remove old Font Awesome arrow */

                const oldArrow =
                    selectWrap.querySelector(
                        ":scope > i"
                    );

                if (oldArrow) {
                    oldArrow.remove();
                }


                /* Prevent duplicate setup */

                if (
                    selectWrap.querySelector(
                        ".custom-select-button"
                    )
                ) {
                    return;
                }


                /* -------------------------------------------------
                   BUTTON
                ------------------------------------------------- */

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "custom-select-button";

                button.setAttribute(
                    "aria-haspopup",
                    "listbox"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );


                /* -------------------------------------------------
                   BUTTON CONTENT
                ------------------------------------------------- */

                const text =
                    document.createElement(
                        "span"
                    );

                text.className =
                    "custom-select-text";


                const arrow =
                    document.createElement(
                        "i"
                    );

                arrow.className =
                    "fa-solid fa-chevron-down custom-select-arrow";


                button.appendChild(
                    text
                );

                button.appendChild(
                    arrow
                );


                /* -------------------------------------------------
                   DROPDOWN
                ------------------------------------------------- */

                const dropdown =
                    document.createElement(
                        "div"
                    );

                dropdown.className =
                    "custom-select-dropdown";

                dropdown.setAttribute(
                    "role",
                    "listbox"
                );


                selectWrap.appendChild(
                    button
                );

                selectWrap.appendChild(
                    dropdown
                );


                /* Hide original select */

                select.classList.add(
                    "custom-select-native"
                );


                /* -------------------------------------------------
                   BUILD OPTIONS
                ------------------------------------------------- */

                function buildOptions() {

                    dropdown.innerHTML =
                        "";


                    [
                        ...select.options
                    ]
                        .forEach(
                            option => {

                                const item =
                                    document.createElement(
                                        "button"
                                    );

                                item.type =
                                    "button";

                                item.className =
                                    "custom-select-option";

                                item.dataset.value =
                                    option.value;

                                item.setAttribute(
                                    "role",
                                    "option"
                                );

                                item.textContent =
                                    option.textContent.trim();


                                if (
                                    option.value ===
                                    select.value
                                ) {

                                    item.classList.add(
                                        "selected"
                                    );

                                    item.setAttribute(
                                        "aria-selected",
                                        "true"
                                    );

                                }


                                item.addEventListener(
                                    "click",
                                    event => {

                                        event.preventDefault();

                                        event.stopPropagation();


                                        select.value =
                                            option.value;


                                        select.dispatchEvent(
                                            new Event(
                                                "change",
                                                {
                                                    bubbles: true
                                                }
                                            )
                                        );


                                        updateButton();

                                        closeDropdown();

                                    }
                                );


                                dropdown.appendChild(
                                    item
                                );

                            }
                        );


                    updateButton();

                }


                /* -------------------------------------------------
                   UPDATE BUTTON
                ------------------------------------------------- */

                function updateButton() {

                    const selected =
                        select.options[
                            select.selectedIndex
                        ];


                    if (selected) {

                        text.textContent =
                            selected.textContent.trim();

                    }


                    dropdown
                        .querySelectorAll(
                            ".custom-select-option"
                        )
                        .forEach(
                            item => {

                                const isSelected =
                                    item.dataset.value ===
                                    select.value;


                                item.classList.toggle(
                                    "selected",
                                    isSelected
                                );


                                item.setAttribute(
                                    "aria-selected",
                                    isSelected
                                        ? "true"
                                        : "false"
                                );

                            }
                        );

                }


                /* -------------------------------------------------
                   OPEN
                ------------------------------------------------- */

                function openDropdown() {

                    closeAllCustomSelects(
                        selectWrap
                    );


                    selectWrap.classList.add(
                        "custom-select-open"
                    );


                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }


                /* -------------------------------------------------
                   CLOSE
                ------------------------------------------------- */

                function closeDropdown() {

                    selectWrap.classList.remove(
                        "custom-select-open"
                    );


                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }


                /* -------------------------------------------------
                   BUTTON CLICK
                ------------------------------------------------- */

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        if (
                            selectWrap.classList.contains(
                                "custom-select-open"
                            )
                        ) {

                            closeDropdown();

                        }

                        else {

                            openDropdown();

                        }

                    }
                );


                /* -------------------------------------------------
                   SELECT CHANGE
                ------------------------------------------------- */

                select.addEventListener(
                    "change",
                    () => {

                        updateButton();

                    }
                );


                /* -------------------------------------------------
                   WATCH DYNAMIC OPTIONS
                   API category options are rebuilt later.
                ------------------------------------------------- */

                const observer =
                    new MutationObserver(
                        () => {

                            buildOptions();

                        }
                    );


                observer.observe(
                    select,
                    {
                        childList: true
                    }
                );


                /* Initial */

                buildOptions();

            }
        );


    /* ---------------------------------------------------------
       OUTSIDE CLICK
    --------------------------------------------------------- */

    document.addEventListener(
        "click",
        () => {

            closeAllCustomSelects();

        }
    );


    /* ---------------------------------------------------------
       ESCAPE
    --------------------------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeAllCustomSelects();

            }

        }
    );

}


/* =========================================================
   CLOSE ALL CUSTOM SELECTS
========================================================= */

function closeAllCustomSelects(
    except = null
) {

    document
        .querySelectorAll(
            ".shop-control .select-wrap.custom-select-open"
        )
        .forEach(
            selectWrap => {

                if (
                    selectWrap ===
                    except
                ) {
                    return;
                }


                selectWrap.classList.remove(
                    "custom-select-open"
                );


                const button =
                    selectWrap.querySelector(
                        ".custom-select-button"
                    );


                button?.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
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
                API_URL,
                {
                    method: "GET",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `API request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !Array.isArray(
                data.products
            )
        ) {

            throw new Error(
                "Invalid API response"
            );

        }


        products =
            data.products.map(
                product => {

                    const reviewCount =
                        Array.isArray(
                            product.reviews
                        )
                            ? product.reviews.length
                            : 0;


                    return {

                        id:
                            Number(
                                product.id
                            ),

                        title:
                            product.title ||
                            "Untitled Product",

                        price:
                            Number(
                                product.price
                            ) || 0,

                        description:
                            product.description ||
                            "No description available.",

                        category:
                            product.category ||
                            "general",

                        image:
                            product.thumbnail ||
                            (
                                Array.isArray(
                                    product.images
                                )
                                    ? product.images[0]
                                    : ""
                            ),

                        rating: {

                            rate:
                                Number(
                                    product.rating
                                ) || 0,

                            count:
                                reviewCount

                        },

                        stock:
                            Number(
                                product.stock
                            ) || 0,

                        brand:
                            product.brand ||
                            "",

                        discountPercentage:
                            Number(
                                product.discountPercentage
                            ) || 0

                    };

                }
            );


        /* Remove invalid wishlist IDs */

        wishlist =
            wishlist.filter(
                id =>
                    products.some(
                        product =>
                            product.id ===
                            Number(id)
                    )
            );


        saveWishlist();


       /* =====================================================
        READ URL FILTERS
        Product Details / Other pages
        → Shop page
        ===================================================== */

        const params =
        new URLSearchParams(
            window.location.search
        );


        const urlCategory =
        params.get("category");


        const urlSearch =
        params.get("search");


        /* -----------------------------------------------------
        CATEGORY FROM URL
        ----------------------------------------------------- */

        if (urlCategory) {

        currentCategory =
            normalizeCategory(
                urlCategory
            );

        }


        /* -----------------------------------------------------
        SEARCH FROM URL
        ----------------------------------------------------- */

        if (urlSearch) {

        currentSearch =
            urlSearch
                .trim()
                .toLowerCase();

        }


        /* -----------------------------------------------------
        POPULATE DROPDOWNS
        ----------------------------------------------------- */

        populateCategoryOptions();


        /* -----------------------------------------------------
        SYNC SELECT VALUES
        ----------------------------------------------------- */

        if (shopCategory) {

        shopCategory.value =
            currentCategory;

        }


        if (shopHeaderCategory) {

        shopHeaderCategory.value =
            currentCategory;

        }


        /* -----------------------------------------------------
        SEARCH INPUT
        ----------------------------------------------------- */

        if (shopSearch) {

        shopSearch.value =
            currentSearch;

        }


        /* -----------------------------------------------------
        APPLY FILTER
        ----------------------------------------------------- */

        applyShopFilters();


        updateCart();

        updateWishlistUI();

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
   POPULATE CATEGORY SELECTS
========================================================= */

function populateCategoryOptions() {

    const categorySet =
        new Set();


    products.forEach(
        product => {

            if (
                product.category
            ) {

                categorySet.add(
                    String(
                        product.category
                    )
                );

            }

        }
    );


    const categories =
        [
            ...categorySet
        ].sort(
            (a, b) =>
                a.localeCompare(b)
        );


    const selects = [

        shopCategory,

        shopHeaderCategory

    ];


    selects.forEach(
        select => {

            if (!select) {
                return;
            }


            const selected =
                select.value ||
                currentCategory ||
                "all";


            select.innerHTML = `

                <option value="all">
                    All Categories
                </option>

            `;


            categories.forEach(
                category => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        category;


                    option.textContent =
                        formatCategory(
                            category
                        );


                    select.appendChild(
                        option
                    );

                }
            );


            const exists =
                [
                    ...select.options
                ].some(
                    option =>
                        option.value ===
                        selected
                );


            select.value =
                exists
                    ? selected
                    : "all";

        }
    );


    if (
        currentCategory !== "all" &&
        !categories.includes(
            currentCategory
        )
    ) {

        currentCategory =
            "all";

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
            {
                length: 8
            },
            () => `

                <article
                    class="
                        product-card
                        shop-loading-card
                    "
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
                id="shopRetryBtn"
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


    document
        .getElementById(
            "shopRetryBtn"
        )
        ?.addEventListener(
            "click",
            loadProducts
        );

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

/* =========================================================
   FILTER PRODUCTS
========================================================= */

function applyShopFilters() {

    if (!products.length) {
        return;
    }


    let result =
        [
            ...products
        ];


    const search =
        currentSearch
            .trim()
            .toLowerCase();


    /* =====================================================
       SEARCH
    ===================================================== */

    if (search) {

        result =
            result.filter(
                product => {

                    const title =
                        String(
                            product.title || ""
                        )
                            .toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        )
                            .toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        )
                            .toLowerCase();


                    const brand =
                        String(
                            product.brand || ""
                        )
                            .toLowerCase();


                    return (

                        title.includes(search) ||

                        category.includes(search) ||

                        description.includes(search) ||

                        brand.includes(search)

                    );

                }
            );

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    const category =
        normalizeCategory(
            currentCategory || "all"
        );


    if (
        category &&
        category !== "all"
    ) {

        result =
            result.filter(
                product =>
                    normalizeCategory(
                        product.category
                    ) === category
            );

    }


    /* =====================================================
       SORT
    ===================================================== */

    result =
        sortProducts(
            result,
            currentSort
        );


    /* =====================================================
       STORE FILTERED PRODUCTS
    ===================================================== */

    currentFilteredProducts =
        result;


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    renderShopProducts(
        result
    );


    /* =====================================================
       RESULT COUNT
    ===================================================== */

    updateShopResultCount(
        result.length
    );


    /* =====================================================
       ACTIVE FILTERS
    ===================================================== */

    renderActiveFilters();

}



function renderShopProducts(list) {

    if (!shopProducts) {
        return;
    }


    currentFilteredProducts =
        list;


    const totalPages =
        Math.ceil(
            list.length /
            PRODUCTS_PER_PAGE
        );


    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages || 1;

    }


    const start =
        (
            currentPage - 1
        ) *
        PRODUCTS_PER_PAGE;


    const pageProducts =
        list.slice(
            start,
            start + PRODUCTS_PER_PAGE
        );


    shopProducts.innerHTML =
        pageProducts
            .map(
                product =>
                    createShopProductCard(
                        product
                    )
            )
            .join("");


    attachShopProductEvents();


    renderPagination(
        totalPages
    );

}

function renderPagination(totalPages) {

    if (!shopPagination) {
        return;
    }

    if (totalPages <= 1) {
        shopPagination.innerHTML = "";
        return;
    }


    let pages = [];


    /* =====================================================
       5 OR FEWER PAGES
    ===================================================== */

    if (totalPages <= 5) {

        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {
            pages.push(i);
        }

    }


    /* =====================================================
       MORE THAN 5 PAGES
    ===================================================== */

    else {

        let startPage;

        /*
         * First 3 pages
         * 1 2 3 ... 16 17
         */
        if (currentPage <= 3) {

            startPage = 1;

        }

        /*
         * Sliding pages
         * 2 3 4 5 ... 16 17
         */
        else {

            startPage =
                currentPage - 2;

        }


        /*
         * Don't go beyond the last section
         */
        if (
            startPage >
            totalPages - 4
        ) {

            startPage =
                totalPages - 4;

        }


        /*
         * Add 5-page sliding window
         */
        for (
            let i = startPage;
            i <= startPage + 4;
            i++
        ) {

            pages.push(i);

        }

    }


    shopPagination.innerHTML = `

        <button
            type="button"
            ${currentPage === 1 ? "disabled" : ""}
            onclick="changeShopPage(${currentPage - 1})"
        >
            ‹
        </button>


        ${pages.map(
            page => `

                <button
                    type="button"
                    class="${
                        currentPage === page
                            ? "active"
                            : ""
                    }"
                    onclick="changeShopPage(${page})"
                >
                    ${page}
                </button>

            `
        ).join("")}


        <button
            type="button"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            onclick="changeShopPage(${currentPage + 1})"
        >
            ›
        </button>

    `;

}


function changeShopPage(page) {

    currentPage =
        page;


    renderShopProducts(
        currentFilteredProducts
    );


    window.scrollTo({
        top:
            shopProducts.offsetTop - 100,
        behavior:
            "smooth"
    });

}




/* =========================================================
   SORT PRODUCTS
========================================================= */

function sortProducts(
    list,
    sortType
) {

    const sorted =
        [
            ...list
        ];


    switch (
        sortType
    ) {

        case "price-low":

            return sorted.sort(
                (a, b) =>
                    Number(
                        a.price
                    ) -
                    Number(
                        b.price
                    )
            );


        case "price-high":

            return sorted.sort(
                (a, b) =>
                    Number(
                        b.price
                    ) -
                    Number(
                        a.price
                    )
            );


        case "rating":

            return sorted.sort(
                (a, b) => {

                    const aRate =
                        Number(
                            a.rating?.rate || 0
                        );

                    const bRate =
                        Number(
                            b.rating?.rate || 0
                        );


                    if (
                        bRate !==
                        aRate
                    ) {

                        return (
                            bRate -
                            aRate
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
                (a, b) =>
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
                (a, b) => {

                    const aRating =
                        Number(
                            a.rating?.rate || 0
                        );

                    const bRating =
                        Number(
                            b.rating?.rate || 0
                        );


                    const aReviews =
                        Number(
                            a.rating?.count || 0
                        );

                    const bReviews =
                        Number(
                            b.rating?.count || 0
                        );


                    const aScore =
                        (
                            aRating * 20
                        ) +
                        Math.log10(
                            aReviews + 1
                        );


                    const bScore =
                        (
                            bRating * 20
                        ) +
                        Math.log10(
                            bReviews + 1
                        );


                    return (
                        bScore -
                        aScore
                    );

                }
            );


        default:

            return sorted;

    }

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

currentPage = 1;

currentFilteredProducts = result;

renderShopProducts(result);

updateShopResultCount(result.length);

renderActiveFilters();


/* =========================================================
   PRODUCT CARD
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


    const discounts = [

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


    const apiDiscount =
        Number(
            product.discountPercentage || 0
        );


    const fallbackDiscount =
        discounts[
            (
                Number(
                    product.id
                ) +
                index
            ) %
            discounts.length
        ];


    const discount =
        apiDiscount > 0
            ? Math.round(
                apiDiscount
            )
            : fallbackDiscount;


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
                    src="${escapeHTML(
                        product.image
                    )}"
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

    if (
        !shopProducts
    ) {

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

            openCart();

            break;


        case "wishlist":

            toggleWishlist(
                id
            );

            break;


        case "view":

            /*
               Existing ShopMax behavior:
               Product opens details page.
            */

            window.location.href =
                `productDetails.html?id=${product.id}`;

            break;

    }

}


/* =========================================================
   RESULT COUNT
========================================================= */

function updateShopResultCount(
    count
) {

    if (
        shopResultCount
    ) {

        shopResultCount.textContent =
            count;

    }

}


/* =========================================================
   ACTIVE FILTERS
========================================================= */

function renderActiveFilters() {

    if (
        !shopActiveFilter
    ) {

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
   CLEAR ACTIVE FILTER
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


        if (
            shopSearch
        ) {

            shopSearch.value =
                "";

        }

    }


    if (
        type === "category"
    ) {

        currentCategory =
            "all";


        if (
            shopCategory
        ) {

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


        if (
            shopSort
        ) {

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
   CLEAR ALL FILTERS
========================================================= */

function clearAllShopFilters() {

    currentSearch =
        "";

    currentCategory =
        "all";

    currentSort =
        "default";


    if (
        shopSearch
    ) {

        shopSearch.value =
            "";

    }


    if (
        shopCategory
    ) {

        shopCategory.value =
            "all";

    }


    if (
        shopHeaderCategory
    ) {

        shopHeaderCategory.value =
            "all";

    }


    if (
        shopSort
    ) {

        shopSort.value =
            "default";

    }


    applyShopFilters();

}

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function setupMobileNavigation() {

    const navigation =
        document.querySelector(
            ".navigation"
        );

    const navigationInner =
        document.querySelector(
            ".navigation-inner"
        );

    const desktopNav =
        document.querySelector(
            ".nav-links"
        );

    if (
        !navigation ||
        !navigationInner
    ) {

        return;

    }


    /* =====================================================
       MOBILE TOGGLE
    ===================================================== */

    mobileMenuToggle =
        document.getElementById(
            "mobileMenuToggle"
        );


    if (!mobileMenuToggle) {

        mobileMenuToggle =
            document.createElement(
                "button"
            );

        mobileMenuToggle.type =
            "button";

        mobileMenuToggle.className =
            "mobile-menu-toggle";

        mobileMenuToggle.id =
            "mobileMenuToggle";

        mobileMenuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        mobileMenuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuToggle.innerHTML =
            `
                <i class="fa-solid fa-bars"></i>
            `;

        navigationInner.appendChild(
            mobileMenuToggle
        );

    }


    /* =====================================================
       MOBILE NAV
    ===================================================== */

    mobileNav =
        document.getElementById(
            "mobileNav"
        );


    if (!mobileNav) {

        mobileNav =
            document.createElement(
                "nav"
            );

        mobileNav.id =
            "mobileNav";

        mobileNav.setAttribute(
            "aria-label",
            "Mobile Navigation"
        );

        navigation.appendChild(
            mobileNav
        );

    }


    /* =====================================================
       OVERLAY
    ===================================================== */

    mobileNavOverlay =
        document.getElementById(
            "mobileNavOverlay"
        );


    if (!mobileNavOverlay) {

        mobileNavOverlay =
            document.createElement(
                "div"
            );

        mobileNavOverlay.id =
            "mobileNavOverlay";

        document.body.appendChild(
            mobileNavOverlay
        );

    }


    /* =====================================================
       COPY DESKTOP NAV LINKS
    ===================================================== */

    if (
        desktopNav &&
        mobileNav.children.length === 0
    ) {

        desktopNav
            .querySelectorAll(
                "a"
            )
            .forEach(
                originalLink => {

                    const link =
                        document.createElement(
                            "a"
                        );

                    link.href =
                        originalLink.getAttribute(
                            "href"
                        ) || "#";

                    link.textContent =
                        originalLink.textContent
                            .trim();

                    mobileNav.appendChild(
                        link
                    );

                }
            );

    }


    /* =====================================================
       OPEN
    ===================================================== */

    function openMobileMenu() {

        mobileNav.classList.add(
            "is-open"
        );

        mobileNavOverlay.classList.add(
            "is-visible"
        );

        mobileMenuToggle.classList.add(
            "is-active"
        );

        mobileMenuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileMenuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        mobileMenuToggle.innerHTML =
            `
                <i class="fa-solid fa-xmark"></i>
            `;

        document.body.classList.add(
            "mobile-menu-open"
        );

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function closeMobileMenu() {

        mobileNav?.classList.remove(
            "is-open"
        );

        mobileNavOverlay?.classList.remove(
            "is-visible"
        );

        mobileMenuToggle?.classList.remove(
            "is-active"
        );

        mobileMenuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuToggle?.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        if (
            mobileMenuToggle
        ) {

            mobileMenuToggle.innerHTML =
                `
                    <i class="fa-solid fa-bars"></i>
                `;

        }

        document.body.classList.remove(
            "mobile-menu-open"
        );

    }


    /* =====================================================
       PREVENT DUPLICATE LISTENER
    ===================================================== */

    if (
        mobileMenuToggle.dataset.shopmaxBound ===
        "true"
    ) {

        return;

    }

    mobileMenuToggle.dataset.shopmaxBound =
        "true";


    /* =====================================================
       TOGGLE CLICK
    ===================================================== */

    mobileMenuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                mobileNav.classList.contains(
                    "is-open"
                );


            if (
                isOpen
            ) {

                closeMobileMenu();

            }

            else {

                /* Close All Categories */

                closeCategoryMenu();

                openMobileMenu();

            }

        }
    );


    /* =====================================================
       OVERLAY CLICK
    ===================================================== */

    mobileNavOverlay.addEventListener(
        "click",
        closeMobileMenu
    );


    /* =====================================================
       MOBILE LINK CLICK
    ===================================================== */

    mobileNav.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a"
                );


            if (!link) {
                return;
            }


            const href =
                link.getAttribute(
                    "href"
                ) || "";


            event.preventDefault();

            event.stopPropagation();


            closeMobileMenu();


            if (
                !href ||
                href === "#"
            ) {

                return;

            }


            const currentPage =
                location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();


            const targetPage =
                href
                    .split("/")
                    .pop()
                    .toLowerCase();


            /* Same page */

            if (
                currentPage ===
                targetPage
            ) {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                return;

            }


            /* Other page */

            window.location.href =
                href;

        }
    );


    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();

            }

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

                closeMobileMenu();

            }

        }
    );

}



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
       CATEGORY DROPDOWN CLICK
    ===================================================== */

    categoryDropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            /* -------------------------------------------------
               SUBMENU LINK
            ------------------------------------------------- */

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

                currentCategory =
                    normalizeCategory(
                        category
                    );

                if (shopCategory) {

    shopCategory.value =
        currentCategory;

    shopCategory.dispatchEvent(
        new Event(
            "change",
            {
                bubbles: true
            }
        )
    );

}


if (shopHeaderCategory) {

    shopHeaderCategory.value =
        currentCategory;

    shopHeaderCategory.dispatchEvent(
        new Event(
            "change",
            {
                bubbles: true
            }
        )
    );

}


applyShopFilters();

closeCategoryMenu();

return;
            }


            /* -------------------------------------------------
               PARENT CATEGORY BUTTON
            ------------------------------------------------- */

            const categoryButton =
                event.target.closest(
                    ".category-item > button"
                );

            if (!categoryButton) {
                return;
            }

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


            /* =================================================
               MOBILE + TABLET
               <= 1024px
            ================================================= */

            if (
                submenu &&
                window.innerWidth <= 1024
            ) {

                event.preventDefault();

                const isOpen =
                    item.classList.contains(
                        "mobile-open"
                    );


                /* Close other submenus */

                categoryDropdown
                    .querySelectorAll(
                        ".category-item.mobile-open"
                    )
                    .forEach(
                        otherItem => {

                            if (
                                otherItem === item
                            ) {
                                return;
                            }

                            otherItem.classList.remove(
                                "mobile-open"
                            );

                            const otherSubmenu =
                                otherItem.querySelector(
                                    ":scope > .category-submenu"
                                );

                            if (otherSubmenu) {

                                otherSubmenu.style.display =
                                    "none";

                                otherSubmenu.style.visibility =
                                    "hidden";

                                otherSubmenu.style.opacity =
                                    "0";

                                otherSubmenu.style.pointerEvents =
                                    "none";

                            }

                        }
                    );


                /* Close current */

                if (isOpen) {

                    item.classList.remove(
                        "mobile-open"
                    );

                    submenu.style.display =
                        "none";

                    submenu.style.visibility =
                        "hidden";

                    submenu.style.opacity =
                        "0";

                    submenu.style.pointerEvents =
                        "none";

                    return;
                }


                /* Open current */

                item.classList.add(
                    "mobile-open"
                );

                submenu.style.display =
                    "block";

                submenu.style.visibility =
                    "visible";

                submenu.style.opacity =
                    "1";

                submenu.style.pointerEvents =
                    "auto";

                submenu.style.transform =
                    "translateX(0)";


                /* =================================================
                   MOBILE
                   <= 768px
                   submenu নিচে
                ================================================= */

                if (
                    window.innerWidth <= 768
                ) {

                    submenu.style.position =
                        "static";

                    submenu.style.left =
                        "auto";

                    submenu.style.top =
                        "auto";

                    submenu.style.width =
                        "100%";

                    submenu.style.maxWidth =
                        "100%";

                    submenu.style.marginTop =
                        "4px";

                    submenu.style.transform =
                        "none";

                    submenu.style.maxHeight =
                        "none";

                    submenu.style.overflow =
                        "visible";

                }


                /* =================================================
                   TABLET
                   769px - 1024px
                   submenu ডান পাশে
                ================================================= */

                else {

                    submenu.style.position =
                        "absolute";

                    submenu.style.left =
                        "calc(100% + 5px)";

                    submenu.style.top =
                        "-1px";

                    submenu.style.width =
                        "190px";

                    submenu.style.maxWidth =
                        "190px";

                    submenu.style.marginTop =
                        "0";

                    submenu.style.transform =
                        "translateX(0)";

                    submenu.style.maxHeight =
                        "60vh";

                    submenu.style.overflowY =
                        "auto";

                }

                return;
            }


            /* =================================================
               DESKTOP
               >= 1025px
            ================================================= */

            const category =
                categoryButton.dataset.category;

            if (!category) {
                return;
            }

            event.preventDefault();

            const normalized =
                normalizeCategory(
                    category
                );


            const hasMatchingProductCategory =
                products.some(
                    product =>
                        normalizeCategory(
                            product.category
                        ) ===
                        normalized
                );


            /* Parent category */

            if (
                normalized !== "all" &&
                !hasMatchingProductCategory &&
                submenu
            ) {

                const isOpen =
                    item.classList.contains(
                        "desktop-open"
                    );


                categoryDropdown
                    .querySelectorAll(
                        ".category-item.desktop-open"
                    )
                    .forEach(
                        otherItem => {

                            if (
                                otherItem !== item
                            ) {

                                otherItem.classList.remove(
                                    "desktop-open"
                                );

                            }

                        }
                    );


                item.classList.toggle(
                    "desktop-open",
                    !isOpen
                );

                return;
            }


            /* Normal category */

            currentCategory =
                normalized;

            if (shopCategory) {

                shopCategory.value =
                    normalized;

            }

            if (shopHeaderCategory) {

                shopHeaderCategory.value =
                    normalized;

            }

            applyShopFilters();

            closeCategoryMenu();

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
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeCategoryMenu();

            }

        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */
    /* =====================================================
   RESIZE
   Tablet → Desktop / Desktop → Tablet
===================================================== */

window.addEventListener(
    "resize",
    () => {

        const width =
            window.innerWidth;


        /* ===============================================
           DESKTOP
           1025px+
        =============================================== */

        if (
            width > 1024
        ) {

            /*
               Close old tablet/mobile submenu
            */

            categoryDropdown
                .querySelectorAll(
                    ".category-item.mobile-open"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "mobile-open"
                        );

                    }
                );


            /*
               Remove old desktop-open state
            */

            categoryDropdown
                .querySelectorAll(
                    ".category-item.desktop-open"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "desktop-open"
                        );

                    }
                );


            /*
               Remove inline styles
               created by tablet/mobile mode
            */

            categoryDropdown
                .querySelectorAll(
                    ".category-submenu"
                )
                .forEach(
                    submenu => {

                        submenu.style.display =
                            "";

                        submenu.style.visibility =
                            "";

                        submenu.style.opacity =
                            "";

                        submenu.style.pointerEvents =
                            "";

                        submenu.style.position =
                            "";

                        submenu.style.left =
                            "";

                        submenu.style.top =
                            "";

                        submenu.style.width =
                            "";

                        submenu.style.maxWidth =
                            "";

                        submenu.style.marginTop =
                            "";

                        submenu.style.transform =
                            "";

                        submenu.style.maxHeight =
                            "";

                        submenu.style.overflow =
                            "";

                        submenu.style.overflowY =
                            "";

                    }
                );

        }


        /* ===============================================
           TABLET / MOBILE
           0 - 1024px
        =============================================== */

        else {

            /*
               Desktop state যেন carry না করে
            */

            categoryDropdown
                .querySelectorAll(
                    ".category-item.desktop-open"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "desktop-open"
                        );

                    }
                );

        }

    }
);
    

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


    categoryDropdown
        ?.querySelectorAll(
            ".category-item.mobile-open, .category-item.desktop-open"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "mobile-open",
                    "desktop-open"
                );

            }
        );

}


/* =========================================================
   CATEGORY NORMALIZE
========================================================= */

function normalizeCategory(
    value
) {

    if (
        !value
    ) {

        return "all";

    }


    return String(
        value
    )
        .trim()
        .toLowerCase()
        .replace(
            /&/g,
            "and"
        )
        .replace(
            /'/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /-+/g,
            "-"
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

    if (
        !product
    ) {

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


    if (
        existing
    ) {

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

    updateCartTotal();

}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    if (
        !cartCount
    ) {

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

    if (
        !cartTotal
    ) {

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

    if (
        !cartItems
    ) {

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
                    src="${escapeHTML(
                        item.image
                    )}"
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


    if (
        !button
    ) {

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


    if (
        !item
    ) {

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


    saveCart();

    updateCart();

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    closeWishlist();


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

    }

    else {

        wishlist.push(
            id
        );

    }


    wishlist =
        [
            ...new Set(
                wishlist.map(
                    Number
                )
            )
        ];


    saveWishlist();

    updateWishlistUI();

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
   UPDATE WISHLIST
========================================================= */

function updateWishlistUI() {

    if (
        wishlistCount
    ) {

        wishlistCount.textContent =
            wishlist.length;

    }


    if (
        wishlistCountText
    ) {

        wishlistCountText.textContent =
            wishlist.length === 1
                ? "1 item"
                : `${wishlist.length} items`;

    }


    renderWishlist();

    refreshVisibleWishlistButtons();

}


/* =========================================================
   REFRESH WISHLIST BUTTONS
========================================================= */

function refreshVisibleWishlistButtons() {

    document
        .querySelectorAll(
            "[data-shop-action='wishlist']"
        )
        .forEach(
            button => {

                const id =
                    Number(
                        button.dataset.id
                    );


                const liked =
                    wishlist.includes(
                        id
                    );


                button.classList.toggle(
                    "wishlisted",
                    liked
                );


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (
                    icon
                ) {

                    icon.classList.toggle(
                        "fa-solid",
                        liked
                    );

                    icon.classList.toggle(
                        "fa-regular",
                        !liked
                    );

                }

            }
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

    if (
        !wishlistItems
    ) {

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
        !items.length
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
                product => `

                    <div
                        class="wishlist-item"
                    >

                        <div
                            class="wishlist-item-image"
                        >

                            <img
                                src="${escapeHTML(
                                    product.image
                                )}"
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

                `
            )
            .join("");

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


    if (
        !button
    ) {

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


    if (
        !product
    ) {

        return;

    }


    if (
        action === "cart"
    ) {

        addToCart(
            product,
            1
        );


        openCart();


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
   MODAL SETUP
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


            addToCart(
                currentModalProduct,
                modalQuantity
            );


            closeProductModal();

            openCart();

        }
    );


    modalBuyNow?.addEventListener(
        "click",
        () => {

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

            openCart();

        }
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


    currentModalProduct =
        product;


    modalQuantity =
        1;


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


    if (
        modalProductRating
    ) {

        const rating =
            Number(
                product.rating?.rate || 0
            );


        const reviews =
            Number(
                product.rating?.count || 0
            );


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
                (${reviews} reviews)
            </span>

        `;

    }


    if (
        modalProductPrice
    ) {

        modalProductPrice.textContent =
            `$${Number(
                product.price
            ).toFixed(2)}`;

    }


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


    document.body.classList.remove(
        "modal-open"
    );


    currentModalProduct =
        null;

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
   CHECKOUT
========================================================= */

function checkout() {

    if (
        !cart.length
    ) {

        return;

    }


    window.location.href =
        "checkout.html";

}


/* =========================================================
   HELPERS
========================================================= */

function formatCategory(
    value
) {

    if (
        !value
    ) {

        return "";

    }


    const specialNames = {

        "mens-shirts":
            "Men's Shirts",

        "mens-shoes":
            "Men's Shoes",

        "mens-watches":
            "Men's Watches",

        "womens-dresses":
            "Women's Dresses",

        "womens-shoes":
            "Women's Shoes",

        "womens-watches":
            "Women's Watches",

        "home-decoration":
            "Home Decoration",

        "kitchen-accessories":
            "Kitchen Accessories",

        "mobile-accessories":
            "Mobile Accessories",

        "sports-accessories":
            "Sports Accessories"

    };


    const normalized =
        normalizeCategory(
            value
        );


    if (
        specialNames[
            normalized
        ]
    ) {

        return specialNames[
            normalized
        ];

    }


    return String(
        value
    )
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

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

window.openCart =
    openCart;

window.closeCart =
    closeCart;

window.openWishlist =
    openWishlist;

window.closeWishlist =
    closeWishlist;

window.addToCart =
    addToCart;

window.toggleWishlist =
    toggleWishlist;

window.loadProducts =
    loadProducts;

window.openProductModal =
    openProductModal;

window.closeProductModal =
    closeProductModal;


/* =========================================================
   END
========================================================= */