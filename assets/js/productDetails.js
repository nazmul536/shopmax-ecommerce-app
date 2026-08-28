/* =========================================================
   SHOPMAX
   PRODUCT DETAILS PAGE
========================================================= */

const API_URL =
    "https://fakestoreapi.com/products";


/* =========================================================
   STATE
========================================================= */

let products = [];

let currentProduct = null;

let productQuantity = 1;

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


/*
   Normalize wishlist
*/

wishlist = [
    ...new Set(
        wishlist.map(Number)
    )
];


/* =========================================================
   DOM
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


/* PRODUCT */

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


/* RELATED */

const relatedProducts =
    document.getElementById(
        "relatedProducts"
    );


/* =========================================================
   CART DOM
========================================================= */

const cartBtn =
    document.getElementById(
        "productCartBtn"
    );


const cartCount =
    document.getElementById(
        "productCartCount"
    );


const cartDrawer =
    document.getElementById(
        "productCartDrawer"
    );


const cartOverlay =
    document.getElementById(
        "productCartOverlay"
    );


const closeCartBtn =
    document.getElementById(
        "productCloseCart"
    );


const cartItems =
    document.getElementById(
        "productCartItems"
    );


const cartTotal =
    document.getElementById(
        "productCartTotal"
    );


const checkoutBtn =
    document.getElementById(
        "productCheckoutBtn"
    );


/* =========================================================
   WISHLIST DOM
========================================================= */

const wishlistBtnHeader =
    document.getElementById(
        "productWishlistHeader"
    );


const wishlistCount =
    document.getElementById(
        "productWishlistCount"
    );


const wishlistDrawer =
    document.getElementById(
        "productWishlistDrawer"
    );


const wishlistOverlay =
    document.getElementById(
        "productWishlistOverlay"
    );


const closeWishlistBtn =
    document.getElementById(
        "productCloseWishlist"
    );


const wishlistItems =
    document.getElementById(
        "productWishlistItems"
    );


const wishlistCountText =
    document.getElementById(
        "productWishlistCountText"
    );


/* =========================================================
   CATEGORY DOM
========================================================= */

const categoriesBtn =
    document.getElementById(
        "productCategoriesBtn"
    );


const categoryDropdown =
    document.getElementById(
        "productCategoryDropdown"
    );


/* =========================================================
   SEARCH DOM
========================================================= */

const searchInput =
    document.getElementById(
        "productSearchInput"
    );


const searchBtn =
    document.getElementById(
        "productSearchBtn"
    );


const searchCategory =
    document.getElementById(
        "productSearchCategory"
    );


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

        updateCartUI();

        updateWishlistUI();

        loadProduct();

    }
);


/* =========================================================
   SETUP PRODUCT DETAILS
========================================================= */

function setupProductDetails() {

    decreaseBtn?.addEventListener(
        "click",
        () => {

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
        () => {

            productQuantity++;

            updateQuantity();

        }
    );


    /*
       Product Details → Add To Cart
       → Add product
       → Open Cart
    */

    addToCartBtn?.addEventListener(
        "click",
        () => {

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
        () => {

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


    /*
       Buy Now
       → Add product
       → Open Cart
    */

    buyNowBtn?.addEventListener(
        "click",
        () => {

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
            params.get(
                "id"
            )
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
                API_URL
            );


        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }


        products =
            await response.json();


        products =
            products.map(
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


        currentProduct =
            products.find(
                product =>
                    product.id ===
                    productId
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


        showProductContent();

    }

    catch (error) {

        console.error(
            "Product details error:",
            error
        );


        showProductError();

    }

}


/* =========================================================
   LOADING STATE
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
   SHOW PRODUCT
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
   SHOW ERROR
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
   RENDER PRODUCT DETAILS
========================================================= */

function renderProductDetails(
    product
) {

    if (!product) {
        return;
    }


    /*
       Reset quantity when opening
       a product page.
    */

    productQuantity =
        1;


    updateQuantity();


    /*
       IMAGE
    */

    if (productImage) {

        productImage.src =
            product.image;

        productImage.alt =
            product.title;

    }


    /*
       CATEGORY
    */

    if (
        productCategory
    ) {

        productCategory.textContent =
            formatCategory(
                product.category
            );

    }


    /*
       TITLE
    */

    if (
        productTitle
    ) {

        productTitle.textContent =
            product.title;

    }


    /*
       RATING
    */

    const rating =
        Number(
            product.rating?.rate ||
            0
        );


    const reviewCount =
        Number(
            product.rating?.count ||
            0
        );


    if (
        productRating
    ) {

        productRating.textContent =
            rating.toFixed(1);

    }


    if (
        productReviewCount
    ) {

        productReviewCount.textContent =
            reviewCount;

    }


    renderStars(
        rating
    );


    /*
       PRICE
    */

    if (
        productPrice
    ) {

        productPrice.textContent =
            `$${product.price.toFixed(
                2
            )}`;

    }


    /*
       OLD PRICE
    */

    const discount =
        getProductDiscount(
            product.id
        );


    const oldPrice =
        product.price /
        (
            1 -
            discount / 100
        );


    if (
        productOldPrice
    ) {

        productOldPrice.textContent =
            `$${oldPrice.toFixed(
                2
            )}`;

    }


    if (
        productBadge
    ) {

        productBadge.textContent =
            `-${discount}%`;

    }


    /*
       DESCRIPTION
    */

    if (
        productDescription
    ) {

        productDescription.textContent =
            product.description ||
            "No description available.";

    }


    /*
       WISHLIST BUTTON
    */

    updateProductWishlistButton();

}


/* =========================================================
   STAR RENDER
========================================================= */

function renderStars(
    rating
) {

    if (!productStars) {
        return;
    }


    const fullStars =
        Math.floor(
            rating
        );


    const hasHalf =
        (
            rating -
            fullStars
        ) >= 0.5;


    let html = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            i <
            fullStars
        ) {

            html += `

                <i
                    class="
                        fa-solid
                        fa-star
                    "
                ></i>

            `;

        }

        else if (
            i ===
            fullStars &&
            hasHalf
        ) {

            html += `

                <i
                    class="
                        fa-solid
                        fa-star-half-stroke
                    "
                ></i>

            `;

        }

        else {

            html += `

                <i
                    class="
                        fa-regular
                        fa-star
                    "
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

    if (
        productQuantityEl
    ) {

        productQuantityEl.textContent =
            productQuantity;

    }

}


/* =========================================================
   PRODUCT DISCOUNT
========================================================= */

function getProductDiscount(
    id
) {

    const discounts = [
        20,
        15,
        18,
        22,
        12,
        25,
        17,
        14
    ];


    return discounts[
        (
            Number(id) -
            1
        ) %
        discounts.length
    ];

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


    const related =
        products
            .filter(
                item =>
                    item.id !==
                        product.id &&
                    item.category ===
                        product.category
            )
            .slice(
                0,
                4
            );


    /*
       If same category has fewer
       than 4, fill from other products.
    */

    if (
        related.length < 4
    ) {

        const extra =
            products
                .filter(
                    item =>
                        item.id !==
                            product.id &&
                        !related.some(
                            relatedItem =>
                                relatedItem.id ===
                                item.id
                        )
                )
                .slice(
                    0,
                    4 -
                    related.length
                );


        related.push(
            ...extra
        );

    }


    relatedProducts.innerHTML =
        related
            .map(
                (
                    item,
                    index
                ) =>
                    createRelatedCard(
                        item,
                        index
                    )
            )
            .join("");


    attachRelatedEvents();

}


/* =========================================================
   RELATED CARD
========================================================= */

function createRelatedCard(
    product,
    index
) {

    const rating =
        Number(
            product.rating?.rate ||
            0
        );


    const reviews =
        Number(
            product.rating?.count ||
            0
        );


    const discount =
        getProductDiscount(
            product.id
        );


    const oldPrice =
        product.price /
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
                        data-related-action="wishlist"
                        data-id="${product.id}"
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
                        "
                        data-related-action="view"
                        data-id="${product.id}"
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
                        $${product.price.toFixed(2)}
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

    if (!relatedProducts) {
        return;
    }


    relatedProducts.onclick =
        event => {

            const element =
                event.target.closest(
                    "[data-related-action]"
                );


            if (!element) {
                return;
            }


            event.preventDefault();

            event.stopPropagation();


            const action =
                element.dataset.relatedAction;


            const id =
                Number(
                    element.dataset.id
                );


            const product =
                products.find(
                    item =>
                        item.id ===
                        id
                );


            if (!product) {
                return;
            }


            if (
                action ===
                "view"
            ) {

                openProductPage(
                    id
                );


                return;

            }


            if (
                action ===
                "wishlist"
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
                action ===
                "cart"
            ) {

                addToCart(
                    product,
                    1
                );

            }

        };

}


/* =========================================================
   OPEN ANOTHER PRODUCT
========================================================= */

function openProductPage(
    id
) {

    window.location.href =
        `productDetails.html?id=${id}`;

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

    updateCartUI();

    showToast(
        "Added to cart",
        "cart-shopping"
    );

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
   UPDATE CART UI
========================================================= */

function updateCartUI() {

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
        action ===
        "increase"
    ) {

        item.quantity++;

    }


    if (
        action ===
        "decrease"
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
        action ===
        "remove"
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

    updateCartUI();

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
   WISHLIST
========================================================= */

function setupWishlist() {

    wishlistBtnHeader?.addEventListener(
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
            "Added to wishlist",
            "heart"
        );

    }


    wishlist =
        [
            ...new Set(
                wishlist
            )
        ];


    localStorage.setItem(
        "shopmax-wishlist",
        JSON.stringify(
            wishlist
        )
    );


    updateWishlistUI();

}


/* =========================================================
   UPDATE WISHLIST UI
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


    updateProductWishlistButton();

    renderWishlist();

}


/* =========================================================
   UPDATE PRODUCT WISHLIST
========================================================= */

function updateProductWishlistButton() {

    if (
        !wishlistBtn ||
        !currentProduct
    ) {
        return;
    }


    const active =
        wishlist.includes(
            Number(
                currentProduct.id
            )
        );


    wishlistBtn.classList.toggle(
        "active",
        active
    );


    wishlistBtn.setAttribute(
        "aria-label",
        active
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
            active
        );


        icon.classList.toggle(
            "fa-regular",
            !active
        );

    }

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
                product => `

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
                                $${product.price.toFixed(2)}
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
                ) ===
                id
        );


    if (!product) {
        return;
    }


    /*
       Wishlist → Add To Cart
       → Add product
       → Open Cart
    */

    if (
        action ===
        "cart"
    ) {

        addToCart(
            product,
            1
        );


        openCart();


        return;

    }


    if (
        action ===
        "remove"
    ) {

        toggleWishlist(
            id
        );

    }

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


            const open =
                categoryDropdown.classList.contains(
                    "show"
                );


            if (open) {

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


            const button =
                event.target.closest(
                    "[data-category]"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            const category =
                button.dataset.category;


            if (
                category
            ) {

                goToShopCategory(
                    category
                );

            }

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                categoryDropdown.contains(
                    event.target
                ) ||
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
   GO TO SHOP CATEGORY
========================================================= */

function goToShopCategory(
    category
) {

    window.location.href =
        `shop.html?category=${encodeURIComponent(
            category
        )}`;

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

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    searchBtn?.addEventListener(
        "click",
        performSearch
    );


    searchInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                performSearch();

            }

        }
    );

}


/* =========================================================
   PERFORM SEARCH
========================================================= */

function performSearch() {

    const query =
        searchInput
            ? searchInput.value.trim()
            : "";


    const category =
        searchCategory
            ? searchCategory.value
            : "all";


    const params =
        new URLSearchParams();


    if (
        query
    ) {

        params.set(
            "search",
            query
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


    const queryString =
        params.toString();


    window.location.href =
        queryString
            ? `shop.html?${queryString}`
            : "shop.html";

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
        "Checkout coming soon",
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
            2000
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
   GLOBAL
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


/* =========================================================
   END
========================================================= */