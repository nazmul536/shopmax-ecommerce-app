"use strict";


/* =========================================================
   SHOPMAX ADMIN DASHBOARD
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const ORDERS_KEY =
    "shopmax-orders";


const ARCHIVED_ORDERS_KEY =
    "shopmax-archived-orders";


const ARCHIVED_CUSTOMERS_KEY =
    "shopmax-archived-customers";


const PRODUCT_OVERRIDES_KEY =
    "shopmax-product-overrides";


const ARCHIVED_PRODUCTS_KEY =
    "shopmax-archived-products";


const API_URL =
    "https://fakestoreapi.com/products";



/* =========================================================
   STATE
========================================================= */

let orders = [];

let archivedOrders = [];

let archivedCustomers = [];

let productOverrides = {};

let archivedProducts = [];

let apiProducts = [];



/* =========================================================
   DOM
========================================================= */

const totalOrders =
    document.getElementById(
        "totalOrders"
    );


const totalCustomers =
    document.getElementById(
        "totalCustomers"
    );


const totalProducts =
    document.getElementById(
        "totalProducts"
    );


const totalRevenue =
    document.getElementById(
        "totalRevenue"
    );


const placedOrders =
    document.getElementById(
        "placedOrders"
    );


const processingOrders =
    document.getElementById(
        "processingOrders"
    );


const shippedOrders =
    document.getElementById(
        "shippedOrders"
    );


const deliveryOrders =
    document.getElementById(
        "deliveryOrders"
    );


const deliveredOrders =
    document.getElementById(
        "deliveredOrders"
    );


const recentOrders =
    document.getElementById(
        "recentOrders"
    );


const recentOrdersEmpty =
    document.getElementById(
        "recentOrdersEmpty"
    );


const lowStockList =
    document.getElementById(
        "lowStockList"
    );


const lowStockEmpty =
    document.getElementById(
        "lowStockEmpty"
    );


const activeCustomersCount =
    document.getElementById(
        "activeCustomersCount"
    );


const archivedOrdersCount =
    document.getElementById(
        "archivedOrdersCount"
    );


const archivedProductsCount =
    document.getElementById(
        "archivedProductsCount"
    );


const archivedCustomersCount =
    document.getElementById(
        "archivedCustomersCount"
    );


const currentDate =
    document.getElementById(
        "currentDate"
    );


const dashboardRefresh =
    document.getElementById(
        "dashboardRefresh"
    );



/* =========================================================
   SIDEBAR DOM
========================================================= */

const adminLayout =
    document.getElementById(
        "adminLayout"
    );


const adminSidebar =
    document.getElementById(
        "adminSidebar"
    );


const sidebarToggleBtn =
    document.getElementById(
        "sidebarToggleBtn"
    );


const sidebarMobileClose =
    document.getElementById(
        "sidebarMobileClose"
    );


const mobileSidebarToggle =
    document.getElementById(
        "mobileSidebarToggle"
    );



/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initAdmin
);


async function initAdmin() {

    loadStorage();

    updateCurrentDate();

    calculateDashboard();

    renderRecentOrders();

    await loadProducts();

    setupEvents();

    initializeSidebar();

}



/* =========================================================
   SIDEBAR INITIALIZE
========================================================= */

function initializeSidebar() {

    if (
        !adminLayout ||
        !adminSidebar
    ) {

        return;

    }


    /*
       -----------------------------------------
       DESKTOP
       Always open on initial load.
    ------------------------------------------
    */

    if (
        window.innerWidth > 900
    ) {

        openDesktopSidebar();

    }


    /*
       -----------------------------------------
       MOBILE/TABLET
       Starts closed.
    ------------------------------------------
    */

    if (
        window.innerWidth <= 900
    ) {

        adminSidebar.classList.remove(
            "open"
        );

    }


    /*
       -----------------------------------------
       DESKTOP ✕ / ☰
    ------------------------------------------
    */

    sidebarToggleBtn?.addEventListener(
        "click",
        function () {

            if (
                window.innerWidth <= 900
            ) {

                return;

            }


            const closed =
                adminLayout.classList.contains(
                    "sidebar-collapsed"
                );


            if (
                closed
            ) {

                openDesktopSidebar();

            } else {

                closeDesktopSidebar();

            }

        }
    );


    /*
       -----------------------------------------
       MOBILE/TABLET ☰
    ------------------------------------------
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
       -----------------------------------------
       MOBILE/TABLET ✕
    ------------------------------------------
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
       -----------------------------------------
       CLOSE ON NAVIGATION
    ------------------------------------------
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
       -----------------------------------------
       RESIZE
    ------------------------------------------
    */

    window.addEventListener(
        "resize",
        handleSidebarResize
    );

}



/* =========================================================
   OPEN DESKTOP
========================================================= */

function openDesktopSidebar() {

    if (
        !adminLayout
    ) {

        return;

    }


    adminLayout.classList.remove(
        "sidebar-collapsed"
    );


    updateDesktopToggle(
        false
    );

}



/* =========================================================
   CLOSE DESKTOP
========================================================= */

function closeDesktopSidebar() {

    if (
        !adminLayout
    ) {

        return;

    }


    /*
       Sidebar width becomes 0.
       Nothing remains visible except ☰.
    */

    adminLayout.classList.add(
        "sidebar-collapsed"
    );


    updateDesktopToggle(
        true
    );

}



/* =========================================================
   UPDATE DESKTOP BUTTON
========================================================= */

function updateDesktopToggle(
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
   RESIZE HANDLER
========================================================= */

function handleSidebarResize() {

    if (
        !adminLayout ||
        !adminSidebar
    ) {

        return;

    }


    /*
       -----------------------------------------
       MOBILE / TABLET
    ------------------------------------------
    */

    if (
        window.innerWidth <= 900
    ) {

        /*
           Remove desktop collapsed state.
        */

        adminLayout.classList.remove(
            "sidebar-collapsed"
        );


        /*
           Always hide sidebar after switching
           into mobile/tablet mode.
        */

        adminSidebar.classList.remove(
            "open"
        );


        return;

    }


    /*
       -----------------------------------------
       DESKTOP
    ------------------------------------------
    */

    adminSidebar.classList.remove(
        "open"
    );


    const closed =
        adminLayout.classList.contains(
            "sidebar-collapsed"
        );


    updateDesktopToggle(
        closed
    );

}



/* =========================================================
   STORAGE
========================================================= */

function loadStorage() {

    orders =
        readArray(
            ORDERS_KEY
        );


    archivedOrders =
        readArray(
            ARCHIVED_ORDERS_KEY
        );


    archivedCustomers =
        readArray(
            ARCHIVED_CUSTOMERS_KEY
        );


    productOverrides =
        readObject(
            PRODUCT_OVERRIDES_KEY
        );


    archivedProducts =
        readArray(
            ARCHIVED_PRODUCTS_KEY
        );

}



/* =========================================================
   DASHBOARD CALCULATION
========================================================= */

function calculateDashboard() {

    const activeOrders =
        orders;


    const orderCount =
        activeOrders.length;


    const revenue =
        activeOrders.reduce(
            (
                sum,
                order
            ) => {

                return (
                    sum +
                    getOrderTotal(
                        order
                    )
                );

            },
            0
        );


    if (
        totalOrders
    ) {

        totalOrders.textContent =
            orderCount;

    }


    if (
        totalRevenue
    ) {

        totalRevenue.textContent =
            formatMoney(
                revenue
            );

    }


    /*
       ORDER STATUS
    */

    const statusCounts =
        countOrderStatuses(
            activeOrders
        );


    if (
        placedOrders
    ) {

        placedOrders.textContent =
            statusCounts.placed;

    }


    if (
        processingOrders
    ) {

        processingOrders.textContent =
            statusCounts.processing;

    }


    if (
        shippedOrders
    ) {

        shippedOrders.textContent =
            statusCounts.shipped;

    }


    if (
        deliveryOrders
    ) {

        deliveryOrders.textContent =
            statusCounts.delivery;

    }


    if (
        deliveredOrders
    ) {

        deliveredOrders.textContent =
            statusCounts.delivered;

    }


    /*
       CUSTOMERS
    */

    const customerMap =
        new Map();


    activeOrders.forEach(
        order => {

            const customer =
                getOrderCustomer(
                    order
                );


            const key =
                createCustomerKey(
                    customer
                );


            if (
                key
            ) {

                customerMap.set(
                    key,
                    customer
                );

            }

        }
    );


    archivedCustomers.forEach(
        customer => {

            const key =
                customer?.key ||
                createCustomerKey(
                    customer
                );


            if (
                key
            ) {

                customerMap.set(
                    key,
                    customer
                );

            }

        }
    );


    const customers =
        customerMap.size;


    const activeCustomerTotal =
        activeOrders.reduce(
            (
                set,
                order
            ) => {

                const customer =
                    getOrderCustomer(
                        order
                    );


                const key =
                    createCustomerKey(
                        customer
                    );


                if (
                    key
                ) {

                    set.add(
                        key
                    );

                }


                return set;

            },
            new Set()
        ).size;


    if (
        totalCustomers
    ) {

        totalCustomers.textContent =
            customers;

    }


    if (
        activeCustomersCount
    ) {

        activeCustomersCount.textContent =
            activeCustomerTotal;

    }


    /*
       ARCHIVED
    */

    if (
        archivedOrdersCount
    ) {

        archivedOrdersCount.textContent =
            archivedOrders.length;

    }


    if (
        archivedProductsCount
    ) {

        archivedProductsCount.textContent =
            archivedProducts.length;

    }


    if (
        archivedCustomersCount
    ) {

        archivedCustomersCount.textContent =
            archivedCustomers.length;

    }

}



/* =========================================================
   STATUS COUNTER
========================================================= */

function countOrderStatuses(
    source
) {

    const result = {

        placed: 0,

        processing: 0,

        shipped: 0,

        delivery: 0,

        delivered: 0

    };


    source.forEach(
        order => {

            const status =
                normalizeStatus(
                    order?.status
                );


            if (
                status ===
                "order placed"
            ) {

                result.placed++;

            }

            else if (
                status ===
                "processing"
            ) {

                result.processing++;

            }

            else if (
                status ===
                "shipped"
            ) {

                result.shipped++;

            }

            else if (
                status ===
                "out for delivery"
            ) {

                result.delivery++;

            }

            else if (
                status ===
                "delivered"
            ) {

                result.delivered++;

            }

        }
    );


    return result;

}



/* =========================================================
   RECENT ORDERS
========================================================= */

function renderRecentOrders() {

    if (
        !recentOrders
    ) {

        return;

    }


    const sorted =
        [...orders]
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        getOrderDate(
                            b
                        ) -
                        getOrderDate(
                            a
                        )
                    );

                }
            )
            .slice(
                0,
                6
            );


    if (
        sorted.length ===
        0
    ) {

        recentOrders.innerHTML =
            "";


        recentOrdersEmpty?.classList.add(
            "show"
        );


        return;

    }


    recentOrdersEmpty?.classList.remove(
        "show"
    );


    recentOrders.innerHTML =
        sorted
            .map(
                createRecentOrderRow
            )
            .join("");

}



/* =========================================================
   RECENT ORDER ROW
========================================================= */

function createRecentOrderRow(
    order
) {

    const customer =
        getOrderCustomer(
            order
        );


    const status =
        normalizeStatus(
            order?.status
        );


    return `

        <div class="recent-order-row">

            <div>

                <span class="order-id">

                    ${escapeHTML(
                        getOrderId(
                            order
                        )
                    )}

                </span>

            </div>


            <div class="order-customer">

                <strong>

                    ${escapeHTML(
                        customer.name ||
                        "Customer"
                    )}

                </strong>


                <small>

                    ${escapeHTML(
                        formatShortDate(
                            getOrderDateValue(
                                order
                            )
                        )
                    )}

                </small>

            </div>


            <div class="order-total">

                ${formatMoney(
                    getOrderTotal(
                        order
                    )
                )}

            </div>


            <div>

                <span
                    class="
                        order-status
                        ${getStatusClass(
                            status
                        )}
                    "
                >

                    ${getStatusText(
                        status
                    )}

                </span>

            </div>

        </div>

    `;

}



/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch(
                API_URL,
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Product API failed."
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(
                data
            )
        ) {

            throw new Error(
                "Invalid API response."
            );

        }


        apiProducts =
            data.map(
                normalizeProduct
            );


        const archivedIds =
            new Set(
                archivedProducts.map(
                    product =>
                        String(
                            product?.id ??
                            ""
                        )
                )
            );


        const activeProducts =
            apiProducts.filter(
                product =>
                    !archivedIds.has(
                        String(
                            product.id
                        )
                    )
            );


        if (
            totalProducts
        ) {

            totalProducts.textContent =
                activeProducts.length;

        }


        renderLowStockProducts(
            activeProducts
        );

    }

    catch (
        error
    ) {

        console.error(
            "Dashboard product API error:",
            error
        );


        if (
            totalProducts
        ) {

            totalProducts.textContent =
                "—";

        }


        if (
            lowStockList
        ) {

            lowStockList.innerHTML =
                "";

        }


        if (
            lowStockEmpty
        ) {

            lowStockEmpty.textContent =
                "Product data unavailable.";


            lowStockEmpty.classList.add(
                "show"
            );

        }

    }

}



/* =========================================================
   LOW STOCK
========================================================= */

function renderLowStockProducts(
    products
) {

    if (
        !lowStockList
    ) {

        return;

    }


    const lowStock =
        products
            .map(
                applyProductOverride
            )
            .filter(
                product =>
                    product.stock !== null
                    &&
                    product.stock !== undefined
                    &&
                    Number.isFinite(
                        Number(
                            product.stock
                        )
                    )
                    &&
                    Number(
                        product.stock
                    ) <= 5
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.stock
                    ) -
                    Number(
                        b.stock
                    )
            )
            .slice(
                0,
                5
            );


    if (
        lowStock.length ===
        0
    ) {

        lowStockList.innerHTML =
            "";


        lowStockEmpty?.classList.add(
            "show"
        );


        return;

    }


    lowStockEmpty?.classList.remove(
        "show"
    );


    lowStockList.innerHTML =
        lowStock
            .map(
                createLowStockRow
            )
            .join("");

}



/* =========================================================
   LOW STOCK ROW
========================================================= */

function createLowStockRow(
    product
) {

    return `

        <div class="stock-row">

            <div class="stock-image">

                ${
                    product.image

                        ? `

                            <img
                                src="${escapeHTML(
                                    product.image
                                )}"
                                alt="${escapeHTML(
                                    product.title
                                )}"
                                loading="lazy"
                            >

                        `

                        : `

                            <i
                                class="
                                    fa-solid
                                    fa-box
                                "
                            ></i>

                        `
                }

            </div>


            <div class="stock-info">

                <strong
                    title="${escapeHTML(
                        product.title
                    )}"
                >

                    ${escapeHTML(
                        product.title
                    )}

                </strong>


                <small>

                    ${escapeHTML(
                        product.category
                    )}

                </small>

            </div>


            <div class="stock-count">

                ${product.stock}

                left

            </div>

        </div>

    `;

}



/* =========================================================
   PRODUCT OVERRIDE
========================================================= */

function applyProductOverride(
    product
) {

    const id =
        String(
            product.id
        );


    const override =
        productOverrides[id] ||
        {};


    const result = {

        ...product,

        title:
            override.title ??
            product.title,

        category:
            override.category ??
            product.category,

        price:
            Number.isFinite(
                Number(
                    override.price
                )
            )
                ? Number(
                    override.price
                )
                : product.price,

        image:
            override.image ??
            product.image,

        stock:
            null

    };


    if (
        Object.prototype.hasOwnProperty.call(
            override,
            "stock"
        )
        &&
        override.stock !== null
        &&
        override.stock !== ""
        &&
        Number.isFinite(
            Number(
                override.stock
            )
        )
    ) {

        result.stock =
            Math.max(
                0,
                Math.floor(
                    Number(
                        override.stock
                    )
                )
            );

    }


    return result;

}



/* =========================================================
   PRODUCT NORMALIZER
========================================================= */

function normalizeProduct(
    product
) {

    return {

        id:
            String(
                product?.id ??
                ""
            ),

        title:
            String(
                product?.title ??
                "Untitled Product"
            ),

        category:
            String(
                product?.category ??
                "Uncategorized"
            ),

        price:
            Number(
                product?.price
            ) || 0,

        image:
            String(
                product?.image ??
                ""
            ),

        description:
            String(
                product?.description ??
                ""
            )

    };

}



/* =========================================================
   ORDER TOTAL
========================================================= */

function getOrderTotal(
    order
) {

    const value =
        Number(
            order?.total
        );


    if (
        Number.isFinite(
            value
        )
    ) {

        return value;

    }


    const total =
        Number(
            order?.amount
        );


    return Number.isFinite(
        total
    )
        ? total
        : 0;

}



/* =========================================================
   CUSTOMER
========================================================= */

function getOrderCustomer(
    order
) {

    if (
        order?.customer &&
        typeof order.customer ===
            "object"
    ) {

        return {

            ...order.customer,

            name:
                order.customer.name ||
                "Customer"

        };

    }


    return {

        name:
            order?.customerName ||
            order?.name ||
            "Customer",

        email:
            order?.customerEmail ||
            order?.email ||
            "",

        phone:
            order?.customerPhone ||
            order?.phone ||
            ""

    };

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
   ORDER ID
========================================================= */

function getOrderId(
    order
) {

    return String(
        order?.orderId ??
        order?.id ??
        "Order"
    );

}



/* =========================================================
   ORDER DATE
========================================================= */

function getOrderDate(
    order
) {

    const value =
        getOrderDateValue(
            order
        );


    if (
        !value
    ) {

        return 0;

    }


    const time =
        new Date(
            value
        ).getTime();


    return Number.isNaN(
        time
    )
        ? 0
        : time;

}


function getOrderDateValue(
    order
) {

    return (
        order?.createdAt ??
        order?.orderDate ??
        order?.date ??
        order?.updatedAt ??
        null
    );

}



/* =========================================================
   DATE FORMAT
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
   STATUS
========================================================= */

function normalizeStatus(
    status
) {

    return String(
        status ||
        "Order Placed"
    )
        .trim()
        .toLowerCase();

}



/* =========================================================
   STATUS TEXT
========================================================= */

function getStatusText(
    status
) {

    const value =
        normalizeStatus(
            status
        );


    if (
        value ===
        "processing"
    ) {

        return "Processing";

    }


    if (
        value ===
        "shipped"
    ) {

        return "Shipped";

    }


    if (
        value ===
        "out for delivery"
    ) {

        return "Out for Delivery";

    }


    if (
        value ===
        "delivered"
    ) {

        return "Delivered";

    }


    return "Order Placed";

}



/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    const value =
        normalizeStatus(
            status
        );


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

        return "delivery";

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
   CURRENT DATE
========================================================= */

function updateCurrentDate() {

    if (
        !currentDate
    ) {

        return;

    }


    currentDate.textContent =
        new Intl.DateTimeFormat(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        ).format(
            new Date()
        );

}



/* =========================================================
   REFRESH
========================================================= */

async function refreshDashboard() {

    loadStorage();

    calculateDashboard();

    renderRecentOrders();

    await loadProducts();

}



/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /*
       Dashboard refresh
    */

    dashboardRefresh?.addEventListener(
        "click",
        async () => {

            dashboardRefresh.disabled =
                true;


            const icon =
                dashboardRefresh.querySelector(
                    "i"
                );


            icon?.classList.add(
                "fa-spin"
            );


            await refreshDashboard();


            icon?.classList.remove(
                "fa-spin"
            );


            dashboardRefresh.disabled =
                false;

        }
    );


    /*
       Storage synchronization
    */

    window.addEventListener(
        "storage",
        event => {

            const keys = [

                ORDERS_KEY,

                ARCHIVED_ORDERS_KEY,

                ARCHIVED_CUSTOMERS_KEY,

                PRODUCT_OVERRIDES_KEY,

                ARCHIVED_PRODUCTS_KEY

            ];


            if (
                keys.includes(
                    event.key
                )
            ) {

                refreshDashboard();

            }

        }
    );


    /*
       Refresh when tab becomes visible
    */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                refreshDashboard();

            }

        }
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

    }

    catch (
        error
    ) {

        console.error(
            `Could not read ${key}`,
            error
        );


        return [];

    }

}



/* =========================================================
   READ OBJECT
========================================================= */

function readObject(
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

            return {};

        }


        const parsed =
            JSON.parse(
                raw
            );


        if (
            parsed &&
            typeof parsed ===
                "object"
            &&
            !Array.isArray(
                parsed
            )
        ) {

            return parsed;

        }


        return {};

    }

    catch (
        error
    ) {

        console.error(
            `Could not read ${key}`,
            error
        );


        return {};

    }

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
        );


    return `$${(
        Number.isFinite(
            amount
        )
            ? amount
            : 0
    ).toFixed(2)}`;

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