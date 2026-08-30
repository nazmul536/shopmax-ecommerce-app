"use strict";

/* =========================================================
   SHOPMAX - ARCHIVED CUSTOMERS
   =========================================================

   PURPOSE:
   - Read archived customer snapshots
   - Display archived customers
   - Show customer details
   - Restore customer
   - Auto-sync when localStorage changes

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
   DOM - STATS
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
   DOM - SEARCH / TABLE
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
   DOM - DETAILS MODAL
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
   DOM - RESTORE MODAL
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

    saveStorageSnapshot();

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
   BUILD ARCHIVED CUSTOMER RECORDS
========================================================= */

function buildArchivedCustomerRecords() {

    const map =
        new Map();


    /*
       ------------------------------------------------------
       STEP 1
       Read archived customer snapshots
       ------------------------------------------------------
    */

    archivedCustomers.forEach(
        archived => {

            if (
                !archived ||
                typeof archived !==
                    "object"
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

                    orders:
                        [],

                    totalSpent:
                        0,

                    lastOrder:
                        null

                }
            );

        }
    );


    /*
       ------------------------------------------------------
       STEP 2
       Connect active orders to archived customer
       ------------------------------------------------------

       IMPORTANT:

       Archiving a customer does NOT archive orders.

       So their orders remain inside:

       shopmax-orders

       We only read them here to show:
       - order count
       - total spent
       - last order
    */

    orders.forEach(
        order => {

            if (
                !order ||
                typeof order !==
                    "object"
            ) {

                return;

            }


            const customer =
                order.customer ||
                {};


            const key =
                createCustomerKey(
                    customer
                );


            if (!key) {

                return;

            }


            const archivedCustomer =
                map.get(
                    key
                );


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
                ) ||
                0;


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
                            ?.createdAt ||
                        0
                    ).getTime();


                const newTime =
                    new Date(
                        order?.createdAt ||
                        0
                    ).getTime();


                if (
                    newTime >
                    currentTime
                ) {

                    archivedCustomer.lastOrder =
                        order;

                }

            }

        }
    );


    /*
       ------------------------------------------------------
       STEP 3
       Latest archived first
       ------------------------------------------------------
    */

    archivedCustomerRecords =
        [...map.values()]
            .sort(
                (
                    a,
                    b
                ) => {

                    const aTime =
                        new Date(
                            a?.archivedAt ||
                            0
                        ).getTime();


                    const bTime =
                        new Date(
                            b?.archivedAt ||
                            0
                        ).getTime();


                    return (
                        bTime -
                        aTime
                    );

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
            customer?.email ||
            ""
        )
            .trim()
            .toLowerCase();


    const phone =
        String(
            customer?.phone ||
            ""
        )
            .replace(
                /\D/g,
                ""
            );


    const name =
        String(
            customer?.name ||
            ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            );


    /*
       SAME IDENTIFICATION RULE
       AS customers.js
    */

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
                    customer.name ||
                    ""
                )
                    .toLowerCase();


            const email =
                String(
                    customer.email ||
                    ""
                )
                    .toLowerCase();


            const phone =
                String(
                    customer.phone ||
                    ""
                )
                    .toLowerCase();


            return (
                name.includes(
                    query
                )
                ||
                email.includes(
                    query
                )
                ||
                phone.includes(
                    query
                )
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
       Desktop table
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
       Mobile cards
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
        list.length ===
        0
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

                <div
                    class="customer-cell"
                >

                    <div
                        class="avatar"
                    >

                        ${escapeHTML(
                            getInitials(
                                customer.name
                            )
                        )}

                    </div>


                    <div>

                        <span
                            class="
                                customer-name
                            "
                        >

                            ${escapeHTML(
                                customer.name
                            )}

                        </span>


                        <span
                            class="
                                customer-email
                            "
                        >

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

                <span
                    class="
                        orders-count
                    "
                >

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

                <span
                    class="
                        muted-date
                    "
                >

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

                <span
                    class="
                        muted-date
                    "
                >

                    ${escapeHTML(
                        formatDateTime(
                            customer.archivedAt
                        )
                    )}

                </span>

            </td>


            <td>

                <div
                    class="
                        action-group
                    "
                >

                    <button
                        type="button"
                        class="action-btn"
                        data-view-archived="${escapeHTML(
                            customer.key
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
                        data-restore-customer="${escapeHTML(
                            customer.key
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
    customer
) {

    return `

        <article
            class="
                mobile-card
            "
        >

            <div
                class="
                    mobile-card-top
                "
            >

                <div
                    class="
                        mobile-main
                    "
                >

                    <div
                        class="avatar"
                    >

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


                <span
                    class="
                        status-badge
                    "
                >

                    Archived

                </span>

            </div>


            <div
                class="
                    mobile-meta
                "
            >

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


            <div
                class="
                    mobile-actions
                "
            >

                <button
                    type="button"
                    class="action-btn"
                    data-view-archived="${escapeHTML(
                        customer.key
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
                    data-restore-customer="${escapeHTML(
                        customer.key
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


                        openDetails(
                            key
                        );

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


                        openRestoreModal(
                            key
                        );

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
                item.key ===
                customerKey
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
        [...customer.orders]
            .sort(
                (
                    a,
                    b
                ) => {

                    const aTime =
                        new Date(
                            a?.createdAt ||
                            0
                        ).getTime();


                    const bTime =
                        new Date(
                            b?.createdAt ||
                            0
                        ).getTime();


                    return (
                        bTime -
                        aTime
                    );

                }
            );


    if (
        archivedDetailsBody
    ) {

        archivedDetailsBody.innerHTML = `

            <div
                class="
                    profile-head
                "
            >

                <div
                    class="
                        profile-avatar
                    "
                >

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


            <div
                class="
                    detail-stats
                "
            >

                <div
                    class="
                        detail-stat
                    "
                >

                    <span>
                        TOTAL ORDERS
                    </span>


                    <strong>

                        ${customer.orders.length}

                    </strong>

                </div>


                <div
                    class="
                        detail-stat
                    "
                >

                    <span>
                        TOTAL SPENT
                    </span>


                    <strong>

                        ${formatMoney(
                            customer.totalSpent
                        )}

                    </strong>

                </div>


                <div
                    class="
                        detail-stat
                    "
                >

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


            <section
                class="
                    detail-section
                "
            >

                <h4>
                    Customer Information
                </h4>


                <div
                    class="
                        info-grid
                    "
                >

                    <div
                        class="
                            info-item
                        "
                    >

                        <span>
                            NAME
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
                            info-item
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
                            info-item
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
                            info-item
                        "
                    >

                        <span>
                            ADDRESS
                        </span>


                        <strong>

                            ${escapeHTML(
                                customer.address ||
                                "—"
                            )}

                        </strong>

                    </div>


                    <div
                        class="
                            info-item
                        "
                    >

                        <span>
                            CITY / DISTRICT
                        </span>


                        <strong>

                            ${escapeHTML(
                                customer.city ||
                                "—"
                            )}

                        </strong>

                    </div>


                    <div
                        class="
                            info-item
                        "
                    >

                        <span>
                            POSTAL CODE
                        </span>


                        <strong>

                            ${escapeHTML(
                                customer.postal ||
                                "—"
                            )}

                        </strong>

                    </div>


                    <div
                        class="
                            info-item
                        "
                    >

                        <span>
                            COUNTRY
                        </span>


                        <strong>

                            ${escapeHTML(
                                customer.country ||
                                "—"
                            )}

                        </strong>

                    </div>


                    <div
                        class="
                            info-item
                        "
                    >

                        <span>
                            ARCHIVED BY
                        </span>


                        <strong>

                            ${escapeHTML(
                                customer.archivedBy ||
                                "Admin"
                            )}

                        </strong>

                    </div>

                </div>

            </section>


            <section
                class="
                    detail-section
                "
            >

                <h4>
                    Order History
                </h4>


                <div
                    class="
                        order-history
                    "
                >

                    ${
                        sortedOrders.length

                            ? sortedOrders
                                .map(
                                    order => `

                                        <div
                                            class="
                                                order-row
                                            "
                                        >

                                            <strong>

                                                ${escapeHTML(
                                                    order?.orderId ||
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

                                <div
                                    class="
                                        no-orders
                                    "
                                >

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
                    class="
                        action-btn
                        restore
                    "
                    data-detail-restore="${escapeHTML(
                        customer.key
                    )}"
                >

                    <i
                        class="
                            fa-solid
                            fa-rotate-left
                        "
                    ></i>

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
   RESTORE MODAL
========================================================= */

function openRestoreModal(
    customerKey
) {

    const customer =
        archivedCustomerRecords.find(
            item =>
                item.key ===
                customerKey
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
   RESTORE CUSTOMER
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


        /*
           Find archived customer.
        */

        const archiveIndex =
            archivedCustomers.findIndex(
                customer =>
                    customer?.key ===
                    selectedRestoreKey
            );


        if (
            archiveIndex ===
            -1
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
           --------------------------------------------------
           Add restore audit to related orders.
           Orders themselves are NOT modified otherwise.
           --------------------------------------------------
        */

        orders.forEach(
            order => {

                const key =
                    createCustomerKey(
                        order?.customer ||
                        {}
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
           Remove customer from archive.
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
           Save updated orders.
        */

        localStorage.setItem(
            ORDERS_KEY,
            JSON.stringify(
                orders
            )
        );


        /*
           Close restore modal.
        */

        closeRestoreModal();


        /*
           Reload page data.
        */

        loadData();

        buildArchivedCustomerRecords();

        updateStats();

        renderArchivedCustomers();

        saveStorageSnapshot();


        /*
           Show confirmation.
        */

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
       Search
    */

    archivedCustomerSearch?.addEventListener(
        "input",
        renderArchivedCustomers
    );


    /*
       Refresh
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
       Escape key
    */

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


    /*
       Global header search
    */

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
   STORAGE AUTO SYNC
========================================================= */


/*
   ----------------------------------------------------------
   A) Cross-tab storage event
   ----------------------------------------------------------

   Example:

   Tab 1:
   customers.html

   Tab 2:
   archivedCustomers.html

   Archive customer in Tab 1.

   Browser fires "storage" event in Tab 2.
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
   ----------------------------------------------------------
   B) Page becomes visible
   ----------------------------------------------------------

   Useful when switching back to the archive tab.
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
   ----------------------------------------------------------
   C) Window focus
   ----------------------------------------------------------
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
   ----------------------------------------------------------
   D) pageshow
   ----------------------------------------------------------
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
   ----------------------------------------------------------
   E) Safety polling

   Every 1000ms we compare localStorage snapshot.

   This is intentionally lightweight.
   It makes the archive page update even when a
   browser/environment does not behave perfectly
   with storage events.
   ----------------------------------------------------------
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
   SYNC FUNCTION
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
   STATUS
========================================================= */

function formatStatus(
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

        return "Processing";

    }


    if (
        status ===
        "shipped"
    ) {

        return "Shipped";

    }


    if (
        status ===
        "out for delivery"
    ) {

        return "Out for Delivery";

    }


    if (
        status ===
        "delivered"
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
        Number(
            value
        ) ||
        0;


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
        parts.length ===
        0
    ) {

        return "G";

    }


    if (
        parts.length ===
        1
    ) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0]
            .charAt(0)
        +
        parts[
            parts.length -
            1
        ]
            .charAt(0)
    )
        .toUpperCase();

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
            JSON.parse(
                raw
            );


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

            position:fixed;

            right:20px;

            bottom:20px;

            z-index:11000;

            max-width:330px;

            padding:13px 16px;

            border-radius:9px;

            background:${
                isError
                    ? "#c74444"
                    : "#15213b"
            };

            color:#ffffff;

            font-size:10px;

            font-weight:800;

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