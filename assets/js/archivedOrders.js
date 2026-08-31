"use strict";


/* =========================================================
   SHOPMAX - ARCHIVED ORDERS
========================================================= */

const ARCHIVE_KEY =
    "shopmax-archived-orders";


const ACTIVE_KEY =
    "shopmax-orders";


let archivedOrders = [];


let selectedRestoreOrderId =
    "";



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
        function () {

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
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeDetails();

                closeRestoreModal();

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


    return archivedOrders

        .filter(
            order => {

                if (
                    !query
                ) {

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
                    )

                    ||

                    name.includes(
                        query
                    )

                    ||

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
            ) => {

                return (

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
        list.length ===
        0
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
            ) => {

                return (

                    total +

                    (
                        Number(
                            order?.total
                        ) || 0
                    )

                );

            },
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
   DESKTOP ROW
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


    const statusClass =
        getStatusClass(
            status
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
                    class="
                        order-status
                        ${statusClass}
                    "
                >

                    ${escapeHTML(
                        status
                    )}

                </span>

            </td>



            <td>

                ${escapeHTML(
                    formatDateTime(
                        order?.archivedAt
                    )
                )}

            </td>



            <td>

                <div
                    class="action-wrap"
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
   MOBILE CARD
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


    const email =
        customer.email ||
        "—";


    const status =
        formatStatus(
            order?.status
        );


    const statusClass =
        getStatusClass(
            status
        );


    return `

        <article
            class="
                mobile-order-card
            "
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
                            id
                        )}

                    </div>


                    <div
                        class="
                            mobile-order-date
                        "
                    >

                        ${escapeHTML(
                            formatDate(
                                order?.createdAt
                            )
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
                    mobile-customer
                "
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



            <div
                class="
                    mobile-order-meta
                "
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
                class="
                    mobile-order-actions
                "
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
   BIND ACTIONS
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
                    function () {

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
                    function () {

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
        !order ||
        !archiveDetailsModal
    ) {

        return;

    }


    archiveModalTitle.textContent =
        order.orderId ||
        "Order";


    archiveModalBody.innerHTML =
        createArchiveDetails(
            order
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
   DETAIL CONTENT
========================================================= */

function createArchiveDetails(
    order
) {

    const customer =
        order?.customer ||
        {};


    const name =
        customer.name ||
        "Guest";


    const email =
        customer.email ||
        "—";


    const phone =
        customer.phone ||
        "—";


    const address =
        order?.shippingAddress ||
        order?.address ||
        {};


    const payment =
        order?.paymentMethod ||
        "—";


    const status =
        formatStatus(
            order?.status
        );


    const items =
        Array.isArray(
            order?.items
        )
            ? order.items
            : [];


    const subtotal =
        Number(
            order?.subtotal
        );


    const total =
        Number(
            order?.total
        ) || 0;


    const shipping =
        Number.isFinite(
            subtotal
        )
            ? Math.max(
                0,
                total - subtotal
            )
            : 0;


    return `

        <section
            class="
                archive-detail-summary
            "
        >

            <div>

                <small>
                    ORDER ID
                </small>

                <strong>
                    ${escapeHTML(
                        order?.orderId ||
                        "—"
                    )}
                </strong>

            </div>


            <div>

                <small>
                    DATE
                </small>

                <strong>
                    ${escapeHTML(
                        formatDateTime(
                            order?.createdAt
                        )
                    )}
                </strong>

            </div>


            <div>

                <small>
                    STATUS
                </small>

                <strong>
                    ${escapeHTML(
                        status
                    )}
                </strong>

            </div>


            <div>

                <small>
                    TOTAL
                </small>

                <strong>
                    ${formatMoney(
                        total
                    )}
                </strong>

            </div>

        </section>



        <section
            class="
                archive-info-grid
            "
        >

            <div>

                <small>
                    CUSTOMER
                </small>


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


                <span>
                    ${escapeHTML(
                        phone
                    )}
                </span>

            </div>



            <div>

                <small>
                    PAYMENT
                </small>


                <strong>
                    ${escapeHTML(
                        payment
                    )}
                </strong>

            </div>



            <div>

                <small>
                    SHIPPING ADDRESS
                </small>


                <strong>

                    ${escapeHTML(
                        address?.address ||
                        address?.street ||
                        "—"
                    )}

                </strong>


                <span>

                    ${escapeHTML(
                        [
                            address?.city,
                            address?.postalCode
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                ", "
                            )
                            ||
                            "—"
                    )}

                </span>


                <span>

                    ${escapeHTML(
                        address?.country ||
                        "—"
                    )}

                </span>

            </div>

        </section>



        <section>

            <div
                class="
                    panel-label
                "
            >
                PRODUCTS
            </div>


            ${
                items.length

                    ? items
                        .map(
                            item =>
                                createDetailProduct(
                                    item
                                )
                        )
                        .join("")

                    : `

                        <div
                            style="
                                padding:20px 0;
                                color:#8a98aa;
                                font-size:9px;
                            "
                        >
                            No product details available.
                        </div>

                    `
            }

        </section>



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

                    ${
                        Number.isFinite(
                            subtotal
                        )
                            ? formatMoney(
                                subtotal
                            )
                            : formatMoney(
                                total
                            )
                    }

                </strong>

            </div>


            <div>

                <span>
                    Shipping
                </span>


                <strong>

                    ${
                        shipping <= 0
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

}



/* =========================================================
   DETAIL PRODUCT
========================================================= */

function createDetailProduct(
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


    return `

        <div
            style="
                display:grid;
                grid-template-columns:50px minmax(0,1fr) auto;
                align-items:center;
                gap:10px;
                padding:10px 0;
                border-bottom:1px solid #eef2f6;
            "
        >


            <div
                style="
                    width:50px;
                    height:50px;
                    display:grid;
                    place-items:center;
                    overflow:hidden;
                    border:1px solid #dfe7f0;
                    border-radius:7px;
                    background:#f8fafc;
                "
            >

                ${
                    item?.image

                        ? `

                            <img
                                src="${escapeHTML(
                                    item.image
                                )}"
                                alt="${escapeHTML(
                                    item?.title ||
                                    "Product"
                                )}"
                                style="
                                    width:100%;
                                    height:100%;
                                    object-fit:contain;
                                "
                            >

                        `

                        : `

                            <i
                                class="
                                    fa-solid
                                    fa-box
                                "
                                style="
                                    color:#a2adba;
                                "
                            ></i>

                        `
                }

            </div>



            <div
                style="
                    min-width:0;
                "
            >

                <strong
                    style="
                        display:block;
                        margin-bottom:3px;
                        color:#15213b;
                        font-size:9px;
                    "
                >

                    ${escapeHTML(
                        item?.title ||
                        "Product"
                    )}

                </strong>


                <span
                    style="
                        color:#94a3b8;
                        font-size:7px;
                    "
                >

                    Qty: ${quantity}

                </span>

            </div>



            <strong
                style="
                    color:#15213b;
                    font-size:9px;
                    white-space:nowrap;
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


    if (
        !order ||
        !restoreModal
    ) {

        return;

    }


    selectedRestoreOrderId =
        order.orderId;


    if (
        restoreText
    ) {

        restoreText.textContent =
            `Restore ${order.orderId}
             back to the active order list?`;

    }


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



/* =========================================================
   CLOSE RESTORE
========================================================= */

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


    if (
        !archiveDetailsModal?.classList.contains(
            "show"
        )
    ) {

        document.body.style.overflow =
            "";

    }

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


    if (
        !restoreModal?.classList.contains(
            "show"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}



/* =========================================================
   HELPERS
========================================================= */

function readArray(
    key
) {

    try {

        const raw =
            localStorage.getItem(
                key
            );


        if (
            !raw
        ) {

            return [];

        }


        const parsed =
            JSON.parse(
                raw
            );


        return Array.isArray(
            parsed
        )
            ? parsed
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



function getStatusClass(
    value
) {

    const status =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();


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


    return "";

}



function formatMoney(
    value
) {

    return `$${(
        Number(
            value
        ) || 0
    ).toFixed(2)}`;

}



function formatDate(
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
            .slice(
                0,
                2
            )
            .toUpperCase();

    }


    return (

        words[0][0] +
        words[1][0]

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
            "adminToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "adminToast";


        toast.style.position =
            "fixed";


        toast.style.right =
            "20px";


        toast.style.bottom =
            "20px";


        toast.style.zIndex =
            "20000";


        toast.style.maxWidth =
            "360px";


        toast.style.padding =
            "13px 16px";


        toast.style.borderRadius =
            "9px";


        toast.style.background =
            "#15213b";


        toast.style.color =
            "#ffffff";


        toast.style.fontSize =
            "9px";


        toast.style.fontWeight =
            "700";


        toast.style.boxShadow =
            "0 10px 30px rgba(15,23,42,.20)";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.borderLeft =
        error
            ? "3px solid #c74444"
            : "3px solid #119b4b";


    toast.style.opacity =
        "1";


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

            },
            2800
        );

}