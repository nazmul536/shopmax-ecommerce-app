"use strict";

/* =========================================================
   SHOPMAX - CUSTOMER MANAGEMENT
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const ORDERS_KEY =
    "shopmax-orders";

const ARCHIVED_CUSTOMERS_KEY =
    "shopmax-archived-customers";


/* =========================================================
   STATE
========================================================= */

let orders = [];

let archivedCustomers = [];

let customers = [];

let selectedCustomerKey = "";

let selectedArchiveCustomerKey = "";


/* =========================================================
   DOM - STATS
========================================================= */

const totalCustomers =
    document.getElementById(
        "totalCustomers"
    );

const activeCustomers =
    document.getElementById(
        "activeCustomers"
    );

const customerOrderCount =
    document.getElementById(
        "customerOrderCount"
    );

const customerRevenue =
    document.getElementById(
        "customerRevenue"
    );


/* =========================================================
   DOM - CUSTOMER LIST
========================================================= */

const customerSearch =
    document.getElementById(
        "customerSearch"
    );

const customerFilter =
    document.getElementById(
        "customerFilter"
    );

const customersTableBody =
    document.getElementById(
        "customersTableBody"
    );

const mobileCustomers =
    document.getElementById(
        "mobileCustomers"
    );

const customerEmpty =
    document.getElementById(
        "customerEmpty"
    );

const refreshCustomersBtn =
    document.getElementById(
        "refreshCustomersBtn"
    );


/* =========================================================
   DOM - DETAILS MODAL
========================================================= */

const customerDetailsModal =
    document.getElementById(
        "customerDetailsModal"
    );

const customerModalOverlay =
    document.getElementById(
        "customerModalOverlay"
    );

const customerModalClose =
    document.getElementById(
        "customerModalClose"
    );

const customerModalTitle =
    document.getElementById(
        "customerModalTitle"
    );

const customerModalBody =
    document.getElementById(
        "customerModalBody"
    );


/* =========================================================
   DOM - EDIT MODAL
========================================================= */

const customerEditModal =
    document.getElementById(
        "customerEditModal"
    );

const customerEditForm =
    document.getElementById(
        "customerEditForm"
    );

const editCustomerIdentity =
    document.getElementById(
        "editCustomerIdentity"
    );


/* =========================================================
   DOM - ARCHIVE MODAL
========================================================= */

const customerArchiveModal =
    document.getElementById(
        "customerArchiveModal"
    );

const archiveCustomerText =
    document.getElementById(
        "archiveCustomerText"
    );

const confirmArchiveCustomer =
    document.getElementById(
        "confirmArchiveCustomer"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initCustomers
);


function initCustomers() {

    loadData();

    buildCustomers();

    updateStats();

    renderCustomers();

    setupEvents();

}


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    orders =
        readArray(
            ORDERS_KEY
        );


    archivedCustomers =
        readArray(
            ARCHIVED_CUSTOMERS_KEY
        );

}


/* =========================================================
   SAVE HELPERS
========================================================= */

function saveOrders() {

    localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(
            orders
        )
    );

}


function saveArchivedCustomers() {

    localStorage.setItem(
        ARCHIVED_CUSTOMERS_KEY,
        JSON.stringify(
            archivedCustomers
        )
    );

}


/* =========================================================
   BUILD CUSTOMER DIRECTORY
========================================================= */

function buildCustomers() {

    /*
       Always refresh archived records
       before building the customer list.
    */

    archivedCustomers =
        readArray(
            ARCHIVED_CUSTOMERS_KEY
        );


    const map =
        new Map();


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


            if (
                !map.has(
                    key
                )
            ) {

                map.set(
                    key,
                    {
                        key,

                        name:
                            customer.name ||
                            "Guest Customer",

                        email:
                            customer.email ||
                            "",

                        phone:
                            customer.phone ||
                            "",

                        address:
                            customer.address ||
                            order?.addressData?.formatted ||
                            "",

                        city:
                            customer.city ||
                            order?.addressData?.city ||
                            order?.addressData?.county ||
                            "",

                        postal:
                            customer.postal ||
                            customer.postalCode ||
                            order?.addressData?.postcode ||
                            "",

                        country:
                            customer.country ||
                            order?.addressData?.country ||
                            "",

                        orders: [],

                        totalSpent:
                            0,

                        lastOrder:
                            null,

                        archived:
                            isCustomerArchived(
                                key
                            )

                    }
                );

            }


            const record =
                map.get(
                    key
                );


            record.orders.push(
                order
            );


            record.totalSpent +=
                Number(
                    order?.total
                ) ||
                0;


            if (
                !record.lastOrder ||
                new Date(
                    order?.createdAt ||
                    0
                ).getTime() >
                new Date(
                    record.lastOrder?.createdAt ||
                    0
                ).getTime()
            ) {

                record.lastOrder =
                    order;

            }


            /*
               Keep the newest available
               customer information.
            */

            if (
                customer.name
            ) {

                record.name =
                    customer.name;

            }


            if (
                customer.email
            ) {

                record.email =
                    customer.email;

            }


            if (
                customer.phone
            ) {

                record.phone =
                    customer.phone;

            }


            if (
                customer.address
            ) {

                record.address =
                    customer.address;

            }


            if (
                customer.city
            ) {

                record.city =
                    customer.city;

            }


            if (
                customer.postal ||
                customer.postalCode
            ) {

                record.postal =
                    customer.postal ||
                    customer.postalCode;

            }


            if (
                customer.country
            ) {

                record.country =
                    customer.country;

            }

        }
    );


    /*
       Also include archived customers
       that no longer have an active order.
    */

    archivedCustomers.forEach(
        archived => {

            if (
                !archived ||
                !archived.key
            ) {

                return;

            }


            if (
                map.has(
                    archived.key
                )
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

                    orders: [],

                    totalSpent:
                        0,

                    lastOrder:
                        null,

                    archived:
                        true

                }
            );

        }
    );


    customers =
        [...map.values()]
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        b?.lastOrder?.createdAt ||
                        0
                    ).getTime()
                    -
                    new Date(
                        a?.lastOrder?.createdAt ||
                        0
                    ).getTime()
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
       Email is the strongest identifier.
    */

    if (
        email
    ) {

        return `email:${email}`;

    }


    /*
       Phone fallback.
    */

    if (
        phone
    ) {

        return `phone:${phone}`;

    }


    /*
       Name fallback.
    */

    if (
        name
    ) {

        return `name:${name}`;

    }


    return "";

}


/* =========================================================
   ARCHIVE CHECK
========================================================= */

function isCustomerArchived(
    key
) {

    return archivedCustomers.some(
        customer =>
            customer?.key ===
            key
    );

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total =
        customers.length;


    const active =
        customers.filter(
            customer =>
                !customer.archived
        ).length;


    const orderCount =
        orders.length;


    const revenue =
        orders.reduce(
            (
                totalValue,
                order
            ) =>
                totalValue +
                (
                    Number(
                        order?.total
                    ) ||
                    0
                ),
            0
        );


    if (
        totalCustomers
    ) {

        totalCustomers.textContent =
            total;

    }


    if (
        activeCustomers
    ) {

        activeCustomers.textContent =
            active;

    }


    if (
        customerOrderCount
    ) {

        customerOrderCount.textContent =
            orderCount;

    }


    if (
        customerRevenue
    ) {

        customerRevenue.textContent =
            formatMoney(
                revenue
            );

    }

}


/* =========================================================
   FILTER CUSTOMERS
========================================================= */

function getFilteredCustomers() {

    const query =
        String(
            customerSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const filter =
        customerFilter?.value ||
        "all";


    return customers.filter(
        customer => {

            /*
               Status filter
            */

            if (
                filter ===
                "active" &&
                customer.archived
            ) {

                return false;

            }


            if (
                filter ===
                "archived" &&
                !customer.archived
            ) {

                return false;

            }


            /*
               Search
            */

            if (
                !query
            ) {

                return true;

            }


            return (

                String(
                    customer.name ||
                    ""
                )
                    .toLowerCase()
                    .includes(
                        query
                    )

                ||

                String(
                    customer.email ||
                    ""
                )
                    .toLowerCase()
                    .includes(
                        query
                    )

                ||

                String(
                    customer.phone ||
                    ""
                )
                    .toLowerCase()
                    .includes(
                        query
                    )

            );

        }
    );

}


/* =========================================================
   RENDER
========================================================= */

function renderCustomers() {

    const list =
        getFilteredCustomers();


    if (
        customersTableBody
    ) {

        customersTableBody.innerHTML =
            list
                .map(
                    createDesktopRow
                )
                .join("");

    }


    if (
        mobileCustomers
    ) {

        mobileCustomers.innerHTML =
            list
                .map(
                    createMobileCard
                )
                .join("");

    }


    bindCustomerActions();


    if (
        list.length
    ) {

        customerEmpty?.classList.remove(
            "show"
        );

    } else {

        customerEmpty?.classList.add(
            "show"
        );

    }

}


/* =========================================================
   DESKTOP CUSTOMER ROW
========================================================= */

function createDesktopRow(
    customer
) {

    return `

        <tr>

            <td>

                <div
                    class="
                        customer-cell
                    "
                >

                    <div
                        class="
                            customer-avatar
                        "
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
                        customer-orders
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
                        customer-last-order
                    "
                >

                    ${escapeHTML(
                        formatShortDate(
                            customer?.lastOrder?.createdAt
                        )
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        customer-status
                        ${
                            customer.archived
                                ? "archived"
                                : ""
                        }
                    "
                >

                    ${
                        customer.archived
                            ? "Archived"
                            : "Active"
                    }

                </span>

            </td>


            <td>

                <div
                    class="
                        customer-actions
                    "
                >

                    <button
                        type="button"
                        class="action-btn"
                        data-view-customer="${escapeHTML(
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
                        class="action-btn"
                        data-edit-customer="${escapeHTML(
                            customer.key
                        )}"
                    >

                        <i
                            class="
                                fa-solid
                                fa-pen
                            "
                        ></i>

                        Edit

                    </button>


                    ${
                        customer.archived

                            ? ""

                            : `

                                <button
                                    type="button"
                                    class="
                                        action-btn
                                        danger
                                    "
                                    data-archive-customer="${escapeHTML(
                                        customer.key
                                    )}"
                                    title="Archive customer"
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-box-archive
                                        "
                                    ></i>

                                </button>

                            `
                    }

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   MOBILE CUSTOMER CARD
========================================================= */

function createMobileCard(
    customer
) {

    return `

        <article
            class="
                mobile-customer-card
            "
        >

            <div
                class="
                    mobile-customer-top
                "
            >

                <div
                    class="
                        mobile-customer-main
                    "
                >

                    <div
                        class="
                            customer-avatar
                        "
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
                        customer-status
                        ${
                            customer.archived
                                ? "archived"
                                : ""
                        }
                    "
                >

                    ${
                        customer.archived
                            ? "Archived"
                            : "Active"
                    }

                </span>

            </div>


            <div
                class="
                    mobile-customer-meta
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
                        SPENT
                    </small>


                    <strong>

                        ${formatMoney(
                            customer.totalSpent
                        )}

                    </strong>

                </div>


                <div>

                    <small>
                        LAST ORDER
                    </small>


                    <strong>

                        ${escapeHTML(
                            formatShortDate(
                                customer?.lastOrder?.createdAt
                            )
                        )}

                    </strong>

                </div>

            </div>


            <div
                class="
                    mobile-customer-actions
                "
            >

                <button
                    type="button"
                    class="action-btn"
                    data-view-customer="${escapeHTML(
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
                    class="action-btn"
                    data-edit-customer="${escapeHTML(
                        customer.key
                    )}"
                >

                    <i
                        class="
                            fa-solid
                            fa-pen
                        "
                    ></i>

                    Edit

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   BIND ACTIONS
========================================================= */

function bindCustomerActions() {

    document
        .querySelectorAll(
            "[data-view-customer]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openCustomerDetails(
                            button.getAttribute(
                                "data-view-customer"
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-edit-customer]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditCustomer(
                            button.getAttribute(
                                "data-edit-customer"
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-archive-customer]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openArchiveCustomer(
                            button.getAttribute(
                                "data-archive-customer"
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN CUSTOMER DETAILS
========================================================= */

function openCustomerDetails(
    customerKey
) {

    loadData();

    buildCustomers();


    const customer =
        customers.find(
            item =>
                item.key ===
                customerKey
        );


    if (
        !customer
    ) {

        showToast(
            "Customer not found.",
            true
        );

        return;

    }


    selectedCustomerKey =
        customerKey;


    if (
        customerModalTitle
    ) {

        customerModalTitle.textContent =
            customer.name;

    }


    const sortedOrders =
        [...customer.orders]
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
        customerModalBody
    ) {

        customerModalBody.innerHTML = `

            <div
                class="
                    customer-profile-head
                "
            >

                <div
                    class="
                        customer-profile-avatar
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
                    customer-detail-stats
                "
            >

                <div
                    class="
                        customer-detail-stat
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
                        customer-detail-stat
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
                        customer-detail-stat
                    "
                >

                    <span>
                        LAST ORDER
                    </span>


                    <strong>

                        ${escapeHTML(
                            formatShortDate(
                                customer?.lastOrder?.createdAt
                            )
                        )}

                    </strong>

                </div>

            </div>


            <section
                class="
                    customer-detail-section
                "
            >

                <h4>
                    Customer Information
                </h4>


                <div
                    class="
                        customer-info-grid
                    "
                >

                    <div
                        class="
                            customer-info-item
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
                            customer-info-item
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
                            customer-info-item
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
                            customer-info-item
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
                            customer-info-item
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
                            customer-info-item
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

                </div>

            </section>


            <section
                class="
                    customer-detail-section
                "
            >

                <h4>
                    Order History
                </h4>


                <div
                    class="
                        customer-orders-list
                    "
                >

                    ${
                        sortedOrders.length

                            ? sortedOrders
                                .map(
                                    order => `

                                        <div
                                            class="
                                                customer-order-row
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

        `;

    }


    customerDetailsModal?.classList.add(
        "show"
    );


    customerDetailsModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   OPEN EDIT CUSTOMER
========================================================= */

function openEditCustomer(
    customerKey
) {

    loadData();

    buildCustomers();


    const customer =
        customers.find(
            item =>
                item.key ===
                customerKey
        );


    if (
        !customer
    ) {

        return;

    }


    selectedCustomerKey =
        customerKey;


    if (
        editCustomerIdentity
    ) {

        editCustomerIdentity.textContent =
            `${customer.name} · ${
                customer.email ||
                "No email"
            }`;

    }


    if (
        customerEditForm
    ) {

        customerEditForm.elements.name.value =
            customer.name || "";

        customerEditForm.elements.email.value =
            customer.email || "";

        customerEditForm.elements.phone.value =
            customer.phone || "";

        customerEditForm.elements.address.value =
            customer.address || "";

        customerEditForm.elements.city.value =
            customer.city || "";

        customerEditForm.elements.postal.value =
            customer.postal || "";

    }


    customerEditModal?.classList.add(
        "show"
    );


    customerEditModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   SAVE CUSTOMER EDIT
========================================================= */

customerEditForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (
            !selectedCustomerKey
        ) {

            return;

        }


        loadData();

        buildCustomers();


        const customer =
            customers.find(
                item =>
                    item.key ===
                    selectedCustomerKey
            );


        if (
            !customer
        ) {

            showToast(
                "Customer not found.",
                true
            );

            return;

        }


        const formData =
            new FormData(
                customerEditForm
            );


        const newName =
            String(
                formData.get(
                    "name"
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


        const newPhone =
            String(
                formData.get(
                    "phone"
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


        if (
            !newName
        ) {

            showToast(
                "Customer name is required.",
                true
            );

            return;

        }


        const matchingOrders =
            orders.filter(
                order =>
                    createCustomerKey(
                        order?.customer ||
                        {}
                    ) ===
                    selectedCustomerKey
            );


        const now =
            new Date().toISOString();


        matchingOrders.forEach(
            order => {

                if (
                    !order.customer ||
                    typeof order.customer !==
                        "object"
                ) {

                    order.customer = {};

                }


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


                if (
                    !order.addressData ||
                    typeof order.addressData !==
                        "object"
                ) {

                    order.addressData =
                        {};

                }


                order.addressData.formatted =
                    newAddress;


                order.addressData.city =
                    newCity;


                order.addressData.postcode =
                    newPostal;


                order.updatedAt =
                    now;


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
                        "customer-update",

                    changedAt:
                        now,

                    changedBy:
                        "Admin",

                    changeType:
                        "customer-update",

                    reason:
                        "Customer information updated"

                });

            }
        );


        /*
           If customer had no active orders
           but exists in archive, update archive
           record too.
        */

        const archiveIndex =
            archivedCustomers.findIndex(
                item =>
                    item?.key ===
                    selectedCustomerKey
            );


        if (
            archiveIndex !==
            -1
        ) {

            const archived =
                archivedCustomers[
                    archiveIndex
                ];


            archived.name =
                newName;


            archived.email =
                newEmail;


            archived.phone =
                newPhone;


            archived.address =
                newAddress;


            archived.city =
                newCity;


            archived.postal =
                newPostal;

        }


        saveOrders();

        saveArchivedCustomers();


        closeEditModal();


        loadData();

        buildCustomers();

        updateStats();

        renderCustomers();


        showToast(
            "Customer information updated successfully."
        );

    }
);


/* =========================================================
   OPEN ARCHIVE CONFIRMATION
========================================================= */

function openArchiveCustomer(
    customerKey
) {

    loadData();

    buildCustomers();


    const customer =
        customers.find(
            item =>
                item.key ===
                customerKey
        );


    if (
        !customer
    ) {

        showToast(
            "Customer not found.",
            true
        );

        return;

    }


    if (
        customer.archived
    ) {

        showToast(
            "Customer is already archived.",
            true
        );

        return;

    }


    selectedArchiveCustomerKey =
        customerKey;


    if (
        archiveCustomerText
    ) {

        archiveCustomerText.textContent =
            `Archive ${
                customer.name
            } from the active customer directory?`;

    }


    customerArchiveModal?.classList.add(
        "show"
    );


    customerArchiveModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CONFIRM ARCHIVE CUSTOMER
========================================================= */

confirmArchiveCustomer?.addEventListener(
    "click",
    () => {

        if (
            !selectedArchiveCustomerKey
        ) {

            return;

        }


        /*
           Always reload the newest storage.
        */

        loadData();

        buildCustomers();


        const customer =
            customers.find(
                item =>
                    item.key ===
                    selectedArchiveCustomerKey
            );


        if (
            !customer
        ) {

            showToast(
                "Customer not found.",
                true
            );

            closeArchiveModal();

            return;

        }


        /*
           Check existing archive.
        */

        const alreadyArchived =
            archivedCustomers.some(
                item =>
                    item?.key ===
                    customer.key
            );


        if (
            !alreadyArchived
        ) {

            /*
               Save the complete customer
               snapshot into archive.
            */

            archivedCustomers.unshift({

                key:
                    customer.key,

                name:
                    customer.name || "",

                email:
                    customer.email || "",

                phone:
                    customer.phone || "",

                address:
                    customer.address || "",

                city:
                    customer.city || "",

                postal:
                    customer.postal || "",

                country:
                    customer.country || "",

                archivedAt:
                    new Date().toISOString(),

                archivedBy:
                    "Admin"

            });


            saveArchivedCustomers();

        }


        /*
           IMPORTANT:
           Orders are NOT archived.
           They remain inside shopmax-orders.
        */


        closeArchiveModal();


        /*
           Stay on customers.html.
           Refresh the customer table.
        */

        loadData();

        buildCustomers();

        updateStats();

        renderCustomers();


        /*
           Confirmation message.
        */

        showToast(
            `${customer.name} archived successfully.`
        );

    }
);


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetails() {

    customerDetailsModal?.classList.remove(
        "show"
    );


    customerDetailsModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   CLOSE EDIT
========================================================= */

function closeEditModal() {

    customerEditModal?.classList.remove(
        "show"
    );


    customerEditModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedCustomerKey =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   CLOSE ARCHIVE
========================================================= */

function closeArchiveModal() {

    customerArchiveModal?.classList.remove(
        "show"
    );


    customerArchiveModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedArchiveCustomerKey =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   PAGE EVENTS
========================================================= */

function setupEvents() {

    customerSearch?.addEventListener(
        "input",
        renderCustomers
    );


    customerFilter?.addEventListener(
        "change",
        renderCustomers
    );


    refreshCustomersBtn?.addEventListener(
        "click",
        () => {

            loadData();

            buildCustomers();

            updateStats();

            renderCustomers();


            showToast(
                "Customers refreshed successfully."
            );

        }
    );


    customerModalOverlay?.addEventListener(
        "click",
        closeDetails
    );


    customerModalClose?.addEventListener(
        "click",
        closeDetails
    );


    document
        .querySelectorAll(
            "[data-close-edit]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeEditModal
                );

            }
        );


    document
        .querySelectorAll(
            "[data-close-archive]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeArchiveModal
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

                closeEditModal();

                closeArchiveModal();

            }

        }
    );


    /*
       Header search.
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
        !parts.length
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
   STORAGE ARRAY
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

    } catch (
        error
    ) {

        console.error(
            `Failed to read ${key}`,
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
            "customerToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "customerToast";


        toast.style.cssText = `

            position:fixed;

            right:20px;

            bottom:20px;

            z-index:11000;

            max-width:340px;

            padding:12px 15px;

            border-radius:8px;

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
                    .18
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
        window.__customerToastTimer
    );


    window.__customerToastTimer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

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
                ORDERS_KEY &&
            event.key !==
                ARCHIVED_CUSTOMERS_KEY
        ) {

            return;

        }


        loadData();

        buildCustomers();

        updateStats();

        renderCustomers();

    }
);

/* =========================================================
   AUTO SYNC WHEN ARCHIVE DATA CHANGES
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            ARCHIVED_CUSTOMERS_KEY
        ) {

            loadData();

            buildArchivedCustomerRecords();

            updateStats();

            renderArchivedCustomers();

        }

    }
);
/* =========================================================
   END
========================================================= */