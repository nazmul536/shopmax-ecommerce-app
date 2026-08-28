/* =========================================================
   SHOPMAX
   CHECKOUT PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   STATE
========================================================= */

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


/* Normalize data */

cart =
    Array.isArray(cart)
        ? cart
        : [];


wishlist =
    Array.isArray(wishlist)
        ? wishlist.map(Number)
        : [];


/* =========================================================
   CONSTANTS
========================================================= */

const SHIPPING_COST = 0;


/* =========================================================
   DOM
========================================================= */

/* Header */

const checkoutCartBtn =
    document.getElementById(
        "checkoutCartBtn"
    );

const checkoutCartCount =
    document.getElementById(
        "checkoutCartCount"
    );

const checkoutWishlistBtn =
    document.getElementById(
        "checkoutWishlistBtn"
    );

const checkoutWishlistCount =
    document.getElementById(
        "checkoutWishlistCount"
    );


const checkoutSearch =
    document.getElementById(
        "checkoutSearch"
    );

const checkoutSearchBtn =
    document.getElementById(
        "checkoutSearchBtn"
    );


/* Summary */

const checkoutSummaryItems =
    document.getElementById(
        "checkoutSummaryItems"
    );

const checkoutSummaryCount =
    document.getElementById(
        "checkoutSummaryCount"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );

const checkoutShipping =
    document.getElementById(
        "checkoutShipping"
    );

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );


/* Customer */

const checkoutName =
    document.getElementById(
        "checkoutName"
    );

const checkoutEmail =
    document.getElementById(
        "checkoutEmail"
    );

const checkoutPhone =
    document.getElementById(
        "checkoutPhone"
    );


/* Shipping */

const checkoutAddress =
    document.getElementById(
        "checkoutAddress"
    );

const checkoutCity =
    document.getElementById(
        "checkoutCity"
    );

const checkoutPostal =
    document.getElementById(
        "checkoutPostal"
    );

const checkoutCountry =
    document.getElementById(
        "checkoutCountry"
    );


/* Payment */

const paymentMethods =
    document.getElementById(
        "paymentMethods"
    );

const cardPaymentFields =
    document.getElementById(
        "cardPaymentFields"
    );

const cardNumber =
    document.getElementById(
        "cardNumber"
    );

const cardExpiry =
    document.getElementById(
        "cardExpiry"
    );

const cardCvv =
    document.getElementById(
        "cardCvv"
    );


/* Order */

const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );


/* Success */

const orderSuccessModal =
    document.getElementById(
        "orderSuccessModal"
    );

const orderSuccessOverlay =
    document.getElementById(
        "orderSuccessOverlay"
    );

const orderNumber =
    document.getElementById(
        "orderNumber"
    );

const continueShoppingBtn =
    document.getElementById(
        "continueShoppingBtn"
    );


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeCheckout();

    }
);


/* =========================================================
   INITIALIZE CHECKOUT
========================================================= */

function initializeCheckout() {

    updateHeaderCounts();

    renderOrderSummary();

    setupPaymentMethods();

    setupForm();

    setupSearch();

    setupHeaderActions();

    setupSuccessModal();

}


/* =========================================================
   HEADER COUNTS
========================================================= */

function updateHeaderCounts() {

    const cartCount =
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


    if (
        checkoutCartCount
    ) {

        checkoutCartCount.textContent =
            cartCount;

    }


    if (
        checkoutWishlistCount
    ) {

        checkoutWishlistCount.textContent =
            wishlist.length;

    }

}


/* =========================================================
   ORDER SUMMARY
========================================================= */

function renderOrderSummary() {

    if (
        !checkoutSummaryItems
    ) {

        return;

    }


    if (
        cart.length === 0
    ) {

        checkoutSummaryItems.innerHTML = `

            <div
                class="empty-checkout"
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
                    Add products before checking out.
                </p>

            </div>

        `;


        updateSummaryTotals();


        if (
            checkoutSummaryCount
        ) {

            checkoutSummaryCount.textContent =
                "0 items";

        }


        if (
            placeOrderBtn
        ) {

            placeOrderBtn.disabled =
                true;

            placeOrderBtn.style.opacity =
                "0.55";

            placeOrderBtn.style.cursor =
                "not-allowed";

        }


        return;

    }


    if (
        placeOrderBtn
    ) {

        placeOrderBtn.disabled =
            false;

        placeOrderBtn.style.opacity =
            "";

        placeOrderBtn.style.cursor =
            "";

    }


    checkoutSummaryItems.innerHTML =
        cart
            .map(
                createSummaryItem
            )
            .join("");


    updateSummaryTotals();

}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function createSummaryItem(
    item
) {

    const quantity =
        Math.max(
            1,
            Number(
                item.quantity
            ) || 1
        );


    const price =
        Number(
            item.price
        ) || 0;


    const itemTotal =
        price *
        quantity;


    return `

        <div
            class="
                checkout-summary-item
            "
        >

            <div
                class="
                    checkout-summary-item-image
                "
            >

                <img
                    src="${safeImage(
                        item.image
                    )}"
                    alt="${escapeHTML(
                        item.title
                    )}"
                    loading="lazy"
                >

            </div>


            <div
                class="
                    checkout-summary-item-info
                "
            >

                <h4>
                    ${escapeHTML(
                        item.title
                    )}
                </h4>


                <span>
                    Qty: ${quantity}
                </span>

            </div>


            <strong
                class="
                    checkout-summary-item-price
                "
            >
                $${itemTotal.toFixed(2)}
            </strong>

        </div>

    `;

}


/* =========================================================
   SUMMARY TOTALS
========================================================= */

function updateSummaryTotals() {

    const subtotal =
        getCartSubtotal();


    const shipping =
        subtotal > 0
            ? SHIPPING_COST
            : 0;


    const total =
        subtotal +
        shipping;


    const itemCount =
        getCartItemCount();


    if (
        checkoutSummaryCount
    ) {

        checkoutSummaryCount.textContent =
            itemCount === 1
                ? "1 item"
                : `${itemCount} items`;

    }


    if (
        checkoutSubtotal
    ) {

        checkoutSubtotal.textContent =
            `$${subtotal.toFixed(2)}`;

    }


    if (
        checkoutShipping
    ) {

        checkoutShipping.textContent =
            shipping === 0
                ? "Free"
                : `$${shipping.toFixed(2)}`;

    }


    if (
        checkoutTotal
    ) {

        checkoutTotal.textContent =
            `$${total.toFixed(2)}`;

    }

}


/* =========================================================
   GET SUBTOTAL
========================================================= */

function getCartSubtotal() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity
                    ) || 1
                );


            return (
                total +
                (
                    price *
                    quantity
                )
            );

        },
        0
    );

}


/* =========================================================
   GET ITEM COUNT
========================================================= */

function getCartItemCount() {

    return cart.reduce(
        (
            total,
            item
        ) =>
            total +
            Math.max(
                1,
                Number(
                    item.quantity
                ) || 1
            ),
        0
    );

}


/* =========================================================
   PAYMENT METHODS
========================================================= */

function setupPaymentMethods() {

    if (
        !paymentMethods
    ) {

        return;

    }


    const options =
        paymentMethods.querySelectorAll(
            ".payment-option"
        );


    options.forEach(
        option => {

            const input =
                option.querySelector(
                    "input[type='radio']"
                );


            option.addEventListener(
                "click",
                () => {

                    if (
                        input
                    ) {

                        input.checked =
                            true;

                    }


                    updatePaymentUI();

                }
            );


            input?.addEventListener(
                "change",
                updatePaymentUI
            );

        }
    );


    updatePaymentUI();

}


/* =========================================================
   UPDATE PAYMENT UI
========================================================= */

function updatePaymentUI() {

    const selected =
        document.querySelector(
            "input[name='payment']:checked"
        );


    if (
        !selected
    ) {

        return;

    }


    const options =
        paymentMethods?.querySelectorAll(
            ".payment-option"
        ) || [];


    options.forEach(
        option => {

            const input =
                option.querySelector(
                    "input[type='radio']"
                );


            option.classList.toggle(
                "active",
                input?.checked === true
            );

        }
    );


    if (
        cardPaymentFields
    ) {

        cardPaymentFields.hidden =
            selected.value !==
            "card";

    }


    if (
        selected.value !==
        "card"
    ) {

        clearCardErrors();

    }

}


/* =========================================================
   FORM SETUP
========================================================= */

function setupForm() {

    const fields = [

        checkoutName,

        checkoutEmail,

        checkoutPhone,

        checkoutAddress,

        checkoutCity,

        checkoutPostal,

        checkoutCountry

    ];


    fields.forEach(
        field => {

            field?.addEventListener(
                "input",
                () => {

                    clearFieldError(
                        field
                    );

                }
            );


            field?.addEventListener(
                "change",
                () => {

                    clearFieldError(
                        field
                    );

                }
            );

        }
    );


    cardNumber?.addEventListener(
        "input",
        () => {

            formatCardNumber();

            clearFieldError(
                cardNumber
            );

        }
    );


    cardExpiry?.addEventListener(
        "input",
        () => {

            formatExpiry();

            clearFieldError(
                cardExpiry
            );

        }
    );


    cardCvv?.addEventListener(
        "input",
        () => {

            cardCvv.value =
                cardCvv.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        4
                    );


            clearFieldError(
                cardCvv
            );

        }
    );


    placeOrderBtn?.addEventListener(
        "click",
        handlePlaceOrder
    );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    checkoutSearchBtn?.addEventListener(
        "click",
        handleSearch
    );


    checkoutSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                handleSearch();

            }

        }
    );

}


/* =========================================================
   HANDLE SEARCH
========================================================= */

function handleSearch() {

    const query =
        checkoutSearch
            ?.value
            .trim();


    if (
        !query
    ) {

        window.location.href =
            "shop.html";

        return;

    }


    window.location.href =
        `shop.html?search=${encodeURIComponent(
            query
        )}`;

}


/* =========================================================
   HEADER ACTIONS
========================================================= */

function setupHeaderActions() {

    checkoutCartBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "shop.html";

        }
    );


    checkoutWishlistBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


/* =========================================================
   PLACE ORDER
========================================================= */

function handlePlaceOrder() {

    if (
        cart.length === 0
    ) {

        showCheckoutMessage(
            "Your cart is empty."
        );

        return;

    }


    const valid =
        validateCheckout();


    if (
        !valid
    ) {

        const firstError =
            document.querySelector(
                ".checkout-input-error"
            );


        firstError
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "center"
            });


        return;

    }


    /* -----------------------------------------------------
       PAYMENT
    ----------------------------------------------------- */

    const selectedPayment =
        document.querySelector(
            "input[name='payment']:checked"
        );


    const paymentMethod =
        selectedPayment
            ?.value ||
        "cod";


    /* -----------------------------------------------------
       CUSTOMER
    ----------------------------------------------------- */

    const customer =
        getCustomerData();


    /* -----------------------------------------------------
       TOTALS
    ----------------------------------------------------- */

    const subtotal =
        getCartSubtotal();


    const shipping =
        SHIPPING_COST;


    const total =
        subtotal +
        shipping;


    /* -----------------------------------------------------
       ORDER ID
    ----------------------------------------------------- */

    const orderId =
        generateOrderNumber();


    /* -----------------------------------------------------
       CREATE ORDER
    ----------------------------------------------------- */

    const order = {

        orderId,

        createdAt:
            new Date()
                .toISOString(),

        status:
            "Order Placed",

        customer,

        paymentMethod,

        items:
            cart.map(
                item => ({

                    ...item,

                    quantity:
                        Number(
                            item.quantity
                        ) || 1

                })
            ),

        subtotal,

        shipping,

        total

    };


    /* =====================================================
       SAVE LATEST ORDER
    ===================================================== */

    localStorage.setItem(
        "shopmax-last-order",
        JSON.stringify(
            order
        )
    );


    /* =====================================================
       SAVE ORDER TO ALL ORDERS
       THIS IS THE IMPORTANT FIX
    ===================================================== */

    let allOrders =
        JSON.parse(
            localStorage.getItem(
                "shopmax-orders"
            )
        ) || [];


    if (
        !Array.isArray(
            allOrders
        )
    ) {

        allOrders = [];

    }


    /*
       Prevent duplicate order IDs.
    */

    const alreadyExists =
        allOrders.some(
            savedOrder =>
                savedOrder?.orderId ===
                order.orderId
        );


    if (
        !alreadyExists
    ) {

        allOrders.push(
            order
        );

    }


    localStorage.setItem(
        "shopmax-orders",
        JSON.stringify(
            allOrders
        )
    );


    /* =====================================================
       SUCCESS MODAL
    ===================================================== */

    showOrderSuccess(
        orderId
    );


    /* =====================================================
       CLEAR CART
    ===================================================== */

    cart = [];


    localStorage.setItem(
        "shopmax-cart",
        JSON.stringify(
            cart
        )
    );


    updateHeaderCounts();

}


/* =========================================================
   VALIDATE CHECKOUT
========================================================= */

function validateCheckout() {

    let valid = true;


    clearAllErrors();


    /* Name */

    if (
        !checkoutName ||
        checkoutName.value.trim().length <
            2
    ) {

        setFieldError(
            checkoutName,
            "Please enter your full name."
        );

        valid = false;

    }


    /* Email */

    if (
        !checkoutEmail ||
        !isValidEmail(
            checkoutEmail.value
        )
    ) {

        setFieldError(
            checkoutEmail,
            "Please enter a valid email address."
        );

        valid = false;

    }


    /* Phone */

    if (
        !checkoutPhone ||
        !isValidPhone(
            checkoutPhone.value
        )
    ) {

        setFieldError(
            checkoutPhone,
            "Please enter a valid phone number."
        );

        valid = false;

    }


    /* Address */

    if (
        !checkoutAddress ||
        checkoutAddress.value.trim().length <
            5
    ) {

        setFieldError(
            checkoutAddress,
            "Please enter your shipping address."
        );

        valid = false;

    }


    /* City */

    if (
        !checkoutCity ||
        checkoutCity.value.trim().length <
            2
    ) {

        setFieldError(
            checkoutCity,
            "Please enter your city."
        );

        valid = false;

    }


    /* Postal */

    if (
        !checkoutPostal ||
        checkoutPostal.value.trim().length <
            3
    ) {

        setFieldError(
            checkoutPostal,
            "Please enter your postal code."
        );

        valid = false;

    }


    /* Country */

    if (
        !checkoutCountry ||
        !checkoutCountry.value
    ) {

        setFieldError(
            checkoutCountry,
            "Please select your country."
        );

        valid = false;

    }


    /* Card */

    const payment =
        document.querySelector(
            "input[name='payment']:checked"
        );


    if (
        payment?.value ===
        "card"
    ) {

        const cleanCard =
            (
                cardNumber
                    ?.value ||
                ""
            )
                .replace(
                    /\D/g,
                    ""
                );


        if (
            cleanCard.length <
            13
        ) {

            setFieldError(
                cardNumber,
                "Please enter a valid card number."
            );

            valid = false;

        }


        if (
            !isValidExpiry(
                cardExpiry?.value ||
                ""
            )
        ) {

            setFieldError(
                cardExpiry,
                "Enter a valid expiry date."
            );

            valid = false;

        }


        if (
            (
                cardCvv?.value ||
                ""
            ).length <
            3
        ) {

            setFieldError(
                cardCvv,
                "Please enter a valid CVV."
            );

            valid = false;

        }

    }


    return valid;

}


/* =========================================================
   CUSTOMER DATA
========================================================= */

function getCustomerData() {

    return {

        name:
            checkoutName
                ?.value
                .trim() ||
            "",

        email:
            checkoutEmail
                ?.value
                .trim() ||
            "",

        phone:
            checkoutPhone
                ?.value
                .trim() ||
            "",

        address:
            checkoutAddress
                ?.value
                .trim() ||
            "",

        city:
            checkoutCity
                ?.value
                .trim() ||
            "",

        postal:
            checkoutPostal
                ?.value
                .trim() ||
            "",

        country:
            checkoutCountry
                ?.value ||
            ""

    };

}


/* =========================================================
   FORMAT CARD NUMBER
========================================================= */

function formatCardNumber() {

    if (
        !cardNumber
    ) {

        return;

    }


    const value =
        cardNumber.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                19
            );


    cardNumber.value =
        value
            .replace(
                /(.{4})/g,
                "$1 "
            )
            .trim();

}


/* =========================================================
   FORMAT EXPIRY
========================================================= */

function formatExpiry() {

    if (
        !cardExpiry
    ) {

        return;

    }


    let value =
        cardExpiry.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                4
            );


    if (
        value.length >
        2
    ) {

        value =
            value.slice(
                0,
                2
            ) +
            "/" +
            value.slice(
                2
            );

    }


    cardExpiry.value =
        value;

}


/* =========================================================
   EMAIL
========================================================= */

function isValidEmail(
    value
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(
                value
            ).trim()
        );

}


/* =========================================================
   PHONE
========================================================= */

function isValidPhone(
    value
) {

    const digits =
        String(
            value
        )
            .replace(
                /\D/g,
                ""
            );


    return (
        digits.length >=
        10
    );

}


/* =========================================================
   EXPIRY
========================================================= */

function isValidExpiry(
    value
) {

    const match =
        /^(\d{2})\/(\d{2})$/
            .exec(
                value.trim()
            );


    if (
        !match
    ) {

        return false;

    }


    const month =
        Number(
            match[1]
        );


    const year =
        Number(
            match[2]
        );


    if (
        month < 1 ||
        month > 12
    ) {

        return false;

    }


    const now =
        new Date();


    const currentYear =
        now.getFullYear() %
        100;


    const currentMonth =
        now.getMonth() +
        1;


    if (
        year <
        currentYear
    ) {

        return false;

    }


    if (
        year ===
        currentYear &&
        month <
        currentMonth
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   FIELD ERROR
========================================================= */

function setFieldError(
    field,
    message
) {

    if (
        !field
    ) {

        return;

    }


    field.classList.add(
        "checkout-input-error"
    );


    field.setAttribute(
        "aria-invalid",
        "true"
    );


    const group =
        field.closest(
            ".form-group"
        );


    if (
        !group
    ) {

        return;

    }


    let error =
        group.querySelector(
            ".form-error"
        );


    if (
        !error
    ) {

        error =
            document.createElement(
                "small"
            );


        error.className =
            "form-error";


        group.appendChild(
            error
        );

    }


    error.textContent =
        message;

}


/* =========================================================
   CLEAR FIELD ERROR
========================================================= */

function clearFieldError(
    field
) {

    if (
        !field
    ) {

        return;

    }


    field.classList.remove(
        "checkout-input-error"
    );


    field.removeAttribute(
        "aria-invalid"
    );


    const group =
        field.closest(
            ".form-group"
        );


    const error =
        group?.querySelector(
            ".form-error"
        );


    if (
        error
    ) {

        error.textContent =
            "";

    }

}


/* =========================================================
   CLEAR ALL ERRORS
========================================================= */

function clearAllErrors() {

    document
        .querySelectorAll(
            ".checkout-input-error"
        )
        .forEach(
            field => {

                clearFieldError(
                    field
                );

            }
        );

}


/* =========================================================
   CLEAR CARD ERRORS
========================================================= */

function clearCardErrors() {

    clearFieldError(
        cardNumber
    );

    clearFieldError(
        cardExpiry
    );

    clearFieldError(
        cardCvv
    );

}


/* =========================================================
   SHOW SUCCESS
========================================================= */

function showOrderSuccess(
    id
) {

    if (
        orderNumber
    ) {

        orderNumber.textContent =
            `Order #${id}`;

    }


    if (
        orderSuccessModal
    ) {

        orderSuccessModal.classList.add(
            "show"
        );


        orderSuccessModal.classList.add(
            "active"
        );


        orderSuccessModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE SUCCESS
========================================================= */

function closeOrderSuccess() {

    if (
        orderSuccessModal
    ) {

        orderSuccessModal.classList.remove(
            "show"
        );


        orderSuccessModal.classList.remove(
            "active"
        );


        orderSuccessModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   SUCCESS EVENTS
========================================================= */

function setupSuccessModal() {

    orderSuccessOverlay?.addEventListener(
        "click",
        closeOrderSuccess
    );


    continueShoppingBtn?.addEventListener(
        "click",
        () => {

            closeOrderSuccess();

            window.location.href =
                "shop.html";

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeOrderSuccess();

            }

        }
    );

}


/* =========================================================
   ORDER NUMBER
========================================================= */

function generateOrderNumber() {

    const random =
        Math.floor(
            100000 +
            Math.random() *
            900000
        );


    return `SHOP-${random}`;

}


/* =========================================================
   CHECKOUT MESSAGE
========================================================= */

function showCheckoutMessage(
    message
) {

    let element =
        document.getElementById(
            "checkoutMessage"
        );


    if (
        !element
    ) {

        element =
            document.createElement(
                "div"
            );


        element.id =
            "checkoutMessage";


        element.style.position =
            "fixed";


        element.style.left =
            "50%";


        element.style.bottom =
            "24px";


        element.style.transform =
            "translateX(-50%)";


        element.style.zIndex =
            "11000";


        element.style.padding =
            "11px 16px";


        element.style.borderRadius =
            "7px";


        element.style.background =
            "#17233b";


        element.style.color =
            "#ffffff";


        element.style.fontSize =
            "12px";


        element.style.fontWeight =
            "700";


        element.style.boxShadow =
            "0 10px 30px rgba(15,23,42,.2)";


        document.body.appendChild(
            element
        );

    }


    element.textContent =
        message;


    element.style.display =
        "block";


    clearTimeout(
        window.checkoutMessageTimer
    );


    window.checkoutMessageTimer =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            2500
        );

}


/* =========================================================
   SAFE IMAGE
========================================================= */

function safeImage(
    value
) {

    if (
        typeof value ===
        "string" &&
        value.trim()
    ) {

        return value;

    }


    return "";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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
   GET LAST ORDER
========================================================= */

window.getLastOrder =
    function () {

        return JSON.parse(
            localStorage.getItem(
                "shopmax-last-order"
            )
        );

    };


/* =========================================================
   END
========================================================= */