"use strict";

/* =========================================================
   SHOPMAX
   ORDERS PAGE
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
   STATUS
========================================================= */

const STATUS = [
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
   HEADER DOM
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
   SUMMARY DOM
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
   ORDERS DOM
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
   DETAILS MODAL
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

    refreshOrders();

    refreshCart();

    refreshWishlist();

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
   STORAGE HELPERS
========================================================= */

function readStorageArray(
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


function saveOrders() {

    localStorage.setItem(
        "shopmax-orders",
        JSON.stringify(
            orders
        )
    );

}


/* =========================================================
   REFRESH STORAGE
========================================================= */

function refreshOrders() {

    orders =
        readStorageArray(
            "shopmax-orders"
        );

    normalizeOrders();

}


function refreshCart() {

    cart =
        readStorageArray(
            "shopmax-cart"
        );

}


function refreshWishlist() {

    wishlist =
        readStorageArray(
            "shopmax-wishlist"
        );

}


/* =========================================================
   NORMALIZE ORDERS
========================================================= */

function normalizeOrders() {

    let changed =
        false;


    orders =
        orders
            .map(
                order => {

                    if (
                        !order ||
                        typeof order !==
                            "object"
                    ) {

                        changed =
                            true;

                        return null;

                    }


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
                       Never delete valid old history.
                    */

                    order.statusHistory =
                        order.statusHistory
                            .filter(
                                entry =>
                                    entry &&
                                    typeof entry ===
                                        "object" &&
                                    entry.changedAt &&
                                    (
                                        entry.status ||
                                        entry.type ===
                                            "correction"
                                    )
                            );


                    order.statusHistory.sort(
                        (
                            a,
                            b
                        ) =>
                            new Date(
                                a.changedAt
                            ).getTime()
                            -
                            new Date(
                                b.changedAt
                            ).getTime()
                    );


                    return order;

                }
            )
            .filter(
                Boolean
            );


    if (
        changed
    ) {

        saveOrders();

    }

}


/* =========================================================
   INITIAL HISTORY
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
            ) =>
                total +
                (
                    Number(
                        order?.total
                    ) ||
                    0
                ),
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
        [...orders].sort(
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
   FILTERED ORDERS
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
                        ).toLowerCase();


                    const customerName =
                        String(
                            order?.customer?.name ||
                            ""
                        ).toLowerCase();


                    const customerEmail =
                        String(
                            order?.customer?.email ||
                            ""
                        ).toLowerCase();


                    const customerPhone =
                        String(
                            order?.customer?.phone ||
                            ""
                        ).toLowerCase();


                    const matches =
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
                        !matches
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
   RENDER
========================================================= */

function renderOrders() {

    const filteredOrders =
        getFilteredOrders();


    if (
        filteredOrders.length ===
        0
    ) {

        renderEmptyState();

        return;

    }


    hideEmptyState();


    renderDesktopTable(
        filteredOrders
    );


    renderMobileList(
        filteredOrders
    );

}


/* =========================================================
   DESKTOP TABLE
========================================================= */

function renderDesktopTable(
    list
) {

    if (
        !ordersTableBody
    ) {

        return;

    }


    ordersTableBody.innerHTML =
        list
            .map(
                createTableRow
            )
            .join("");


    bindTrackButtons();

    bindViewButtons();

    bindStatusControls();

    updateStatusControlClasses();

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


    const date =
        formatShortDate(
            order?.createdAt
        );


    const itemCount =
        getOrderItemCount(
            order
        );


    const total =
        formatMoney(
            order?.total
        );


    const status =
        formatStatus(
            order?.status
        );


    const statusClass =
        getStatusClass(
            status
        );


    const showCorrection =
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
                    date
                )}

            </td>


            <td
                class="order-items-cell"
            >

                ${itemCount}

                ${
                    itemCount ===
                    1
                        ? "item"
                        : "items"
                }

            </td>


            <td
                class="order-total-cell"
            >

                ${total}

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
                            ${statusClass}
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
                        showCorrection
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
                    class="order-actions"
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
   MOBILE
========================================================= */

function renderMobileList(
    list
) {

    if (
        !ordersMobileList
    ) {

        return;

    }


    ordersMobileList.innerHTML =
        list
            .map(
                createMobileOrder
            )
            .join("");


    bindTrackButtons();

    bindViewButtons();

    bindStatusControls();

}


/* =========================================================
   MOBILE ORDER
========================================================= */

function createMobileOrder(
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


    const date =
        formatShortDate(
            order?.createdAt
        );


    const items =
        getOrderItemCount(
            order
        );


    const total =
        formatMoney(
            order?.total
        );


    const status =
        formatStatus(
            order?.status
        );


    const statusClass =
        getStatusClass(
            status
        );


    const showCorrection =
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
                class="mobile-order-top"
            >

                <div>

                    <div
                        class="mobile-order-id"
                    >

                        ${escapeHTML(
                            orderId
                        )}

                    </div>


                    <div
                        class="mobile-order-date"
                    >

                        ${escapeHTML(
                            date
                        )}

                    </div>

                </div>


                <span
                    class="
                        order-status
                        ${statusClass}
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

                        ${items}

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
                            ${statusClass}
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
                        showCorrection
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
   STATUS OPTIONS
========================================================= */

function createStatusOptions(
    currentStatus
) {

    const currentIndex =
        getStatusIndex(
            currentStatus
        );


    return STATUS
        .map(
            (
                status,
                index
            ) => {

                const selected =
                    index ===
                    currentIndex;


                const enabled =
                    index ===
                        currentIndex ||
                    index ===
                        currentIndex + 1;


                return `

                    <option
                        value="${escapeHTML(
                            status
                        )}"
                        ${
                            selected
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
   STATUS CONTROL
========================================================= */

function bindStatusControls() {

    document
        .querySelectorAll(
            "[data-status-order]"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    handleStatusChange
                );

            }
        );


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

}


/* =========================================================
   NORMAL STATUS CHANGE
========================================================= */

function handleStatusChange(
    event
) {

    const select =
        event.currentTarget;


    const orderId =
        select.getAttribute(
            "data-status-order"
        );


    const newStatus =
        select.value;


    refreshOrders();


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
        !order
    ) {

        renderOrders();

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


    const targetIndex =
        getStatusIndex(
            newStatus
        );


    /*
       Forward one step only.
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
       Rider restriction.
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


    ensureHistory(
        order
    );


    const oldStatus =
        formatStatus(
            order.status
        );


    const targetStatus =
        formatStatus(
            newStatus
        );


    /*
       SAVE HISTORY.
    */

    order.statusHistory.push({

        type:
            "status",

        status:
            targetStatus,

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
       AUDIT LOG.
    */

    order.statusAuditLog.push({

        from:
            oldStatus,

        to:
            targetStatus,

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
       CURRENT STATUS.
    */

    order.status =
        targetStatus;


    order.updatedAt =
        now;


    saveOrders();


    refreshStateAfterStatusChange();

}


/* =========================================================
   SAVE + REFRESH
========================================================= */

function refreshStateAfterStatusChange() {

    refreshOrders();

    refreshCart();

    refreshWishlist();

    updateHeaderCounts();

    updateSummary();

    renderOrders();

}


/* =========================================================
   EMERGENCY MODAL
   ---------------------------------------------------------
   FINAL BUG-FIXED VERSION
========================================================= */

function createEmergencyModal() {

    /*
       Remove old modal if one exists.
    */

    document
        .getElementById(
            "emergencyStatusModal"
        )
        ?.remove();


    const modal =
        document.createElement(
            "div"
        );


    /*
       IMPORTANT:
       IDs are clean single-line strings.
    */

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
            class="emergency-status-overlay"
            data-emergency-close
        ></div>


        <div
            class="emergency-status-dialog"
            role="dialog"
            aria-modal="true"
        >

            <div
                class="emergency-status-header"
            >

                <div>

                    <span>
                        EMERGENCY CORRECTION
                    </span>


                    <h3>
                        Correct Order Status
                    </h3>

                </div>


                <button
                    type="button"
                    class="emergency-status-close"
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
                class="emergency-warning"
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
                        be deleted. The correction will
                        be recorded in the audit history.
                    </p>

                </div>

            </div>


            <div
                class="emergency-status-field"
            >

                <label>
                    CURRENT STATUS
                </label>


                <div
                    id="emergencyCurrentStatus"
                    class="emergency-current-status"
                >
                    —
                </div>

            </div>


            <div
                class="emergency-status-field"
            >

                <label
                    for="emergencyNewStatus"
                >
                    CHANGE TO
                </label>


                <select
                    id="emergencyNewStatus"
                    class="emergency-status-select"
                ></select>

            </div>


            <div
                class="emergency-status-field"
            >

                <label
                    for="emergencyStatusReason"
                >
                    REASON
                </label>


                <textarea
                    id="emergencyStatusReason"
                    class="emergency-status-reason"
                    rows="4"
                    maxlength="250"
                    placeholder="Example: Incorrect status update"
                ></textarea>

            </div>


            <div
                class="emergency-status-footer"
            >

                <button
                    type="button"
                    class="emergency-cancel-btn"
                    data-emergency-close
                >

                    Cancel

                </button>


                <button
                    type="button"
                    class="emergency-confirm-btn"
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


    /*
       Bind close buttons.
    */

    modal
        .querySelectorAll(
            "[data-emergency-close]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    closeEmergency
                );

            }
        );


    /*
       Bind confirm.
    */

    const confirmButton =
        modal.querySelector(
            "#emergencyConfirmBtn"
        );


    if (
        confirmButton
    ) {

        confirmButton.addEventListener(
            "click",
            confirmEmergency
        );

    }


    return modal;

}


/* =========================================================
   OPEN EMERGENCY
========================================================= */

function openEmergencyStatusModal(
    orderId
) {

    if (
        getCurrentRole() !==
        "admin"
    ) {

        showToast(
            "Emergency correction is admin only.",
            true
        );

        return;

    }


    refreshOrders();


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
        !order
    ) {

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
            "No earlier status available.",
            true
        );

        return;

    }


    emergencyOrderId =
        order.orderId;


    const modal =
        createEmergencyModal();


    /*
       IMPORTANT:
       Query INSIDE the fresh modal.
    */

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


    /*
       Safety guard.
    */

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
       Previous statuses only.
    */

    statusSelect.innerHTML =
        STATUS
            .slice(
                0,
                currentIndex
            )
            .map(
                status => `

                    <option
                        value="${escapeHTML(
                            status
                        )}"
                    >

                        ${escapeHTML(
                            status
                        )}

                    </option>

                `
            )
            .join("");


    /*
       Immediate previous status by default.
    */

    statusSelect.value =
        STATUS[
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

function confirmEmergency() {

    const modal =
        document.getElementById(
            "emergencyStatusModal"
        );


    if (
        !modal
    ) {

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


    const targetStatus =
        statusSelect.value.trim();


    const reason =
        reasonField.value.trim();


    if (
        !targetStatus
    ) {

        showToast(
            "Please select a status.",
            true
        );

        return;

    }


    if (
        !reason
    ) {

        showToast(
            "Please enter the correction reason.",
            true
        );

        reasonField.focus();

        return;

    }


    refreshOrders();


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


    if (
        !order
    ) {

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
            targetStatus
        );


    /*
       Correction MUST go backward.
    */

    if (
        targetIndex < 0 ||
        targetIndex >= currentIndex
    ) {

        showToast(
            "Choose an earlier status.",
            true
        );

        return;

    }


    ensureHistory(
        order
    );


    const now =
        new Date().toISOString();


    const formattedTarget =
        formatStatus(
            targetStatus
        );


    /*
       IMPORTANT:
       Old history stays.

       We add ONLY new audit events.
    */

    order.statusHistory.push({

        type:
            "correction",

        fromStatus:
            currentStatus,

        toStatus:
            formattedTarget,

        status:
            formattedTarget,

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
       New effective status event.
    */

    order.statusHistory.push({

        type:
            "status",

        status:
            formattedTarget,

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
       Audit log.
    */

    order.statusAuditLog.push({

        from:
            currentStatus,

        to:
            formattedTarget,

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
       Current status.
    */

    order.status =
        formattedTarget;


    order.updatedAt =
        now;


    /*
       Keep complete history.
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


    closeEmergency();


    refreshOrders();

    refreshCart();

    refreshWishlist();

    updateHeaderCounts();

    updateSummary();

    renderOrders();


    showToast(
        `${order.orderId} corrected to ${formattedTarget}`
    );

}


/* =========================================================
   CLOSE EMERGENCY
========================================================= */

function closeEmergency() {

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


        setTimeout(
            () => {

                if (
                    modal.parentNode
                ) {

                    modal.remove();

                }

            },
            200
        );

    }


    emergencyOrderId =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   TRACK BUTTONS
========================================================= */

function bindTrackButtons() {

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


                        trackSpecificOrder(
                            orderId
                        );

                    }
                );

            }
        );

}


/* =========================================================
   TRACK SPECIFIC ORDER
========================================================= */

function trackSpecificOrder(
    orderId
) {

    if (
        !orderId
    ) {

        return;

    }


    /*
       Keep original working flow.
    */

    window.location.href =
        `trackOrder.html?orderId=${encodeURIComponent(
            orderId
        )}`;

}


/* =========================================================
   VIEW BUTTONS
========================================================= */

function bindViewButtons() {

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

}


/* =========================================================
   ORDER DETAILS
========================================================= */

function openOrderDetails(
    orderId
) {

    refreshOrders();


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


    const customer =
        order.customer ||
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


    const address =
        customer.address ||
        order?.addressData?.formatted ||
        "—";


    const city =
        customer.city ||
        order?.addressData?.city ||
        order?.addressData?.county ||
        "—";


    const postal =
        customer.postal ||
        customer.postalCode ||
        order?.addressData?.postcode ||
        "—";


    orderDetailsTitle.textContent =
        `Order #${order.orderId}`;


    orderDetailsBody.innerHTML = `

        <div
            class="
                order-detail-status-row
            "
        >

            <span
                class="
                    order-status
                    ${getStatusClass(
                        order.status
                    )}
                "
            >

                ${escapeHTML(
                    formatStatus(
                        order.status
                    )
                )}

            </span>


            <span
                class="
                    order-detail-date
                "
            >

                ${escapeHTML(
                    formatDateTime(
                        order.createdAt
                    )
                )}

            </span>

        </div>


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

                </div>

            </section>

        </div>


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
                        fa-box
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

}


/* =========================================================
   DETAILS MODAL
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

                closeEmergency();

            }

        }
    );

}


function closeOrderDetails() {

    orderDetailsModal?.classList.remove(
        "show"
    );


    orderDetailsModal?.setAttribute(
        "aria-hidden",
        "true"
    );


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
   FILTER
========================================================= */

function setupFilters() {

    orderStatusFilter?.addEventListener(
        "change",
        renderOrders
    );

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    refreshOrdersBtn?.addEventListener(
        "click",
        () => {

            refreshOrders();

            refreshCart();

            refreshWishlist();

            updateHeaderCounts();

            updateSummary();

            renderOrders();


            refreshOrdersBtn?.classList.add(
                "is-refreshing"
            );


            setTimeout(
                () => {

                    refreshOrdersBtn?.classList.remove(
                        "is-refreshing"
                    );

                },
                450
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
   STATUS CLASSES
========================================================= */

function updateStatusControlClasses() {

    document
        .querySelectorAll(
            ".order-status-select"
        )
        .forEach(
            select => {

                select.classList.remove(
                    "processing",
                    "shipped",
                    "out-for-delivery",
                    "delivered"
                );


                const className =
                    getStatusClass(
                        select.value
                    );


                if (
                    className
                ) {

                    select.classList.add(
                        className
                    );

                }

            }
        );

}


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
   STATUS HELPERS
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


function getCurrentRole() {

    return String(
        localStorage.getItem(
            ROLE_KEY
        ) ||
        DEFAULT_ROLE
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   GENERAL HELPERS
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
            words.length - 1
        ]
            .charAt(0)
    )
        .toUpperCase();

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
            "shopmaxOrderToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "shopmaxOrderToast";


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
        window.shopmaxToastTimer
    );


    window.shopmaxToastTimer =
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


        refreshOrders();

        updateHeaderCounts();

        updateSummary();

        renderOrders();

    }
);