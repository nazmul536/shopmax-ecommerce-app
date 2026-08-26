/* =====================================================
   SHOPMAX
   COMPLETE JAVASCRIPT
===================================================== */

const API_URL = "https://fakestoreapi.com/products";


/* =====================================================
   STATE
===================================================== */

let products = [];

let cart =
    JSON.parse(
        localStorage.getItem("shopmax-cart")
    ) || [];

let wishlist =
    JSON.parse(
        localStorage.getItem("shopmax-wishlist")
    ) || [];

let modalQuantity = 1;
let currentModalProduct = null;


/* =====================================================
   DOM
===================================================== */

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


/* CATEGORY */

const categoriesBtn =
    document.getElementById("categoriesBtn");

const categoryDropdown =
    document.getElementById("categoryDropdown");


/* MODAL */

const productModal =
    document.getElementById("productModal");

const productModalOverlay =
    document.getElementById("productModalOverlay");

const closeProductModal =
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


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        updateCart();

        setupSearch();

        setupCategoryMenu();

        setupCategoryCards();

        setupCart();

        setupModal();

        startCountdown();

    }
);


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    showLoading(flashProducts);

    showLoading(trendingProducts);

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


        renderFlashProducts(
            products.slice(0, 4)
        );


        renderTrendingProducts(
            products.slice(4, 8)
        );


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        showError(flashProducts);

        showError(trendingProducts);

    }

}


/* =====================================================
   LOADING
===================================================== */

function showLoading(container) {

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
                        animation:pulse 1.4s infinite;
                    "
                ></div>

                <div class="product-info">

                    <div
                        style="
                            height:8px;
                            width:45%;
                            background:#e9edf3;
                            border-radius:5px;
                            margin-bottom:10px;
                        "
                    ></div>

                    <div
                        style="
                            height:10px;
                            width:90%;
                            background:#e9edf3;
                            border-radius:5px;
                            margin-bottom:8px;
                        "
                    ></div>

                    <div
                        style="
                            height:35px;
                            width:100%;
                            background:#e9edf3;
                            border-radius:5px;
                        "
                    ></div>

                </div>

            </div>

        `;

    }

}


/* =====================================================
   ERROR
===================================================== */

function showError(container) {

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
                    margin-top:5px;
                "
            >
                Please refresh the page.
            </p>

        </div>

    `;

}


/* =====================================================
   CREATE PRODUCT CARD
===================================================== */

function createProductCard(
    product,
    index
) {

    const rating =
        product.rating?.rate || 4.2;

    const count =
        product.rating?.count || 100;


    const discountList = [
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
        discountList[
            index % discountList.length
        ];


    const oldPrice =
        product.price /
        (1 - discount / 100);


    const liked =
        wishlist.includes(
            product.id
        );


    return `

        <article class="product-card">

            <div
                class="product-image"
                data-action="view"
                data-id="${product.id}"
            >

                <span class="product-badge">
                    -${discount}%
                </span>


                <img
                    src="${product.image}"
                    alt="${escapeHTML(
                        product.title
                    )}"
                    loading="lazy"
                >


                <div class="product-actions">

                    <button
                        type="button"
                        class="
                            product-action-btn
                            ${liked ? "wishlisted" : ""}
                        "
                        data-action="wishlist"
                        data-id="${product.id}"
                        aria-label="Add to wishlist"
                    >

                        <i
                            class="
                                ${liked
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


            <div class="product-info">

                <span class="product-category">

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


                <div class="product-rating">

                    <i
                        class="
                            fa-solid
                            fa-star
                        "
                    ></i>

                    ${rating}

                    <span>
                        (${count})
                    </span>

                </div>


                <div class="product-price">

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


/* =====================================================
   RENDER FLASH PRODUCTS
===================================================== */

function renderFlashProducts(list) {

    if (!flashProducts) {
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


/* =====================================================
   RENDER TRENDING PRODUCTS
===================================================== */

function renderTrendingProducts(list) {

    if (!trendingProducts) {
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


/* =====================================================
   PRODUCT EVENTS
===================================================== */

function attachProductEvents(container) {

    if (!container) {
        return;
    }


    const buttons =
        container.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                handleProductAction
            );

        }
    );

}


/* =====================================================
   PRODUCT ACTION
===================================================== */

function handleProductAction(event) {

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


    switch (action) {

        case "cart":

            addToCart(
                product,
                1
            );

            break;


        case "wishlist":

            toggleWishlist(id);

            break;


        case "view":

            openProductModal(
                product
            );

            break;

    }

}


/* =====================================================
   SEARCH SETUP
===================================================== */

function setupSearch() {

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterProducts
        );


        searchInput.addEventListener(
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

    }


    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            filterProducts
        );

    }


    if (categorySelect) {

        categorySelect.addEventListener(
            "change",
            filterProducts
        );

    }

}


/* =====================================================
   FILTER PRODUCTS
===================================================== */

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


                const searchMatch =
                    title.includes(
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


    if (
        filtered.length === 0
    ) {

        const emptyMessage = `

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
                        fa-magnifying-glass
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
                    Try another search.
                </p>

            </div>

        `;


        if (flashProducts) {

            flashProducts.innerHTML =
                emptyMessage;

        }


        if (trendingProducts) {

            trendingProducts.innerHTML =
                "";

        }


        return;

    }


    renderFlashProducts(
        filtered.slice(0, 4)
    );


    renderTrendingProducts(
        filtered.slice(4, 8)
    );

}


/* =====================================================
   CATEGORY MENU
===================================================== */

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

            event.stopPropagation();


            categoryDropdown.classList.toggle(
                "show"
            );


            categoriesBtn.classList.toggle(
                "active"
            );

        }
    );


    categoryDropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        () => {

            categoryDropdown.classList.remove(
                "show"
            );


            categoriesBtn.classList.remove(
                "active"
            );


            document
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

        }
    );


    /* MOBILE SUBMENU */

    const submenuButtons =
        document.querySelectorAll(
            ".category-item.has-submenu > button"
        );


    submenuButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    if (
                        window.innerWidth <= 600
                    ) {

                        event.preventDefault();

                        event.stopPropagation();


                        const parent =
                            button.closest(
                                ".category-item"
                            );


                        parent.classList.toggle(
                            "mobile-open"
                        );

                    }

                }
            );

        }
    );


    /* SUBMENU LINKS */

    const submenuLinks =
        document.querySelectorAll(
            ".category-submenu a"
        );


    submenuLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const category =
                        link.dataset.category;


                    if (
                        category &&
                        categorySelect
                    ) {

                        categorySelect.value =
                            category;

                        filterProducts();

                    }


                    categoryDropdown.classList.remove(
                        "show"
                    );


                    categoriesBtn.classList.remove(
                        "active"
                    );


                    document
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

                }
            );

        }
    );

}


/* =====================================================
   POPULAR CATEGORY CARDS
===================================================== */

function setupCategoryCards() {

    const cards =
        document.querySelectorAll(
            ".category-card"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const category =
                        card.dataset.category;


                    if (!category) {
                        return;
                    }


                    if (categorySelect) {

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


/* =====================================================
   ADD TO CART
===================================================== */

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
                item.id === product.id
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

    openCart();

}


/* =====================================================
   SAVE CART
===================================================== */

function saveCart() {

    localStorage.setItem(
        "shopmax-cart",
        JSON.stringify(cart)
    );

}


/* =====================================================
   UPDATE CART
===================================================== */

function updateCart() {

    updateCartCount();

    renderCart();

}


/* =====================================================
   UPDATE CART COUNT
===================================================== */

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
                item.quantity,
            0
        );


    cartCount.textContent =
        count;

}


/* =====================================================
   RENDER CART
===================================================== */

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
            .map(
                item =>
                    createCartItem(item)
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
                    item.price *
                    item.quantity
                ),
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            `$${total.toFixed(2)}`;

    }


    attachCartEvents();

}


/* =====================================================
   CREATE CART ITEM
===================================================== */

function createCartItem(item) {

    const total =
        item.price *
        item.quantity;


    return `

        <div class="cart-item">

            <div class="cart-item-image">

                <img
                    src="${item.image}"
                    alt="${escapeHTML(
                        item.title
                    )}"
                    loading="lazy"
                >

            </div>


            <div class="cart-item-info">

                <h4>
                    ${escapeHTML(
                        item.title
                    )}
                </h4>


                <div class="cart-item-price">

                    $${total.toFixed(2)}

                </div>


                <div class="cart-item-bottom">

                    <div class="quantity-controls">

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

        </div>

    `;

}


/* =====================================================
   CART EVENTS
===================================================== */

function attachCartEvents() {

    if (!cartItems) {
        return;
    }


    const buttons =
        cartItems.querySelectorAll(
            "[data-cart-action]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                handleCartAction
            );

        }
    );

}


/* =====================================================
   CART ACTION
===================================================== */

function handleCartAction() {

    const action =
        this.dataset.cartAction;


    const id =
        Number(
            this.dataset.id
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

    }


    saveCart();

    updateCart();

}


/* =====================================================
   CART SETUP
===================================================== */

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


    checkoutBtn?.addEventListener(
        "click",
        () => {

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            alert(
                "Checkout feature coming soon."
            );

        }
    );

}


/* =====================================================
   OPEN CART
===================================================== */

function openCart() {

    if (!cartDrawer) {
        return;
    }


    /* Close product modal first */

    if (
        productModal &&
        productModal.classList.contains(
            "show"
        )
    ) {

        closeProductModalWindow();

    }


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


/* =====================================================
   CLOSE CART
===================================================== */

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


/* =====================================================
   WISHLIST
===================================================== */

function toggleWishlist(id) {

    if (
        wishlist.includes(id)
    ) {

        wishlist =
            wishlist.filter(
                item =>
                    item !== id
            );

    } else {

        wishlist.push(id);

    }


    localStorage.setItem(
        "shopmax-wishlist",
        JSON.stringify(wishlist)
    );


    rerenderProducts();

}


/* =====================================================
   RERENDER PRODUCTS
===================================================== */

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

                return (

                    product.title
                        .toLowerCase()
                        .includes(search)

                    &&

                    (
                        category === "all" ||
                        product.category ===
                        category
                    )

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


/* =====================================================
   PRODUCT MODAL SETUP
===================================================== */

function setupModal() {

    closeProductModal?.addEventListener(
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
                event.key === "Escape"
            ) {

                if (
                    productModal?.classList.contains(
                        "show"
                    )
                ) {

                    closeProductModalWindow();

                }


                if (
                    cartDrawer?.classList.contains(
                        "open"
                    )
                ) {

                    closeCart();

                }


                if (
                    categoryDropdown?.classList.contains(
                        "show"
                    )
                ) {

                    categoryDropdown.classList.remove(
                        "show"
                    );

                    categoriesBtn?.classList.remove(
                        "active"
                    );

                }

            }

        }
    );

}


/* =====================================================
   OPEN PRODUCT MODAL
===================================================== */

function openProductModal(product) {

    if (
        !productModal ||
        !product
    ) {
        return;
    }


    currentModalProduct =
        product;


    modalQuantity = 1;


    /* Close cart */

    closeCart();


    /* IMAGE */

    if (modalProductImage) {

        modalProductImage.src =
            product.image;

        modalProductImage.alt =
            product.title;

    }


    /* CATEGORY */

    if (modalProductCategory) {

        modalProductCategory.textContent =
            formatCategory(
                product.category
            );

    }


    /* TITLE */

    if (modalProductTitle) {

        modalProductTitle.textContent =
            product.title;

    }


    /* RATING */

    const rating =
        product.rating?.rate || 4.2;

    const count =
        product.rating?.count || 100;


    if (modalProductRating) {

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
                (${count} reviews)
            </span>

        `;

    }


    /* PRICE */

    if (modalProductPrice) {

        modalProductPrice.textContent =
            `$${product.price.toFixed(2)}`;

    }


    /* DESCRIPTION */

    if (modalProductDescription) {

        modalProductDescription.textContent =
            product.description;

    }


    updateModalQuantity();


    /* SHOW */

    productModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =====================================================
   CLOSE PRODUCT MODAL
===================================================== */

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


/* =====================================================
   MODAL QUANTITY
===================================================== */

function updateModalQuantity() {

    if (!modalQuantityEl) {
        return;
    }


    modalQuantityEl.textContent =
        modalQuantity;

}


/* =====================================================
   COUNTDOWN
===================================================== */

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
            `${String(days).padStart(2, "0")} : ` +
            `${String(hours).padStart(2, "0")} : ` +
            `${String(minutes).padStart(2, "0")} : ` +
            `${String(seconds).padStart(2, "0")}`;


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


/* =====================================================
   FORMAT CATEGORY
===================================================== */

function formatCategory(value) {

    if (!value) {
        return "";
    }


    return value
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (
        typeof value !== "string"
    ) {
        return "";
    }


    return value
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