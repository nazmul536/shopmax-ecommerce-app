/* =========================================================
   SHOPMAX
   ORDERS / ORDER HISTORY PAGE JAVASCRIPT

   Features:
   - Read all orders from LocalStorage
   - Show total orders
   - Show total spent
   - Show latest order date
   - Render desktop table
   - Render mobile order cards
   - Search orders
   - Filter by status
   - Refresh orders
   - Track specific order
   - View full order details in modal
   - Reset filters on page load / restore
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


/* =========================================================
   NORMALIZE STATE
========================================================= */

orders =
    Array.isArray(
        orders
    )
        ? orders
        : [];


cart =
    Array.isArray(
        cart
    )
        ? cart
        : [];


wishlist =
    Array.isArray(
        wishlist
    )
        ? wishlist
        : [];


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
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeOrdersPage();

    }
);


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeOrdersPage() {

    resetOrderFilters();


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

    setupOrderDetailsModal();

}


/* =========================================================
   RESET FILTERS
========================================================= */

function resetOrderFilters() {

    if (
        orderTableSearch
    ) {

        orderTableSearch.value =
            "";

    }


    if (
        orderStatusFilter
    ) {

        orderStatusFilter.value =
            "all";

    }

}


/* =========================================================
   PAGE SHOW
========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        resetOrderFilters();


        refreshOrders();

        refreshCart();

        refreshWishlist();


        updateHeaderCounts();

        updateSummary();

        renderOrders();

    }
);


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

    const totalOrders =
        orders.length;


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
                        ) || 0
                    )
                );

            },
            0
        );


    const latestOrder =
        getLatestOrder();


    if (
        totalOrdersCount
    ) {

        totalOrdersCount.textContent =
            totalOrders;

    }


    if (
        totalOrdersSpent
    ) {

        totalOrdersSpent.textContent =
            formatMoney(
                totalSpent
            );

    }


    if (
        latestOrderDate
    ) {

        latestOrderDate.textContent =
            latestOrder
                ? formatShortDate(
                    latestOrder.createdAt
                )
                : "—";

    }

}


/* =========================================================
   GET LATEST ORDER
========================================================= */

function getLatestOrder() {

    if (
        orders.length ===
        0
    ) {

        return null;

    }


    return [...orders].sort(
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
    )[0];

}


/* =========================================================
   RENDER ORDERS
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
   GET FILTERED ORDERS
========================================================= */

function getFilteredOrders() {

    const query =
        (
            orderTableSearch
                ?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const selectedStatus =
        orderStatusFilter
            ?.value ||
        "all";


    return orders
        .filter(
            order => {

                /*
                   Search
                */

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


                    const matchesSearch =
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
                        !matchesSearch
                    ) {

                        return false;

                    }

                }


                /*
                   Status
                */

                if (
                    selectedStatus !==
                    "all"
                ) {

                    const orderStatus =
                        normalizeStatusText(
                            order?.status
                        );


                    const filterStatus =
                        normalizeStatusText(
                            selectedStatus
                        );


                    if (
                        orderStatus !==
                        filterStatus
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

}


/* =========================================================
   CREATE TABLE ROW
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
        order?.status ||
        "Order Placed";


    const statusClass =
        getStatusClass(
            status
        );


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
                    class="
                        order-customer
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


            <td
                class="
                    order-date-cell
                "
            >

                ${escapeHTML(
                    date
                )}

            </td>


            <td
                class="
                    order-items-cell
                "
            >

                ${itemCount}

                ${
                    itemCount === 1
                        ? "item"
                        : "items"
                }

            </td>


            <td
                class="
                    order-total-cell
                "
            >

                ${total}

            </td>


            <td>

                <span
                    class="
                        order-status
                        ${statusClass}
                    "
                >

                    ${escapeHTML(
                        formatStatus(
                            status
                        )
                    )}

                </span>

            </td>


            <td>

                <div
                    class="
                        order-actions
                    "
                >


                    <!-- VIEW -->

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



                    <!-- TRACK -->

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
   MOBILE LIST
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

}


/* =========================================================
   CREATE MOBILE ORDER
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


    const itemCount =
        getOrderItemCount(
            order
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
                            orderId
                        )}

                    </div>


                    <div
                        class="
                            mobile-order-date
                        "
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
                        formatStatus(
                            status
                        )
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

                        ${
                            itemCount === 1
                                ? "item"
                                : "items"
                        }

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
                    mobile-order-actions
                "
            >


                <!-- VIEW -->

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



                <!-- TRACK -->

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
   BIND TRACK BUTTONS
========================================================= */

function bindTrackButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-track-order]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

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


    window.location.href =
        `trackOrder.html?orderId=${encodeURIComponent(
            orderId
        )}`;

}


/* =========================================================
   BIND VIEW BUTTONS
========================================================= */

function bindViewButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-view-order]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const orderId =
                        button.getAttribute(
                            "data-view-order"
                        );


                    openOrderDetails(
                        orderId
                    );

                }
            );

        }
    );

}


/* =========================================================
   OPEN ORDER DETAILS
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
        !order
    ) {

        return;

    }


    renderOrderDetailsModal(
        order
    );


    orderDetailsModal?.classList.add(
        "show"
    );


    orderDetailsModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE ORDER DETAILS
========================================================= */

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
   SETUP ORDER DETAILS MODAL
========================================================= */

function setupOrderDetailsModal() {

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

            }

        }
    );

}


/* =========================================================
   RENDER ORDER DETAILS MODAL
========================================================= */

function renderOrderDetailsModal(
    order
) {

    if (
        !orderDetailsBody
    ) {

        return;

    }


    const customer =
        order?.customer ||
        {};


    const addressData =
        order?.addressData ||
        {};


    const items =
        Array.isArray(
            order?.items
        )
            ? order.items
            : [];


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
        subtotal +
        shipping;


    const status =
        order?.status ||
        "Order Placed";


    /*
       Address
    */

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
        customer.postal ||
        "—";


    const country =
        addressData.country ||
        customer.country ||
        "—";


    /*
       Title
    */

    if (
        orderDetailsTitle
    ) {

        orderDetailsTitle.textContent =
            `Order #${
                order?.orderId ||
                "—"
            }`;

    }


    /*
       Body
    */

    orderDetailsBody.innerHTML = `

        <!-- STATUS -->

        <div
            class="
                order-detail-status-row
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
                    formatStatus(
                        status
                    )
                )}

            </span>


            <span
                class="
                    order-detail-date
                "
            >

                ${escapeHTML(
                    formatFullDate(
                        order?.createdAt
                    )
                )}

            </span>

        </div>



        <!-- CUSTOMER + DELIVERY -->

        <div
            class="
                order-detail-grid
            "
        >


            <!-- CUSTOMER -->

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



            <!-- SHIPPING -->

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


                    <div
                        class="two-col"
                    >

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

                </div>

            </section>

        </div>



        <!-- PRODUCTS -->

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
                    items.length > 0
                        ? items
                            .map(
                                createDetailProduct
                            )
                            .join("")
                        : `
                            <div
                                class="
                                    order-detail-no-items
                                "
                            >
                                No products found.
                            </div>
                        `
                }

            </div>

        </section>



        <!-- PAYMENT -->

        <section
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
                            order?.paymentMethod
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
                        fa-credit-card
                    "
                ></i>

            </div>

        </section>



        <!-- TOTALS -->

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
                        shipping === 0
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
   CREATE DETAIL PRODUCT
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


    const total =
        price *
        quantity;


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

                    Qty: ${quantity}

                </span>

            </div>


            <strong
                class="
                    order-detail-product-price
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
   NORMALIZE ORDER ID
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
   SEARCH
========================================================= */

function setupSearch() {

    orderTableSearch?.addEventListener(
        "input",
        () => {

            renderOrders();

        }
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


/* =========================================================
   HEADER SEARCH
========================================================= */

function handleHeaderSearch() {

    const query =
        ordersSearch
            ?.value
            .trim();


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
   STATUS FILTER
========================================================= */

function setupFilters() {

    orderStatusFilter?.addEventListener(
        "change",
        () => {

            renderOrders();

        }
    );

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    refreshOrdersBtn?.addEventListener(
        "click",
        () => {

            resetOrderFilters();


            refreshOrders();

            refreshCart();

            refreshWishlist();


            updateHeaderCounts();

            updateSummary();

            renderOrders();


            refreshOrdersBtn.classList.add(
                "is-refreshing"
            );


            setTimeout(
                () => {

                    refreshOrdersBtn.classList.remove(
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


/* =========================================================
   STATUS NORMALIZE
========================================================= */

function normalizeStatusText(
    status
) {

    return String(
        status ||
        "Order Placed"
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

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    const normalized =
        normalizeStatusText(
            status
        );


    switch (
        normalized
    ) {

        case "processing":

            return "processing";


        case "shipped":

            return "shipped";


        case "out for delivery":

            return "out-for-delivery";


        case "delivered":

            return "delivered";


        default:

            return "";

    }

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(
    status
) {

    switch (
        normalizeStatusText(
            status
        )
    ) {

        case "processing":

            return "Processing";


        case "shipped":

            return "Shipped";


        case "out for delivery":

            return "Out for Delivery";


        case "delivered":

            return "Delivered";


        default:

            return "Order Placed";

    }

}


/* =========================================================
   FORMAT PAYMENT
========================================================= */

function formatPayment(
    value
) {

    const method =
        String(
            value ||
            "cod"
        )
            .trim()
            .toLowerCase();


    switch (
        method
    ) {

        case "card":

            return "Card Payment";


        case "card payment":

            return "Card Payment";


        case "cash":

            return "Cash on Delivery";


        case "cash on delivery":

            return "Cash on Delivery";


        case "cod":

            return "Cash on Delivery";


        default:

            return "Cash on Delivery";

    }

}


/* =========================================================
   FORMAT MONEY
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
   SHORT DATE
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
   FULL DATE
========================================================= */

function formatFullDate(
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
   END SHOPMAX ORDERS
========================================================= */