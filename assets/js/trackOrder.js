"use strict";

/* =========================================================
   SHOPMAX
   TRACK ORDER PAGE
========================================================= */

let orders = [];
let cart = [];
let wishlist = [];


/* =========================================================
   FLOW
========================================================= */

const FLOW = [
    "placed",
    "processing",
    "shipped",
    "out-for-delivery",
    "delivered"
];


/* =========================================================
   STORAGE KEY
========================================================= */

const SELECTED_ORDER_KEY =
    "shopmax-selected-order-id";


/* =========================================================
   DOM HELPER
========================================================= */

const ids =
    name =>
        document.getElementById(
            name
        );


/* =========================================================
   HEADER
========================================================= */

const trackWishlistBtn =
    ids(
        "trackWishlistBtn"
    );

const trackWishlistCount =
    ids(
        "trackWishlistCount"
    );

const trackCartBtn =
    ids(
        "trackCartBtn"
    );

const trackCartCount =
    ids(
        "trackCartCount"
    );

const trackSearch =
    ids(
        "trackSearch"
    );

const trackSearchBtn =
    ids(
        "trackSearchBtn"
    );

const trackCategoriesBtn =
    ids(
        "trackCategoriesBtn"
    );


/* =========================================================
   SEARCH
========================================================= */

const orderTrackingInput =
    ids(
        "orderTrackingInput"
    );

const trackOrderBtn =
    ids(
        "trackOrderBtn"
    );

const trackOrderError =
    ids(
        "trackOrderError"
    );


/* =========================================================
   MULTIPLE ORDERS
========================================================= */

const multipleOrdersResult =
    ids(
        "multipleOrdersResult"
    );

const multipleOrdersTitle =
    ids(
        "multipleOrdersTitle"
    );

const multipleOrdersSubtitle =
    ids(
        "multipleOrdersSubtitle"
    );

const multipleOrdersCount =
    ids(
        "multipleOrdersCount"
    );

const activeOrdersCount =
    ids(
        "activeOrdersCount"
    );

const deliveredOrdersCount =
    ids(
        "deliveredOrdersCount"
    );

const multipleOrdersList =
    ids(
        "multipleOrdersList"
    );


/* =========================================================
   SINGLE ORDER
========================================================= */

const orderResult =
    ids(
        "orderResult"
    );

const trackEmpty =
    ids(
        "trackEmpty"
    );


/* =========================================================
   ORDER HEADER
========================================================= */

const trackedOrderId =
    ids(
        "trackedOrderId"
    );

const trackedOrderStatus =
    ids(
        "trackedOrderStatus"
    );

const trackedOrderDate =
    ids(
        "trackedOrderDate"
    );

const trackedPaymentMethod =
    ids(
        "trackedPaymentMethod"
    );

const trackedOrderTotal =
    ids(
        "trackedOrderTotal"
    );


/* =========================================================
   CUSTOMER
========================================================= */

const trackedCustomerName =
    ids(
        "trackedCustomerName"
    );

const trackedCustomerEmail =
    ids(
        "trackedCustomerEmail"
    );

const trackedCustomerPhone =
    ids(
        "trackedCustomerPhone"
    );


/* =========================================================
   SHIPPING
========================================================= */

const trackedAddress =
    ids(
        "trackedAddress"
    );

const trackedCity =
    ids(
        "trackedCity"
    );

const trackedPostal =
    ids(
        "trackedPostal"
    );

const trackedCountry =
    ids(
        "trackedCountry"
    );


/* =========================================================
   PRODUCTS
========================================================= */

const trackedItems =
    ids(
        "trackedItems"
    );

const trackedItemsCount =
    ids(
        "trackedItemsCount"
    );

const trackedSubtotal =
    ids(
        "trackedSubtotal"
    );

const trackedShipping =
    ids(
        "trackedShipping"
    );

const trackedTotal =
    ids(
        "trackedTotal"
    );


/* =========================================================
   TIMELINE
========================================================= */

const trackingTimeline =
    ids(
        "trackingTimeline"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTracking
);


function initializeTracking() {

    refreshAll();

    updateHeaderCounts();

    setupHeaderSearch();

    setupOrderSearch();

    setupHeaderActions();


    const params =
        new URLSearchParams(
            window.location.search
        );


    /*
       URL orderId is the PRIMARY source.
    */

    let orderId =
        params.get(
            "orderId"
        );


    /*
       Fallback for selected order.
    */

    if (
        !orderId
    ) {

        orderId =
            localStorage.getItem(
                SELECTED_ORDER_KEY
            );

    }


    if (
        orderId
    ) {

        try {

            orderId =
                decodeURIComponent(
                    orderId
                );

        } catch {}


        if (
            orderTrackingInput
        ) {

            orderTrackingInput.value =
                orderId;

        }


        trackOrderById(
            orderId
        );

    }

    else {

        showEmptyState();

    }

}


/* =========================================================
   STORAGE
========================================================= */

function readArray(
    key
) {

    try {

        const value =
            JSON.parse(
                localStorage.getItem(
                    key
                )
            );


        return Array.isArray(
            value
        )
            ? value
            : [];

    } catch {

        return [];

    }

}


function refreshAll() {

    orders =
        readArray(
            "shopmax-orders"
        );


    cart =
        readArray(
            "shopmax-cart"
        );


    wishlist =
        readArray(
            "shopmax-wishlist"
        );

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
                Math.max(
                    1,
                    Number(
                        item?.quantity
                    ) ||
                    1
                ),
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
   HEADER SEARCH
========================================================= */

function setupHeaderSearch() {

    trackSearchBtn?.addEventListener(
        "click",
        searchProducts
    );


    trackSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchProducts();

            }

        }
    );

}


function searchProducts() {

    const query =
        trackSearch
            ?.value
            ?.trim();


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
   ORDER SEARCH
========================================================= */

function setupOrderSearch() {

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
        clearTrackingError
    );

}


/* =========================================================
   HANDLE SEARCH
========================================================= */

function handleTrackOrder() {

    clearTrackingError();

    refreshAll();


    const input =
        orderTrackingInput
            ?.value
            ?.trim();


    if (
        !input
    ) {

        showTrackingError(
            "Please enter an Order ID or phone number."
        );


        showEmptyState();

        return;

    }


    /*
       Exact Order ID first.
    */

    const order =
        findOrderById(
            input
        );


    if (
        order
    ) {

        saveSelectedOrder(
            order.orderId
        );


        updateUrl(
            order.orderId
        );


        renderTrackedOrder(
            order
        );


        return;

    }


    /*
       Phone number.
    */

    const phone =
        normalizePhone(
            input
        );


    if (
        phone.length >=
        7
    ) {

        const matches =
            orders
                .filter(
                    item =>
                        normalizePhone(
                            item
                                ?.customer
                                ?.phone
                        ) ===
                        phone
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            b?.createdAt ||
                            0
                        ).getTime()
                        -
                        new Date(
                            a?.createdAt ||
                            0
                        ).getTime()
                );


        if (
            matches.length
        ) {

            renderMultipleOrders(
                matches,
                phone
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
   TRACK BY ID
========================================================= */

function trackOrderById(
    orderId
) {

    refreshAll();


    const order =
        findOrderById(
            orderId
        );


    if (
        !order
    ) {

        showTrackingError(
            `Order "${orderId}" was not found.`
        );


        showEmptyState();

        return;

    }


    saveSelectedOrder(
        order.orderId
    );


    updateUrl(
        order.orderId
    );


    renderTrackedOrder(
        order
    );

}


/* =========================================================
   FIND ORDER
========================================================= */

function findOrderById(
    orderId
) {

    const normalized =
        normalizeOrderId(
            orderId
        );


    return orders.find(
        order =>
            normalizeOrderId(
                order?.orderId
            ) ===
            normalized
    );

}


/* =========================================================
   SELECTED ORDER
========================================================= */

function saveSelectedOrder(
    orderId
) {

    if (
        !orderId
    ) {

        return;

    }


    localStorage.setItem(
        SELECTED_ORDER_KEY,
        orderId
    );

}


/* =========================================================
   URL
========================================================= */

function updateUrl(
    orderId
) {

    if (
        !orderId
    ) {

        return;

    }


    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "orderId",
        orderId
    );


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* =========================================================
   SINGLE ORDER
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


    showSingleOrderState();

    renderOrderHeader(order);

    renderCustomer(order);

    renderShipping(order);

    renderItems(order);

    renderTimeline(order);

    renderStatusHistory(order);

}


/* =========================================================
   ORDER HEADER
========================================================= */

function renderOrderHeader(
    order
) {

    const status =
        formatOrderStatus(
            order.status
        );


    if (
        trackedOrderId
    ) {

        trackedOrderId.textContent =
            `Order #${order.orderId}`;

    }


    if (
        trackedOrderStatus
    ) {

        trackedOrderStatus.textContent =
            status;


        applyStatusClass(
            trackedOrderStatus,
            status
        );

    }


    if (
        trackedOrderDate
    ) {

        trackedOrderDate.textContent =
            formatDateTime(
                order.createdAt
            );

    }


    if (
        trackedPaymentMethod
    ) {

        trackedPaymentMethod.textContent =
            formatPayment(
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


    if (
        trackedAddress
    ) {

        trackedAddress.textContent =
            customer.address ||
            addressData.formatted ||
            "—";

    }


    if (
        trackedCity
    ) {

        trackedCity.textContent =
            customer.city ||
            addressData.city ||
            addressData.county ||
            "—";

    }


    if (
        trackedPostal
    ) {

        trackedPostal.textContent =
            customer.postal ||
            customer.postalCode ||
            addressData.postcode ||
            "—";

    }


    if (
        trackedCountry
    ) {

        trackedCountry.textContent =
            customer.country ||
            addressData.country ||
            "—";

    }

}


/* =========================================================
   PRODUCTS
========================================================= */

function renderItems(
    order
) {

    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const count =
        getItemCount(
            order
        );


    if (
        trackedItemsCount
    ) {

        trackedItemsCount.textContent =
            `${count} ${
                count ===
                1
                    ? "item"
                    : "items"
            }`;

    }


    if (
        trackedItems
    ) {

        trackedItems.innerHTML =
            items.length
                ? items
                    .map(
                        createTrackedItem
                    )
                    .join("")
                : `

                    <div
                        class="
                            orders-inline-empty
                        "
                    >

                        No products found.

                    </div>

                `;

    }


    const subtotal =
        Number(
            order.subtotal
        ) ||
        0;


    const shipping =
        Number(
            order.shipping
        ) ||
        0;


    const total =
        Number(
            order.total
        ) ||
        subtotal +
        shipping;


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
            shipping ===
            0
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
   PRODUCT ITEM
========================================================= */

function createTrackedItem(
    item
) {

    const quantity =
        Math.max(
            1,
            Number(
                item?.quantity
            ) ||
            1
        );


    const price =
        Number(
            item?.price
        ) ||
        0;


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

                    Qty:
                    ${quantity}

                </span>

            </div>


            <strong
                class="tracked-item-price"
            >

                ${formatMoney(
                    price *
                    quantity
                )}

            </strong>

        </div>

    `;

}


/* =========================================================
   CURRENT SHIPMENT TIMELINE
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


    const effective =
        buildEffectiveTimeline(
            order
        );


    FLOW.forEach(
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


            const dateElement =
                step.querySelector(
                    "small"
                );


            /*
               FUTURE.
            */

            if (
                index >
                currentIndex
            ) {

                if (
                    dateElement
                ) {

                    dateElement.textContent =
                        "Pending";

                }


                return;

            }


            /*
               CURRENT.
            */

            if (
                index ===
                currentIndex
            ) {

                step.classList.add(
                    "current"
                );

            }

            else {

                step.classList.add(
                    "completed"
                );

            }


            const event =
                effective[
                    status
                ];


            if (
                dateElement
            ) {

                dateElement.textContent =
                    event
                        ? formatDateTime(
                            event.changedAt
                        )
                        : "Pending";

            }

        }
    );

}


/* =========================================================
   EFFECTIVE TIMELINE
========================================================= */

function buildEffectiveTimeline(
    order
) {

    const history =
        Array.isArray(
            order.statusHistory
        )
            ? [
                ...order.statusHistory
            ]
            : [];


    history.sort(
        (
            a,
            b
        ) =>
            new Date(
                a?.changedAt ||
                0
            ).getTime()
            -
            new Date(
                b?.changedAt ||
                0
            ).getTime()
    );


    const effective =
        {};


    let effectiveIndex =
        -1;


    for (
        const entry of history
    ) {

        if (
            !entry ||
            !entry.changedAt
        ) {

            continue;

        }


        /*
           Emergency correction.

           Example:
           Delivered → Out for Delivery
        */

        if (
            entry.type ===
            "correction"
        ) {

            const target =
                normalizeStatus(
                    entry.toStatus ||
                    entry.status
                );


            const targetIndex =
                getStatusIndex(
                    target
                );


            if (
                targetIndex < 0
            ) {

                continue;

            }


            FLOW.forEach(
                (
                    status,
                    index
                ) => {

                    if (
                        index >
                        targetIndex
                    ) {

                        delete effective[
                            status
                        ];

                    }

                }
            );


            effectiveIndex =
                targetIndex;


            continue;

        }


        const status =
            normalizeStatus(
                entry.status
            );


        const index =
            getStatusIndex(
                status
            );


        if (
            index < 0
        ) {

            continue;

        }


        if (
            effectiveIndex ===
            -1
        ) {

            if (
                index ===
                0
            ) {

                effective[
                    status
                ] =
                    entry;


                effectiveIndex =
                    0;

            }


            continue;

        }


        /*
           Same status after a correction.
        */

        if (
            index ===
            effectiveIndex
        ) {

            effective[
                status
            ] =
                entry;


            continue;

        }


        /*
           Normal next step.
        */

        if (
            index ===
            effectiveIndex + 1
        ) {

            effective[
                status
            ] =
                entry;


            effectiveIndex =
                index;


            continue;

        }

    }


    /*
       Current order status wins.
    */

    const current =
        normalizeStatus(
            order.status
        );


    const currentIndex =
        getStatusIndex(
            current
        );


    FLOW.forEach(
        (
            status,
            index
        ) => {

            if (
                index >
                currentIndex
            ) {

                delete effective[
                    status
                ];

            }

        }
    );


    /*
       Fallback.
    */

    if (
        !effective.placed &&
        order.createdAt
    ) {

        effective.placed = {

            type:
                "status",

            status:
                "Order Placed",

            changedAt:
                order.createdAt,

            changedBy:
                "System"

        };

    }


    return effective;

}


/* =========================================================
   COMPLETE STATUS HISTORY
   ---------------------------------------------------------
   NEVER filters old history.
========================================================= */

function renderStatusHistory(
    order
) {

    const oldSection =
        document.getElementById(
            "trackStatusHistory"
        );


    if (
        oldSection
    ) {

        oldSection.remove();

    }


    const history =
        Array.isArray(
            order.statusHistory
        )
            ? [
                ...order.statusHistory
            ]
            : [];


    /*
       Newest first.
    */

    history.sort(
        (
            a,
            b
        ) =>
            new Date(
                b?.changedAt ||
                0
            ).getTime()
            -
            new Date(
                a?.changedAt ||
                0
            ).getTime()
    );


    const section =
        document.createElement(
            "section"
        );


    section.id =
        "trackStatusHistory";


    section.className =
        "track-status-history";


    section.innerHTML = `

        <div
            class="track-history-header"
        >

            <div>

                <span
                    class="
                        track-history-eyebrow
                    "
                >

                    ORDER ACTIVITY

                </span>


                <h3>
                    Status History
                </h3>


                <p>

                    Complete record of every
                    status update and correction.

                </p>

            </div>


            <span
                class="
                    track-history-count
                "
            >

                ${history.length}

                ${
                    history.length ===
                    1
                        ? " event"
                        : " events"
                }

            </span>

        </div>


        <div
            class="track-history-list"
        >

            ${
                history.length
                    ? history
                        .map(
                            createHistoryItem
                        )
                        .join("")
                    : `

                        <div
                            class="
                                track-history-empty
                            "
                        >

                            No status history available.

                        </div>

                    `
            }

        </div>

    `;


    insertHistorySection(
        section
    );


    ensureHistoryStyles();

}


/* =========================================================
   HISTORY ITEM
========================================================= */

function createHistoryItem(
    entry
) {

    /*
       CORRECTION
    */

    if (
        entry?.type ===
        "correction"
    ) {

        return `

            <div
                class="
                    track-history-item
                    correction
                "
            >

                <div
                    class="
                        track-history-dot
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-rotate-left
                        "
                    ></i>

                </div>


                <div
                    class="
                        track-history-content
                    "
                >

                    <div
                        class="
                            track-history-top
                        "
                    >

                        <div>

                            <strong>

                                Emergency Correction

                            </strong>


                            <span
                                class="
                                    track-history-change
                                "
                            >

                                ${escapeHTML(
                                    entry.fromStatus ||
                                    "—"
                                )}

                                →

                                ${escapeHTML(
                                    entry.toStatus ||
                                    "—"
                                )}

                            </span>

                        </div>


                        <time>

                            ${escapeHTML(
                                formatDateTime(
                                    entry.changedAt
                                )
                            )}

                        </time>

                    </div>


                    ${
                        entry.reason
                            ? `

                                <div
                                    class="
                                        track-history-reason
                                    "
                                >

                                    <span>
                                        REASON
                                    </span>


                                    <p>

                                        ${escapeHTML(
                                            entry.reason
                                        )}

                                    </p>

                                </div>

                            `
                            : ""
                    }


                    <small>

                        Changed by:
                        ${escapeHTML(
                            formatActor(
                                entry.changedBy
                            )
                        )}

                    </small>

                </div>

            </div>

        `;

    }


    /*
       NORMAL STATUS
    */

    return `

        <div
            class="track-history-item"
        >

            <div
                class="track-history-dot"
            >

                <i
                    class="
                        fa-solid
                        fa-check
                    "
                ></i>

            </div>


            <div
                class="
                    track-history-content
                "
            >

                <div
                    class="
                        track-history-top
                    "
                >

                    <div>

                        <strong>

                            ${escapeHTML(
                                formatOrderStatus(
                                    entry?.status
                                )
                            )}

                        </strong>

                    </div>


                    <time>

                        ${escapeHTML(
                            formatDateTime(
                                entry?.changedAt
                            )
                        )}

                    </time>

                </div>


                <small>

                    Changed by:
                    ${escapeHTML(
                        formatActor(
                            entry?.changedBy
                        )
                    )}

                </small>


                ${
                    entry?.reason
                        ? `

                            <div
                                class="
                                    track-history-reason
                                "
                            >

                                <span>
                                    REASON
                                </span>


                                <p>

                                    ${escapeHTML(
                                        entry.reason
                                    )}

                                </p>

                            </div>

                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   INSERT HISTORY
========================================================= */

function insertHistorySection(
    section
) {

    if (
        trackingTimeline
    ) {

        const parent =
            trackingTimeline.parentElement;


        const shipmentSection =
            parent?.closest(
                "section"
            );


        if (
            shipmentSection &&
            shipmentSection.parentNode
        ) {

            shipmentSection.parentNode.insertBefore(
                section,
                shipmentSection.nextSibling
            );


            return;

        }

    }


    if (
        orderResult
    ) {

        orderResult.appendChild(
            section
        );

        return;

    }


    document.body.appendChild(
        section
    );

}


/* =========================================================
   HISTORY CSS
========================================================= */

function ensureHistoryStyles() {

    if (
        document.getElementById(
            "trackHistoryStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "trackHistoryStyles";


    style.textContent = `

        .track-status-history {

            width: 100%;

            margin-top: 24px;

            padding: 24px;

            box-sizing: border-box;

            background: #ffffff;

            border: 1px solid #dfe6ef;

            border-radius: 14px;

        }


        .track-history-header {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 20px;

            margin-bottom: 24px;

        }


        .track-history-eyebrow {

            display: block;

            margin-bottom: 5px;

            color: #8b98aa;

            font-size: 8px;

            font-weight: 800;

            letter-spacing: 1.1px;

            text-transform: uppercase;

        }


        .track-history-header h3 {

            margin: 0 0 5px;

            color: #17233b;

            font-size: 20px;

            font-weight: 800;

        }


        .track-history-header p {

            margin: 0;

            color: #8b98aa;

            font-size: 10px;

            line-height: 1.5;

        }


        .track-history-count {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-height: 30px;

            padding: 0 12px;

            border-radius: 18px;

            background: #edf4ff;

            color: #2864e8;

            font-size: 9px;

            font-weight: 800;

            white-space: nowrap;

        }


        .track-history-list {

            display: flex;

            flex-direction: column;

        }


        .track-history-item {

            position: relative;

            display: flex;

            gap: 14px;

            padding-bottom: 20px;

        }


        .track-history-item:not(:last-child)::after {

            content: "";

            position: absolute;

            top: 26px;

            left: 11px;

            width: 1px;

            height: calc(100% - 5px);

            background: #e2e8f0;

        }


        .track-history-dot {

            position: relative;

            z-index: 2;

            width: 24px;

            height: 24px;

            flex: 0 0 24px;

            display: grid;

            place-items: center;

            border-radius: 50%;

            background: #eaf8ef;

            color: #16a34a;

            font-size: 9px;

        }


        .track-history-item.correction
        .track-history-dot {

            background: #fff4df;

            color: #bd7200;

        }


        .track-history-content {

            flex: 1;

            min-width: 0;

        }


        .track-history-top {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 16px;

        }


        .track-history-top strong {

            display: block;

            margin-bottom: 4px;

            color: #17233b;

            font-size: 11px;

            font-weight: 800;

        }


        .track-history-change {

            display: block;

            color: #2864e8;

            font-size: 9px;

            font-weight: 700;

        }


        .track-history-top time {

            color: #7e8b9d;

            font-size: 9px;

            white-space: nowrap;

        }


        .track-history-content > small {

            display: block;

            margin-top: 7px;

            color: #99a5b4;

            font-size: 8px;

        }


        .track-history-reason {

            margin-top: 10px;

            padding: 10px 12px;

            background: #fffaf2;

            border: 1px solid #efdfc5;

            border-radius: 8px;

        }


        .track-history-reason span {

            display: block;

            margin-bottom: 3px;

            color: #9d6a24;

            font-size: 7px;

            font-weight: 800;

            letter-spacing: .6px;

            text-transform: uppercase;

        }


        .track-history-reason p {

            margin: 0;

            color: #7d6548;

            font-size: 9px;

            line-height: 1.55;

            word-break: break-word;

        }


        .track-history-empty {

            padding: 30px;

            color: #94a3b8;

            text-align: center;

            font-size: 10px;

        }


        @media (max-width: 700px) {

            .track-status-history {

                padding: 18px;

            }


            .track-history-header {

                flex-direction: column;

            }


            .track-history-top {

                flex-direction: column;

                gap: 5px;

            }


            .track-history-top time {

                white-space: normal;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   MULTIPLE ORDERS
========================================================= */

function renderMultipleOrders(
    list,
    phone
) {

    showMultipleOrdersState();


    const total =
        list.length;


    const delivered =
        list.filter(
            order =>
                normalizeStatus(
                    order.status
                ) ===
                "delivered"
        ).length;


    const active =
        total -
        delivered;


    if (
        multipleOrdersTitle
    ) {

        multipleOrdersTitle.textContent =
            `${
                list[0]
                    ?.customer
                    ?.name ||
                "Customer"
            }'s Orders`;

    }


    if (
        multipleOrdersSubtitle
    ) {

        multipleOrdersSubtitle.textContent =
            `Orders associated with ${phone}.`;

    }


    if (
        multipleOrdersCount
    ) {

        multipleOrdersCount.textContent =
            total;

    }


    if (
        activeOrdersCount
    ) {

        activeOrdersCount.textContent =
            active;

    }


    if (
        deliveredOrdersCount
    ) {

        deliveredOrdersCount.textContent =
            delivered;

    }


    if (
        multipleOrdersList
    ) {

        multipleOrdersList.innerHTML =
            list
                .map(
                    createMultipleOrderCard
                )
                .join("");


        bindMultipleTrackButtons();

    }

}


/* =========================================================
   MULTIPLE ORDER CARD
========================================================= */

function createMultipleOrderCard(
    order
) {

    const status =
        formatOrderStatus(
            order.status
        );


    const count =
        getItemCount(
            order
        );


    return `

        <article
            class="
                multiple-order-card
            "
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
                            order.orderId
                        )}

                    </span>


                    <span
                        class="
                            multiple-order-date
                        "
                    >

                        ${escapeHTML(
                            formatDateTime(
                                order.createdAt
                            )
                        )}

                    </span>

                </div>


                <span
                    class="
                        multiple-order-status
                        ${getStatusClass(
                            status
                        )}
                    "
                >

                    ${escapeHTML(
                        status
                    )}

                </span>

            </div>


            <div
                class="
                    multiple-order-card-body
                "
            >

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
                                order
                                    ?.customer
                                    ?.name
                            )
                        )}

                    </div>


                    <strong>

                        ${escapeHTML(
                            order
                                ?.customer
                                ?.name ||
                            "Customer"
                        )}

                    </strong>

                </div>


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
                            ${count}
                        </strong>

                    </div>


                    <div>

                        <small>
                            TOTAL
                        </small>


                        <strong>

                            ${formatMoney(
                                order.total
                            )}

                        </strong>

                    </div>


                    <button
                        type="button"
                        class="
                            multiple-order-track-btn
                        "
                        data-multiple-track-order="${escapeHTML(
                            order.orderId
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

        </article>

    `;

}


/* =========================================================
   MULTIPLE TRACK BUTTON
========================================================= */

function bindMultipleTrackButtons() {

    document
        .querySelectorAll(
            "[data-multiple-track-order]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const orderId =
                            button.getAttribute(
                                "data-multiple-track-order"
                            );


                        saveSelectedOrder(
                            orderId
                        );


                        window.location.href =
                            `trackOrder.html?orderId=${encodeURIComponent(
                                orderId
                            )}`;

                    }
                );

            }
        );

}


/* =========================================================
   STATE UI
========================================================= */

function showEmptyState() {

    orderResult?.classList.remove(
        "show"
    );


    multipleOrdersResult?.classList.remove(
        "show"
    );


    document
        .getElementById(
            "trackStatusHistory"
        )
        ?.remove();


    if (
        trackEmpty
    ) {

        trackEmpty.style.display =
            "";

    }

}


function showSingleOrderState() {

    if (
        trackEmpty
    ) {

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


function showMultipleOrdersState() {

    if (
        trackEmpty
    ) {

        trackEmpty.style.display =
            "none";

    }


    orderResult?.classList.remove(
        "show"
    );


    document
        .getElementById(
            "trackStatusHistory"
        )
        ?.remove();


    multipleOrdersResult?.classList.add(
        "show"
    );

}


/* =========================================================
   ERROR
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
   HELPERS
========================================================= */

function normalizeStatus(
    value
) {

    const status =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /[-_]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            );


    if (
        status ===
        "processing"
    ) {

        return "processing";

    }


    if (
        status ===
        "shipped"
    ) {

        return "shipped";

    }


    if (
        status ===
        "out for delivery"
    ) {

        return "out-for-delivery";

    }


    if (
        status ===
        "delivered"
    ) {

        return "delivered";

    }


    return "placed";

}


function getStatusIndex(
    value
) {

    return FLOW.indexOf(
        normalizeStatus(
            value
        )
    );

}


function formatOrderStatus(
    value
) {

    switch (
        normalizeStatus(
            value
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


function getStatusClass(
    value
) {

    const status =
        normalizeStatus(
            value
        );


    return status ===
        "placed"
        ? ""
        : status;

}


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


function normalizePhone(
    value
) {

    return String(
        value ||
        ""
    )
        .replace(
            /\D/g,
            ""
        );

}


function getItemCount(
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
        ) =>
            total +
            Math.max(
                1,
                Number(
                    item?.quantity
                ) ||
                1
            ),
        0
    );

}


function getInitials(
    name
) {

    const parts =
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
        !parts.length
    ) {

        return "C";

    }


    if (
        parts.length ===
        1
    ) {

        return parts[0][0]
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    )
        .toUpperCase();

}


function formatMoney(
    value
) {

    return `$${(
        Number(
            value
        ) ||
        0
    ).toFixed(2)}`;

}


function formatDateTime(
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


function formatPayment(
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
            "card" ||
        method ===
            "card payment"
    ) {

        return "Card Payment";

    }


    return "Cash on Delivery";

}


function formatActor(
    value
) {

    const actor =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        actor ===
        "admin"
    ) {

        return "Admin";

    }


    if (
        actor ===
        "rider"
    ) {

        return "Rider";

    }


    if (
        actor ===
        "system"
    ) {

        return "System";

    }


    return "Admin";

}


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
   PAGE RESTORE
========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        refreshAll();

        updateHeaderCounts();


        const params =
            new URLSearchParams(
                window.location.search
            );


        let orderId =
            params.get(
                "orderId"
            );


        if (
            !orderId
        ) {

            orderId =
                localStorage.getItem(
                    SELECTED_ORDER_KEY
                );

        }


        if (
            orderId
        ) {

            try {

                orderId =
                    decodeURIComponent(
                        orderId
                    );

            } catch {}


            trackOrderById(
                orderId
            );

        }

    }
);


/* =========================================================
   LIVE STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            "shopmax-orders"
        ) {

            return;

        }


        refreshAll();

        updateHeaderCounts();


        const params =
            new URLSearchParams(
                window.location.search
            );


        let orderId =
            params.get(
                "orderId"
            );


        if (
            !orderId
        ) {

            orderId =
                localStorage.getItem(
                    SELECTED_ORDER_KEY
                );

        }


        if (
            orderId
        ) {

            try {

                orderId =
                    decodeURIComponent(
                        orderId
                    );

            } catch {}


            const order =
                findOrderById(
                    orderId
                );


            if (
                order
            ) {

                renderTrackedOrder(
                    order
                );

            }

        }

    }
);