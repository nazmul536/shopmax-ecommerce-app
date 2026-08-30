"use strict";

/* =========================================================
   SHOPMAX - ORDERS PAGE
   =========================================================

   FEATURES
   ---------------------------------------------------------
   ✅ Order list
   ✅ Search
   ✅ Status filter
   ✅ Normal status progression
   ✅ Admin emergency correction
   ✅ Complete status history
   ✅ Order details modal
   ✅ Edit order
   ✅ Archive/delete order
   ✅ Track order
   ✅ LocalStorage persistence
   ✅ Multiple customer orders remain independent
   ✅ No WebSocket
========================================================= */


/* =========================================================
   STATE
========================================================= */

let orders =
    readArray("shopmax-orders");

let cart =
    readArray("shopmax-cart");

let wishlist =
    readArray("shopmax-wishlist");


/* =========================================================
   CONSTANTS
========================================================= */

const ORDER_STATUSES = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered"
];


const ROLE_KEY =
    "shopmax-user-role";


const DEFAULT_ROLE =
    "admin";


let emergencyOrderId =
    "";


/* =========================================================
   DOM - HEADER
========================================================= */

const ordersWishlistBtn =
    document.getElementById(
        "ordersWishlistBtn"
    );


const ordersWishlistCount =
    document.getElementById(
        "ordersWishlistCount"
    );


const ordersCartBtn =
    document.getElementById(
        "ordersCartBtn"
    );


const ordersCartCount =
    document.getElementById(
        "ordersCartCount"
    );


const ordersSearch =
    document.getElementById(
        "ordersSearch"
    );


const ordersSearchBtn =
    document.getElementById(
        "ordersSearchBtn"
    );


const ordersCategoriesBtn =
    document.getElementById(
        "ordersCategoriesBtn"
    );


/* =========================================================
   DOM - SUMMARY
========================================================= */

const totalOrdersCount =
    document.getElementById(
        "totalOrdersCount"
    );


const totalOrdersSpent =
    document.getElementById(
        "totalOrdersSpent"
    );


const latestOrderDate =
    document.getElementById(
        "latestOrderDate"
    );


/* =========================================================
   DOM - ORDERS
========================================================= */

const ordersTableBody =
    document.getElementById(
        "ordersTableBody"
    );


const ordersMobileList =
    document.getElementById(
        "ordersMobileList"
    );


const ordersEmpty =
    document.getElementById(
        "ordersEmpty"
    );


const orderTableSearch =
    document.getElementById(
        "orderTableSearch"
    );


const orderStatusFilter =
    document.getElementById(
        "orderStatusFilter"
    );


const refreshOrdersBtn =
    document.getElementById(
        "refreshOrdersBtn"
    );


/* =========================================================
   DOM - ORDER DETAILS MODAL
========================================================= */

const orderDetailsModal =
    document.getElementById(
        "orderDetailsModal"
    );


const orderDetailsOverlay =
    document.getElementById(
        "orderDetailsOverlay"
    );


const orderDetailsClose =
    document.getElementById(
        "orderDetailsClose"
    );


const orderDetailsTitle =
    document.getElementById(
        "orderDetailsTitle"
    );


const orderDetailsBody =
    document.getElementById(
        "orderDetailsBody"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeOrdersPage
);


function initializeOrdersPage() {

    refreshState();

    updateHeaderCounts();

    updateSummary();

    renderOrders();

    setupSearch();

    setupFilters();

    setupRefresh();

    setupHeaderActions();

    setupDetailsModal();

}


/* =========================================================
   LOCAL STORAGE HELPERS
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


    } catch (error) {

        console.error(
            `Failed to read ${key}`,
            error
        );


        return [];

    }

}


function saveOrders() {

    localStorage.setItem(
        "shopmax-orders",
        JSON.stringify(
            orders
        )
    );

}


/* =========================================================
   REFRESH STATE
========================================================= */

function refreshState() {

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


    normalizeOrders();

}


/* =========================================================
   NORMALIZE ORDERS
========================================================= */

function normalizeOrders() {

    let changed =
        false;


    orders =
        orders.filter(
            order =>
                order &&
                typeof order ===
                    "object"
        );


    orders.forEach(
        order => {

            if (
                !order.createdAt
            ) {

                order.createdAt =
                    new Date()
                        .toISOString();

                changed =
                    true;

            }


            order.status =
                formatStatus(
                    order.status
                );


            if (
                !Array.isArray(
                    order.statusHistory
                )
            ) {

                order.statusHistory =
                    [];

                changed =
                    true;

            }


            if (
                !Array.isArray(
                    order.statusAuditLog
                )
            ) {

                order.statusAuditLog =
                    [];

                changed =
                    true;

            }


            ensureHistory(
                order
            );


            /*
               Keep only valid history records.
               Existing valid history is NEVER deleted.
            */

            order.statusHistory =
                order.statusHistory.filter(
                    entry => {

                        if (
                            !entry ||
                            typeof entry !==
                                "object"
                        ) {

                            return false;

                        }


                        if (
                            entry.type ===
                            "correction"
                        ) {

                            return Boolean(
                                entry.changedAt
                            );

                        }


                        return (
                            Boolean(
                                entry.status
                            ) &&
                            Boolean(
                                entry.changedAt
                            )
                        );

                    }
                );


            order.statusHistory.sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        a.changedAt ||
                        0
                    ).getTime()
                    -
                    new Date(
                        b.changedAt ||
                        0
                    ).getTime()
            );

        }
    );


    if (
        changed
    ) {

        saveOrders();

    }

}


/* =========================================================
   ENSURE INITIAL HISTORY
========================================================= */

function ensureHistory(
    order
) {

    if (
        !Array.isArray(
            order.statusHistory
        )
    ) {

        order.statusHistory =
            [];

    }


    if (
        !Array.isArray(
            order.statusAuditLog
        )
    ) {

        order.statusAuditLog =
            [];

    }


    const hasPlaced =
        order.statusHistory.some(
            entry =>
                entry &&
                entry.type !==
                    "correction" &&
                normalizeStatus(
                    entry.status
                ) ===
                    "placed"
        );


    if (
        !hasPlaced
    ) {

        order.statusHistory.unshift({

            type:
                "status",

            status:
                "Order Placed",

            changedAt:
                order.createdAt,

            changedBy:
                "System",

            changeType:
                "initial",

            reason:
                ""

        });

    }

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
                        ) ||
                        1
                    )
                );

            },
            0
        );


    if (
        ordersCartCount
    ) {

        ordersCartCount.textContent =
            cartCount;

    }


    if (
        ordersWishlistCount
    ) {

        ordersWishlistCount.textContent =
            wishlist.length;

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    if (
        totalOrdersCount
    ) {

        totalOrdersCount.textContent =
            orders.length;

    }


    const totalSpent =
        orders.reduce(
            (
                total,
                order
            ) => {

                return (
                    total +
                    (
                        Number(
                            order?.total
                        ) ||
                        0
                    )
                );

            },
            0
        );


    if (
        totalOrdersSpent
    ) {

        totalOrdersSpent.textContent =
            formatMoney(
                totalSpent
            );

    }


    const latest =
        [...orders]
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
            )[0];


    if (
        latestOrderDate
    ) {

        latestOrderDate.textContent =
            latest
                ? formatShortDate(
                    latest.createdAt
                )
                : "—";

    }

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredOrders() {

    const query =
        String(
            orderTableSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const selectedStatus =
        orderStatusFilter?.value ||
        "all";


    return [...orders]
        .filter(
            order => {

                if (
                    query
                ) {

                    const orderId =
                        String(
                            order?.orderId ||
                            ""
                        )
                            .toLowerCase();


                    const customerName =
                        String(
                            order?.customer?.name ||
                            ""
                        )
                            .toLowerCase();


                    const customerEmail =
                        String(
                            order?.customer?.email ||
                            ""
                        )
                            .toLowerCase();


                    const customerPhone =
                        String(
                            order?.customer?.phone ||
                            ""
                        )
                            .toLowerCase();


                    const matched =
                        orderId.includes(
                            query
                        ) ||
                        customerName.includes(
                            query
                        ) ||
                        customerEmail.includes(
                            query
                        ) ||
                        customerPhone.includes(
                            query
                        );


                    if (
                        !matched
                    ) {

                        return false;

                    }

                }


                if (
                    selectedStatus !==
                    "all"
                ) {

                    if (
                        normalizeStatus(
                            order?.status
                        ) !==
                        normalizeStatus(
                            selectedStatus
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
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

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders() {

    const list =
        getFilteredOrders();


    if (
        list.length ===
        0
    ) {

        renderEmptyState();

        return;

    }


    hideEmptyState();


    if (
        ordersTableBody
    ) {

        ordersTableBody.innerHTML =
            list
                .map(
                    createTableRow
                )
                .join("");

    }


    if (
        ordersMobileList
    ) {

        ordersMobileList.innerHTML =
            list
                .map(
                    createMobileCard
                )
                .join("");

    }


    bindOrderEvents();

}


/* =========================================================
   STATUS OPTIONS
========================================================= */

function createStatusOptions(
    currentStatus
) {

    const currentIndex =
        getStatusIndex(
            currentStatus
        );


    return ORDER_STATUSES
        .map(
            (
                status,
                index
            ) => {

                const isCurrent =
                    index ===
                    currentIndex;


                const isNext =
                    index ===
                    currentIndex + 1;


                const enabled =
                    isCurrent ||
                    isNext;


                return `

                    <option
                        value="${escapeHTML(
                            status
                        )}"
                        ${
                            isCurrent
                                ? "selected"
                                : ""
                        }
                        ${
                            enabled
                                ? ""
                                : "disabled"
                        }
                    >

                        ${escapeHTML(
                            status
                        )}

                    </option>

                `;

            }
        )
        .join("");

}


/* =========================================================
   TABLE ROW
========================================================= */

function createTableRow(
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
        "Guest Customer";


    const email =
        customer.email ||
        "—";


    const status =
        formatStatus(
            order?.status
        );


    const itemCount =
        getOrderItemCount(
            order
        );


    const showEmergency =
        getCurrentRole() ===
            "admin" &&
        getStatusIndex(
            status
        ) > 0;


    return `

        <tr>

            <td
                class="order-id-cell"
            >

                ${escapeHTML(
                    orderId
                )}

            </td>


            <td>

                <div
                    class="order-customer"
                >

                    <div
                        class="
                            order-customer-avatar
                        "
                    >

                        ${escapeHTML(
                            getInitials(
                                name
                            )
                        )}

                    </div>


                    <div
                        class="
                            order-customer-info
                        "
                    >

                        <strong>

                            ${escapeHTML(
                                name
                            )}

                        </strong>


                        <span>

                            ${escapeHTML(
                                email
                            )}

                        </span>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHTML(
                    formatShortDate(
                        order?.createdAt
                    )
                )}

            </td>


            <td>

                ${itemCount}

                ${
                    itemCount ===
                    1
                        ? "item"
                        : "items"
                }

            </td>


            <td>

                ${formatMoney(
                    order?.total
                )}

            </td>


            <td>

                <div
                    class="
                        order-status-control
                    "
                >

                    <select
                        class="
                            order-status-select
                            ${getStatusClass(
                                status
                            )}
                        "
                        data-status-order="${escapeHTML(
                            orderId
                        )}"
                    >

                        ${createStatusOptions(
                            status
                        )}

                    </select>


                    ${
                        showEmergency
                            ? `

                                <button
                                    type="button"
                                    class="
                                        order-emergency-btn
                                    "
                                    data-emergency-order="${escapeHTML(
                                        orderId
                                    )}"
                                    title="Emergency correction"
                                    aria-label="Emergency correction"
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-shield-halved
                                        "
                                    ></i>

                                </button>

                            `
                            : ""
                    }

                </div>

            </td>


            <td>

                <div
                    class="
                        order-actions
                    "
                >

                    <button
                        type="button"
                        class="order-action-btn"
                        data-view-order="${escapeHTML(
                            orderId
                        )}"
                    >

                        <i
                            class="
                                fa-regular
                                fa-eye
                            "
                        ></i>

                        View

                    </button>


                    <button
                        type="button"
                        class="
                            order-action-btn
                            primary
                        "
                        data-track-order="${escapeHTML(
                            orderId
                        )}"
                    >

                        <i
                            class="
                                fa-solid
                                fa-location-dot
                            "
                        ></i>

                        Track

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   MOBILE CARD
========================================================= */

function createMobileCard(
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
        "Guest Customer";


    const email =
        customer.email ||
        "—";


    const status =
        formatStatus(
            order?.status
        );


    const itemCount =
        getOrderItemCount(
            order
        );


    const showEmergency =
        getCurrentRole() ===
            "admin" &&
        getStatusIndex(
            status
        ) > 0;


    return `

        <article
            class="mobile-order-card"
        >

            <div
                class="
                    mobile-order-top
                "
            >

                <div>

                    <div
                        class="
                            mobile-order-id
                        "
                    >

                        ${escapeHTML(
                            orderId
                        )}

                    </div>


                    <div
                        class="
                            mobile-order-date
                        "
                    >

                        ${escapeHTML(
                            formatShortDate(
                                order?.createdAt
                            )
                        )}

                    </div>

                </div>


                <span
                    class="
                        order-status
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
                    mobile-order-customer
                "
            >

                <div
                    class="
                        order-customer-avatar
                    "
                >

                    ${escapeHTML(
                        getInitials(
                            name
                        )
                    )}

                </div>


                <div>

                    <strong>

                        ${escapeHTML(
                            name
                        )}

                    </strong>


                    <span>

                        ${escapeHTML(
                            email
                        )}

                    </span>

                </div>

            </div>


            <div
                class="
                    mobile-order-meta
                "
            >

                <div>

                    <small>
                        ITEMS
                    </small>


                    <strong>

                        ${itemCount}

                    </strong>

                </div>


                <div>

                    <small>
                        TOTAL
                    </small>


                    <strong>

                        ${formatMoney(
                            order?.total
                        )}

                    </strong>

                </div>

            </div>


            <div
                class="
                    mobile-order-status-control
                "
            >

                <small>
                    ORDER STATUS
                </small>


                <div
                    class="
                        mobile-status-row
                    "
                >

                    <select
                        class="
                            order-status-select
                            ${getStatusClass(
                                status
                            )}
                        "
                        data-status-order="${escapeHTML(
                            orderId
                        )}"
                    >

                        ${createStatusOptions(
                            status
                        )}

                    </select>


                    ${
                        showEmergency
                            ? `

                                <button
                                    type="button"
                                    class="
                                        order-emergency-btn
                                    "
                                    data-emergency-order="${escapeHTML(
                                        orderId
                                    )}"
                                    title="Emergency correction"
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-shield-halved
                                        "
                                    ></i>

                                </button>

                            `
                            : ""
                    }

                </div>

            </div>


            <div
                class="
                    mobile-order-actions
                "
            >

                <button
                    type="button"
                    class="
                        order-action-btn
                    "
                    data-view-order="${escapeHTML(
                        orderId
                    )}"
                >

                    <i
                        class="
                            fa-regular
                            fa-eye
                        "
                    ></i>

                    View Details

                </button>


                <button
                    type="button"
                    class="
                        order-action-btn
                        primary
                    "
                    data-track-order="${escapeHTML(
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

        </article>

    `;

}


/* =========================================================
   BIND ALL ORDER EVENTS
========================================================= */

function bindOrderEvents() {

    /*
       Status dropdown
    */

    document
        .querySelectorAll(
            "[data-status-order]"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    handleNormalStatusChange
                );

            }
        );


    /*
       Emergency buttons
    */

    document
        .querySelectorAll(
            "[data-emergency-order]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEmergencyStatusModal(
                            button.getAttribute(
                                "data-emergency-order"
                            )
                        );

                    }
                );

            }
        );


    /*
       View buttons
    */

    document
        .querySelectorAll(
            "[data-view-order]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openOrderDetails(
                            button.getAttribute(
                                "data-view-order"
                            )
                        );

                    }
                );

            }
        );


    /*
       Track buttons
    */

    document
        .querySelectorAll(
            "[data-track-order]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const orderId =
                            button.getAttribute(
                                "data-track-order"
                            );


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
                );

            }
        );

}


/* =========================================================
   NORMAL STATUS CHANGE
========================================================= */

function handleNormalStatusChange(
    event
) {

    const select =
        event.currentTarget;


    const orderId =
        select.getAttribute(
            "data-status-order"
        );


    const requestedStatus =
        select.value;


    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (!order) {

        renderOrders();

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    const currentStatus =
        formatStatus(
            order.status
        );


    const currentIndex =
        getStatusIndex(
            currentStatus
        );


    const targetIndex =
        getStatusIndex(
            requestedStatus
        );


    /*
       Forward exactly one step.
    */

    if (
        targetIndex !==
        currentIndex + 1
    ) {

        renderOrders();

        showToast(
            "Previous and skipped statuses are locked.",
            true
        );

        return;

    }


    /*
       Rider can only perform
       delivery-side status updates.
    */

    if (
        getCurrentRole() ===
        "rider"
    ) {

        const allowed =
            (
                currentIndex === 2 &&
                targetIndex === 3
            ) ||
            (
                currentIndex === 3 &&
                targetIndex === 4
            );


        if (
            !allowed
        ) {

            renderOrders();

            showToast(
                "Rider can update delivery statuses only.",
                true
            );

            return;

        }

    }


    const now =
        new Date().toISOString();


    const nextStatus =
        formatStatus(
            requestedStatus
        );


    ensureHistory(
        order
    );


    /*
       STATUS HISTORY
    */

    order.statusHistory.push({

        type:
            "status",

        status:
            nextStatus,

        changedAt:
            now,

        changedBy:
            getCurrentRole(),

        changeType:
            "normal",

        reason:
            ""

    });


    /*
       AUDIT LOG
    */

    order.statusAuditLog.push({

        type:
            "status-change",

        from:
            currentStatus,

        to:
            nextStatus,

        changedAt:
            now,

        changedBy:
            getCurrentRole(),

        changeType:
            "normal",

        reason:
            ""

    });


    /*
       CURRENT STATUS
    */

    order.status =
        nextStatus;


    order.updatedAt =
        now;


    saveOrders();


    refreshState();

    updateHeaderCounts();

    updateSummary();

    renderOrders();


    showToast(
        `${order.orderId} → ${nextStatus}`
    );

}


/* =========================================================
   EMERGENCY MODAL
========================================================= */

function ensureEmergencyStatusModal() {

    let modal =
        document.getElementById(
            "emergencyStatusModal"
        );


    if (
        modal
    ) {

        return modal;

    }


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "emergencyStatusModal";


    modal.className =
        "emergency-status-modal";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.innerHTML = `

        <div
            class="
                emergency-status-overlay
            "
            data-emergency-close
        ></div>


        <div
            class="
                emergency-status-dialog
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergencyStatusTitle"
        >

            <div
                class="
                    emergency-status-header
                "
            >

                <div>

                    <span>
                        EMERGENCY CORRECTION
                    </span>


                    <h3
                        id="emergencyStatusTitle"
                    >
                        Correct Order Status
                    </h3>

                </div>


                <button
                    type="button"
                    class="
                        emergency-status-close
                    "
                    data-emergency-close
                    aria-label="Close"
                >

                    <i
                        class="
                            fa-solid
                            fa-xmark
                        "
                    ></i>

                </button>

            </div>


            <div
                class="
                    emergency-status-warning
                "
            >

                <i
                    class="
                        fa-solid
                        fa-triangle-exclamation
                    "
                ></i>


                <div>

                    <strong>
                        This is a correction action.
                    </strong>


                    <p>

                        Previous status history will not
                        be deleted. The correction will be
                        recorded in the audit history.

                    </p>

                </div>

            </div>


            <div
                class="
                    emergency-status-form
                "
            >

                <div
                    class="
                        emergency-status-current
                    "
                >

                    <small>
                        CURRENT STATUS
                    </small>


                    <strong
                        id="emergencyCurrentStatus"
                    >
                        —
                    </strong>

                </div>


                <label
                    for="emergencyNewStatus"
                >
                    CHANGE TO
                </label>


                <select
                    id="emergencyNewStatus"
                    class="
                        emergency-status-select
                    "
                ></select>


                <label
                    for="emergencyStatusReason"
                >
                    REASON
                </label>


                <textarea
                    id="emergencyStatusReason"
                    class="
                        emergency-status-reason
                    "
                    rows="4"
                    maxlength="240"
                    placeholder="Example: Incorrect status update"
                ></textarea>

            </div>


            <div
                class="
                    emergency-status-footer
                "
            >

                <button
                    type="button"
                    class="
                        emergency-cancel-btn
                    "
                    data-emergency-close
                >

                    Cancel

                </button>


                <button
                    type="button"
                    class="
                        emergency-confirm-btn
                    "
                    id="emergencyConfirmBtn"
                >

                    <i
                        class="
                            fa-solid
                            fa-shield-halved
                        "
                    ></i>

                    Confirm Correction

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelectorAll(
            "[data-emergency-close]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeEmergencyStatusModal
                );

            }
        );


    modal
        .querySelector(
            "#emergencyConfirmBtn"
        )
        ?.addEventListener(
            "click",
            confirmEmergencyStatusChange
        );


    return modal;

}


/* =========================================================
   OPEN EMERGENCY MODAL
========================================================= */

function openEmergencyStatusModal(
    orderId
) {

    if (
        getCurrentRole() !==
        "admin"
    ) {

        showToast(
            "Emergency correction is available to admin only.",
            true
        );

        return;

    }


    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (!order) {

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    const currentIndex =
        getStatusIndex(
            order.status
        );


    if (
        currentIndex <=
        0
    ) {

        showToast(
            "There is no previous status to correct.",
            true
        );

        return;

    }


    emergencyOrderId =
        order.orderId;


    const modal =
        ensureEmergencyStatusModal();


    const currentStatus =
        modal.querySelector(
            "#emergencyCurrentStatus"
        );


    const statusSelect =
        modal.querySelector(
            "#emergencyNewStatus"
        );


    const reasonField =
        modal.querySelector(
            "#emergencyStatusReason"
        );


    if (
        !currentStatus ||
        !statusSelect ||
        !reasonField
    ) {

        console.error(
            "Emergency modal elements are missing."
        );

        return;

    }


    currentStatus.textContent =
        formatStatus(
            order.status
        );


    /*
       Only previous statuses.
    */

    statusSelect.innerHTML =
        ORDER_STATUSES
            .map(
                (
                    status,
                    index
                ) => {

                    if (
                        index >=
                        currentIndex
                    ) {

                        return "";

                    }


                    return `

                        <option
                            value="${escapeHTML(
                                status
                            )}"
                        >

                            ${escapeHTML(
                                status
                            )}

                        </option>

                    `;

                }
            )
            .join("");


    /*
       Immediate previous status selected.
    */

    statusSelect.value =
        ORDER_STATUSES[
            currentIndex -
            1
        ];


    reasonField.value =
        "";


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    statusSelect.focus();

}


/* =========================================================
   CONFIRM EMERGENCY
========================================================= */

function confirmEmergencyStatusChange() {

    if (
        !emergencyOrderId
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "emergencyStatusModal"
        );


    if (!modal) {

        return;

    }


    const statusSelect =
        modal.querySelector(
            "#emergencyNewStatus"
        );


    const reasonField =
        modal.querySelector(
            "#emergencyStatusReason"
        );


    if (
        !statusSelect ||
        !reasonField
    ) {

        console.error(
            "Emergency form elements are missing."
        );

        return;

    }


    const newStatus =
        statusSelect.value.trim();


    const reason =
        reasonField.value.trim();


    if (!newStatus) {

        showToast(
            "Please select a new status.",
            true
        );

        return;

    }


    if (!reason) {

        showToast(
            "Please enter the correction reason.",
            true
        );

        reasonField.focus();

        return;

    }


    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    emergencyOrderId
                )
        );


    if (!order) {

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    const currentStatus =
        formatStatus(
            order.status
        );


    const currentIndex =
        getStatusIndex(
            currentStatus
        );


    const targetStatus =
        formatStatus(
            newStatus
        );


    const targetIndex =
        getStatusIndex(
            targetStatus
        );


    /*
       Emergency correction must move backward.
    */

    if (
        targetIndex <
            0 ||
        targetIndex >=
            currentIndex
    ) {

        showToast(
            "Emergency correction must select an earlier status.",
            true
        );

        return;

    }


    const now =
        new Date().toISOString();


    ensureHistory(
        order
    );


    /*
       CORRECTION EVENT
    */

    order.statusHistory.push({

        type:
            "correction",

        fromStatus:
            currentStatus,

        toStatus:
            targetStatus,

        status:
            targetStatus,

        changedAt:
            now,

        changedBy:
            "Admin",

        changeType:
            "emergency-correction",

        reason:
            reason

    });


    /*
       NEW EFFECTIVE STATUS
    */

    order.statusHistory.push({

        type:
            "status",

        status:
            targetStatus,

        changedAt:
            now,

        changedBy:
            "Admin",

        changeType:
            "emergency-correction",

        reason:
            reason

    });


    /*
       AUDIT
    */

    order.statusAuditLog.push({

        type:
            "status-correction",

        from:
            currentStatus,

        to:
            targetStatus,

        changedAt:
            now,

        changedBy:
            "Admin",

        changeType:
            "emergency-correction",

        reason:
            reason

    });


    /*
       CURRENT STATUS
    */

    order.status =
        targetStatus;


    order.updatedAt =
        now;


    /*
       Keep chronological history.
    */

    order.statusHistory.sort(
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


    saveOrders();


    closeEmergencyStatusModal();


    refreshState();

    updateHeaderCounts();

    updateSummary();

    renderOrders();


    showToast(
        `${order.orderId} corrected to ${targetStatus}`
    );

}


/* =========================================================
   CLOSE EMERGENCY
========================================================= */

function closeEmergencyStatusModal() {

    const modal =
        document.getElementById(
            "emergencyStatusModal"
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "show"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    emergencyOrderId =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   ORDER DETAILS MODAL
========================================================= */

function openOrderDetails(
    orderId
) {

    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (
        !order ||
        !orderDetailsModal ||
        !orderDetailsBody
    ) {

        return;

    }


    ensureHistory(
        order
    );


    const customer =
        order.customer ||
        {};


    const addressData =
        order.addressData ||
        {};


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


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


    const status =
        formatStatus(
            order.status
        );


    const address =
        customer.address ||
        addressData.formatted ||
        "—";


    const city =
        customer.city ||
        addressData.city ||
        addressData.county ||
        "—";


    const postal =
        customer.postal ||
        customer.postalCode ||
        addressData.postcode ||
        "—";


    const country =
        customer.country ||
        addressData.country ||
        "—";


    /*
       Complete saved history.
       Newest first.
    */

    const history =
        [...order.statusHistory]
            .filter(
                entry =>
                    entry &&
                    entry.changedAt &&
                    (
                        entry.status ||
                        entry.type ===
                            "correction"
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        b.changedAt
                    ).getTime()
                    -
                    new Date(
                        a.changedAt
                    ).getTime()
            );


    if (
        orderDetailsTitle
    ) {

        orderDetailsTitle.textContent =
            `Order #${order.orderId}`;

    }


    orderDetailsBody.innerHTML = `

        <!-- =================================================
             ORDER SUMMARY
        ================================================== -->

        <section
            class="
                order-detail-hero
            "
        >

            <div
                class="
                    order-detail-hero-main
                "
            >

                <div
                    class="
                        order-detail-hero-status
                    "
                >

                    <span
                        class="
                            order-status
                            ${getStatusClass(
                                status
                            )}
                        "
                    >

                        ${escapeHTML(
                            status
                        )}

                    </span>


                    <span
                        class="
                            order-detail-last-updated
                        "
                    >

                        Last updated:
                        ${escapeHTML(
                            formatDateTime(
                                order.updatedAt ||
                                order.createdAt
                            )
                        )}

                    </span>

                </div>


                <p>

                    Complete overview of this order,
                    including customer, delivery,
                    products and status activity.

                </p>

            </div>


            <div
                class="
                    order-detail-hero-badge
                "
            >

                <i
                    class="
                        fa-solid
                        fa-receipt
                    "
                ></i>


                <div>

                    <span>
                        ORDER DATE
                    </span>


                    <strong>

                        ${escapeHTML(
                            formatDateTime(
                                order.createdAt
                            )
                        )}

                    </strong>

                </div>

            </div>

        </section>


        <!-- =================================================
             ADMIN ACTIONS
        ================================================== -->

        ${
            getCurrentRole() ===
            "admin"

                ? `

                    <div
                        class="
                            order-detail-admin-actions
                        "
                    >

                        <button
                            type="button"
                            class="
                                order-detail-admin-btn
                                edit
                            "
                            data-edit-order="${escapeHTML(
                                order.orderId
                            )}"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-pen
                                "
                            ></i>

                            Edit Order

                        </button>


                        <button
                            type="button"
                            class="
                                order-detail-admin-btn
                                delete
                            "
                            data-delete-order="${escapeHTML(
                                order.orderId
                            )}"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-trash
                                "
                            ></i>

                            Archive Order

                        </button>

                    </div>

                `

                : ""
        }


        <!-- =================================================
             QUICK STATS
        ================================================== -->

        <section
            class="
                order-detail-stat-grid
            "
        >

            <div
                class="
                    order-detail-stat-card
                "
            >

                <div
                    class="
                        order-detail-stat-icon
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-box
                        "
                    ></i>

                </div>


                <div>

                    <span>
                        ITEMS
                    </span>


                    <strong>

                        ${getOrderItemCount(
                            order
                        )}

                    </strong>

                </div>

            </div>


            <div
                class="
                    order-detail-stat-card
                "
            >

                <div
                    class="
                        order-detail-stat-icon
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-credit-card
                        "
                    ></i>

                </div>


                <div>

                    <span>
                        PAYMENT
                    </span>


                    <strong>

                        ${escapeHTML(
                            formatPayment(
                                order.paymentMethod
                            )
                        )}

                    </strong>

                </div>

            </div>


            <div
                class="
                    order-detail-stat-card
                    total
                "
            >

                <div
                    class="
                        order-detail-stat-icon
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-dollar-sign
                        "
                    ></i>

                </div>


                <div>

                    <span>
                        ORDER TOTAL
                    </span>


                    <strong>

                        ${formatMoney(
                            total
                        )}

                    </strong>

                </div>

            </div>

        </section>


        <!-- =================================================
             CUSTOMER + DELIVERY
        ================================================== -->

        <div
            class="
                order-detail-grid
            "
        >

            <section
                class="
                    order-detail-section
                "
            >

                <div
                    class="
                        order-detail-section-title
                    "
                >

                    <i
                        class="
                            fa-regular
                            fa-user
                        "
                    ></i>


                    <div>

                        <span>
                            CUSTOMER
                        </span>


                        <h3>
                            Customer Information
                        </h3>

                    </div>

                </div>


                <div
                    class="
                        order-detail-info-list
                    "
                >

                    <div>

                        <small>
                            NAME
                        </small>


                        <strong>

                            ${escapeHTML(
                                customer.name ||
                                "—"
                            )}

                        </strong>

                    </div>


                    <div>

                        <small>
                            EMAIL
                        </small>


                        <strong>

                            ${escapeHTML(
                                customer.email ||
                                "—"
                            )}

                        </strong>

                    </div>


                    <div>

                        <small>
                            PHONE
                        </small>


                        <strong>

                            ${escapeHTML(
                                customer.phone ||
                                "—"
                            )}

                        </strong>

                    </div>

                </div>

            </section>


            <section
                class="
                    order-detail-section
                "
            >

                <div
                    class="
                        order-detail-section-title
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-location-dot
                        "
                    ></i>


                    <div>

                        <span>
                            DELIVERY
                        </span>


                        <h3>
                            Shipping Address
                        </h3>

                    </div>

                </div>


                <div
                    class="
                        order-detail-info-list
                    "
                >

                    <div>

                        <small>
                            ADDRESS
                        </small>


                        <strong>

                            ${escapeHTML(
                                address
                            )}

                        </strong>

                    </div>


                    <div>

                        <small>
                            CITY / DISTRICT
                        </small>


                        <strong>

                            ${escapeHTML(
                                city
                            )}

                        </strong>

                    </div>


                    <div>

                        <small>
                            POSTAL CODE
                        </small>


                        <strong>

                            ${escapeHTML(
                                postal
                            )}

                        </strong>

                    </div>


                    <div>

                        <small>
                            COUNTRY
                        </small>


                        <strong>

                            ${escapeHTML(
                                country
                            )}

                        </strong>

                    </div>

                </div>

            </section>

        </div>


        <!-- =================================================
             STATUS HISTORY
        ================================================== -->

        <section
            class="
                order-detail-section
                order-detail-history-section
            "
        >

            <div
                class="
                    order-detail-section-title
                "
            >

                <i
                    class="
                        fa-solid
                        fa-clock-rotate-left
                    "
                ></i>


                <div>

                    <span>
                        ORDER ACTIVITY
                    </span>


                    <h3>
                        Status History
                    </h3>

                </div>


                <span
                    class="
                        order-detail-history-count
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
                class="
                    order-detail-history
                "
            >

                ${
                    history.length
                        ? history
                            .map(
                                createOrderHistoryEntry
                            )
                            .join("")
                        : `

                            <div
                                class="
                                    order-detail-history-empty
                                "
                            >

                                No status history available.

                            </div>

                        `
                }

            </div>

        </section>


        <!-- =================================================
             PRODUCTS
        ================================================== -->

        <section
            class="
                order-detail-section
                products-section
            "
        >

            <div
                class="
                    order-detail-section-title
                "
            >

                <i
                    class="
                        fa-solid
                        fa-box-open
                    "
                ></i>


                <div>

                    <span>
                        ORDER ITEMS
                    </span>


                    <h3>
                        Products
                    </h3>

                </div>

            </div>


            <div
                class="
                    order-detail-products
                "
            >

                ${
                    items.length
                        ? items
                            .map(
                                item => {

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
                                            class="
                                                order-detail-product
                                            "
                                        >

                                            <div
                                                class="
                                                    order-detail-product-image
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
                                                    order-detail-product-info
                                                "
                                            >

                                                <strong>

                                                    ${escapeHTML(
                                                        item?.title ||
                                                        "Product"
                                                    )}

                                                </strong>


                                                <span>

                                                    Qty:
                                                    ${quantity}

                                                </span>

                                            </div>


                                            <strong
                                                class="
                                                    order-detail-product-price
                                                "
                                            >

                                                ${formatMoney(
                                                    price *
                                                    quantity
                                                )}

                                            </strong>

                                        </div>

                                    `;

                                }
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

                        `
                }

            </div>

        </section>


        <!-- =================================================
             PAYMENT + TOTALS
        ================================================== -->

        <div
            class="
                order-detail-bottom-grid
            "
        >

            <div
                class="
                    order-detail-payment
                "
            >

                <div>

                    <small>
                        PAYMENT METHOD
                    </small>


                    <strong>

                        ${escapeHTML(
                            formatPayment(
                                order.paymentMethod
                            )
                        )}

                    </strong>

                </div>


                <div
                    class="
                        order-detail-payment-icon
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-wallet
                        "
                    ></i>

                </div>

            </div>


            <div
                class="
                    order-detail-totals
                "
            >

                <div>

                    <span>
                        Subtotal
                    </span>


                    <strong>

                        ${formatMoney(
                            subtotal
                        )}

                    </strong>

                </div>


                <div>

                    <span>
                        Shipping
                    </span>


                    <strong>

                        ${
                            shipping ===
                            0
                                ? "Free"
                                : formatMoney(
                                    shipping
                                )
                        }

                    </strong>

                </div>


                <div
                    class="
                        grand-total
                    "
                >

                    <span>
                        Total
                    </span>


                    <strong>

                        ${formatMoney(
                            total
                        )}

                    </strong>

                </div>

            </div>

        </div>

    `;


    orderDetailsModal.classList.add(
        "show"
    );


    orderDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    orderDetailsBody.scrollTop =
        0;


    /*
       Bind Edit + Archive buttons
       AFTER dynamic HTML is created.
    */

    bindOrderDetailsAdminActions();

}


/* =========================================================
   DETAILS - HISTORY ENTRY
========================================================= */

function createOrderHistoryEntry(
    entry
) {

    /*
       EMERGENCY CORRECTION
    */

    if (
        entry?.type ===
        "correction"
    ) {

        return `

            <div
                class="
                    order-detail-history-item
                    correction
                "
            >

                <div
                    class="
                        order-detail-history-icon
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
                        order-detail-history-content
                    "
                >

                    <div
                        class="
                            order-detail-history-top
                        "
                    >

                        <div>

                            <strong>
                                Emergency Correction
                            </strong>


                            <span>

                                ${escapeHTML(
                                    entry.fromStatus ||
                                    "—"
                                )}

                                →

                                ${escapeHTML(
                                    entry.toStatus ||
                                    entry.status ||
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
                                        order-detail-history-reason
                                    "
                                >

                                    <small>
                                        REASON
                                    </small>


                                    <p>

                                        ${escapeHTML(
                                            entry.reason
                                        )}

                                    </p>

                                </div>

                            `
                            : ""
                    }


                    <small
                        class="
                            order-detail-history-by
                        "
                    >

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
            class="
                order-detail-history-item
            "
        >

            <div
                class="
                    order-detail-history-icon
                "
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
                    order-detail-history-content
                "
            >

                <div
                    class="
                        order-detail-history-top
                    "
                >

                    <div>

                        <strong>

                            ${escapeHTML(
                                formatStatus(
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


                <small
                    class="
                        order-detail-history-by
                    "
                >

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
                                    order-detail-history-reason
                                "
                            >

                                <small>
                                    REASON
                                </small>


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
   DETAILS ADMIN ACTIONS
========================================================= */

function bindOrderDetailsAdminActions() {

    const editButton =
        orderDetailsBody?.querySelector(
            "[data-edit-order]"
        );


    const deleteButton =
        orderDetailsBody?.querySelector(
            "[data-delete-order]"
        );


    editButton?.addEventListener(
        "click",
        () => {

            openEditOrderModal(
                editButton.getAttribute(
                    "data-edit-order"
                )
            );

        }
    );


    deleteButton?.addEventListener(
        "click",
        () => {

            openDeleteOrderModal(
                deleteButton.getAttribute(
                    "data-delete-order"
                )
            );

        }
    );

}


/* =========================================================
   EDIT ORDER MODAL
========================================================= */

function openEditOrderModal(
    orderId
) {

    if (
        getCurrentRole() !==
        "admin"
    ) {

        showToast(
            "Only admin can edit orders.",
            true
        );

        return;

    }


    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (!order) {

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    document
        .getElementById(
            "shopmaxEditOrderModal"
        )
        ?.remove();


    const customer =
        order.customer ||
        {};


    const addressData =
        order.addressData ||
        {};


    const name =
        customer.name ||
        "";


    const email =
        customer.email ||
        "";


    const phone =
        customer.phone ||
        "";


    const address =
        customer.address ||
        addressData.formatted ||
        "";


    const city =
        customer.city ||
        addressData.city ||
        addressData.county ||
        "";


    const postal =
        customer.postal ||
        customer.postalCode ||
        addressData.postcode ||
        "";


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "shopmaxEditOrderModal";


    modal.className =
        "order-edit-modal";


    modal.innerHTML = `

        <div
            class="
                order-edit-overlay
            "
            data-edit-close
        ></div>


        <div
            class="
                order-edit-dialog
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="editOrderTitle"
        >

            <div
                class="
                    order-edit-header
                "
            >

                <div>

                    <span>
                        ORDER MANAGEMENT
                    </span>


                    <h3
                        id="editOrderTitle"
                    >
                        Edit Order
                    </h3>


                    <p>

                        #${escapeHTML(
                            order.orderId
                        )}

                    </p>

                </div>


                <button
                    type="button"
                    class="
                        order-edit-close
                    "
                    data-edit-close
                    aria-label="Close"
                >

                    <i
                        class="
                            fa-solid
                            fa-xmark
                        "
                    ></i>

                </button>

            </div>


            <form
                id="shopmaxEditOrderForm"
            >

                <div
                    class="
                        order-edit-grid
                    "
                >

                    <div
                        class="
                            order-edit-field
                        "
                    >

                        <label>
                            CUSTOMER NAME
                        </label>


                        <input
                            type="text"
                            name="customerName"
                            value="${escapeHTML(
                                name
                            )}"
                            required
                            maxlength="100"
                        >

                    </div>


                    <div
                        class="
                            order-edit-field
                        "
                    >

                        <label>
                            PHONE
                        </label>


                        <input
                            type="text"
                            name="phone"
                            value="${escapeHTML(
                                phone
                            )}"
                            maxlength="30"
                        >

                    </div>


                    <div
                        class="
                            order-edit-field full
                        "
                    >

                        <label>
                            EMAIL
                        </label>


                        <input
                            type="email"
                            name="email"
                            value="${escapeHTML(
                                email
                            )}"
                            maxlength="150"
                        >

                    </div>


                    <div
                        class="
                            order-edit-field full
                        "
                    >

                        <label>
                            ADDRESS
                        </label>


                        <input
                            type="text"
                            name="address"
                            value="${escapeHTML(
                                address
                            )}"
                            maxlength="200"
                        >

                    </div>


                    <div
                        class="
                            order-edit-field
                        "
                    >

                        <label>
                            CITY / DISTRICT
                        </label>


                        <input
                            type="text"
                            name="city"
                            value="${escapeHTML(
                                city
                            )}"
                            maxlength="80"
                        >

                    </div>


                    <div
                        class="
                            order-edit-field
                        "
                    >

                        <label>
                            POSTAL CODE
                        </label>


                        <input
                            type="text"
                            name="postal"
                            value="${escapeHTML(
                                postal
                            )}"
                            maxlength="20"
                        >

                    </div>

                </div>


                <div
                    class="
                        order-edit-footer
                    "
                >

                    <button
                        type="button"
                        class="
                            order-edit-cancel
                        "
                        data-edit-close
                    >

                        Cancel

                    </button>


                    <button
                        type="submit"
                        class="
                            order-edit-save
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-check
                            "
                        ></i>

                        Save Changes

                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelectorAll(
            "[data-edit-close]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeEditOrderModal
                );

            }
        );


    modal
        .querySelector(
            "#shopmaxEditOrderForm"
        )
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                saveEditedOrder(
                    orderId,
                    event.currentTarget
                );

            }
        );


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";


    modal
        .querySelector(
            'input[name="customerName"]'
        )
        ?.focus();

}


/* =========================================================
   SAVE EDITED ORDER
========================================================= */

function saveEditedOrder(
    orderId,
    form
) {

    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (!order) {

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    const formData =
        new FormData(
            form
        );


    const newName =
        String(
            formData.get(
                "customerName"
            ) ||
            ""
        ).trim();


    const newPhone =
        String(
            formData.get(
                "phone"
            ) ||
            ""
        ).trim();


    const newEmail =
        String(
            formData.get(
                "email"
            ) ||
            ""
        ).trim();


    const newAddress =
        String(
            formData.get(
                "address"
            ) ||
            ""
        ).trim();


    const newCity =
        String(
            formData.get(
                "city"
            ) ||
            ""
        ).trim();


    const newPostal =
        String(
            formData.get(
                "postal"
            ) ||
            ""
        ).trim();


    if (!newName) {

        showToast(
            "Customer name is required.",
            true
        );

        return;

    }


    /*
       Ensure objects exist.
    */

    if (
        !order.customer ||
        typeof order.customer !==
            "object"
    ) {

        order.customer = {};

    }


    if (
        !order.addressData ||
        typeof order.addressData !==
            "object"
    ) {

        order.addressData = {};

    }


    /*
       OLD VALUES
    */

    const oldCustomer = {

        name:
            order.customer.name ||
            "",

        email:
            order.customer.email ||
            "",

        phone:
            order.customer.phone ||
            "",

        address:
            order.customer.address ||
            order.addressData.formatted ||
            "",

        city:
            order.customer.city ||
            order.addressData.city ||
            order.addressData.county ||
            "",

        postal:
            order.customer.postal ||
            order.customer.postalCode ||
            order.addressData.postcode ||
            ""

    };


    /*
       UPDATE CUSTOMER
    */

    order.customer.name =
        newName;


    order.customer.email =
        newEmail;


    order.customer.phone =
        newPhone;


    order.customer.address =
        newAddress;


    order.customer.city =
        newCity;


    order.customer.postal =
        newPostal;


    /*
       Keep addressData synchronized.
    */

    order.addressData.formatted =
        newAddress;


    order.addressData.city =
        newCity;


    order.addressData.postcode =
        newPostal;


    const now =
        new Date().toISOString();


    order.updatedAt =
        now;


    /*
       Separate audit event.
       This is NOT a shipment status event.
    */

    if (
        !Array.isArray(
            order.statusAuditLog
        )
    ) {

        order.statusAuditLog =
            [];

    }


    const changes = {};


    if (
        oldCustomer.name !==
        newName
    ) {

        changes.name = {

            from:
                oldCustomer.name,

            to:
                newName

        };

    }


    if (
        oldCustomer.email !==
        newEmail
    ) {

        changes.email = {

            from:
                oldCustomer.email,

            to:
                newEmail

        };

    }


    if (
        oldCustomer.phone !==
        newPhone
    ) {

        changes.phone = {

            from:
                oldCustomer.phone,

            to:
                newPhone

        };

    }


    if (
        oldCustomer.address !==
        newAddress
    ) {

        changes.address = {

            from:
                oldCustomer.address,

            to:
                newAddress

        };

    }


    if (
        oldCustomer.city !==
        newCity
    ) {

        changes.city = {

            from:
                oldCustomer.city,

            to:
                newCity

        };

    }


    if (
        oldCustomer.postal !==
        newPostal
    ) {

        changes.postal = {

            from:
                oldCustomer.postal,

            to:
                newPostal

        };

    }


    if (
        Object.keys(
            changes
        ).length
    ) {

        order.statusAuditLog.push({

            type:
                "order-update",

            changedAt:
                now,

            changedBy:
                "Admin",

            changeType:
                "order-update",

            reason:
                "Order information updated",

            changes:
                changes

        });

    }


    saveOrders();


    closeEditOrderModal();


    refreshState();

    updateHeaderCounts();

    updateSummary();

    renderOrders();


    /*
       If details modal is still open,
       refresh it with the new data.
    */

    if (
        orderDetailsModal?.classList.contains(
            "show"
        )
    ) {

        openOrderDetails(
            order.orderId
        );

    }


    showToast(
        `${order.orderId} updated successfully.`
    );

}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditOrderModal() {

    const modal =
        document.getElementById(
            "shopmaxEditOrderModal"
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "show"
        );


        setTimeout(
            () => {

                modal.remove();

            },
            150
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   DELETE / ARCHIVE CONFIRMATION
========================================================= */

function openDeleteOrderModal(
    orderId
) {

    if (
        getCurrentRole() !==
        "admin"
    ) {

        showToast(
            "Only admin can archive orders.",
            true
        );

        return;

    }


    refreshState();


    const order =
        orders.find(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (!order) {

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    document
        .getElementById(
            "shopmaxDeleteOrderModal"
        )
        ?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "shopmaxDeleteOrderModal";


    modal.className =
        "order-delete-modal";


    modal.innerHTML = `

        <div
            class="
                order-delete-overlay
            "
            data-delete-close
        ></div>


        <div
            class="
                order-delete-dialog
            "
            role="dialog"
            aria-modal="true"
        >

            <div
                class="
                    order-delete-icon
                "
            >

                <i
                    class="
                        fa-solid
                        fa-trash
                    "
                ></i>

            </div>


            <h3>
                Archive Order?
            </h3>


            <p>

                Are you sure you want to archive

                <strong>

                    ${escapeHTML(
                        order.orderId
                    )}

                </strong>

                ?

            </p>


            <span
                class="
                    order-delete-note
                "
            >

                This order will be removed from the
                active order list, but its complete
                record and history will be preserved
                in the archive.

            </span>


            <div
                class="
                    order-delete-actions
                "
            >

                <button
                    type="button"
                    class="
                        order-delete-cancel
                    "
                    data-delete-close
                >

                    Cancel

                </button>


                <button
                    type="button"
                    class="
                        order-delete-confirm
                    "
                    id="confirmDeleteOrderBtn"
                >

                    <i
                        class="
                            fa-solid
                            fa-box-archive
                        "
                    ></i>

                    Archive Order

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelectorAll(
            "[data-delete-close]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeDeleteOrderModal
                );

            }
        );


    modal
        .querySelector(
            "#confirmDeleteOrderBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                archiveOrder(
                    order.orderId
                );

            }
        );


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ARCHIVE ORDER
========================================================= */

function archiveOrder(
    orderId
) {

    refreshState();


    const orderIndex =
        orders.findIndex(
            item =>
                normalizeOrderId(
                    item?.orderId
                ) ===
                normalizeOrderId(
                    orderId
                )
        );


    if (
        orderIndex ===
        -1
    ) {

        showToast(
            "Order not found.",
            true
        );

        return;

    }


    const order =
        orders[
            orderIndex
        ];


    const now =
        new Date().toISOString();


    if (
        !Array.isArray(
            order.statusAuditLog
        )
    ) {

        order.statusAuditLog =
            [];

    }


    /*
       Preserve archive action in audit log.
    */

    order.statusAuditLog.push({

        type:
            "order-archive",

        changedAt:
            now,

        changedBy:
            "Admin",

        changeType:
            "archive",

        reason:
            "Order archived by admin"

    });


    order.archivedAt =
        now;


    order.archivedBy =
        "Admin";


    /*
       Existing archive records.
    */

    const archivedOrders =
        readArray(
            "shopmax-archived-orders"
        );


    /*
       Avoid duplicate archived records.
    */

    const alreadyArchived =
        archivedOrders.some(
            archived =>
                normalizeOrderId(
                    archived?.orderId
                ) ===
                normalizeOrderId(
                    order.orderId
                )
        );


    if (
        alreadyArchived
    ) {

        showToast(
            "This order is already archived.",
            true
        );

        return;

    }


    archivedOrders.unshift(
        order
    );


    localStorage.setItem(
        "shopmax-archived-orders",
        JSON.stringify(
            archivedOrders
        )
    );


    /*
       Remove only from active orders.
    */

    orders.splice(
        orderIndex,
        1
    );


    saveOrders();


    closeDeleteOrderModal();


    closeOrderDetails();


    refreshState();

    updateHeaderCounts();

    updateSummary();

    renderOrders();


    showToast(
        `${order.orderId} archived successfully.`
    );

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteOrderModal() {

    const modal =
        document.getElementById(
            "shopmaxDeleteOrderModal"
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "show"
        );


        setTimeout(
            () => {

                modal.remove();

            },
            150
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   DETAILS MODAL CLOSE
========================================================= */

function setupDetailsModal() {

    orderDetailsOverlay?.addEventListener(
        "click",
        closeOrderDetails
    );


    orderDetailsClose?.addEventListener(
        "click",
        closeOrderDetails
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeOrderDetails();

                closeEmergencyStatusModal();

                closeEditOrderModal();

                closeDeleteOrderModal();

            }

        }
    );

}


function closeOrderDetails() {

    if (
        orderDetailsModal
    ) {

        orderDetailsModal.classList.remove(
            "show"
        );


        orderDetailsModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    orderTableSearch?.addEventListener(
        "input",
        renderOrders
    );


    ordersSearchBtn?.addEventListener(
        "click",
        handleHeaderSearch
    );


    ordersSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                handleHeaderSearch();

            }

        }
    );

}


function handleHeaderSearch() {

    const query =
        ordersSearch
            ?.value
            ?.trim();


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
   FILTER
========================================================= */

function setupFilters() {

    orderStatusFilter?.addEventListener(
        "change",
        renderOrders
    );

}


/* =========================================================
   REFRESH BUTTON
========================================================= */

function setupRefresh() {

    refreshOrdersBtn?.addEventListener(
        "click",
        () => {

            refreshState();

            updateHeaderCounts();

            updateSummary();

            renderOrders();


            showToast(
                "Orders refreshed successfully."
            );

        }
    );

}


/* =========================================================
   HEADER ACTIONS
========================================================= */

function setupHeaderActions() {

    ordersWishlistBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );


    ordersCartBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "shop.html";

        }
    );


    ordersCategoriesBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "shop.html";

        }
    );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmptyState() {

    if (
        ordersTableBody
    ) {

        ordersTableBody.innerHTML =
            "";

    }


    if (
        ordersMobileList
    ) {

        ordersMobileList.innerHTML =
            "";

    }


    ordersEmpty?.classList.add(
        "show"
    );

}


function hideEmptyState() {

    ordersEmpty?.classList.remove(
        "show"
    );

}


/* =========================================================
   STATUS CLASS
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
   STATUS NORMALIZATION
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


    if (
        status ===
        "all"
    ) {

        return "all";

    }


    return "placed";

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(
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


/* =========================================================
   STATUS INDEX
========================================================= */

function getStatusIndex(
    status
) {

    return [
        "placed",
        "processing",
        "shipped",
        "out-for-delivery",
        "delivered"
    ]
        .indexOf(
            normalizeStatus(
                status
            )
        );

}


/* =========================================================
   ROLE
========================================================= */

function getCurrentRole() {

    const role =
        String(
            localStorage.getItem(
                ROLE_KEY
            ) ||
            DEFAULT_ROLE
        )
            .trim()
            .toLowerCase();


    return role ===
        "rider"
        ? "rider"
        : "admin";

}


/* =========================================================
   ORDER ITEM COUNT
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


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    const words =
        String(
            name ||
            "Guest"
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        words.length ===
        0
    ) {

        return "G";

    }


    if (
        words.length ===
        1
    ) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0]
            .charAt(0)
        +
        words[
            words.length -
            1
        ]
            .charAt(0)
    )
        .toUpperCase();

}


/* =========================================================
   ORDER ID
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
   MONEY
========================================================= */

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


/* =========================================================
   DATE
========================================================= */

function formatShortDate(
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
                "numeric"
        }
    ).format(
        date
    );

}


/* =========================================================
   DATE + TIME
========================================================= */

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


/* =========================================================
   PAYMENT
========================================================= */

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


/* =========================================================
   ACTOR
========================================================= */

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


    return "System";

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
   TOAST
========================================================= */

function showToast(
    message,
    isError = false
) {

    let toast =
        document.getElementById(
            "ordersStatusToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "ordersStatusToast";


        toast.className =
            "order-status-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.toggle(
        "error",
        isError
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.__shopmaxToastTimer
    );


    window.__shopmaxToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   STORAGE SYNC
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


        refreshState();

        updateHeaderCounts();

        updateSummary();

        renderOrders();

    }
);


/* =========================================================
   END
========================================================= */