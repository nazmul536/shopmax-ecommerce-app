"use strict";

/* =========================================================
   SHOPMAX - ARCHIVED CUSTOMERS
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const ARCHIVED_CUSTOMERS_KEY =
    "shopmax-archived-customers";

const ORDERS_KEY =
    "shopmax-orders";


/* =========================================================
   STATE
========================================================= */

let archivedCustomers = [];

let orders = [];

let archivedCustomerRecords = [];

let selectedRestoreKey = "";

let lastStorageSnapshot = "";


/* =========================================================
   ADMIN SIDEBAR DOM
========================================================= */

const adminLayout =
    document.getElementById("adminLayout");

const adminSidebar =
    document.getElementById("adminSidebar");

const sidebarToggleBtn =
    document.getElementById("sidebarToggleBtn");

const sidebarMobileClose =
    document.getElementById("sidebarMobileClose");

const mobileSidebarToggle =
    document.getElementById("mobileSidebarToggle");

const adminPageRefresh =
    document.getElementById("adminPageRefresh");


/* =========================================================
   STATS DOM
========================================================= */

const archivedCustomerCount =
    document.getElementById(
        "archivedCustomerCount"
    );

const archivedCustomerOrders =
    document.getElementById(
        "archivedCustomerOrders"
    );


/* =========================================================
   SEARCH / TABLE DOM
========================================================= */

const archivedCustomerSearch =
    document.getElementById(
        "archivedCustomerSearch"
    );

const archivedCustomersBody =
    document.getElementById(
        "archivedCustomersBody"
    );

const archivedCustomersMobile =
    document.getElementById(
        "archivedCustomersMobile"
    );

const archivedCustomersEmpty =
    document.getElementById(
        "archivedCustomersEmpty"
    );

const refreshArchivedCustomers =
    document.getElementById(
        "refreshArchivedCustomers"
    );


/* =========================================================
   DETAILS MODAL DOM
========================================================= */

const archivedCustomerDetailsModal =
    document.getElementById(
        "archivedCustomerDetailsModal"
    );

const archivedDetailsOverlay =
    document.getElementById(
        "archivedDetailsOverlay"
    );

const archivedDetailsClose =
    document.getElementById(
        "archivedDetailsClose"
    );

const archivedDetailsTitle =
    document.getElementById(
        "archivedDetailsTitle"
    );

const archivedDetailsBody =
    document.getElementById(
        "archivedDetailsBody"
    );


/* =========================================================
   RESTORE MODAL DOM
========================================================= */

const restoreCustomerModal =
    document.getElementById(
        "restoreCustomerModal"
    );

const restoreCustomerMessage =
    document.getElementById(
        "restoreCustomerMessage"
    );

const confirmRestoreCustomer =
    document.getElementById(
        "confirmRestoreCustomer"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initArchivedCustomers
);


function initArchivedCustomers() {

    loadData();

    buildArchivedCustomerRecords();

    updateStats();

    renderArchivedCustomers();

    setupEvents();

    initializeAdminSidebar();

    saveStorageSnapshot();

}


/* =========================================================
   ADMIN SIDEBAR
========================================================= */

function initializeAdminSidebar() {

    if (
        !adminLayout ||
        !adminSidebar
    ) {

        return;

    }


    /*
       Desktop starts open.
    */

    if (
        window.innerWidth > 900
    ) {

        openAdminDesktopSidebar();

    }


    /*
       Mobile / Tablet starts closed.
    */

    if (
        window.innerWidth <= 900
    ) {

        adminSidebar.classList.remove(
            "open"
        );

    }


    /*
       Desktop close/open button
    */

    sidebarToggleBtn?.addEventListener(
        "click",
        function () {

            if (
                window.innerWidth <= 900
            ) {

                return;

            }


            const isClosed =
                adminLayout.classList.contains(
                    "sidebar-collapsed"
                );


            if (
                isClosed
            ) {

                openAdminDesktopSidebar();

            } else {

                closeAdminDesktopSidebar();

            }

        }
    );


    /*
       Mobile open
    */

    mobileSidebarToggle?.addEventListener(
        "click",
        function () {

            if (
                window.innerWidth > 900
            ) {

                return;

            }


            adminSidebar.classList.add(
                "open"
            );

        }
    );


    /*
       Mobile close
    */

    sidebarMobileClose?.addEventListener(
        "click",
        function () {

            if (
                window.innerWidth > 900
            ) {

                return;

            }


            adminSidebar.classList.remove(
                "open"
            );

        }
    );


    /*
       Close after navigation
    */

    document
        .querySelectorAll(
            ".admin-nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        if (
                            window.innerWidth <=
                            900
                        ) {

                            adminSidebar.classList.remove(
                                "open"
                            );

                        }

                    }
                );

            }
        );


    /*
       Resize
    */

    window.addEventListener(
        "resize",
        handleAdminSidebarResize
    );

}


/* =========================================================
   OPEN DESKTOP SIDEBAR
========================================================= */

function openAdminDesktopSidebar() {

    if (
        !adminLayout
    ) {

        return;

    }


    adminLayout.classList.remove(
        "sidebar-collapsed"
    );


    updateAdminDesktopToggle(
        false
    );

}


/* =========================================================
   CLOSE DESKTOP SIDEBAR
========================================================= */

function closeAdminDesktopSidebar() {

    if (
        !adminLayout
    ) {

        return;

    }


    adminLayout.classList.add(
        "sidebar-collapsed"
    );


    updateAdminDesktopToggle(
        true
    );

}


/* =========================================================
   DESKTOP TOGGLE ICON
========================================================= */

function updateAdminDesktopToggle(
    closed
) {

    if (
        !sidebarToggleBtn
    ) {

        return;

    }


    const icon =
        sidebarToggleBtn.querySelector(
            "i"
        );


    if (
        !icon
    ) {

        return;

    }


    if (
        closed
    ) {

        icon.classList.remove(
            "fa-xmark"
        );

        icon.classList.add(
            "fa-bars"
        );

        sidebarToggleBtn.setAttribute(
            "aria-label",
            "Open sidebar"
        );

        sidebarToggleBtn.setAttribute(
            "title",
            "Open sidebar"
        );

    } else {

        icon.classList.remove(
            "fa-bars"
        );

        icon.classList.add(
            "fa-xmark"
        );

        sidebarToggleBtn.setAttribute(
            "aria-label",
            "Close sidebar"
        );

        sidebarToggleBtn.setAttribute(
            "title",
            "Close sidebar"
        );

    }

}


/* =========================================================
   SIDEBAR RESIZE
========================================================= */

function handleAdminSidebarResize() {

    if (
        !adminLayout ||
        !adminSidebar
    ) {

        return;

    }


    /*
       Mobile / Tablet
    */

    if (
        window.innerWidth <= 900
    ) {

        adminLayout.classList.remove(
            "sidebar-collapsed"
        );

        adminSidebar.classList.remove(
            "open"
        );

        return;

    }


    /*
       Desktop
    */

    adminSidebar.classList.remove(
        "open"
    );


    const closed =
        adminLayout.classList.contains(
            "sidebar-collapsed"
        );


    updateAdminDesktopToggle(
        closed
    );

}


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    archivedCustomers =
        readArray(
            ARCHIVED_CUSTOMERS_KEY
        );

    orders =
        readArray(
            ORDERS_KEY
        );

}


/* =========================================================
   BUILD CUSTOMER RECORDS
========================================================= */

function buildArchivedCustomerRecords() {

    const map =
        new Map();


    /*
       Archived customer snapshots
    */

    archivedCustomers.forEach(
        archived => {

            if (
                !archived ||
                typeof archived !== "object"
            ) {

                return;

            }


            if (
                !archived.key
            ) {

                return;

            }


            map.set(
                archived.key,
                {

                    key:
                        archived.key,

                    name:
                        archived.name ||
                        "Customer",

                    email:
                        archived.email ||
                        "",

                    phone:
                        archived.phone ||
                        "",

                    address:
                        archived.address ||
                        "",

                    city:
                        archived.city ||
                        "",

                    postal:
                        archived.postal ||
                        "",

                    country:
                        archived.country ||
                        "",

                    archivedAt:
                        archived.archivedAt ||
                        null,

                    archivedBy:
                        archived.archivedBy ||
                        "Admin",

                    orders: [],

                    totalSpent: 0,

                    lastOrder: null

                }
            );

        }
    );


    /*
       Attach active orders
    */

    orders.forEach(
        order => {

            if (
                !order ||
                typeof order !== "object"
            ) {

                return;

            }


            const customer =
                order.customer || {};


            const key =
                createCustomerKey(
                    customer
                );


            if (
                !key
            ) {

                return;

            }


            const archivedCustomer =
                map.get(key);


            if (
                !archivedCustomer
            ) {

                return;

            }


            archivedCustomer.orders.push(
                order
            );


            archivedCustomer.totalSpent +=
                Number(
                    order.total
                ) || 0;


            if (
                !archivedCustomer.lastOrder
            ) {

                archivedCustomer.lastOrder =
                    order;

            } else {

                const currentTime =
                    new Date(
                        archivedCustomer
                            .lastOrder
                            ?.createdAt || 0
                    ).getTime();


                const newTime =
                    new Date(
                        order?.createdAt || 0
                    ).getTime();


                if (
                    newTime > currentTime
                ) {

                    archivedCustomer.lastOrder =
                        order;

                }

            }

        }
    );


    /*
       Latest archived first
    */

    archivedCustomerRecords =
        [...map.values()].sort(
            (a, b) => {

                const aTime =
                    new Date(
                        a?.archivedAt || 0
                    ).getTime();


                const bTime =
                    new Date(
                        b?.archivedAt || 0
                    ).getTime();


                return bTime - aTime;

            }
        );

}


/* =========================================================
   CUSTOMER KEY
========================================================= */

function createCustomerKey(
    customer
) {

    const email =
        String(
            customer?.email || ""
        )
            .trim()
            .toLowerCase();


    const phone =
        String(
            customer?.phone || ""
        )
            .replace(
                /\D/g,
                ""
            );


    const name =
        String(
            customer?.name || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            );


    if (
        email
    ) {

        return `email:${email}`;

    }


    if (
        phone
    ) {

        return `phone:${phone}`;

    }


    if (
        name
    ) {

        return `name:${name}`;

    }


    return "";

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total =
        archivedCustomerRecords.length;


    let totalOrders = 0;


    archivedCustomerRecords.forEach(
        customer => {

            totalOrders +=
                customer.orders.length;

        }
    );


    if (
        archivedCustomerCount
    ) {

        archivedCustomerCount.textContent =
            total;

    }


    if (
        archivedCustomerOrders
    ) {

        archivedCustomerOrders.textContent =
            totalOrders;

    }

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredRecords() {

    const query =
        String(
            archivedCustomerSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    return archivedCustomerRecords.filter(
        customer => {

            if (
                !query
            ) {

                return true;

            }


            const name =
                String(
                    customer.name || ""
                )
                    .toLowerCase();


            const email =
                String(
                    customer.email || ""
                )
                    .toLowerCase();


            const phone =
                String(
                    customer.phone || ""
                )
                    .toLowerCase();


            return (
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query)
            );

        }
    );

}


/* =========================================================
   RENDER
========================================================= */

function renderArchivedCustomers() {

    const list =
        getFilteredRecords();


    /*
       Desktop
    */

    if (
        archivedCustomersBody
    ) {

        archivedCustomersBody.innerHTML =
            list
                .map(
                    createDesktopRow
                )
                .join("");

    }


    /*
       Mobile
    */

    if (
        archivedCustomersMobile
    ) {

        archivedCustomersMobile.innerHTML =
            list
                .map(
                    createMobileCard
                )
                .join("");

    }


    bindActions();


    /*
       Empty state
    */

    if (
        list.length === 0
    ) {

        archivedCustomersEmpty?.classList.add(
            "show"
        );

    } else {

        archivedCustomersEmpty?.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   DESKTOP ROW
========================================================= */

function createDesktopRow(
    customer
) {

    return `

        <tr>

            <td>

                <div class="customer-cell">

                    <div class="avatar">

                        ${escapeHTML(
                            getInitials(
                                customer.name
                            )
                        )}

                    </div>


                    <div>

                        <span class="customer-name">

                            ${escapeHTML(
                                customer.name
                            )}

                        </span>


                        <span class="customer-email">

                            ${escapeHTML(
                                customer.email ||
                                "No email"
                            )}

                        </span>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHTML(
                    customer.phone ||
                    "—"
                )}

            </td>


            <td>

                <span class="orders-count">

                    ${customer.orders.length}

                </span>

            </td>


            <td>

                <strong>

                    ${formatMoney(
                        customer.totalSpent
                    )}

                </strong>

            </td>


            <td>

                <span class="muted-date">

                    ${escapeHTML(
                        formatDate(
                            customer
                                ?.lastOrder
                                ?.createdAt
                        )
                    )}

                </span>

            </td>


            <td>

                <span class="muted-date">

                    ${escapeHTML(
                        formatDateTime(
                            customer.archivedAt
                        )
                    )}

                </span>

            </td>


            <td>

                <div class="action-group">

                    <button
                        type="button"
                        class="action-btn"
                        data-view-archived="${escapeHTML(
                            customer.key
                        )}"
                    >

                        <i class="fa-regular fa-eye"></i>

                        View

                    </button>


                    <button
                        type="button"
                        class="action-btn restore"
                        data-restore-customer="${escapeHTML(
                            customer.key
                        )}"
                    >

                        <i class="fa-solid fa-rotate-left"></i>

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
    customer
) {

    return `

        <article class="mobile-card">

            <div class="mobile-card-top">

                <div class="mobile-main">

                    <div class="avatar">

                        ${escapeHTML(
                            getInitials(
                                customer.name
                            )
                        )}

                    </div>


                    <div>

                        <strong>

                            ${escapeHTML(
                                customer.name
                            )}

                        </strong>


                        <span>

                            ${escapeHTML(
                                customer.email ||
                                "No email"
                            )}

                        </span>

                    </div>

                </div>


                <span class="status-badge">

                    Archived

                </span>

            </div>


            <div class="mobile-meta">

                <div>

                    <small>
                        ORDERS
                    </small>

                    <strong>

                        ${customer.orders.length}

                    </strong>

                </div>


                <div>

                    <small>
                        TOTAL SPENT
                    </small>

                    <strong>

                        ${formatMoney(
                            customer.totalSpent
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
                                customer.archivedAt
                            )
                        )}

                    </strong>

                </div>

            </div>


            <div class="mobile-actions">

                <button
                    type="button"
                    class="action-btn"
                    data-view-archived="${escapeHTML(
                        customer.key
                    )}"
                >

                    <i class="fa-regular fa-eye"></i>

                    View

                </button>


                <button
                    type="button"
                    class="action-btn restore"
                    data-restore-customer="${escapeHTML(
                        customer.key
                    )}"
                >

                    <i class="fa-solid fa-rotate-left"></i>

                    Restore

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   ACTION BINDING
========================================================= */

function bindActions() {

    document
        .querySelectorAll(
            "[data-view-archived]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const key =
                            button.getAttribute(
                                "data-view-archived"
                            );


                        openDetails(key);

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-restore-customer]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const key =
                            button.getAttribute(
                                "data-restore-customer"
                            );


                        openRestoreModal(key);

                    }
                );

            }
        );

}


/* =========================================================
   DETAILS MODAL
========================================================= */

function openDetails(
    customerKey
) {

    const customer =
        archivedCustomerRecords.find(
            item =>
                item.key === customerKey
        );


    if (
        !customer
    ) {

        showToast(
            "Archived customer not found.",
            true
        );

        return;

    }


    if (
        archivedDetailsTitle
    ) {

        archivedDetailsTitle.textContent =
            customer.name;

    }


    const sortedOrders =
        [...customer.orders].sort(
            (a, b) => {

                const aTime =
                    new Date(
                        a?.createdAt || 0
                    ).getTime();


                const bTime =
                    new Date(
                        b?.createdAt || 0
                    ).getTime();


                return bTime - aTime;

            }
        );


    if (
        archivedDetailsBody
    ) {

        archivedDetailsBody.innerHTML = `

            <div class="profile-head">

                <div class="profile-avatar">

                    ${escapeHTML(
                        getInitials(
                            customer.name
                        )
                    )}

                </div>


                <div>

                    <h4>

                        ${escapeHTML(
                            customer.name
                        )}

                    </h4>


                    <p>

                        ${escapeHTML(
                            customer.email ||
                            "No email"
                        )}

                    </p>

                </div>

            </div>


            <div class="detail-stats">

                <div class="detail-stat">

                    <span>
                        TOTAL ORDERS
                    </span>


                    <strong>

                        ${customer.orders.length}

                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        TOTAL SPENT
                    </span>


                    <strong>

                        ${formatMoney(
                            customer.totalSpent
                        )}

                    </strong>

                </div>


                <div class="detail-stat">

                    <span>
                        ARCHIVED
                    </span>


                    <strong>

                        ${escapeHTML(
                            formatDateTime(
                                customer.archivedAt
                            )
                        )}

                    </strong>

                </div>

            </div>


            <section class="detail-section">

                <h4>
                    Customer Information
                </h4>


                <div class="info-grid">

                    ${createInfoItem(
                        "NAME",
                        customer.name
                    )}

                    ${createInfoItem(
                        "EMAIL",
                        customer.email
                    )}

                    ${createInfoItem(
                        "PHONE",
                        customer.phone
                    )}

                    ${createInfoItem(
                        "ADDRESS",
                        customer.address
                    )}

                    ${createInfoItem(
                        "CITY / DISTRICT",
                        customer.city
                    )}

                    ${createInfoItem(
                        "POSTAL CODE",
                        customer.postal
                    )}

                    ${createInfoItem(
                        "COUNTRY",
                        customer.country
                    )}

                    ${createInfoItem(
                        "ARCHIVED BY",
                        customer.archivedBy ||
                        "Admin"
                    )}

                </div>

            </section>


            <section class="detail-section">

                <h4>
                    Order History
                </h4>


                <div class="order-history">

                    ${
                        sortedOrders.length

                            ? sortedOrders
                                .map(
                                    order => `

                                        <div class="order-row">

                                            <strong>

                                                ${escapeHTML(
                                                    order?.orderId ||
                                                    order?.id ||
                                                    "—"
                                                )}

                                            </strong>


                                            <span>

                                                ${escapeHTML(
                                                    formatStatus(
                                                        order?.status
                                                    )
                                                )}

                                            </span>


                                            <b>

                                                ${formatMoney(
                                                    order?.total
                                                )}

                                            </b>

                                        </div>

                                    `
                                )
                                .join("")

                            : `

                                <div class="no-orders">

                                    No orders found.

                                </div>

                            `
                    }

                </div>

            </section>


            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    margin-top:16px;
                "
            >

                <button
                    type="button"
                    class="action-btn restore"
                    data-detail-restore="${escapeHTML(
                        customer.key
                    )}"
                >

                    <i class="fa-solid fa-rotate-left"></i>

                    Restore Customer

                </button>

            </div>

        `;


        const detailRestoreButton =
            archivedDetailsBody.querySelector(
                "[data-detail-restore]"
            );


        detailRestoreButton?.addEventListener(
            "click",
            () => {

                closeDetails();

                openRestoreModal(
                    customer.key
                );

            }
        );

    }


    archivedCustomerDetailsModal?.classList.add(
        "show"
    );


    archivedCustomerDetailsModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   INFO ITEM
========================================================= */

function createInfoItem(
    label,
    value
) {

    return `

        <div class="info-item">

            <span>
                ${escapeHTML(label)}
            </span>


            <strong>

                ${escapeHTML(
                    value || "—"
                )}

            </strong>

        </div>

    `;

}


/* =========================================================
   RESTORE MODAL
========================================================= */

function openRestoreModal(
    customerKey
) {

    const customer =
        archivedCustomerRecords.find(
            item =>
                item.key === customerKey
        );


    if (
        !customer
    ) {

        showToast(
            "Archived customer not found.",
            true
        );

        return;

    }


    selectedRestoreKey =
        customerKey;


    if (
        restoreCustomerMessage
    ) {

        restoreCustomerMessage.textContent =
            `Restore ${
                customer.name
            } back to the active customer directory?`;

    }


    restoreCustomerModal?.classList.add(
        "show"
    );


    restoreCustomerModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CONFIRM RESTORE
========================================================= */

confirmRestoreCustomer?.addEventListener(
    "click",
    () => {

        if (
            !selectedRestoreKey
        ) {

            return;

        }


        loadData();


        const archiveIndex =
            archivedCustomers.findIndex(
                customer =>
                    customer?.key ===
                    selectedRestoreKey
            );


        if (
            archiveIndex === -1
        ) {

            showToast(
                "Archived customer not found.",
                true
            );

            closeRestoreModal();

            return;

        }


        const restoredCustomer =
            archivedCustomers[
                archiveIndex
            ];


        const now =
            new Date().toISOString();


        /*
           Add restore audit to related orders.
        */

        orders.forEach(
            order => {

                const key =
                    createCustomerKey(
                        order?.customer || {}
                    );


                if (
                    key !==
                    selectedRestoreKey
                ) {

                    return;

                }


                if (
                    !Array.isArray(
                        order.statusAuditLog
                    )
                ) {

                    order.statusAuditLog =
                        [];

                }


                order.statusAuditLog.push({

                    type:
                        "customer-restore",

                    changedAt:
                        now,

                    changedBy:
                        "Admin",

                    changeType:
                        "customer-restore",

                    reason:
                        "Customer restored from archive"

                });


                order.updatedAt =
                    now;

            }
        );


        /*
           Remove from archive.
        */

        archivedCustomers.splice(
            archiveIndex,
            1
        );


        /*
           Save archive.
        */

        localStorage.setItem(
            ARCHIVED_CUSTOMERS_KEY,
            JSON.stringify(
                archivedCustomers
            )
        );


        /*
           Save orders.
        */

        localStorage.setItem(
            ORDERS_KEY,
            JSON.stringify(
                orders
            )
        );


        closeRestoreModal();


        /*
           Rebuild page.
        */

        loadData();

        buildArchivedCustomerRecords();

        updateStats();

        renderArchivedCustomers();

        saveStorageSnapshot();


        showToast(
            `${
                restoredCustomer.name ||
                "Customer"
            } restored successfully.`
        );

    }
);


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetails() {

    archivedCustomerDetailsModal?.classList.remove(
        "show"
    );


    archivedCustomerDetailsModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !restoreCustomerModal?.classList.contains(
            "show"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   CLOSE RESTORE
========================================================= */

function closeRestoreModal() {

    restoreCustomerModal?.classList.remove(
        "show"
    );


    restoreCustomerModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedRestoreKey =
        "";


    if (
        !archivedCustomerDetailsModal?.classList.contains(
            "show"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   PAGE EVENTS
========================================================= */

function setupEvents() {

    /*
       ADMIN TOPBAR REFRESH
    */

    adminPageRefresh?.addEventListener(
        "click",
        async () => {

            adminPageRefresh.disabled =
                true;


            const icon =
                adminPageRefresh.querySelector(
                    "i"
                );


            icon?.classList.add(
                "fa-spin"
            );


            syncArchivedCustomers(
                true
            );


            setTimeout(
                () => {

                    icon?.classList.remove(
                        "fa-spin"
                    );


                    adminPageRefresh.disabled =
                        false;

                },
                350
            );

        }
    );


    /*
       Archive panel refresh
    */

    refreshArchivedCustomers?.addEventListener(
        "click",
        () => {

            syncArchivedCustomers(
                true
            );

        }
    );


    /*
       Search
    */

    archivedCustomerSearch?.addEventListener(
        "input",
        renderArchivedCustomers
    );


    /*
       Details modal
    */

    archivedDetailsOverlay?.addEventListener(
        "click",
        closeDetails
    );


    archivedDetailsClose?.addEventListener(
        "click",
        closeDetails
    );


    /*
       Restore modal
    */

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


    /*
       Escape
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeDetails();

                closeRestoreModal();

            }

        }
    );

}


/* =========================================================
   STORAGE AUTO SYNC
========================================================= */


/*
   Cross-tab
*/

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
                ARCHIVED_CUSTOMERS_KEY ||
            event.key ===
                ORDERS_KEY
        ) {

            syncArchivedCustomers(
                false
            );

        }

    }
);


/*
   Visibility
*/

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            syncArchivedCustomers(
                false
            );

        }

    }
);


/*
   Focus
*/

window.addEventListener(
    "focus",
    () => {

        syncArchivedCustomers(
            false
        );

    }
);


/*
   Pageshow
*/

window.addEventListener(
    "pageshow",
    () => {

        syncArchivedCustomers(
            false
        );

    }
);


/*
   Safety polling
*/

setInterval(
    () => {

        const currentSnapshot =
            createStorageSnapshot();


        if (
            currentSnapshot !==
            lastStorageSnapshot
        ) {

            syncArchivedCustomers(
                false
            );

        }

    },
    1000
);


/* =========================================================
   SYNC
========================================================= */

function syncArchivedCustomers(
    force = false
) {

    const newSnapshot =
        createStorageSnapshot();


    if (
        !force &&
        newSnapshot ===
            lastStorageSnapshot
    ) {

        return;

    }


    loadData();

    buildArchivedCustomerRecords();

    updateStats();

    renderArchivedCustomers();

    saveStorageSnapshot();

}


/* =========================================================
   STORAGE SNAPSHOT
========================================================= */

function createStorageSnapshot() {

    const archivedRaw =
        localStorage.getItem(
            ARCHIVED_CUSTOMERS_KEY
        ) ||
        "[]";


    const ordersRaw =
        localStorage.getItem(
            ORDERS_KEY
        ) ||
        "[]";


    return (
        archivedRaw +
        "||" +
        ordersRaw
    );

}


function saveStorageSnapshot() {

    lastStorageSnapshot =
        createStorageSnapshot();

}


/* =========================================================
   DATE
========================================================= */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    const date =
        new Date(value);


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
            year: "numeric"
        }
    ).format(date);

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
        new Date(value);


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
    ).format(date);

}


/* =========================================================
   STATUS
========================================================= */

function formatStatus(
    value
) {

    const status =
        String(
            value || ""
        )
            .trim()
            .toLowerCase();


    if (
        status === "processing"
    ) {

        return "Processing";

    }


    if (
        status === "shipped"
    ) {

        return "Shipped";

    }


    if (
        status === "out for delivery"
    ) {

        return "Out for Delivery";

    }


    if (
        status === "delivered"
    ) {

        return "Delivered";

    }


    return "Order Placed";

}


/* =========================================================
   MONEY
========================================================= */

function formatMoney(
    value
) {

    const amount =
        Number(value) || 0;


    return `$${amount.toFixed(2)}`;

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    const parts =
        String(
            name || "Guest"
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 0
    ) {

        return "G";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[
            parts.length - 1
        ].charAt(0)
    ).toUpperCase();

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
   READ ARRAY
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
            JSON.parse(raw);


        return Array.isArray(
            parsed
        )
            ? parsed
            : [];

    } catch (
        error
    ) {

        console.error(
            `Failed to read localStorage key: ${key}`,
            error
        );


        return [];

    }

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
            "archivedCustomerToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "archivedCustomerToast";


        toast.style.cssText = `

            position: fixed;

            right: 20px;

            bottom: 20px;

            z-index: 11000;

            max-width: 330px;

            padding: 13px 16px;

            border-radius: 9px;

            background: ${
                isError
                    ? "#c74444"
                    : "#15213b"
            };

            color: #ffffff;

            font-size: 10px;

            font-weight: 800;

            box-shadow:
                0 15px 40px
                rgba(
                    15,
                    23,
                    42,
                    .20
                );

        `;


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        window.__archivedCustomerToastTimer
    );


    window.__archivedCustomerToastTimer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

            },
            2500
        );

}


/* =========================================================
   END
========================================================= */