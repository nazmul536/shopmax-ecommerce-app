

/* =========================================================
   SHOPMAX
   PRODUCT DETAILS PAGE
   COMPLETE JAVASCRIPT

   FEATURES
   ---------------------------------------------------------
   - DummyJSON API
   - Product Details
   - Quantity
   - Add To Cart
   - Buy Now
   - Cart Drawer
   - Wishlist Drawer
   - Wishlist Toggle
   - Related Products
   - Header Search
   - Category Menu
   - Mobile Navigation
   - LocalStorage
   - Shared Cart / Wishlist with Shop page
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

let currentProduct = null;

let productQuantity = 1;


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


wishlist = [
    ...new Set(
        wishlist.map(Number)
    )
];


/* =========================================================
   PRODUCT DOM
========================================================= */

const loadingEl =
    document.getElementById(
        "productDetailsLoading"
    );


const contentEl =
    document.getElementById(
        "productDetailsContent"
    );


const errorEl =
    document.getElementById(
        "productDetailsError"
    );


const productImage =
    document.getElementById(
        "productDetailsImage"
    );


const productBadge =
    document.getElementById(
        "productDetailsBadge"
    );


const productCategory =
    document.getElementById(
        "productDetailsCategory"
    );


const productTitle =
    document.getElementById(
        "productDetailsTitle"
    );


const productStars =
    document.getElementById(
        "productDetailsStars"
    );


const productRating =
    document.getElementById(
        "productDetailsRating"
    );


const productReviewCount =
    document.getElementById(
        "productDetailsReviewCount"
    );


const productPrice =
    document.getElementById(
        "productDetailsPrice"
    );


const productOldPrice =
    document.getElementById(
        "productDetailsOldPrice"
    );


const productDescription =
    document.getElementById(
        "productDetailsDescription"
    );


const productQuantityEl =
    document.getElementById(
        "productDetailsQuantity"
    );


const decreaseBtn =
    document.getElementById(
        "productDetailsDecrease"
    );


const increaseBtn =
    document.getElementById(
        "productDetailsIncrease"
    );


const addToCartBtn =
    document.getElementById(
        "productDetailsAddToCart"
    );


const wishlistBtn =
    document.getElementById(
        "productDetailsWishlist"
    );


const buyNowBtn =
    document.getElementById(
        "productDetailsBuyNow"
    );


/* =========================================================
   RELATED PRODUCTS
========================================================= */

const relatedProducts =
    document.getElementById(
        "relatedProducts"
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


const wishlistCount =
    document.getElementById(
        "wishlistCount"
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
   CATEGORY MENU
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
   SEARCH
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
   MOBILE NAV
========================================================= */

let mobileMenuToggle = null;

let mobileNav = null;

let mobileNavOverlay = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupProductDetails();

        setupCart();

        setupWishlist();

        setupCategoryMenu();

        setupSearch();

        setupCategorySelect();

        setupMobileNavigation();

        updateCart();

        updateWishlistUI();

        loadProduct();

    }
);


/* =========================================================
   PRODUCT DETAILS SETUP
========================================================= */

function setupProductDetails() {

    decreaseBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            if (
                productQuantity > 1
            ) {

                productQuantity--;

                updateQuantity();

            }

        }
    );


    increaseBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            productQuantity++;

            updateQuantity();

        }
    );


    addToCartBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            if (
                !currentProduct
            ) {

                return;

            }


            addToCart(
                currentProduct,
                productQuantity
            );


            openCart();

        }
    );


    wishlistBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            if (
                !currentProduct
            ) {

                return;

            }


            toggleWishlist(
                currentProduct.id
            );


            updateProductWishlistButton();

        }
    );


    buyNowBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            if (
                !currentProduct
            ) {

                return;

            }


            addToCart(
                currentProduct,
                productQuantity
            );


            openCart();

        }
    );

}


/* =========================================================
   LOAD PRODUCT
========================================================= */

async function loadProduct() {

    showLoadingState();


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        Number(
            params.get("id")
        );


    if (
        !productId
    ) {

        showProductError();

        return;

    }


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
                "API request failed"
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

                    const rating =
                        Number(
                            product.rating || 0
                        );


                    const reviewCount =
                        Array.isArray(
                            product.reviews
                        )
                            ? product.reviews.length
                            : 0;


                    return {

                        ...product,

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


        /* =====================================================
           IMPORTANT FIX
           SAME FLOW AS SHOP.JS

           products are loaded first,
           then categories are populated.
        ===================================================== */

        populateCategorySelect();


        currentProduct =
            products.find(
                product =>
                    Number(
                        product.id
                    ) === productId
            );


        if (
            !currentProduct
        ) {

            showProductError();

            return;

        }


        renderProductDetails(
            currentProduct
        );


        renderRelatedProducts(
            currentProduct
        );


        updateProductWishlistButton();


        showProductContent();

    }

    catch (error) {

        console.error(
            "Product Details Error:",
            error
        );


        showProductError();

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoadingState() {

    if (loadingEl) {

        loadingEl.hidden =
            false;

    }


    if (contentEl) {

        contentEl.hidden =
            true;

    }


    if (errorEl) {

        errorEl.hidden =
            true;

    }

}


/* =========================================================
   SHOW CONTENT
========================================================= */

function showProductContent() {

    if (loadingEl) {

        loadingEl.hidden =
            true;

    }


    if (contentEl) {

        contentEl.hidden =
            false;

    }


    if (errorEl) {

        errorEl.hidden =
            true;

    }

}


/* =========================================================
   ERROR
========================================================= */

function showProductError() {

    if (loadingEl) {

        loadingEl.hidden =
            true;

    }


    if (contentEl) {

        contentEl.hidden =
            true;

    }


    if (errorEl) {

        errorEl.hidden =
            false;

    }

}


/* =========================================================
   RENDER PRODUCT
========================================================= */

function renderProductDetails(
    product
) {

    if (!product) {

        return;

    }


    productQuantity =
        1;


    updateQuantity();


    if (productImage) {

        productImage.src =
            product.image;

        productImage.alt =
            product.title;

    }


    if (productBadge) {

        const discount =
            Number(
                product.discountPercentage
            ) ||
            getFallbackDiscount(
                product.id
            );


        productBadge.textContent =
            `-${Math.round(
                discount
            )}%`;

    }


    if (productCategory) {

        productCategory.textContent =
            formatCategory(
                product.category
            );

    }


    if (productTitle) {

        productTitle.textContent =
            product.title;

    }


    const rating =
        Number(
            product.rating?.rate || 0
        );


    const reviewCount =
        Number(
            product.rating?.count || 0
        );


    if (productRating) {

        productRating.textContent =
            rating.toFixed(1);

    }


    if (productReviewCount) {

        productReviewCount.textContent =
            reviewCount;

    }


    renderStars(
        rating
    );


    if (productPrice) {

        productPrice.textContent =
            `$${Number(
                product.price
            ).toFixed(2)}`;

    }


    if (productOldPrice) {

        const discount =
            Number(
                product.discountPercentage
            ) ||
            getFallbackDiscount(
                product.id
            );


        const oldPrice =
            Number(
                product.price
            ) /
            (
                1 -
                discount / 100
            );


        productOldPrice.textContent =
            `$${oldPrice.toFixed(2)}`;

    }


    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "No description available.";

    }

}


/* =========================================================
   STAR RATING
========================================================= */

function renderStars(
    rating
) {

    if (!productStars) {

        return;

    }


    const value =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );


    let html = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (
            value >= i
        ) {

            html += `
                <i
                    class="fa-solid fa-star"
                ></i>
            `;

        }

        else if (
            value >= i - 0.5
        ) {

            html += `
                <i
                    class="fa-solid fa-star-half-stroke"
                ></i>
            `;

        }

        else {

            html += `
                <i
                    class="fa-regular fa-star"
                ></i>
            `;

        }

    }


    productStars.innerHTML =
        html;

}


/* =========================================================
   QUANTITY
========================================================= */

function updateQuantity() {

    if (productQuantityEl) {

        productQuantityEl.textContent =
            productQuantity;

    }

}


/* =========================================================
   PRODUCT WISHLIST BUTTON
========================================================= */

function updateProductWishlistButton() {

    if (
        !wishlistBtn ||
        !currentProduct
    ) {

        return;

    }


    const liked =
        wishlist.includes(
            Number(
                currentProduct.id
            )
        );


    wishlistBtn.classList.toggle(
        "wishlisted",
        liked
    );


    wishlistBtn.setAttribute(
        "aria-pressed",
        liked
            ? "true"
            : "false"
    );


    wishlistBtn.setAttribute(
        "aria-label",
        liked
            ? "Remove from wishlist"
            : "Add to wishlist"
    );


    const icon =
        wishlistBtn.querySelector(
            "i"
        );


    if (icon) {

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


/* =========================================================
   RELATED PRODUCTS
========================================================= */

function renderRelatedProducts(
    product
) {

    if (
        !relatedProducts ||
        !product
    ) {

        return;

    }


    let related =
        products.filter(
            item =>
                Number(
                    item.id
                ) !==
                Number(
                    product.id
                ) &&
                item.category ===
                product.category
        );


    if (
        related.length < 4
    ) {

        const additional =
            products.filter(
                item =>
                    Number(
                        item.id
                    ) !==
                    Number(
                        product.id
                    ) &&
                    !related.some(
                        relatedItem =>
                            Number(
                                relatedItem.id
                            ) ===
                            Number(
                                item.id
                            )
                    )
            );


        related =
            [
                ...related,
                ...additional
            ];

    }


    related =
        related.slice(
            0,
            4
        );


    relatedProducts.innerHTML =
        related
            .map(
                (
                    product,
                    index
                ) =>
                    createRelatedProduct(
                        product,
                        index
                    )
            )
            .join("");


    attachRelatedEvents();

}


/* =========================================================
   CREATE RELATED PRODUCT
========================================================= */

function createRelatedProduct(
    product,
    index
) {

    const rating =
        Number(
            product.rating?.rate || 0
        );


    const reviews =
        Number(
            product.rating?.count || 0
        );


    const discount =
        Number(
            product.discountPercentage
        ) ||
        getFallbackDiscount(
            product.id + index
        );


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
            data-related-id="${product.id}"
        >

            <div
                class="product-image"
                data-related-action="view"
                data-id="${product.id}"
            >

                <span
                    class="product-badge"
                >
                    -${Math.round(
                        discount
                    )}%
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
                        data-related-action="wishlist"
                        data-id="${product.id}"
                        aria-label="Wishlist"
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
                        data-related-action="view"
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
                    data-related-action="view"
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
                        (${reviews})
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
                    data-related-action="cart"
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
   RELATED EVENTS
========================================================= */

function attachRelatedEvents() {

    relatedProducts
        ?.querySelectorAll(
            "[data-related-action]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    handleRelatedAction
                );

            }
        );

}


/* =========================================================
   RELATED ACTION
========================================================= */

function handleRelatedAction(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const action =
        this.dataset.relatedAction;


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


    if (
        action === "view"
    ) {

        window.location.href =
            `productDetails.html?id=${id}`;

        return;

    }


    if (
        action === "wishlist"
    ) {

        toggleWishlist(
            id
        );


        renderRelatedProducts(
            currentProduct
        );


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
            Number(quantity) || 1
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
                product.image ||
                product.thumbnail ||
                product.images?.[0] ||
                "",

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

    }


    saveCart();

    updateCart();

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    closeWishlist();


    renderCart();


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
        wishlist.includes(id)
    ) {

        wishlist =
            wishlist.filter(
                item =>
                    Number(item) !== id
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
                wishlist.map(Number)
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

    if (wishlistCount) {

        wishlistCount.textContent =
            wishlist.length;

    }


    if (wishlistCountText) {

        wishlistCountText.textContent =
            wishlist.length === 1
                ? "1 item"
                : `${wishlist.length} items`;

    }


    renderWishlist();

    updateProductWishlistButton();

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
                        data-id="${product.id}"
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
   PRODUCT DETAILS SEARCH
   SAME SEARCH BEHAVIOR AS SHOP.JS
========================================================= */

let productSearchSuggestions = null;

let activeProductSearchSuggestion =
    -1;


/* =========================================================
   SETUP SEARCH
========================================================= */

function setupSearch() {

    if (!searchInput) {

        return;

    }


    createProductSearchSuggestions();


    /* ---------------------------------------------------------
       INPUT
    --------------------------------------------------------- */

    searchInput.addEventListener(
        "input",
        () => {

            const value =
                searchInput.value
                    .trim();


            activeProductSearchSuggestion =
                -1;


            if (value) {

                showProductSearchSuggestions(
                    value
                );

            }

            else {

                hideProductSearchSuggestions();

            }

        }
    );


    /* ---------------------------------------------------------
       FOCUS
    --------------------------------------------------------- */

    searchInput.addEventListener(
        "focus",
        () => {

            const value =
                searchInput.value
                    .trim();


            if (value) {

                showProductSearchSuggestions(
                    value
                );

            }

        }
    );


    /* ---------------------------------------------------------
       SEARCH BUTTON
    --------------------------------------------------------- */

    searchBtn?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            goToShopFromProductSearch();

        }
    );


    /* ---------------------------------------------------------
       KEYBOARD
    --------------------------------------------------------- */

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                !productSearchSuggestions ||
                productSearchSuggestions.style.display ===
                    "none"
            ) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    goToShopFromProductSearch();

                }

                return;

            }


            const items =
                productSearchSuggestions
                    .querySelectorAll(
                        ".product-details-search-suggestion-item"
                    );


            if (!items.length) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    goToShopFromProductSearch();

                }

                return;

            }


            /* -------------------------------------------------
               ARROW DOWN
            ------------------------------------------------- */

            if (
                event.key === "ArrowDown"
            ) {

                event.preventDefault();

                activeProductSearchSuggestion++;


                if (
                    activeProductSearchSuggestion >=
                    items.length
                ) {

                    activeProductSearchSuggestion =
                        0;

                }


                updateProductSearchActiveItem(
                    items
                );

            }


            /* -------------------------------------------------
               ARROW UP
            ------------------------------------------------- */

            else if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();

                activeProductSearchSuggestion--;


                if (
                    activeProductSearchSuggestion < 0
                ) {

                    activeProductSearchSuggestion =
                        items.length - 1;

                }


                updateProductSearchActiveItem(
                    items
                );

            }


            /* -------------------------------------------------
               ENTER
            ------------------------------------------------- */

            else if (
                event.key === "Enter"
            ) {

                if (
                    activeProductSearchSuggestion >= 0 &&
                    items[
                        activeProductSearchSuggestion
                    ]
                ) {

                    event.preventDefault();


                    items[
                        activeProductSearchSuggestion
                    ].click();

                }

                else {

                    event.preventDefault();

                    goToShopFromProductSearch();

                }

            }


            /* -------------------------------------------------
               ESCAPE
            ------------------------------------------------- */

            else if (
                event.key === "Escape"
            ) {

                event.preventDefault();

                hideProductSearchSuggestions();

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
                !productSearchSuggestions
            ) {

                return;

            }


            if (
                event.target === searchInput ||
                productSearchSuggestions.contains(
                    event.target
                )
            ) {

                return;

            }


            hideProductSearchSuggestions();

        }
    );


    /* ---------------------------------------------------------
       RESIZE
    --------------------------------------------------------- */

    window.addEventListener(
        "resize",
        positionProductSearchSuggestions
    );


    /* ---------------------------------------------------------
       SCROLL
    --------------------------------------------------------- */

    window.addEventListener(
        "scroll",
        positionProductSearchSuggestions,
        true
    );

}




/* =========================================================
   CATEGORY SELECT → SHOP PAGE
========================================================= */

function setupCategorySelect() {

    if (!categorySelect) {
        return;
    }

    categorySelect.addEventListener(
        "change",
        () => {

            const category =
                categorySelect.value;

            if (
                !category ||
                category === "all"
            ) {

                window.location.href =
                    "shop.html";

                return;

            }

            window.location.href =
                `shop.html?category=${encodeURIComponent(
                    category
                )}`;

        }
    );

}

/* =========================================================
   CREATE SEARCH SUGGESTION BOX
========================================================= */

function createProductSearchSuggestions() {

    if (
        productSearchSuggestions
    ) {

        return;

    }


    productSearchSuggestions =
        document.createElement(
            "div"
        );


    productSearchSuggestions.id =
        "productSearchSuggestions";


    productSearchSuggestions.className =
        "product-details-search-suggestions";


    productSearchSuggestions.setAttribute(
        "role",
        "listbox"
    );


    document.body.appendChild(
        productSearchSuggestions
    );

}


/* =========================================================
   SHOW SEARCH SUGGESTIONS
   SAME LOGIC AS SHOP.JS
========================================================= */

function showProductSearchSuggestions(
    value
) {

    if (
        !productSearchSuggestions ||
        !products.length
    ) {

        return;

    }


    const search =
        String(value)
            .trim()
            .toLowerCase();


    if (!search) {

        hideProductSearchSuggestions();

        return;

    }


    let matches =
        products.filter(
            product => {

                const title =
                    String(
                        product.title || ""
                    ).toLowerCase();


                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();


                const brand =
                    String(
                        product.brand || ""
                    ).toLowerCase();


                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();


                return (
                    title.includes(search) ||
                    category.includes(search) ||
                    brand.includes(search) ||
                    description.includes(search)
                );

            }
        );


    matches =
        matches.slice(
            0,
            6
        );


    activeProductSearchSuggestion =
        -1;


    /* ---------------------------------------------------------
       NO RESULTS
    --------------------------------------------------------- */

    if (
        !matches.length
    ) {

        productSearchSuggestions.innerHTML = `

            <div
                class="
                    product-details-search-no-results
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

        productSearchSuggestions.innerHTML =
            matches
                .map(
                    product =>
                        createProductSearchSuggestion(
                            product
                        )
                )
                .join("");


        productSearchSuggestions
            .querySelectorAll(
                ".product-details-search-suggestion-item"
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


                            hideProductSearchSuggestions();


                            window.location.href =
                                `productDetails.html?id=${product.id}`;

                        }
                    );

                }
            );

    }


    productSearchSuggestions.style.display =
        "block";


    positionProductSearchSuggestions();

}


/* =========================================================
   CREATE SINGLE SEARCH SUGGESTION
========================================================= */

function createProductSearchSuggestion(
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
                product-details-search-suggestion-item
            "
            data-product-id="${product.id}"
            role="option"
        >

            <div
                class="
                    product-details-search-suggestion-image
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
                    product-details-search-suggestion-info
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


                <div
                    class="
                        product-details-search-suggestion-meta
                    "
                >

                    <span
                        class="
                            product-details-search-suggestion-price
                        "
                    >

                        $${Number(
                            product.price
                        ).toFixed(2)}

                    </span>


                    <span
                        class="
                            product-details-search-suggestion-rating
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
                    product-details-search-suggestion-arrow
                "
            ></i>

        </button>

    `;

}

/* =========================================================
   POSITION SEARCH SUGGESTIONS
   SAME STYLE / BEHAVIOR AS SHOP.JS
========================================================= */

function positionProductSearchSuggestions() {

    if (
        !productSearchSuggestions ||
        productSearchSuggestions.style.display ===
            "none" ||
        !searchInput
    ) {

        return;

    }


    /* =========================================================
       IMPORTANT:
       Use the FULL .search-box width
       instead of only the search input width.
    ========================================================= */

    const searchBox =
        searchInput.closest(".search-box") ||
        searchInput.parentElement;


    if (!searchBox) {

        return;

    }


    const rect =
        searchBox.getBoundingClientRect();


    const viewportWidth =
        window.innerWidth;


    const viewportHeight =
        window.innerHeight;


    /* =========================================================
       DESKTOP
    ========================================================= */

    if (
        viewportWidth > 768
    ) {

        productSearchSuggestions.style.position =
            "fixed";


        productSearchSuggestions.style.left =
            `${rect.left}px`;


        productSearchSuggestions.style.top =
            `${rect.bottom + 8}px`;


        productSearchSuggestions.style.width =
            `${rect.width}px`;


        productSearchSuggestions.style.maxWidth =
            `${rect.width}px`;

    }


    /* =========================================================
       MOBILE
    ========================================================= */

    else {

        const gap =
            10;


        /*
           Get full search-box width
        */

        let width =
            rect.width;


        /*
           Prevent overflow outside viewport
        */

        width =
            Math.min(
                width,
                viewportWidth -
                    gap * 2
            );


        /*
           Calculate horizontal position
        */

        let left =
            rect.left;


        /*
           Keep left side inside viewport
        */

        if (
            left < gap
        ) {

            left =
                gap;

        }


        /*
           Keep right side inside viewport
        */

        if (
            left + width >
            viewportWidth - gap
        ) {

            left =
                viewportWidth -
                width -
                gap;

        }


        /*
           Final safety check
        */

        left =
            Math.max(
                gap,
                left
            );


        /*
           Default:
           dropdown below search box
        */

        let top =
            rect.bottom + 6;


        /*
           Maximum dropdown height
        */

        const maxHeight =
            350;


        /*
           If there isn't enough space below,
           move dropdown above search box.
        */

        if (
            top + maxHeight >
            viewportHeight - gap
        ) {

            top =
                rect.top -
                maxHeight -
                6;

        }


        /*
           Prevent dropdown from going
           outside the top of viewport.
        */

        if (
            top < gap
        ) {

            top =
                gap;

        }


        /* =====================================================
           APPLY POSITION
        ===================================================== */

        productSearchSuggestions.style.position =
            "fixed";


        productSearchSuggestions.style.left =
            `${left}px`;


        productSearchSuggestions.style.top =
            `${top}px`;


        productSearchSuggestions.style.width =
            `${width}px`;


        productSearchSuggestions.style.maxWidth =
            `${width}px`;

    }

}

/* =========================================================
   HIDE SEARCH SUGGESTIONS
========================================================= */

function hideProductSearchSuggestions() {

    if (
        !productSearchSuggestions
    ) {

        return;

    }


    productSearchSuggestions.style.display =
        "none";


    activeProductSearchSuggestion =
        -1;

}


/* =========================================================
   ACTIVE KEYBOARD ITEM
========================================================= */

function updateProductSearchActiveItem(
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
                    activeProductSearchSuggestion
            );

        }
    );


    if (
        activeProductSearchSuggestion >= 0 &&
        items[
            activeProductSearchSuggestion
        ]
    ) {

        items[
            activeProductSearchSuggestion
        ].scrollIntoView({
            block: "nearest"
        });

    }

}


/* =========================================================
   SEARCH → SHOP URL
========================================================= */

function goToShopFromProductSearch() {

    const search =
        searchInput
            ?.value
            .trim() || "";


    const category =
        categorySelect
            ?.value || "all";


    hideProductSearchSuggestions();


    const params =
        new URLSearchParams();


    if (
        search
    ) {

        params.set(
            "search",
            search
        );

    }


    if (
        category &&
        category !== "all"
    ) {

        params.set(
            "category",
            category
        );

    }


    const query =
        params.toString();


    window.location.href =
        query
            ? `shop.html?${query}`
            : "shop.html";

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


    categoryDropdown.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const link =
                event.target.closest(
                    ".category-submenu a[data-category]"
                );


            if (link) {

                event.preventDefault();


                const category =
                    link.dataset.category;


                if (!category) {

                    return;

                }


                window.location.href =
                    `shop.html?category=${encodeURIComponent(
                        category
                    )}`;


                return;

            }


            const button =
                event.target.closest(
                    ".category-item > button"
                );


            if (!button) {

                return;

            }


            const item =
                button.closest(
                    ".category-item"
                );


            if (!item) {

                return;

            }


            const submenu =
                item.querySelector(
                    ":scope > .category-submenu"
                );


            if (
                submenu &&
                window.innerWidth <= 1024
            ) {

                event.preventDefault();


                const isOpen =
                    item.classList.contains(
                        "mobile-open"
                    );


                categoryDropdown
                    .querySelectorAll(
                        ".category-item.mobile-open"
                    )
                    .forEach(
                        other => {

                            if (
                                other !== item
                            ) {

                                other.classList.remove(
                                    "mobile-open"
                                );

                            }

                        }
                    );


                item.classList.toggle(
                    "mobile-open",
                    !isOpen
                );


                return;

            }


            const category =
                button.dataset.category;


            if (!category) {

                return;

            }


            if (
                submenu &&
                window.innerWidth >= 1025
            ) {

                const hasProducts =
                    products.some(
                        product =>
                            normalizeCategory(
                                product.category
                            ) ===
                            normalizeCategory(
                                category
                            )
                    );


                if (!hasProducts) {

                    item.classList.toggle(
                        "desktop-open"
                    );

                    return;

                }

            }


            window.location.href =
                `shop.html?category=${encodeURIComponent(
                    category
                )}`;

        }
    );


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


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 1024
            ) {

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

            }

            else {

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
   CLOSE CATEGORY
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
            "aria-expanded",
            "false"
        );


        mobileMenuToggle.innerHTML =
            `
                <i
                    class="
                        fa-solid
                        fa-bars
                    "
                ></i>
            `;


        navigationInner.appendChild(
            mobileMenuToggle
        );

    }


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


    if (
        desktopNav &&
        mobileNav.children.length === 0
    ) {

        desktopNav
            .querySelectorAll(
                "a"
            )
            .forEach(
                original => {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        original.getAttribute(
                            "href"
                        ) || "#";


                    link.textContent =
                        original.textContent.trim();


                    mobileNav.appendChild(
                        link
                    );

                }
            );

    }


    function openMobileMenu() {

        mobileNav?.classList.add(
            "is-open"
        );


        mobileNavOverlay?.classList.add(
            "is-visible"
        );


        mobileMenuToggle?.classList.add(
            "is-active"
        );


        mobileMenuToggle?.setAttribute(
            "aria-expanded",
            "true"
        );


        mobileMenuToggle.innerHTML =
            `
                <i
                    class="
                        fa-solid
                        fa-xmark
                    "
                ></i>
            `;


        document.body.classList.add(
            "mobile-menu-open"
        );

    }


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


        mobileMenuToggle.innerHTML =
            `
                <i
                    class="
                        fa-solid
                        fa-bars
                    "
                ></i>
            `;


        document.body.classList.remove(
            "mobile-menu-open"
        );

    }


    mobileMenuToggle.addEventListener(
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

                closeCategoryMenu();

                openMobileMenu();

            }

        }
    );


    mobileNavOverlay.addEventListener(
        "click",
        closeMobileMenu
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


            const href =
                link.getAttribute(
                    "href"
                ) || "";


            if (
                !href ||
                href === "#"
            ) {

                event.preventDefault();

                return;

            }


            event.preventDefault();

            closeMobileMenu();


            window.location.href =
                href;

        }
    );


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

function getFallbackDiscount(
    id
) {

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


    return discounts[
        Math.abs(
            Number(id) || 0
        ) %
        discounts.length
    ];

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

        "womens-bags":
            "Women's Bags",

        "womens-jewellery":
            "Women's Jewellery",

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


/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

function normalizeCategory(
    value
) {

    if (!value) {

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
   POPULATE CATEGORY SELECT
   SAME LOGIC AS SHOP.JS
========================================================= */

function populateCategorySelect() {

    if (!categorySelect) {

        return;

    }


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


    const selected =
        categorySelect.value ||
        "all";


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


    const exists =
        [
            ...categorySelect.options
        ].some(
            option =>
                option.value ===
                selected
        );


    categorySelect.value =
        exists
            ? selected
            : "all";

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


window.loadProduct =
    loadProduct;


/* =========================================================
   END PRODUCT DETAILS JS
========================================================= */

