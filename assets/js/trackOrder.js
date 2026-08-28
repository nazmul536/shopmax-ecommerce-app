/* =========================================================
   SHOPMAX
   TRACK ORDER PAGE JAVASCRIPT

   Features:
   - Read orders from LocalStorage
   - Search by Order ID
   - Search by Phone Number
   - Show multiple orders for same phone
   - Show active / delivered counts
   - Track specific order
   - Auto-load Order ID from URL
   - Show customer information
   - Show shipping information
   - Show payment method
   - Show products
   - Show totals
   - Show tracking timeline
========================================================= */


/* =========================================================
   STATE
========================================================= */

let orders =
    JSON.parse(
        localStorage.getItem("shopmax-orders")
    ) || [];


let cart =
    JSON.parse(
        localStorage.getItem("shopmax-cart")
    ) || [];


let wishlist =
    JSON.parse(
        localStorage.getItem("shopmax-wishlist")
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
    document.getElementById("trackWishlistBtn");

const trackWishlistCount =
    document.getElementById("trackWishlistCount");

const trackCartBtn =
    document.getElementById("trackCartBtn");

const trackCartCount =
    document.getElementById("trackCartCount");

const trackSearch =
    document.getElementById("trackSearch");

const trackSearchBtn =
    document.getElementById("trackSearchBtn");

const trackCategoriesBtn =
    document.getElementById("trackCategoriesBtn");


/* =========================================================
   DOM - ORDER SEARCH
========================================================= */

const orderTrackingInput =
    document.getElementById("orderTrackingInput");

const trackOrderBtn =
    document.getElementById("trackOrderBtn");

const trackOrderError =
    document.getElementById("trackOrderError");

const trackSearchHint =
    document.getElementById("trackSearchHint");


/* =========================================================
   DOM - MULTIPLE ORDERS
========================================================= */

const multipleOrdersResult =
    document.getElementById("multipleOrdersResult");

const multipleOrdersTitle =
    document.getElementById("multipleOrdersTitle");

const multipleOrdersSubtitle =
    document.getElementById("multipleOrdersSubtitle");

const multipleOrdersCount =
    document.getElementById("multipleOrdersCount");

const activeOrdersCount =
    document.getElementById("activeOrdersCount");

const deliveredOrdersCount =
    document.getElementById("deliveredOrdersCount");

const multipleOrdersList =
    document.getElementById("multipleOrdersList");


/* =========================================================
   DOM - SINGLE RESULT
========================================================= */

const orderResult =
    document.getElementById("orderResult");

const trackEmpty =
    document.getElementById("trackEmpty");


/* =========================================================
   DOM - ORDER HEADER
========================================================= */

const trackedOrderId =
    document.getElementById("trackedOrderId");

const trackedOrderStatus =
    document.getElementById("trackedOrderStatus");

const trackedOrderDate =
    document.getElementById("trackedOrderDate");

const trackedPaymentMethod =
    document.getElementById("trackedPaymentMethod");

const trackedOrderTotal =
    document.getElementById("trackedOrderTotal");


/* =========================================================
   DOM - TIMELINE
========================================================= */

const trackingTimeline =
    document.getElementById("trackingTimeline");


/* =========================================================
   DOM - CUSTOMER
========================================================= */

const trackedCustomerName =
    document.getElementById("trackedCustomerName");

const trackedCustomerEmail =
    document.getElementById("trackedCustomerEmail");

const trackedCustomerPhone =
    document.getElementById("trackedCustomerPhone");


/* =========================================================
   DOM - SHIPPING
========================================================= */

const trackedAddress =
    document.getElementById("trackedAddress");

const trackedCity =
    document.getElementById("trackedCity");

const trackedPostal =
    document.getElementById("trackedPostal");

const trackedCountry =
    document.getElementById("trackedCountry");


/* =========================================================
   DOM - ITEMS
========================================================= */

const trackedItems =
    document.getElementById("trackedItems");

const trackedItemsCount =
    document.getElementById("trackedItemsCount");

const trackedSubtotal =
    document.getElementById("trackedSubtotal");

const trackedShipping =
    document.getElementById("trackedShipping");

const trackedTotal =
    document.getElementById("trackedTotal");


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
   INITIALIZE
========================================================= */

function initializeTracking() {

    refreshOrders();

    refreshCart();

    refreshWishlist();

    updateHeaderCounts();

    setupSearch();

    setupOrderTracking();

    setupHeaderActions();


    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get("orderId");


    if (orderId) {

        const decodedOrderId =
            decodeURIComponent(orderId);


        if (orderTrackingInput) {

            orderTrackingInput.value =
                decodedOrderId;

        }


        handleTrackOrder();

    }

    else {

        if (orderTrackingInput) {

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
   HEADER COUNTS
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


    if (trackCartCount) {

        trackCartCount.textContent =
            cartCount;

    }


    if (trackWishlistCount) {

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
                event.key === "Enter"
            ) {

                event.preventDefault();

                handleProductSearch();

            }

        }
    );

}


/* =========================================================
   PRODUCT SEARCH HANDLER
========================================================= */

function handleProductSearch() {

    const query =
        trackSearch
            ?.value
            .trim();


    if (!query) {

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
   ORDER SEARCH SETUP
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
                event.key === "Enter"
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
   MAIN TRACK HANDLER
========================================================= */

function handleTrackOrder() {

    clearTrackingError();


    const enteredValue =
        orderTrackingInput
            ?.value
            .trim();


    if (!enteredValue) {

        showTrackingError(
            "Please enter an Order ID or phone number."
        );


        showEmptyState();

        return;

    }


    refreshOrders();


    if (
        orders.length === 0
    ) {

        showTrackingError(
            "No saved orders were found on this device."
        );


        showEmptyState();

        return;

    }


    /* -----------------------------------------------------
       FIRST: ORDER ID
    ----------------------------------------------------- */

    const normalizedOrderId =
        normalizeOrderId(
            enteredValue
        );


    const orderById =
        orders.find(
            order =>
                normalizeOrderId(
                    order?.orderId
                ) ===
                normalizedOrderId
        );


    if (orderById) {

        renderTrackedOrder(
            orderById
        );

        return;

    }


    /* -----------------------------------------------------
       SECOND: PHONE
    ----------------------------------------------------- */

    const normalizedPhone =
        normalizePhone(
            enteredValue
        );


    if (
        normalizedPhone.length >= 7
    ) {

        const phoneOrders =
            orders
                .filter(
                    order => {

                        const savedPhone =
                            normalizePhone(
                                order
                                    ?.customer
                                    ?.phone
                            );


                        return (
                            savedPhone &&
                            savedPhone ===
                            normalizedPhone
                        );

                    }
                )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const dateA =
                            new Date(
                                a?.createdAt ||
                                0
                            ).getTime();


                        const dateB =
                            new Date(
                                b?.createdAt ||
                                0
                            ).getTime();


                        return (
                            dateB -
                            dateA
                        );

                    }
                );


        if (
            phoneOrders.length > 0
        ) {

            renderMultipleOrders(
                phoneOrders,
                normalizedPhone
            );

            return;

        }

    }


    showTrackingError(
        "We couldn't find an order with that Order ID or phone number."
    );


    showEmptyState();

}


/* =========================================================
   NORMALIZE ORDER ID
========================================================= */

function normalizeOrderId(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toUpperCase()
        .replace(
            /\s+/g,
            ""
        );

}


/* =========================================================
   NORMALIZE PHONE
========================================================= */

function normalizePhone(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /\D/g,
            ""
        );

}


/* =========================================================
   SHOW EMPTY
========================================================= */

function showEmptyState() {

    orderResult?.classList.remove(
        "show"
    );


    multipleOrdersResult?.classList.remove(
        "show"
    );


    if (trackEmpty) {

        trackEmpty.style.display =
            "";

    }

}


/* =========================================================
   SHOW SINGLE ORDER
========================================================= */

function showResultState() {

    if (trackEmpty) {

        trackEmpty.style.display =
            "none";

    }


    multipleOrdersResult?.classList.remove(
        "show"
    );


    orderResult?.classList.add(
        "show"
    );

}


/* =========================================================
   SHOW MULTIPLE ORDERS
========================================================= */

function showMultipleOrdersState() {

    orderResult?.classList.remove(
        "show"
    );


    if (trackEmpty) {

        trackEmpty.style.display =
            "none";

    }


    multipleOrdersResult?.classList.add(
        "show"
    );

}


/* =========================================================
   RENDER MULTIPLE ORDERS
========================================================= */

function renderMultipleOrders(
    matchedOrders,
    phone
) {

    if (
        !multipleOrdersResult ||
        !multipleOrdersList
    ) {

        return;

    }


    showMultipleOrdersState();


    const total =
        matchedOrders.length;


    const delivered =
        matchedOrders.filter(
            order =>
                normalizeStatus(
                    order?.status
                ) ===
                "delivered"
        ).length;


    const active =
        total -
        delivered;


    const firstOrder =
        matchedOrders[0];


    const customerName =
        firstOrder
            ?.customer
            ?.name ||
        "Customer";


    if (multipleOrdersTitle) {

        multipleOrdersTitle.textContent =
            `${customerName}'s Orders`;

    }


    if (multipleOrdersSubtitle) {

        multipleOrdersSubtitle.textContent =
            `Orders associated with ${formatPhoneDisplay(
                phone
            )}.`;

    }


    if (multipleOrdersCount) {

        multipleOrdersCount.textContent =
            total;

    }


    if (activeOrdersCount) {

        activeOrdersCount.textContent =
            active;

    }


    if (deliveredOrdersCount) {

        deliveredOrdersCount.textContent =
            delivered;

    }


    multipleOrdersList.innerHTML =
        matchedOrders
            .map(
                createMultipleOrderCard
            )
            .join("");


    bindMultipleOrderTrackButtons();

}


/* =========================================================
   CREATE MULTIPLE ORDER CARD
========================================================= */

function createMultipleOrderCard(
    order
) {

    const orderId =
        order?.orderId ||
        "—";


    const customer =
        order?.customer ||
        {};


    const name =
        customer.name ||
        "Customer";


    const date =
        formatOrderDate(
            order?.createdAt
        );


    const total =
        formatMoney(
            order?.total
        );


    const status =
        order?.status ||
        "Order Placed";


    const statusClass =
        getStatusClass(
            status
        );


    const itemCount =
        getOrderItemCount(
            order
        );


    const itemLabel =
        itemCount === 1
            ? "item"
            : "items";


    return `

        <article
            class="multiple-order-card"
        >

            <div
                class="
                    multiple-order-card-header
                "
            >

                <div>

                    <span
                        class="
                            multiple-order-id
                        "
                    >
                        ${escapeHTML(
                            orderId
                        )}
                    </span>


                    <span
                        class="
                            multiple-order-date
                        "
                    >
                        ${escapeHTML(
                            date
                        )}
                    </span>

                </div>


                <span
                    class="
                        multiple-order-status
                        ${statusClass}
                    "
                >
                    ${escapeHTML(
                        formatOrderStatus(
                            status
                        )
                    )}
                </span>

            </div>


            <div
                class="
                    multiple-order-card-body
                "
            >

                <!-- CUSTOMER -->

                <div
                    class="
                        multiple-order-customer
                    "
                >

                    <div
                        class="
                            multiple-order-avatar
                        "
                    >

                        ${escapeHTML(
                            getInitials(
                                name
                            )
                        )}

                    </div>


                    <strong>

                        ${escapeHTML(
                            name
                        )}

                    </strong>

                </div>



                <!-- ORDER DATA -->

                <div
                    class="
                        multiple-order-info
                    "
                >

                    <div>

                        <small>
                            ITEMS
                        </small>

                        <strong>

                            ${itemCount}
                            ${itemLabel}

                        </strong>

                    </div>


                    <div>

                        <small>
                            TOTAL
                        </small>

                        <strong>

                            ${total}

                        </strong>

                    </div>


                    <!-- TRACK BUTTON -->

                    <div
                        class="
                            multiple-order-track-wrap
                        "
                    >

                        <button
                            type="button"
                            class="
                                multiple-order-track-btn
                            "
                            data-multiple-track-order="${escapeHTML(
                                orderId
                            )}"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-location-dot
                                "
                            ></i>

                            Track Order

                        </button>

                    </div>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   BIND MULTIPLE ORDER TRACK BUTTONS
========================================================= */

function bindMultipleOrderTrackButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-multiple-track-order]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const orderId =
                        button.getAttribute(
                            "data-multiple-track-order"
                        );


                    openSpecificOrder(
                        orderId
                    );

                }
            );

        }
    );

}


/* =========================================================
   OPEN SPECIFIC ORDER
========================================================= */

function openSpecificOrder(
    orderId
) {

    if (
        !orderId
    ) {

        return;

    }


    window.location.href =
        `trackOrder.html?orderId=${encodeURIComponent(
            orderId
        )}`;

}


/* =========================================================
   RENDER SINGLE ORDER
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

    if (trackedOrderId) {

        trackedOrderId.textContent =
            `Order #${
                order?.orderId ||
                "—"
            }`;

    }


    if (trackedOrderStatus) {

        trackedOrderStatus.textContent =
            formatOrderStatus(
                order?.status
            );


        applyStatusClass(
            trackedOrderStatus,
            order?.status
        );

    }


    if (trackedOrderDate) {

        trackedOrderDate.textContent =
            formatOrderDate(
                order?.createdAt
            );

    }


    if (trackedPaymentMethod) {

        trackedPaymentMethod.textContent =
            formatPaymentMethod(
                order?.paymentMethod
            );

    }


    if (trackedOrderTotal) {

        trackedOrderTotal.textContent =
            formatMoney(
                order?.total
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
        order?.customer ||
        {};


    if (trackedCustomerName) {

        trackedCustomerName.textContent =
            customer.name ||
            "—";

    }


    if (trackedCustomerEmail) {

        trackedCustomerEmail.textContent =
            customer.email ||
            "—";

    }


    if (trackedCustomerPhone) {

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
        order?.customer ||
        {};


    const addressData =
        order?.addressData ||
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


    if (trackedAddress) {

        trackedAddress.textContent =
            address;

    }


    if (trackedCity) {

        trackedCity.textContent =
            city;

    }


    if (trackedPostal) {

        trackedPostal.textContent =
            postal;

    }


    if (trackedCountry) {

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

    if (!trackedItems) {

        return;

    }


    const items =
        Array.isArray(
            order?.items
        )
            ? order.items
            : [];


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


    if (trackedItemsCount) {

        trackedItemsCount.textContent =
            itemCount === 1
                ? "1 item"
                : `${itemCount} items`;

    }


    if (
        items.length === 0
    ) {

        trackedItems.innerHTML = `

            <div
                class="orders-inline-empty"
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


    const subtotal =
        Number(
            order?.subtotal
        ) || 0;


    const shipping =
        Number(
            order?.shipping
        ) || 0;


    const total =
        Number(
            order?.total
        ) ||
        (
            subtotal +
            shipping
        );


    if (trackedSubtotal) {

        trackedSubtotal.textContent =
            formatMoney(
                subtotal
            );

    }


    if (trackedShipping) {

        trackedShipping.textContent =
            shipping === 0
                ? "Free"
                : formatMoney(
                    shipping
                );

    }


    if (trackedTotal) {

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
                class="
                    tracked-item-image
                "
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
                class="
                    tracked-item-info
                "
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
                class="
                    tracked-item-price
                "
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
            order?.status
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


            if (!step) {

                return;

            }


            step.classList.remove(
                "completed",
                "current"
            );


            if (
                index <
                currentIndex
            ) {

                step.classList.add(
                    "completed"
                );

            }


            if (
                index ===
                currentIndex
            ) {

                step.classList.add(
                    "current"
                );

            }


            const dateElement =
                step.querySelector(
                    "small"
                );


            if (dateElement) {

                if (
                    index <=
                    currentIndex
                ) {

                    dateElement.textContent =
                        formatOrderDate(
                            order?.createdAt
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
   STATUS NORMALIZE
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
        value === "processing"
    ) {

        return "processing";

    }


    if (
        value === "shipped"
    ) {

        return "shipped";

    }


    if (
        value === "out for delivery" ||
        value === "out-for-delivery"
    ) {

        return "out-for-delivery";

    }


    if (
        value === "delivered"
    ) {

        return "delivered";

    }


    return "placed";

}


/* =========================================================
   STATUS INDEX
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
   STATUS CLASS
========================================================= */

function applyStatusClass(
    element,
    status
) {

    if (!element) {

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
   STATUS TEXT
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
   STATUS CLASS FOR MULTIPLE CARD
========================================================= */

function getStatusClass(
    status
) {

    switch (
        normalizeStatus(
            status
        )
    ) {

        case "processing":

            return "processing";


        case "shipped":

            return "shipped";


        case "out-for-delivery":

            return "out-for-delivery";


        case "delivered":

            return "delivered";


        default:

            return "";

    }

}


/* =========================================================
   PAYMENT
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
        method === "card" ||
        method === "card payment"
    ) {

        return "Card Payment";

    }


    if (
        method === "cash" ||
        method === "cash on delivery" ||
        method === "cod"
    ) {

        return "Cash on Delivery";

    }


    return "Cash on Delivery";

}


/* =========================================================
   DATE
========================================================= */

function formatOrderDate(
    value
) {

    if (!value) {

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

            month: "short",

            day: "numeric",

            year: "numeric",

            hour: "numeric",

            minute: "2-digit"

        }
    ).format(
        date
    );

}


/* =========================================================
   MONEY
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
   ITEM COUNT
========================================================= */

function getOrderItemCount(
    order
) {

    const items =
        Array.isArray(
            order?.items
        )
            ? order.items
            : [];


    return items.reduce(
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

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    const words =
        String(
            name ||
            "Customer"
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        words.length === 0
    ) {

        return "C";

    }


    if (
        words.length === 1
    ) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0]
            .charAt(0) +
        words[
            words.length - 1
        ]
            .charAt(0)
    )
        .toUpperCase();

}


/* =========================================================
   PHONE DISPLAY
========================================================= */

function formatPhoneDisplay(
    phone
) {

    const value =
        String(
            phone ||
            ""
        ).trim();


    return value ||
        "this phone number";

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
   END SHOPMAX TRACK ORDER
========================================================= */