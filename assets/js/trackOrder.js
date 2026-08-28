/* =========================================================
   SHOPMAX
   TRACK ORDER PAGE JAVASCRIPT

   Features:
   - Read all orders from LocalStorage
   - Search by Order ID
   - Auto-load Order ID from URL
   - Show customer information
   - Show shipping information
   - Show payment method
   - Show products
   - Show totals
   - Show tracking timeline
   - Support multiple orders
========================================================= */


/* =========================================================
   STATE
========================================================= */

let orders =
    JSON.parse(
        localStorage.getItem(
            "shopmax-orders"
        )
    ) || [];


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


/* =========================================================
   NORMALIZE STATE
========================================================= */

orders =
    Array.isArray(orders)
        ? orders
        : [];


cart =
    Array.isArray(cart)
        ? cart
        : [];


wishlist =
    Array.isArray(wishlist)
        ? wishlist
        : [];


/* =========================================================
   DOM - HEADER
========================================================= */

const trackWishlistBtn =
    document.getElementById(
        "trackWishlistBtn"
    );


const trackWishlistCount =
    document.getElementById(
        "trackWishlistCount"
    );


const trackCartBtn =
    document.getElementById(
        "trackCartBtn"
    );


const trackCartCount =
    document.getElementById(
        "trackCartCount"
    );


const trackSearch =
    document.getElementById(
        "trackSearch"
    );


const trackSearchBtn =
    document.getElementById(
        "trackSearchBtn"
    );


const trackCategoriesBtn =
    document.getElementById(
        "trackCategoriesBtn"
    );


/* =========================================================
   DOM - ORDER SEARCH
========================================================= */

const orderTrackingInput =
    document.getElementById(
        "orderTrackingInput"
    );


const trackOrderBtn =
    document.getElementById(
        "trackOrderBtn"
    );


const trackOrderError =
    document.getElementById(
        "trackOrderError"
    );


/* =========================================================
   DOM - RESULT
========================================================= */

const orderResult =
    document.getElementById(
        "orderResult"
    );


const trackEmpty =
    document.getElementById(
        "trackEmpty"
    );


/* =========================================================
   DOM - ORDER HEADER
========================================================= */

const trackedOrderId =
    document.getElementById(
        "trackedOrderId"
    );


const trackedOrderStatus =
    document.getElementById(
        "trackedOrderStatus"
    );


const trackedOrderDate =
    document.getElementById(
        "trackedOrderDate"
    );


const trackedPaymentMethod =
    document.getElementById(
        "trackedPaymentMethod"
    );


const trackedOrderTotal =
    document.getElementById(
        "trackedOrderTotal"
    );


/* =========================================================
   DOM - TIMELINE
========================================================= */

const trackingTimeline =
    document.getElementById(
        "trackingTimeline"
    );


/* =========================================================
   DOM - CUSTOMER
========================================================= */

const trackedCustomerName =
    document.getElementById(
        "trackedCustomerName"
    );


const trackedCustomerEmail =
    document.getElementById(
        "trackedCustomerEmail"
    );


const trackedCustomerPhone =
    document.getElementById(
        "trackedCustomerPhone"
    );


/* =========================================================
   DOM - SHIPPING
========================================================= */

const trackedAddress =
    document.getElementById(
        "trackedAddress"
    );


const trackedCity =
    document.getElementById(
        "trackedCity"
    );


const trackedPostal =
    document.getElementById(
        "trackedPostal"
    );


const trackedCountry =
    document.getElementById(
        "trackedCountry"
    );


/* =========================================================
   DOM - ITEMS
========================================================= */

const trackedItems =
    document.getElementById(
        "trackedItems"
    );


const trackedItemsCount =
    document.getElementById(
        "trackedItemsCount"
    );


const trackedSubtotal =
    document.getElementById(
        "trackedSubtotal"
    );


const trackedShipping =
    document.getElementById(
        "trackedShipping"
    );


const trackedTotal =
    document.getElementById(
        "trackedTotal"
    );


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTracking();

    }
);


/* =========================================================
   INITIALIZE TRACKING
========================================================= */

function initializeTracking() {

    refreshOrders();

    refreshCart();

    refreshWishlist();

    updateHeaderCounts();

    setupSearch();

    setupOrderTracking();

    setupHeaderActions();


    /*
       Check URL for Order ID.

       Example:

       trackOrder.html?orderId=SHOP-121423
    */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get(
            "orderId"
        );


    /*
       If Order ID exists in URL,
       automatically load the order.
    */

    if (
        orderId
    ) {

        const decodedOrderId =
            decodeURIComponent(
                orderId
            );


        if (
            orderTrackingInput
        ) {

            orderTrackingInput.value =
                decodedOrderId;

        }


        /*
           Search automatically.
        */

        handleTrackOrder();

    }

    else {

        /*
           Direct page visit:

           Keep input completely blank
           and show empty state.
        */

        if (
            orderTrackingInput
        ) {

            orderTrackingInput.value =
                "";

        }


        showEmptyState();

    }

}


/* =========================================================
   REFRESH ORDERS
========================================================= */

function refreshOrders() {

    const storedOrders =
        JSON.parse(
            localStorage.getItem(
                "shopmax-orders"
            )
        );


    orders =
        Array.isArray(
            storedOrders
        )
            ? storedOrders
            : [];

}


/* =========================================================
   REFRESH CART
========================================================= */

function refreshCart() {

    const storedCart =
        JSON.parse(
            localStorage.getItem(
                "shopmax-cart"
            )
        );


    cart =
        Array.isArray(
            storedCart
        )
            ? storedCart
            : [];

}


/* =========================================================
   REFRESH WISHLIST
========================================================= */

function refreshWishlist() {

    const storedWishlist =
        JSON.parse(
            localStorage.getItem(
                "shopmax-wishlist"
            )
        );


    wishlist =
        Array.isArray(
            storedWishlist
        )
            ? storedWishlist
            : [];

}


/* =========================================================
   UPDATE HEADER COUNTS
========================================================= */

function updateHeaderCounts() {

    const cartCount =
        cart.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Math.max(
                        1,
                        Number(
                            item?.quantity
                        ) || 1
                    )
                );

            },
            0
        );


    if (
        trackCartCount
    ) {

        trackCartCount.textContent =
            cartCount;

    }


    if (
        trackWishlistCount
    ) {

        trackWishlistCount.textContent =
            wishlist.length;

    }

}


/* =========================================================
   PRODUCT SEARCH
========================================================= */

function setupSearch() {

    trackSearchBtn?.addEventListener(
        "click",
        handleProductSearch
    );


    trackSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                handleProductSearch();

            }

        }
    );

}


/* =========================================================
   HANDLE PRODUCT SEARCH
========================================================= */

function handleProductSearch() {

    const query =
        trackSearch
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
   ORDER TRACKING SETUP
========================================================= */

function setupOrderTracking() {

    trackOrderBtn?.addEventListener(
        "click",
        handleTrackOrder
    );


    orderTrackingInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                handleTrackOrder();

            }

        }
    );


    orderTrackingInput?.addEventListener(
        "input",
        () => {

            clearTrackingError();

        }
    );

}


/* =========================================================
   HANDLE TRACK ORDER
========================================================= */

function handleTrackOrder() {

    clearTrackingError();


    const enteredId =
        orderTrackingInput
            ?.value
            .trim();


    /*
       Empty input
    */

    if (
        !enteredId
    ) {

        showTrackingError(
            "Please enter your order number."
        );


        showEmptyState();


        return;

    }


    /*
       Always refresh from LocalStorage
       before searching.
    */

    refreshOrders();


    /*
       No orders at all
    */

    if (
        orders.length ===
        0
    ) {

        showTrackingError(
            "No saved orders were found on this device."
        );


        showEmptyState();


        return;

    }


    /*
       Normalize entered Order ID
    */

    const normalizedInput =
        normalizeOrderId(
            enteredId
        );


    /*
       Find matching order
    */

    const order =
        orders.find(
            item => {

                return (
                    normalizeOrderId(
                        item?.orderId
                    ) ===
                    normalizedInput
                );

            }
        );


    /*
       Order not found
    */

    if (
        !order
    ) {

        showTrackingError(
            "We couldn't find an order with that number."
        );


        showEmptyState();


        return;

    }


    /*
       Order found
    */

    renderTrackedOrder(
        order
    );

}


/* =========================================================
   NORMALIZE ORDER ID
========================================================= */

function normalizeOrderId(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toUpperCase()
        .replace(
            /\s+/g,
            ""
        );

}


/* =========================================================
   SHOW EMPTY STATE
========================================================= */

function showEmptyState() {

    orderResult?.classList.remove(
        "show"
    );


    if (
        trackEmpty
    ) {

        trackEmpty.style.display =
            "";

    }

}


/* =========================================================
   SHOW RESULT STATE
========================================================= */

function showResultState() {

    if (
        trackEmpty
    ) {

        trackEmpty.style.display =
            "none";

    }


    orderResult?.classList.add(
        "show"
    );

}


/* =========================================================
   RENDER ORDER
========================================================= */

function renderTrackedOrder(
    order
) {

    if (
        !order
    ) {

        showEmptyState();

        return;

    }


    showResultState();


    renderOrderHeader(
        order
    );


    renderTimeline(
        order
    );


    renderCustomer(
        order
    );


    renderShipping(
        order
    );


    renderItems(
        order
    );

}


/* =========================================================
   ORDER HEADER
========================================================= */

function renderOrderHeader(
    order
) {

    if (
        trackedOrderId
    ) {

        trackedOrderId.textContent =
            `Order #${
                order.orderId ||
                "—"
            }`;

    }


    if (
        trackedOrderStatus
    ) {

        trackedOrderStatus.textContent =
            formatOrderStatus(
                order.status
            );


        applyStatusClass(
            trackedOrderStatus,
            order.status
        );

    }


    if (
        trackedOrderDate
    ) {

        trackedOrderDate.textContent =
            formatOrderDate(
                order.createdAt
            );

    }


    if (
        trackedPaymentMethod
    ) {

        trackedPaymentMethod.textContent =
            formatPaymentMethod(
                order.paymentMethod
            );

    }


    if (
        trackedOrderTotal
    ) {

        trackedOrderTotal.textContent =
            formatMoney(
                order.total
            );

    }

}


/* =========================================================
   CUSTOMER
========================================================= */

function renderCustomer(
    order
) {

    const customer =
        order.customer ||
        {};


    if (
        trackedCustomerName
    ) {

        trackedCustomerName.textContent =
            customer.name ||
            "—";

    }


    if (
        trackedCustomerEmail
    ) {

        trackedCustomerEmail.textContent =
            customer.email ||
            "—";

    }


    if (
        trackedCustomerPhone
    ) {

        trackedCustomerPhone.textContent =
            customer.phone ||
            "—";

    }

}


/* =========================================================
   SHIPPING
========================================================= */

function renderShipping(
    order
) {

    const customer =
        order.customer ||
        {};


    const addressData =
        order.addressData ||
        {};


    const address =
        addressData.formatted ||
        customer.address ||
        "—";


    const city =
        addressData.city ||
        addressData.county ||
        customer.city ||
        "—";


    const postal =
        addressData.postcode ||
        customer.postalCode ||
        customer.postal ||
        "—";


    const country =
        addressData.country ||
        customer.country ||
        "—";


    if (
        trackedAddress
    ) {

        trackedAddress.textContent =
            address;

    }


    if (
        trackedCity
    ) {

        trackedCity.textContent =
            city;

    }


    if (
        trackedPostal
    ) {

        trackedPostal.textContent =
            postal;

    }


    if (
        trackedCountry
    ) {

        trackedCountry.textContent =
            country;

    }

}


/* =========================================================
   ITEMS
========================================================= */

function renderItems(
    order
) {

    if (
        !trackedItems
    ) {

        return;

    }


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    /*
       Total quantity
    */

    const itemCount =
        items.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Math.max(
                        1,
                        Number(
                            item?.quantity
                        ) || 1
                    )
                );

            },
            0
        );


    if (
        trackedItemsCount
    ) {

        trackedItemsCount.textContent =
            itemCount === 1
                ? "1 item"
                : `${itemCount} items`;

    }


    /*
       Render products
    */

    if (
        items.length ===
        0
    ) {

        trackedItems.innerHTML = `

            <div
                class="
                    orders-inline-empty
                "
            >

                <i
                    class="
                        fa-solid
                        fa-box-open
                    "
                ></i>

                <span>
                    No products found.
                </span>

            </div>

        `;

    }

    else {

        trackedItems.innerHTML =
            items
                .map(
                    createTrackedItem
                )
                .join("");

    }


    /*
       Totals
    */

    const subtotal =
        Number(
            order.subtotal
        ) || 0;


    const shipping =
        Number(
            order.shipping
        ) || 0;


    const total =
        Number(
            order.total
        ) ||
        (
            subtotal +
            shipping
        );


    if (
        trackedSubtotal
    ) {

        trackedSubtotal.textContent =
            formatMoney(
                subtotal
            );

    }


    if (
        trackedShipping
    ) {

        trackedShipping.textContent =
            shipping === 0
                ? "Free"
                : formatMoney(
                    shipping
                );

    }


    if (
        trackedTotal
    ) {

        trackedTotal.textContent =
            formatMoney(
                total
            );

    }

}


/* =========================================================
   CREATE TRACKED ITEM
========================================================= */

function createTrackedItem(
    item
) {

    const quantity =
        Math.max(
            1,
            Number(
                item?.quantity
            ) || 1
        );


    const price =
        Number(
            item?.price
        ) || 0;


    const total =
        price *
        quantity;


    return `

        <div
            class="tracked-item"
        >

            <div
                class="tracked-item-image"
            >

                <img
                    src="${escapeHTML(
                        item?.image ||
                        ""
                    )}"
                    alt="${escapeHTML(
                        item?.title ||
                        "Product"
                    )}"
                    loading="lazy"
                >

            </div>


            <div
                class="tracked-item-info"
            >

                <h4>
                    ${escapeHTML(
                        item?.title ||
                        "Product"
                    )}
                </h4>


                <span>
                    Qty: ${quantity}
                </span>

            </div>


            <strong
                class="tracked-item-price"
            >
                ${formatMoney(
                    total
                )}
            </strong>

        </div>

    `;

}


/* =========================================================
   TIMELINE
========================================================= */

function renderTimeline(
    order
) {

    if (
        !trackingTimeline
    ) {

        return;

    }


    const currentStatus =
        normalizeStatus(
            order.status
        );


    const currentIndex =
        getStatusIndex(
            currentStatus
        );


    const statuses =
        [
            "placed",
            "processing",
            "shipped",
            "out-for-delivery",
            "delivered"
        ];


    statuses.forEach(
        (
            status,
            index
        ) => {

            const step =
                trackingTimeline.querySelector(
                    `[data-status="${status}"]`
                );


            if (
                !step
            ) {

                return;

            }


            step.classList.remove(
                "completed",
                "current"
            );


            /*
               Previous steps
            */

            if (
                index <
                currentIndex
            ) {

                step.classList.add(
                    "completed"
                );

            }


            /*
               Current step
            */

            if (
                index ===
                currentIndex
            ) {

                step.classList.add(
                    "current"
                );

            }


            /*
               Date
            */

            const dateElement =
                step.querySelector(
                    "small"
                );


            if (
                dateElement
            ) {

                if (
                    index <=
                    currentIndex
                ) {

                    dateElement.textContent =
                        formatOrderDate(
                            order.createdAt
                        );

                }

                else {

                    dateElement.textContent =
                        "Pending";

                }

            }

        }
    );

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "Order Placed"
        )
            .trim()
            .toLowerCase();


    if (
        value ===
        "processing"
    ) {

        return "processing";

    }


    if (
        value ===
        "shipped"
    ) {

        return "shipped";

    }


    if (
        value ===
        "out for delivery"
    ) {

        return "out-for-delivery";

    }


    if (
        value ===
        "out-for-delivery"
    ) {

        return "out-for-delivery";

    }


    if (
        value ===
        "delivered"
    ) {

        return "delivered";

    }


    return "placed";

}


/* =========================================================
   GET STATUS INDEX
========================================================= */

function getStatusIndex(
    status
) {

    const statuses =
        [
            "placed",
            "processing",
            "shipped",
            "out-for-delivery",
            "delivered"
        ];


    const index =
        statuses.indexOf(
            normalizeStatus(
                status
            )
        );


    return index >= 0
        ? index
        : 0;

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatOrderStatus(
    status
) {

    switch (
        normalizeStatus(
            status
        )
    ) {

        case "processing":

            return "Processing";


        case "shipped":

            return "Shipped";


        case "out-for-delivery":

            return "Out for Delivery";


        case "delivered":

            return "Delivered";


        default:

            return "Order Placed";

    }

}


/* =========================================================
   STATUS CLASS
========================================================= */

function applyStatusClass(
    element,
    status
) {

    if (
        !element
    ) {

        return;

    }


    element.classList.remove(
        "placed",
        "processing",
        "shipped",
        "out-for-delivery",
        "delivered"
    );


    element.classList.add(
        normalizeStatus(
            status
        )
    );

}


/* =========================================================
   PAYMENT METHOD
========================================================= */

function formatPaymentMethod(
    value
) {

    const method =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        method ===
        "card"
    ) {

        return "Card Payment";

    }


    if (
        method ===
        "card payment"
    ) {

        return "Card Payment";

    }


    if (
        method ===
        "cash"
    ) {

        return "Cash on Delivery";

    }


    if (
        method ===
        "cash on delivery"
    ) {

        return "Cash on Delivery";

    }


    if (
        method ===
        "cod"
    ) {

        return "Cash on Delivery";

    }


    return "Cash on Delivery";

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatOrderDate(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "en-US",
        {

            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"

        }
    ).format(
        date
    );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(
    value
) {

    const amount =
        Number(
            value
        ) || 0;


    return `$${amount.toFixed(2)}`;

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showTrackingError(
    message
) {

    if (
        trackOrderError
    ) {

        trackOrderError.textContent =
            message;

    }


    orderTrackingInput?.classList.add(
        "tracking-input-error"
    );

}


/* =========================================================
   CLEAR ERROR
========================================================= */

function clearTrackingError() {

    if (
        trackOrderError
    ) {

        trackOrderError.textContent =
            "";

    }


    orderTrackingInput?.classList.remove(
        "tracking-input-error"
    );

}


/* =========================================================
   HEADER ACTIONS
========================================================= */

function setupHeaderActions() {

    trackWishlistBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );


    trackCartBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "shop.html";

        }
    );


    trackCategoriesBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "shop.html";

        }
    );

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
   PUBLIC HELPER
========================================================= */

window.findShopMaxOrder =
    function (
        orderId
    ) {

        refreshOrders();


        const normalizedId =
            normalizeOrderId(
                orderId
            );


        return (
            orders.find(
                order =>
                    normalizeOrderId(
                        order?.orderId
                    ) ===
                    normalizedId
            ) ||
            null
        );

    };


/* =========================================================
   END
========================================================= */