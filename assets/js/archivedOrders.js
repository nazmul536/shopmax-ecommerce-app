"use strict";

/* =========================================================
   SHOPMAX - ARCHIVED ORDERS
========================================================= */

const ARCHIVE_KEY =
    "shopmax-archived-orders";

const ACTIVE_KEY =
    "shopmax-orders";


let archivedOrders = [];

let selectedRestoreOrderId = "";


/* =========================================================
   DOM
========================================================= */

const archiveSearch =
    document.getElementById(
        "archiveSearch"
    );


const archivedOrdersBody =
    document.getElementById(
        "archivedOrdersBody"
    );


const mobileArchivedList =
    document.getElementById(
        "mobileArchivedList"
    );


const archiveEmpty =
    document.getElementById(
        "archiveEmpty"
    );


const archivedCount =
    document.getElementById(
        "archivedCount"
    );


const archivedValue =
    document.getElementById(
        "archivedValue"
    );


const refreshArchivedBtn =
    document.getElementById(
        "refreshArchivedBtn"
    );


const archiveDetailsModal =
    document.getElementById(
        "archiveDetailsModal"
    );


const archiveModalOverlay =
    document.getElementById(
        "archiveModalOverlay"
    );


const archiveModalClose =
    document.getElementById(
        "archiveModalClose"
    );


const archiveModalTitle =
    document.getElementById(
        "archiveModalTitle"
    );


const archiveModalBody =
    document.getElementById(
        "archiveModalBody"
    );


const restoreModal =
    document.getElementById(
        "restoreModal"
    );


const restoreText =
    document.getElementById(
        "restoreText"
    );


const confirmRestoreBtn =
    document.getElementById(
        "confirmRestoreBtn"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initArchivedOrders
);


function initArchivedOrders() {

    loadArchivedOrders();

    renderArchivedOrders();

    setupEvents();

}


/* =========================================================
   LOAD
========================================================= */

function loadArchivedOrders() {

    archivedOrders =
        readArray(
            ARCHIVE_KEY
        );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    archiveSearch?.addEventListener(
        "input",
        renderArchivedOrders
    );


    refreshArchivedBtn?.addEventListener(
        "click",
        () => {

            loadArchivedOrders();

            renderArchivedOrders();

        }
    );


    archiveModalOverlay?.addEventListener(
        "click",
        closeDetails
    );


    archiveModalClose?.addEventListener(
        "click",
        closeDetails
    );


    confirmRestoreBtn?.addEventListener(
        "click",
        restoreSelectedOrder
    );


    document
        .querySelectorAll(
            "[data-close-restore]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeRestoreModal
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeDetails();

                closeRestoreModal();

            }

        }
    );


    document
        .getElementById(
            "globalSearchBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                const query =
                    document
                        .getElementById(
                            "globalSearch"
                        )
                        ?.value
                        ?.trim();


                if (
                    query
                ) {

                    window.location.href =
                        `shop.html?search=${encodeURIComponent(
                            query
                        )}`;

                }

            }
        );

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredOrders() {

    const query =
        String(
            archiveSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    return [...archivedOrders]
        .filter(
            order => {

                if (!query) {

                    return true;

                }


                const orderId =
                    String(
                        order?.orderId ||
                        ""
                    )
                        .toLowerCase();


                const name =
                    String(
                        order?.customer?.name ||
                        ""
                    )
                        .toLowerCase();


                const email =
                    String(
                        order?.customer?.email ||
                        ""
                    )
                        .toLowerCase();


                return (
                    orderId.includes(
                        query
                    ) ||
                    name.includes(
                        query
                    ) ||
                    email.includes(
                        query
                    )
                );

            }
        )
        .sort(
            (
                a,
                b
            ) =>
                new Date(
                    b?.archivedAt ||
                    0
                ).getTime()
                -
                new Date(
                    a?.archivedAt ||
                    0
                ).getTime()
        );

}


/* =========================================================
   RENDER
========================================================= */

function renderArchivedOrders() {

    const list =
        getFilteredOrders();


    updateStats();


    if (
        archivedOrdersBody
    ) {

        archivedOrdersBody.innerHTML =
            list
                .map(
                    createDesktopRow
                )
                .join("");

    }


    if (
        mobileArchivedList
    ) {

        mobileArchivedList.innerHTML =
            list
                .map(
                    createMobileCard
                )
                .join("");

    }


    bindArchiveActions();


    if (
        list.length === 0
    ) {

        archiveEmpty?.classList.add(
            "show"
        );

    } else {

        archiveEmpty?.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    if (
        archivedCount
    ) {

        archivedCount.textContent =
            archivedOrders.length;

    }


    const value =
        archivedOrders.reduce(
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
        archivedValue
    ) {

        archivedValue.textContent =
            formatMoney(
                value
            );

    }

}


/* =========================================================
   DESKTOP
========================================================= */

function createDesktopRow(
    order
) {

    const id =
        order?.orderId ||
        "—";


    const customer =
        order?.customer ||
        {};


    const name =
        customer.name ||
        "Guest";


    const email =
        customer.email ||
        "—";


    const status =
        formatStatus(
            order?.status
        );


    return `

        <tr>

            <td>

                <span
                    class="order-id"
                >

                    ${escapeHTML(
                        id
                    )}

                </span>

            </td>


            <td>

                <div
                    class="customer"
                >

                    <div
                        class="avatar"
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

            </td>


            <td>

                ${escapeHTML(
                    formatDate(
                        order?.createdAt
                    )
                )}

            </td>


            <td>

                <strong>

                    ${formatMoney(
                        order?.total
                    )}

                </strong>

            </td>


            <td>

                <span
                    class="status-badge"
                >

                    ${escapeHTML(
                        status
                    )}

                </span>

            </td>


            <td>

                <span
                    class="archive-date"
                >

                    ${escapeHTML(
                        formatDateTime(
                            order?.archivedAt
                        )
                    )}

                </span>

            </td>


            <td>

                <div
                    class="actions"
                >

                    <button
                        type="button"
                        class="action-btn"
                        data-view-archive="${escapeHTML(
                            id
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
                            action-btn
                            restore
                        "
                        data-restore-order="${escapeHTML(
                            id
                        )}"
                    >

                        <i
                            class="
                                fa-solid
                                fa-rotate-left
                            "
                        ></i>

                        Restore

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   MOBILE
========================================================= */

function createMobileCard(
    order
) {

    const id =
        order?.orderId ||
        "—";


    const customer =
        order?.customer ||
        {};


    const name =
        customer.name ||
        "Guest";


    const status =
        formatStatus(
            order?.status
        );


    return `

        <article
            class="mobile-card"
        >

            <div
                class="mobile-card-top"
            >

                <div>

                    <div
                        class="mobile-order-id"
                    >

                        ${escapeHTML(
                            id
                        )}

                    </div>


                    <div
                        class="mobile-date"
                    >

                        ${escapeHTML(
                            formatDate(
                                order?.createdAt
                            )
                        )}

                    </div>

                </div>


                <span
                    class="status-badge"
                >

                    ${escapeHTML(
                        status
                    )}

                </span>

            </div>


            <div>

                <strong>

                    ${escapeHTML(
                        name
                    )}

                </strong>

            </div>


            <div
                class="mobile-meta"
            >

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


                <div>

                    <small>
                        ARCHIVED
                    </small>


                    <strong>

                        ${escapeHTML(
                            formatDate(
                                order?.archivedAt
                            )
                        )}

                    </strong>

                </div>

            </div>


            <div
                class="mobile-actions"
            >

                <button
                    type="button"
                    class="action-btn"
                    data-view-archive="${escapeHTML(
                        id
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
                        action-btn
                        restore
                    "
                    data-restore-order="${escapeHTML(
                        id
                    )}"
                >

                    <i
                        class="
                            fa-solid
                            fa-rotate-left
                        "
                    ></i>

                    Restore

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   ACTION BINDING
========================================================= */

function bindArchiveActions() {

    document
        .querySelectorAll(
            "[data-view-archive]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openArchivedDetails(
                            button.getAttribute(
                                "data-view-archive"
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-restore-order]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openRestoreModal(
                            button.getAttribute(
                                "data-restore-order"
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================================
   DETAILS
========================================================= */

function openArchivedDetails(
    orderId
) {

    const order =
        archivedOrders.find(
            item =>
                normalizeId(
                    item?.orderId
                ) ===
                normalizeId(
                    orderId
                )
        );


    if (
        !order
    ) {

        return;

    }


    const customer =
        order.customer ||
        {};


    const addressData =
        order.addressData ||
        {};


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
                b?.changedAt ||
                0
            ).getTime()
            -
            new Date(
                a?.changedAt ||
                0
            ).getTime()
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


    archiveModalTitle.textContent =
        `Order #${order.orderId}`;


    archiveModalBody.innerHTML = `

        <div
            class="
                archive-detail-summary
            "
        >

            <div
                class="archive-summary-box"
            >

                <span>
                    CURRENT STATUS
                </span>


                <strong>

                    ${escapeHTML(
                        formatStatus(
                            order.status
                        )
                    )}

                </strong>

            </div>


            <div
                class="archive-summary-box"
            >

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


            <div
                class="archive-summary-box"
            >

                <span>
                    ARCHIVED DATE
                </span>


                <strong>

                    ${escapeHTML(
                        formatDateTime(
                            order.archivedAt
                        )
                    )}

                </strong>

            </div>

        </div>


        <section
            class="archive-section"
        >

            <h4
                class="
                    archive-section-title
                "
            >
                Customer & Delivery
            </h4>


            <div
                class="
                    archive-info-grid
                "
            >

                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        CUSTOMER
                    </span>


                    <strong>

                        ${escapeHTML(
                            customer.name ||
                            "—"
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        EMAIL
                    </span>


                    <strong>

                        ${escapeHTML(
                            customer.email ||
                            "—"
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        PHONE
                    </span>


                    <strong>

                        ${escapeHTML(
                            customer.phone ||
                            "—"
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        ADDRESS
                    </span>


                    <strong>

                        ${escapeHTML(
                            address
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        CITY
                    </span>


                    <strong>

                        ${escapeHTML(
                            city
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        POSTAL CODE
                    </span>


                    <strong>

                        ${escapeHTML(
                            postal
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        COUNTRY
                    </span>


                    <strong>

                        ${escapeHTML(
                            country
                        )}

                    </strong>

                </div>


                <div
                    class="
                        archive-info-item
                    "
                >

                    <span>
                        TOTAL
                    </span>


                    <strong>

                        ${formatMoney(
                            order.total
                        )}

                    </strong>

                </div>

            </div>

        </section>


        <section
            class="archive-section"
        >

            <h4
                class="
                    archive-section-title
                "
            >
                Status History
            </h4>


            <div
                class="archive-history"
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
                                style="
                                    color:#8998ab;
                                    font-size:10px;
                                "
                            >

                                No status history available.

                            </div>

                        `
                }

            </div>

        </section>


        <section
            class="archive-section"
        >

            <h4
                class="
                    archive-section-title
                "
            >
                Products
            </h4>


            ${
                Array.isArray(
                    order.items
                ) &&
                order.items.length

                    ? order.items
                        .map(
                            item => `

                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        justify-content:space-between;
                                        gap:12px;
                                        padding:10px 0;
                                        border-bottom:1px solid #edf1f5;
                                    "
                                >

                                    <div>

                                        <strong
                                            style="
                                                display:block;
                                                font-size:10px;
                                            "
                                        >

                                            ${escapeHTML(
                                                item?.title ||
                                                "Product"
                                            )}

                                        </strong>


                                        <span
                                            style="
                                                color:#8b99ab;
                                                font-size:8px;
                                            "
                                        >

                                            Qty:
                                            ${
                                                Math.max(
                                                    1,
                                                    Number(
                                                        item?.quantity
                                                    ) ||
                                                    1
                                                )
                                            }

                                        </span>

                                    </div>


                                    <strong
                                        style="
                                            font-size:10px;
                                        "
                                    >

                                        ${formatMoney(
                                            (
                                                Number(
                                                    item?.price
                                                ) ||
                                                0
                                            ) *
                                            Math.max(
                                                1,
                                                Number(
                                                    item?.quantity
                                                ) ||
                                                1
                                            )
                                        )}

                                    </strong>

                                </div>

                            `
                        )
                        .join("")

                    : `

                        <div
                            style="
                                color:#8998ab;
                                font-size:10px;
                            "
                        >

                            No products available.

                        </div>

                    `
            }

        </section>


        <div
            style="
                display:flex;
                justify-content:flex-end;
                margin-top:18px;
            "
        >

            <button
                type="button"
                class="
                    action-btn
                    restore
                "
                data-modal-restore="${escapeHTML(
                    order.orderId
                )}"
            >

                <i
                    class="
                        fa-solid
                        fa-rotate-left
                    "
                ></i>

                Restore Order

            </button>

        </div>

    `;


    archiveModalBody
        .querySelector(
            "[data-modal-restore]"
        )
        ?.addEventListener(
            "click",
            () => {

                closeDetails();

                openRestoreModal(
                    order.orderId
                );

            }
        );


    archiveDetailsModal.classList.add(
        "show"
    );


    archiveDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   HISTORY ITEM
========================================================= */

function createHistoryItem(
    entry
) {

    const correction =
        entry?.type ===
        "correction";


    return `

        <div
            class="
                archive-history-item
            "
        >

            <div
                class="
                    history-dot
                    ${correction
                        ? "correction"
                        : ""}
                "
            >

                <i
                    class="
                        fa-solid
                        ${
                            correction
                                ? "fa-rotate-left"
                                : "fa-check"
                        }
                    "
                ></i>

            </div>


            <div
                class="history-main"
            >

                <div
                    class="history-top"
                >

                    <strong>

                        ${
                            correction
                                ? "Emergency Correction"
                                : escapeHTML(
                                    formatStatus(
                                        entry?.status
                                    )
                                )
                        }

                    </strong>


                    <time>

                        ${escapeHTML(
                            formatDateTime(
                                entry?.changedAt
                            )
                        )}

                    </time>

                </div>


                ${
                    correction

                        ? `

                            <p>

                                ${escapeHTML(
                                    entry?.fromStatus ||
                                    "—"
                                )}

                                →

                                ${escapeHTML(
                                    entry?.toStatus ||
                                    entry?.status ||
                                    "—"
                                )}

                            </p>

                        `

                        : ""
                }


                ${
                    entry?.reason

                        ? `

                            <div
                                class="history-reason"
                            >

                                <strong>
                                    Reason:
                                </strong>

                                ${escapeHTML(
                                    entry.reason
                                )}

                            </div>

                        `

                        : ""
                }


                <span
                    class="history-actor"
                >

                    Changed by:
                    ${escapeHTML(
                        formatActor(
                            entry?.changedBy
                        )
                    )}

                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   RESTORE MODAL
========================================================= */

function openRestoreModal(
    orderId
) {

    const order =
        archivedOrders.find(
            item =>
                normalizeId(
                    item?.orderId
                ) ===
                normalizeId(
                    orderId
                )
        );


    if (!order) {

        return;

    }


    selectedRestoreOrderId =
        order.orderId;


    restoreText.textContent =
        `Restore ${order.orderId}
         back to the active order list?`;


    restoreModal.classList.add(
        "show"
    );


    restoreModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeRestoreModal() {

    restoreModal?.classList.remove(
        "show"
    );


    restoreModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedRestoreOrderId =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   RESTORE
========================================================= */

function restoreSelectedOrder() {

    if (
        !selectedRestoreOrderId
    ) {

        return;

    }


    loadArchivedOrders();


    const archiveIndex =
        archivedOrders.findIndex(
            item =>
                normalizeId(
                    item?.orderId
                ) ===
                normalizeId(
                    selectedRestoreOrderId
                )
        );


    if (
        archiveIndex ===
        -1
    ) {

        showToast(
            "Archived order not found.",
            true
        );

        closeRestoreModal();

        return;

    }


    const order =
        archivedOrders[
            archiveIndex
        ];


    const activeOrders =
        readArray(
            ACTIVE_KEY
        );


    const exists =
        activeOrders.some(
            item =>
                normalizeId(
                    item?.orderId
                ) ===
                normalizeId(
                    order.orderId
                )
        );


    if (
        exists
    ) {

        showToast(
            "This order already exists in active orders.",
            true
        );

        closeRestoreModal();

        return;

    }


    const restored =
        {
            ...order
        };


    delete restored.archivedAt;

    delete restored.archivedBy;


    /*
       Preserve archive/restore audit.
    */

    if (
        !Array.isArray(
            restored.statusAuditLog
        )
    ) {

        restored.statusAuditLog =
            [];

    }


    restored.statusAuditLog.push({

        type:
            "order-restore",

        changedAt:
            new Date().toISOString(),

        changedBy:
            "Admin",

        changeType:
            "restore",

        reason:
            "Order restored from archive"

    });


    activeOrders.unshift(
        restored
    );


    archivedOrders.splice(
        archiveIndex,
        1
    );


    localStorage.setItem(
        ACTIVE_KEY,
        JSON.stringify(
            activeOrders
        )
    );


    localStorage.setItem(
        ARCHIVE_KEY,
        JSON.stringify(
            archivedOrders
        )
    );


    closeRestoreModal();


    loadArchivedOrders();

    renderArchivedOrders();


    showToast(
        `${order.orderId} restored successfully.`
    );

}


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetails() {

    archiveDetailsModal?.classList.remove(
        "show"
    );


    archiveDetailsModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   HELPERS
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


function normalizeId(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toUpperCase();

}


function formatStatus(
    value
) {

    const raw =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        raw ===
        "processing"
    ) {

        return "Processing";

    }


    if (
        raw ===
        "shipped"
    ) {

        return "Shipped";

    }


    if (
        raw ===
        "out for delivery"
    ) {

        return "Out for Delivery";

    }


    if (
        raw ===
        "delivered"
    ) {

        return "Delivered";

    }


    return "Order Placed";

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


function formatDate(
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
            .charAt(0) +
        words[
            words.length - 1
        ]
            .charAt(0)
    )
        .toUpperCase();

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
    error = false
) {

    let toast =
        document.getElementById(
            "archiveToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "archiveToast";


        toast.style.cssText = `
            position:fixed;
            right:20px;
            bottom:20px;
            z-index:11000;
            max-width:320px;
            padding:12px 15px;
            border-radius:8px;
            background:${
                error
                    ? "#c74444"
                    : "#15213b"
            };
            color:#ffffff;
            font-size:10px;
            font-weight:800;
            box-shadow:0 15px 40px rgba(15,23,42,.18);
        `;


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    clearTimeout(
        window.archiveToastTimer
    );


    toast.style.display =
        "block";


    window.archiveToastTimer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

            },
            2500
        );

}