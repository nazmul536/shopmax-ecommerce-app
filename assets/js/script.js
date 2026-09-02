/* =========================================================
   SHOPMAX E-COMMERCE
   CLEAN / UPDATED JAVASCRIPT
   =========================================================

   FEATURES
   - DummyJSON Product API
   - Dynamic Categories
   - Flash Sale
   - Trending Products
   - Search
   - Category Filter
   - Category Menu
   - Mobile Menu
   - Cart
   - Wishlist
   - Product Quick View
   - Recently Viewed
   - Countdown
   - LocalStorage
   - Toast
   - No unnecessary reload for same-page actions
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL = "https://dummyjson.com/products?limit=0";


/* =========================================================
   GLOBAL STATE
========================================================= */

let products = [];

let categories = [];


/* =========================================================
   CART
========================================================= */

let cart = JSON.parse(
    localStorage.getItem("shopmax-cart")
) || [];


/* =========================================================
   WISHLIST
========================================================= */

let wishlist = JSON.parse(
    localStorage.getItem("shopmax-wishlist")
) || [];

wishlist = [
    ...new Set(
        wishlist.map(Number)
    )
];


/* =========================================================
   RECENTLY VIEWED
========================================================= */

let recentlyViewed = JSON.parse(
    localStorage.getItem(
        "shopmax-recently-viewed"
    )
) || [];

recentlyViewed = [
    ...new Set(
        recentlyViewed.map(Number)
    )
];


/* =========================================================
   MODAL
========================================================= */

let modalQuantity = 1;

let currentModalProduct = null;


/* =========================================================
   DOM
========================================================= */


/* PRODUCTS */

const flashProducts =
    document.getElementById("flashProducts");

const trendingProducts =
    document.getElementById("trendingProducts");


/* SEARCH */

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const categorySelect =
    document.getElementById("categorySelect");


/* CATEGORY MENU */

const categoriesBtn =
    document.getElementById("categoriesBtn");

const categoryDropdown =
    document.getElementById("categoryDropdown");


/* CART */

const cartBtn =
    document.getElementById("cartBtn");

const cartCount =
    document.getElementById("cartCount");

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

const checkoutBtn =
    document.getElementById("checkoutBtn");


/* WISHLIST */

const wishlistHeader =
    document.getElementById("wishlistHeader");

const wishlistDrawer =
    document.getElementById("wishlistDrawer");

const wishlistOverlay =
    document.getElementById("wishlistOverlay");

const closeWishlistBtn =
    document.getElementById("closeWishlistBtn");

const wishlistItems =
    document.getElementById("wishlistItems");

const wishlistCountText =
    document.getElementById("wishlistCountText");


/* PRODUCT MODAL */

const productModal =
    document.getElementById("productModal");

const productModalOverlay =
    document.getElementById("productModalOverlay");

const closeProductModalBtn =
    document.getElementById("closeProductModal");

const modalProductImage =
    document.getElementById("modalProductImage");

const modalProductCategory =
    document.getElementById("modalProductCategory");

const modalProductTitle =
    document.getElementById("modalProductTitle");

const modalProductRating =
    document.getElementById("modalProductRating");

const modalProductPrice =
    document.getElementById("modalProductPrice");

const modalProductDescription =
    document.getElementById("modalProductDescription");

const modalQuantityEl =
    document.getElementById("modalQuantity");

const modalDecrease =
    document.getElementById("modalDecrease");

const modalIncrease =
    document.getElementById("modalIncrease");

const modalAddToCart =
    document.getElementById("modalAddToCart");


/* RECENTLY VIEWED */

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
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupMobileNavigation();

        setupNavigationLinks();

        setupSearch();

        setupCategoryMenu();

        setupCategoryCards();

        setupCart();

        setupWishlist();

        setupModal();

        setupRecentlyViewed();

        setupGlobalKeyboard();

        updateCart();

        updateWishlistCount();

        renderWishlist();

        loadRecentlyViewed();

        startCountdown();

        loadProducts();

    }
);


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    showLoading(flashProducts);

    showLoading(trendingProducts);


    try {

        const response = await fetch(
            API_URL,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch products"
            );

        }


        const data =
            await response.json();


        const apiProducts =
            Array.isArray(data.products)
                ? data.products
                : [];


        if (
            apiProducts.length === 0
        ) {

            throw new Error(
                "No products returned"
            );

        }


        /* -----------------------------------------
           NORMALIZE PRODUCTS
        ----------------------------------------- */

        products =
            apiProducts.map(
                product => {

                    const rating =
                        Number(
                            product.rating ||
                            4.2
                        );


                    const reviewCount =
                        Number(
                            product.reviews?.length ||
                            product.stock ||
                            100
                        );


                    return {

                        ...product,

                        id:
                            Number(product.id),

                        price:
                            Number(product.price),

                        image:
                            product.thumbnail ||
                            product.images?.[0] ||
                            "",

                        rating: {

                            rate:
                                rating,

                            count:
                                reviewCount

                        }

                    };

                }
            );


        /* -----------------------------------------
           BUILD DYNAMIC CATEGORIES
        ----------------------------------------- */

        buildCategories();


        /* -----------------------------------------
           UPDATE CATEGORY SELECT
        ----------------------------------------- */

        populateCategorySelect();


        /* -----------------------------------------
           UPDATE CATEGORY MENU
        ----------------------------------------- */

        syncCategoryMenu();


        /* -----------------------------------------
           CLEAN WISHLIST
        ----------------------------------------- */

        wishlist =
            wishlist.filter(
                id =>
                    products.some(
                        product =>
                            Number(product.id) ===
                            Number(id)
                    )
            );


        saveWishlist();


        /* -----------------------------------------
           CLEAN RECENTLY VIEWED
        ----------------------------------------- */

        recentlyViewed =
            recentlyViewed.filter(
                id =>
                    products.some(
                        product =>
                            Number(product.id) ===
                            Number(id)
                    )
            );


        saveRecentlyViewedState();


        /* -----------------------------------------
           INITIAL RENDER
        ----------------------------------------- */

        applyInitialHomeFilter();


        renderWishlist();

        renderRecentlyViewed();


    }

    catch (error) {

        console.error(
            "ShopMax API Error:",
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
   BUILD CATEGORIES
========================================================= */

function buildCategories() {

    const uniqueCategories =
        [
            ...new Set(
                products
                    .map(
                        product =>
                            String(
                                product.category || ""
                            )
                                .trim()
                                .toLowerCase()
                    )
                    .filter(Boolean)
            )
        ];


    categories =
        uniqueCategories.sort(
            (a, b) =>
                formatCategory(a).localeCompare(
                    formatCategory(b)
                )
        );

}


/* =========================================================
   POPULATE CATEGORY SELECT
========================================================= */

function populateCategorySelect() {

    if (!categorySelect) {
        return;
    }


    const currentValue =
        categorySelect.value;


    categorySelect.innerHTML = `
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


            categorySelect.appendChild(
                option
            );

        }
    );


    /*
       Preserve existing selection
       if it still exists.
    */

    if (
        currentValue &&
        (
            currentValue === "all" ||
            categories.includes(
                normalizeCategory(
                    currentValue
                )
            )
        )
    ) {

        categorySelect.value =
            normalizeCategory(
                currentValue
            );

    }

}


/* =========================================================
   SYNC CATEGORY MENU
========================================================= */

function syncCategoryMenu() {

    if (!categoryDropdown) {
        return;
    }


    /*
       Existing HTML category menu is preserved.
       We only fix data-category values when
       category text matches API category.
    */

    categoryDropdown
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(
            element => {

                const raw =
                    element.dataset.category;


                if (!raw) {
                    return;
                }


                const normalized =
                    normalizeCategory(
                        raw
                    );


                const matched =
                    categories.find(
                        category =>
                            category ===
                            normalized
                    );


                if (matched) {

                    element.dataset.category =
                        matched;

                }

            }
        );

}


/* =========================================================
   APPLY INITIAL HOME FILTER
   ---------------------------------------------------------
   IMPORTANT:
   Category selected before reload will be restored
   from the URL after reload.
========================================================= */

function applyInitialHomeFilter() {

    /*
       Products must be loaded first
    */

    if (
        !products ||
        products.length === 0
    ) {

        return;

    }


    /*
       =====================================================
       READ CATEGORY FROM URL
       Example:
       ?category=smartphones
       ?category=furniture
       ?category=beauty-health
       =====================================================
    */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlCategory =
        params.get(
            "category"
        );


    /*
       =====================================================
       NO CATEGORY IN URL
       =====================================================
    */

    if (
        !urlCategory
    ) {

        if (
            categorySelect
        ) {

            categorySelect.value =
                "all";

        }


        if (
            searchInput
        ) {

            searchInput.value =
                "";

        }


        renderHomeProducts(
            "all",
            ""
        );


        return;

    }


    /*
       =====================================================
       NORMALIZE URL CATEGORY
       =====================================================
    */

    const normalizedCategory =
        normalizeCategory(
            decodeURIComponent(
                urlCategory
            )
        );


    /*
       =====================================================
       FIND REAL API CATEGORY
       =====================================================
    */

    const matchedCategory =
        categories.find(
            category =>
                normalizeCategory(
                    category
                ) ===
                normalizedCategory
        );


    /*
       =====================================================
       CATEGORY NOT FOUND
       =====================================================
    */

    if (
        !matchedCategory
    ) {

        /*
           Invalid category হলে
           URL থেকে remove করবো.
        */

        try {

            const url =
                new URL(
                    window.location.href
                );


            url.searchParams.delete(
                "category"
            );


            window.history.replaceState(
                {},
                "",
                url
            );

        }
        catch (error) {

            console.warn(
                "Unable to clean category URL:",
                error
            );

        }


        if (
            categorySelect
        ) {

            categorySelect.value =
                "all";

        }


        if (
            searchInput
        ) {

            searchInput.value =
                "";

        }


        renderHomeProducts(
            "all",
            ""
        );


        return;

    }


    /*
       =====================================================
       RESTORE SELECTED CATEGORY
       =====================================================
    */

    if (
        categorySelect
    ) {

        categorySelect.value =
            matchedCategory;

    }


    /*
       Clear search input
       because category is active.
    */

    if (
        searchInput
    ) {

        searchInput.value =
            "";

    }


    /*
       =====================================================
       RENDER SAME CATEGORY AFTER RELOAD
       =====================================================
    */

    renderHomeProducts(
        matchedCategory,
        ""
    );


    /*
       =====================================================
       KEEP URL IN SYNC
       =====================================================
    */

    try {

        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            "category",
            matchedCategory
        );


        window.history.replaceState(
            {},
            "",
            url
        );

    }
    catch (error) {

        console.warn(
            "Unable to restore category URL:",
            error
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
                Please try again.
            </p>

            <button
                type="button"
                class="add-cart-btn"
                style="
                    max-width:150px;
                    margin:16px auto 0;
                "
                onclick="loadProducts()"
            >
                Try Again
            </button>

        </div>

    `;

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(
    product,
    index = 0
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
        Number(product.price) /
        (
            1 -
            discount / 100
        );


    const liked =
        wishlist.includes(
            Number(product.id)
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
                        aria-label="Quick view"
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


            <div class="product-info">

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
   RENDER FLASH
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
   RENDER TRENDING
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
   RENDER HOME PRODUCTS
========================================================= */

function renderHomeProducts(
    category = "all",
    search = ""
) {

    const normalizedCategory =
        normalizeCategory(
            category
        );


    const searchText =
        String(
            search || ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        products.filter(
            product => {

                const productTitle =
                    String(
                        product.title || ""
                    )
                        .toLowerCase();


                const productCategory =
                    normalizeCategory(
                        product.category
                    );


                const categoryMatch =
                    normalizedCategory ===
                        "all" ||
                    productCategory ===
                        normalizedCategory;


                const searchMatch =
                    !searchText ||
                    productTitle.includes(
                        searchText
                    ) ||
                    productCategory.includes(
                        searchText
                    );


                return (
                    categoryMatch &&
                    searchMatch
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
   SEARCH + LIVE SUGGESTIONS
========================================================= */

function setupSearch() {

    if (!searchInput) {
        return;
    }


    createSearchSuggestionBox();


    /* -----------------------------------------
       LIVE TYPING
    ----------------------------------------- */

    searchInput.addEventListener(
        "input",
        () => {

            const value =
                searchInput.value.trim();


            if (value.length > 0) {

                showSearchSuggestions(
                    value
                );

            } else {

                hideSearchSuggestions();

            }


            filterProducts();

        }
    );


    /* -----------------------------------------
       ENTER
    ----------------------------------------- */

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                hideSearchSuggestions();

                filterProducts();

            }


            if (
                event.key === "Escape"
            ) {

                hideSearchSuggestions();

            }

        }
    );


    /* -----------------------------------------
       SEARCH BUTTON
    ----------------------------------------- */

    searchBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            hideSearchSuggestions();

            filterProducts();

        }
    );


    /* -----------------------------------------
       CATEGORY
    ----------------------------------------- */

    categorySelect?.addEventListener(
        "change",
        () => {

            hideSearchSuggestions();

            filterProducts();

        }
    );


    /* -----------------------------------------
       OUTSIDE CLICK
    ----------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const suggestionBox =
                document.getElementById(
                    "shopmaxSearchSuggestions"
                );


            if (
                event.target === searchInput ||
                suggestionBox?.contains(
                    event.target
                )
            ) {

                return;

            }


            hideSearchSuggestions();

        }
    );

}


/* =========================================================
   CREATE SUGGESTION BOX
========================================================= */

function createSearchSuggestionBox() {

    let box =
        document.getElementById(
            "shopmaxSearchSuggestions"
        );


    if (box) {
        return box;
    }


    box =
        document.createElement(
            "div"
        );


    box.id =
        "shopmaxSearchSuggestions";


    box.className =
        "shopmax-search-suggestions";


    document.body.appendChild(
        box
    );


    addSearchSuggestionStyles();


    return box;

}


/* =========================================================
   SHOW SUGGESTIONS
========================================================= */

function showSearchSuggestions(
    value
) {

    const box =
        document.getElementById(
            "shopmaxSearchSuggestions"
        );


    if (
        !box ||
        !products.length
    ) {

        return;

    }


    const query =
        value
            .trim()
            .toLowerCase();


    if (!query) {

        hideSearchSuggestions();

        return;

    }


    const selectedCategory =
        categorySelect
            ? categorySelect.value
            : "all";


    const normalizedSelected =
        normalizeCategory(
            selectedCategory
        );


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


                const categoryMatch =
                    normalizedSelected ===
                        "all" ||
                    normalizeCategory(
                        product.category
                    ) ===
                        normalizedSelected;


                const textMatch =
                    title.includes(query) ||
                    category.includes(query) ||
                    brand.includes(query) ||
                    description.includes(query);


                return (
                    categoryMatch &&
                    textMatch
                );

            }
        );


    /*
       Maximum 6 suggestions
    */

    matches =
        matches.slice(
            0,
            6
        );


    /* -----------------------------------------
       NO RESULT
    ----------------------------------------- */

    if (
        matches.length === 0
    ) {

        box.innerHTML = `

            <div class="shopmax-search-empty">

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


        positionSearchSuggestions();


        box.classList.add(
            "show"
        );


        return;

    }


    /* -----------------------------------------
       PRODUCT LIST
    ----------------------------------------- */

    box.innerHTML =
        matches
            .map(
                product => {

                    const rating =
                        Number(
                            product.rating?.rate ||
                            4.2
                        );


                    return `

                        <button
                            type="button"
                            class="
                                shopmax-search-item
                            "
                            data-search-id="${product.id}"
                        >

                            <div
                                class="
                                    shopmax-search-image
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
                                    shopmax-search-info
                                "
                            >

                                <strong>
                                    ${escapeHTML(
                                        product.title
                                    )}
                                </strong>

                                <span>
                                    ${formatCategory(
                                        product.category
                                    )}
                                </span>

                            </div>


                            <div
                                class="
                                    shopmax-search-price
                                "
                            >

                                <strong>
                                    $${Number(
                                        product.price
                                    ).toFixed(2)}
                                </strong>

                                <small>

                                    <i
                                        class="
                                            fa-solid
                                            fa-star
                                        "
                                    ></i>

                                    ${rating.toFixed(1)}

                                </small>

                            </div>

                        </button>

                    `;

                }
            )
            .join("");


    /*
       Position under search box
    */

    positionSearchSuggestions();


    /*
       SHOW
    */

    box.classList.add(
        "show"
    );


    /*
       CLICK PRODUCT
    */

    box
        .querySelectorAll(
            "[data-search-id]"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const id =
                            Number(
                                item.dataset.searchId
                            );


                        const product =
                            products.find(
                                p =>
                                    Number(
                                        p.id
                                    ) === id
                            );


                        if (!product) {
                            return;
                        }


                        /*
                           Put title in search
                        */

                        searchInput.value =
                            product.title;


                        hideSearchSuggestions();


                        /*
                           Open product modal
                        */

                        openProductModal(
                            product
                        );

                    }
                );

            }
        );

}


function positionSearchSuggestions() {

    const suggestions =
        document.getElementById("shopmaxSearchSuggestions");

    if (!suggestions || !searchInput) {
        return;
    }

    const searchBox =
        searchInput.closest(".search-box");

    if (!searchBox) {
        return;
    }

    const rect =
        searchBox.getBoundingClientRect();

    const viewportWidth =
        document.documentElement.clientWidth;

    const viewportHeight =
        window.innerHeight;


    /* =====================================================
       DESKTOP
       Keep the existing design exactly as it is
    ===================================================== */

    if (viewportWidth > 1024) {

        suggestions.style.position = "absolute";

        suggestions.style.left =
            `${rect.left + window.scrollX}px`;

        suggestions.style.top =
            `${rect.bottom + window.scrollY + 8}px`;

        suggestions.style.width =
            `${rect.width}px`;

        suggestions.style.maxWidth =
            `${rect.width}px`;

        suggestions.style.maxHeight =
            "430px";

        suggestions.style.overflowY =
            "auto";

        suggestions.style.overflowX =
            "hidden";

        return;
    }


    /* =====================================================
       TABLET + MOBILE
       Use viewport-safe fixed positioning
    ===================================================== */

    suggestions.style.position = "fixed";


    const gap = 8;


    /* ---------------------------------------------
       Width
    --------------------------------------------- */

    let dropdownWidth =
        rect.width;

    dropdownWidth =
        Math.min(
            dropdownWidth,
            viewportWidth - (gap * 2)
        );


    /* ---------------------------------------------
       Left position
    --------------------------------------------- */

    let left =
        rect.left;


    /* Prevent left overflow */

    if (left < gap) {
        left = gap;
    }


    /* Prevent right overflow */

    if (
        left + dropdownWidth >
        viewportWidth - gap
    ) {

        left =
            viewportWidth -
            dropdownWidth -
            gap;

    }


    /* Final safety */

    left =
        Math.max(
            gap,
            left
        );


    /* ---------------------------------------------
       Top position
    --------------------------------------------- */

    const top =
        rect.bottom + 8;


    /* ---------------------------------------------
       Height
    --------------------------------------------- */

    let maxHeight =
        viewportHeight -
        top -
        gap;


    maxHeight =
        Math.max(
            180,
            Math.min(
                maxHeight,
                430
            )
        );


    /* ---------------------------------------------
       Apply
    --------------------------------------------- */

    suggestions.style.left =
        `${left}px`;

    suggestions.style.top =
        `${top}px`;

    suggestions.style.width =
        `${dropdownWidth}px`;

    suggestions.style.maxWidth =
        `calc(100vw - ${gap * 2}px)`;

    suggestions.style.maxHeight =
        `${maxHeight}px`;

    suggestions.style.overflowY =
        "auto";

    suggestions.style.overflowX =
        "hidden";

}

/* =========================================================
   HIDE SUGGESTIONS
========================================================= */

function hideSearchSuggestions() {

    const box =
        document.getElementById(
            "shopmaxSearchSuggestions"
        );


    if (!box) {

        return;

    }


    /*
       Hide suggestion dropdown
    */

    box.classList.remove(
        "show"
    );


    /*
       Remove keyboard selected item
    */

    box
        .querySelectorAll(
            ".search-keyboard-active"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "search-keyboard-active"
                );

            }
        );


    /*
       Reset temporary inline
       display value
    */

    box.style.display =
        "";


    /*
       Reset temporary positioning
       values.

       This prevents old mobile/tablet
       position from affecting the next open.
    */

    box.style.left =
        "";

    box.style.top =
        "";

}

/* =========================================================
   KEEP POSITION CORRECT
========================================================= */

window.addEventListener(
    "resize",
    () => {

        const box =
            document.getElementById(
                "shopmaxSearchSuggestions"
            );


        if (
            box &&
            box.classList.contains(
                "show"
            )
        ) {

            positionSearchSuggestions();

        }

    }
);


window.addEventListener(
    "scroll",
    () => {

        const box =
            document.getElementById(
                "shopmaxSearchSuggestions"
            );


        if (
            box &&
            box.classList.contains(
                "show"
            )
        ) {

            positionSearchSuggestions();

        }

    },
    true
);


/* =========================================================
   SEARCH SUGGESTION CSS
========================================================= */

function addSearchSuggestionStyles() {

    if (
        document.getElementById(
            "shopmaxSearchSuggestionCSS"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "shopmaxSearchSuggestionCSS";


    style.textContent = `

        #shopmaxSearchSuggestions {

            position: absolute;

            display: none;

            background: #ffffff;

            border:
                1px solid
                #dbe3ef;

            border-radius: 12px;

            box-shadow:
                0 18px 50px
                rgba(
                    15,
                    23,
                    42,
                    0.18
                );

            overflow: hidden;

            z-index: 999999;

            max-height: 430px;

            overflow-y: auto;

        }


        #shopmaxSearchSuggestions.show {

            display: block;

        }


        .shopmax-search-item {

            width: 100%;

            min-height: 72px;

            padding:
                10px 14px;

            display: flex;

            align-items: center;

            gap: 12px;

            border: 0;

            border-bottom:
                1px solid
                #eef2f7;

            background:
                #ffffff;

            cursor: pointer;

            text-align: left;

            font-family:
                inherit;

            transition:
                background
                0.15s ease;

        }


        .shopmax-search-item:hover {

            background:
                #f5f8ff;

        }


        .shopmax-search-item:last-child {

            border-bottom: 0;

        }


        .shopmax-search-image {

            width: 52px;

            height: 52px;

            min-width: 52px;

            display: flex;

            align-items: center;

            justify-content: center;

            background:
                #f8fafc;

            border-radius: 8px;

            overflow: hidden;

        }


        .shopmax-search-image img {

            width: 100%;

            height: 100%;

            object-fit: contain;

        }


        .shopmax-search-info {

            flex: 1;

            min-width: 0;

            display: flex;

            flex-direction: column;

            gap: 5px;

        }


        .shopmax-search-info strong {

            color:
                #172033;

            font-size:
                13px;

            font-weight:
                700;

            white-space:
                nowrap;

            overflow:
                hidden;

            text-overflow:
                ellipsis;

        }


        .shopmax-search-info span {

            color:
                #94a3b8;

            font-size:
                10px;

            font-weight:
                600;

            text-transform:
                uppercase;

        }


        .shopmax-search-price {

            display: flex;

            flex-direction: column;

            align-items:
                flex-end;

            gap: 4px;

            white-space:
                nowrap;

        }


        .shopmax-search-price strong {

            color:
                #16a34a;

            font-size:
                13px;

        }


        .shopmax-search-price small {

            color:
                #94a3b8;

            font-size:
                10px;

        }


        .shopmax-search-price i {

            color:
                #f59e0b;

        }


        .shopmax-search-empty {

            min-height: 90px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            color:
                #64748b;

            font-size:
                12px;

        }


        .shopmax-search-empty i {

            color:
                #94a3b8;

        }


        @media (
            max-width: 768px
        ) {

            #shopmaxSearchSuggestions {

                max-height:
                    350px;

                border-radius:
                    10px;

            }


            .shopmax-search-item {

                min-height:
                    62px;

                padding:
                    8px 10px;

            }


            .shopmax-search-image {

                width:
                    44px;

                height:
                    44px;

                min-width:
                    44px;

            }


            .shopmax-search-info strong {

                font-size:
                    11px;

            }


            .shopmax-search-price strong {

                font-size:
                    11px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function filterProducts() {

    const search =
        searchInput
            ? searchInput.value
            : "";


    const category =
        categorySelect
            ? categorySelect.value
            : "all";


    renderHomeProducts(
        category,
        search
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


    /* =====================================================
       MAIN CATEGORY BUTTON
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


    /* =====================================================
       CATEGORY DROPDOWN CLICK
    ===================================================== */

    categoryDropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            /* =================================================
               SUBMENU LINK
            ================================================= */

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


                selectHomeCategory(
                    category
                );


                closeCategoryMenu();

                return;

            }


            /* =================================================
               CATEGORY BUTTON
            ================================================= */

            const categoryButton =
                event.target.closest(
                    ".category-item > button"
                );


            if (
                !categoryButton
            ) {

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
               0px - 1024px

               IMPORTANT:
               এখানে আর <=950 নেই
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


                /* =============================================
                   CLOSE OTHER OPEN SUBMENUS
                ============================================= */

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


                            if (
                                otherSubmenu
                            ) {

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


                /* =============================================
                   CLOSE CURRENT SUBMENU
                ============================================= */

                if (
                    isOpen
                ) {

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


                /* =============================================
                   OPEN CURRENT SUBMENU
                ============================================= */

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


                /* =============================================
                   MOBILE
                   0px - 768px

                   Submenu নিচে যাবে
                ============================================= */

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


                /* =============================================
                   TABLET
                   769px - 1024px

                   Submenu ডান পাশে যাবে
                ============================================= */

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
               1025px+
            ================================================= */

            const category =
                categoryButton.dataset.category;


            if (
                category
            ) {

                event.preventDefault();


                selectHomeCategory(
                    category
                );


                closeCategoryMenu();

            }

        }
    );


    /* =====================================================
       CLICK OUTSIDE
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

}



/* =========================================================
   SELECT HOME CATEGORY
========================================================= */

function selectHomeCategory(
    category
) {

    if (
        !category
    ) {

        return;

    }


    const normalized =
        normalizeCategory(
            category
        );


    /*
       =====================================================
       ALL CATEGORIES
       =====================================================
    */

    if (
        normalized === "all"
    ) {

        if (categorySelect) {

            categorySelect.value =
                "all";

        }


        if (searchInput) {

            searchInput.value =
                "";

        }


        /*
           Remove category from URL
        */

        try {

            const url =
                new URL(
                    window.location.href
                );


            url.searchParams.delete(
                "category"
            );


            window.history.replaceState(
                {},
                "",
                url
            );

        }
        catch (error) {

            console.warn(
                "Unable to update URL:",
                error
            );

        }


        renderHomeProducts(
            "all",
            ""
        );


        scrollToFlashSale();


        return;

    }


    /*
       =====================================================
       FIND CATEGORY
       =====================================================
    */

    const matchedCategory =
        categories.find(
            item =>
                normalizeCategory(
                    item
                ) ===
                normalized
        );


    if (
        !matchedCategory
    ) {

        console.warn(
            "Category not found:",
            category
        );


        return;

    }


    /*
       Update dropdown
    */

    if (categorySelect) {

        categorySelect.value =
            matchedCategory;

    }


    /*
       Clear search
    */

    if (searchInput) {

        searchInput.value =
            "";

    }


    /*
       Render category
    */

    renderHomeProducts(
        matchedCategory,
        ""
    );


    /*
       =====================================================
       SAVE CATEGORY IN URL
       WITHOUT PAGE RELOAD
       =====================================================
    */

    try {

        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            "category",
            matchedCategory
        );


        window.history.replaceState(
            {},
            "",
            url
        );

    }
    catch (error) {

        console.warn(
            "Unable to update URL:",
            error
        );

    }


    scrollToFlashSale();

}


/* =========================================================
   SCROLL TO FLASH SALE
========================================================= */

function scrollToFlashSale() {

    const flashSale =
        document.getElementById(
            "flashSale"
        );


    if (!flashSale) {
        return;
    }


    flashSale.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CATEGORY CARDS
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
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const category =
                            card.dataset.category;


                        if (!category) {
                            return;
                        }


                        selectHomeCategory(
                            category
                        );

                    }
                );

            }
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


    /*
       Remove previous handler
       before assigning a new one.
    */

    container.onclick =
        handleProductContainerClick;

}


/* =========================================================
   PRODUCT CLICK
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
                Number(item.id) === id
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
        action === "wishlist"
    ) {

        toggleWishlist(
            id
        );

        return;

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
        event => {

            event.preventDefault();

            checkout();

        }
    );

}


/* =========================================================
   ADD CART
========================================================= */

function addToCart(
    product,
    quantity = 1
) {

    if (!product) {
        return;
    }


    const id =
        Number(product.id);


    const qty =
        Math.max(
            1,
            Number(quantity) || 1
        );


    const existing =
        cart.find(
            item =>
                Number(item.id) === id
        );


    if (existing) {

        existing.quantity =
            Number(existing.quantity) +
            qty;

    }

    else {

        cart.push({

            id,

            title:
                product.title,

            price:
                Number(product.price),

            image:
                product.image,

            quantity:
                qty

        });

    }


    saveCart();

    updateCart();


    showToast(
        "Added to cart",
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
        JSON.stringify(cart)
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

            <div class="empty-cart">

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
            .map(createCartItem)
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
        Number(item.price) *
        Number(item.quantity);


    return `

        <div class="cart-item">

            <div class="cart-item-image">

                <img
                    src="${escapeHTML(
                        item.image
                    )}"
                    alt="${escapeHTML(
                        item.title
                    )}"
                >

            </div>


            <div class="cart-item-info">

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
                Number(product.id) === id
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
                        Number(product.id) !== id
                );

        }

    }


    if (
        action === "remove"
    ) {

        cart =
            cart.filter(
                product =>
                    Number(product.id) !== id
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
                    Number(item.price) *
                    Number(item.quantity)
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

    /*
       Close search suggestions first
       so search dropdown and cart drawer
       never stay open together.
    */

    hideSearchSuggestions();


    /*
       Close wishlist
    */

    closeWishlist();


    /*
       Close category menu
    */

    closeCategoryMenu();


    /*
       Close product modal if open
    */

    if (
        productModal?.classList.contains(
            "show"
        )
    ) {

        closeProductModalWindow();

    }


    /*
       Open cart drawer
    */

    cartDrawer?.classList.add(
        "open"
    );


    /*
       Show cart overlay
    */

    cartOverlay?.classList.add(
        "show"
    );


    /*
       Prevent background scrolling
    */

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


function toggleWishlist(id) {

    id = Number(id);

    if (!id) {
        return;
    }


    /* -----------------------------------------
       ADD / REMOVE WISHLIST
    ----------------------------------------- */

    if (wishlist.includes(id)) {

        wishlist = wishlist.filter(
            item => Number(item) !== id
        );

        showToast(
            "Removed from wishlist",
            "heart-crack"
        );

    } else {

        wishlist.push(id);

        showToast(
            "Added to wishlist",
            "heart"
        );

    }


    /* -----------------------------------------
       REMOVE DUPLICATES
    ----------------------------------------- */

    wishlist = [
        ...new Set(
            wishlist.map(Number)
        )
    ];


    /* -----------------------------------------
       SAVE
    ----------------------------------------- */

    saveWishlist();


    /* -----------------------------------------
       UPDATE WISHLIST COUNT
    ----------------------------------------- */

    updateWishlistCount();


    /* -----------------------------------------
       UPDATE WISHLIST DRAWER
    ----------------------------------------- */

    renderWishlist();


    /* -----------------------------------------
       UPDATE HOME PRODUCTS
       Flash Sale + Trending
    ----------------------------------------- */

    rerenderHomeProducts();


    /* -----------------------------------------
       IMPORTANT:
       UPDATE RECENTLY VIEWED IMMEDIATELY

       This fixes the problem where
       wishlist icon only changes after reload.
    ----------------------------------------- */

    renderRecentlyViewed();

}

/* =========================================================
   SAVE WISHLIST
========================================================= */

function saveWishlist() {

    localStorage.setItem(
        "shopmax-wishlist",
        JSON.stringify(wishlist)
    );

}


/* =========================================================
   RERENDER HOME
========================================================= */

function rerenderHomeProducts() {

    if (
        !products.length
    ) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
            : "";


    const category =
        categorySelect
            ? categorySelect.value
            : "all";


    renderHomeProducts(
        category,
        search
    );

}


/* =========================================================
   OPEN WISHLIST
========================================================= */

function openWishlist() {

    /*
       Close search suggestions first
       so search dropdown and wishlist drawer
       never stay open together.
    */

    hideSearchSuggestions();


    /*
       Close cart
    */

    closeCart();


    /*
       Close category menu
    */

    closeCategoryMenu();


    /*
       Close product modal if open
    */

    if (
        productModal?.classList.contains(
            "show"
        )
    ) {

        closeProductModalWindow();

    }


    /*
       Refresh wishlist content
       before opening the drawer.
    */

    renderWishlist();


    /*
       Open wishlist drawer
    */

    wishlistDrawer?.classList.add(
        "open"
    );


    /*
       Show wishlist overlay
    */

    wishlistOverlay?.classList.add(
        "show"
    );


    /*
       Prevent background scrolling
    */

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
                            Number(product.id) ===
                            Number(id)
                    )
            )
            .filter(Boolean);


    if (
        items.length === 0
    ) {

        wishlistItems.innerHTML = `

            <div class="empty-wishlist">

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

        <div class="wishlist-item">

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
        Number(button.dataset.id);


    const product =
        products.find(
            item =>
                Number(item.id) === id
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

        toggleWishlist(id);

    }

}


/* =========================================================
   RECENTLY VIEWED
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
        Number(productId);


    if (!id) {
        return;
    }


    recentlyViewed =
        recentlyViewed.filter(
            item =>
                Number(item) !== id
        );


    recentlyViewed.unshift(id);


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


    if (
        !products.length
    ) {

        recentlyViewedSection.hidden =
            true;

        recentlyViewedProducts.innerHTML =
            "";

        return;

    }


    const viewedProducts =
        recentlyViewed
            .map(
                id =>
                    products.find(
                        product =>
                            Number(product.id) ===
                            Number(id)
                    )
            )
            .filter(Boolean);


    recentlyViewed =
        viewedProducts.map(
            product =>
                Number(product.id)
        );


    saveRecentlyViewedState();


    if (
        viewedProducts.length === 0
    ) {

        recentlyViewedSection.hidden =
            true;

        recentlyViewedProducts.innerHTML =
            "";

        return;

    }


    recentlyViewedSection.hidden =
        false;


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


    attachProductEvents(
        recentlyViewedProducts
    );

}


/* =========================================================
   CLEAR RECENTLY VIEWED
========================================================= */

function clearRecentlyViewed() {

    recentlyViewed = [];


    localStorage.removeItem(
        "shopmax-recently-viewed"
    );


    renderRecentlyViewed();

}


/* =========================================================
   MODAL SETUP
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
        event => {

            event.preventDefault();


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
        event => {

            event.preventDefault();


            modalQuantity++;

            updateModalQuantity();

        }
    );


    modalAddToCart?.addEventListener(
        "click",
        event => {

            event.preventDefault();


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
       Close search suggestions only
    */

    hideSearchSuggestions();


    /*
       Set current product
    */

    currentModalProduct =
        product;


    modalQuantity =
        1;


    /*
       Save to recently viewed
    */

    saveRecentlyViewed(
        product.id
    );


    /*
       Update recently viewed immediately
    */

    renderRecentlyViewed();


    /*
       IMAGE
    */

    if (
        modalProductImage
    ) {

        modalProductImage.src =
            product.image || "";

        modalProductImage.alt =
            product.title || "";

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
            product.title || "";

    }


    /*
       RATING
    */

    const rating =
        Number(
            product.rating?.rate
        ) || 4.2;


    const reviewCount =
        Number(
            product.rating?.count
        ) || 0;


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
       OPEN MODAL
    */

    productModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE MODAL
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


    modalQuantity = 1;

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
            ${escapeHTML(message)}
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


    window.location.href =
        "checkout.html";

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
        ) +
        (
            15 * 60 * 60
        ) +
        (
            30 * 60
        ) +
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


    let mobileToggle =
        document.getElementById(
            "mobileMenuToggle"
        );


    if (!mobileToggle) {

        mobileToggle =
            document.createElement(
                "button"
            );


        mobileToggle.type =
            "button";


        mobileToggle.id =
            "mobileMenuToggle";


        mobileToggle.setAttribute(
            "aria-label",
            "Open menu"
        );


        mobileToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        mobileToggle.innerHTML =
            `<i class="fa-solid fa-bars"></i>`;


        navigationInner.appendChild(
            mobileToggle
        );

    }


    let mobileNav =
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
            "aria-hidden",
            "true"
        );


        navigation.appendChild(
            mobileNav
        );

    }


    let mobileOverlay =
        document.getElementById(
            "mobileNavOverlay"
        );


    if (!mobileOverlay) {

        mobileOverlay =
            document.createElement(
                "div"
            );


        mobileOverlay.id =
            "mobileNavOverlay";


        document.body.appendChild(
            mobileOverlay
        );

    }


    if (
        desktopNav &&
        mobileNav.children.length === 0
    ) {

        const links =
            desktopNav.querySelectorAll(
                "a"
            );


        links.forEach(
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
                    originalLink.textContent.trim();


                link.dataset.mobileLink =
                    "true";


                mobileNav.appendChild(
                    link
                );

            }
        );

    }


    function openMobileMenu() {

        mobileNav.classList.add(
            "is-open"
        );


        mobileOverlay.classList.add(
            "is-visible"
        );


        mobileToggle.classList.add(
            "is-active"
        );


        mobileToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        mobileToggle.setAttribute(
            "aria-label",
            "Close menu"
        );


        mobileNav.setAttribute(
            "aria-hidden",
            "false"
        );


        mobileToggle.innerHTML =
            `<i class="fa-solid fa-xmark"></i>`;


        document.body.classList.add(
            "mobile-menu-open"
        );

    }


    function closeMobileMenu() {

        mobileNav.classList.remove(
            "is-open"
        );


        mobileOverlay.classList.remove(
            "is-visible"
        );


        mobileToggle.classList.remove(
            "is-active"
        );


        mobileToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        mobileToggle.setAttribute(
            "aria-label",
            "Open menu"
        );


        mobileNav.setAttribute(
            "aria-hidden",
            "true"
        );


        mobileToggle.innerHTML =
            `<i class="fa-solid fa-bars"></i>`;


        document.body.classList.remove(
            "mobile-menu-open"
        );

    }


    mobileToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (
                mobileNav.classList.contains(
                    "is-open"
                )
            ) {

                closeMobileMenu();

            }

            else {

                openMobileMenu();

            }

        }
    );


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


            event.preventDefault();

            event.stopPropagation();


            const href =
                link.getAttribute(
                    "href"
                ) || "";


            closeMobileMenu();


            if (
                !href ||
                href === "#"
            ) {

                return;

            }


            if (
                href.startsWith("#")
            ) {

                const target =
                    document.querySelector(
                        href
                    );


                if (target) {

                    target.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

                }


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


            /*
               HOME -> HOME
               No reload
            */

            if (
                targetPage === "index.html" &&
                (
                    currentPage === "index.html" ||
                    currentPage === ""
                )
            ) {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                return;

            }


            /*
               SHOP -> SHOP
            */

            if (
                targetPage === "shop.html" &&
                currentPage === "shop.html"
            ) {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                return;

            }


            /*
               Other actual pages
            */

            window.location.href =
                href;

        }
    );


    mobileOverlay.addEventListener(
        "click",
        closeMobileMenu
    );


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


/* =========================================================
   DESKTOP NAVIGATION
========================================================= */

function setupNavigationLinks() {

    const navLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (!href) {

                        event.preventDefault();

                        return;

                    }


                    if (
                        href === "#"
                    ) {

                        event.preventDefault();

                        return;

                    }


                    if (
                        href.startsWith("#")
                    ) {

                        event.preventDefault();


                        const target =
                            document.querySelector(
                                href
                            );


                        if (target) {

                            target.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });

                        }

                    }

                }
            );

        }
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

function setupGlobalKeyboard() {

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


            const mobileNav =
                document.getElementById(
                    "mobileNav"
                );


            const mobileToggle =
                document.getElementById(
                    "mobileMenuToggle"
                );


            const mobileOverlay =
                document.getElementById(
                    "mobileNavOverlay"
                );


            mobileNav?.classList.remove(
                "is-open"
            );


            mobileOverlay?.classList.remove(
                "is-visible"
            );


            mobileToggle?.classList.remove(
                "is-active"
            );


            mobileToggle?.setAttribute(
                "aria-expanded",
                "false"
            );


            if (mobileToggle) {

                mobileToggle.innerHTML =
                    `<i class="fa-solid fa-bars"></i>`;

            }


            document.body.classList.remove(
                "mobile-menu-open"
            );

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
   CATEGORY NORMALIZER
========================================================= */

function normalizeCategory(
    value
) {

    if (!value) {
        return "all";
    }


    let category =
        String(value)
            .trim()
            .toLowerCase();


    /*
       Common aliases
    */

    const aliases = {

        "all categories":
            "all",

        "all":
            "all",

        "home & kitchen":
            "home-decoration",

        "home and kitchen":
            "home-decoration",

        "beauty & health":
            "beauty",

        "beauty and health":
            "beauty",

        "sports & outdoors":
            "sports-accessories",

        "sports and outdoors":
            "sports-accessories",

        "toys & games":
            "toys",

        "toys and games":
            "toys",

        "books & media":
            "books",

        "books and media":
            "books",

        "mens clothing":
            "mens-shirts",

        "men's clothing":
            "mens-shirts",

        "womens clothing":
            "womens-dresses",

        "women's clothing":
            "womens-dresses"

    };


    if (
        aliases[category]
    ) {

        category =
            aliases[category];

    }


    /*
       Convert spaces to hyphens
    */

    category =
        category.replace(
            /\s+/g,
            "-"
        );


    /*
       Remove duplicate hyphens
    */

    category =
        category.replace(
            /-+/g,
            "-"
        );


    return category;

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
        specialNames[normalized]
    ) {

        return specialNames[
            normalized
        ];

    }


    return String(value)
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* =========================================================
   NO PRODUCTS
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
   END
========================================================= */