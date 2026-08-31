"use strict";

/* =========================================================
   SHOPMAX - PRODUCT MANAGEMENT
   API + LOCAL STORAGE ADMIN LAYER

   API:
   https://fakestoreapi.com/products

   LOCAL STORAGE:
   shopmax-product-overrides
   shopmax-archived-products
   shopmax-orders
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://fakestoreapi.com/products";


/* =========================================================
   STORAGE KEYS
========================================================= */

const PRODUCT_OVERRIDES_KEY =
    "shopmax-product-overrides";

const ARCHIVED_PRODUCTS_KEY =
    "shopmax-archived-products";

const ORDERS_KEY =
    "shopmax-orders";


/* =========================================================
   LEGACY STORAGE
========================================================= */

const LEGACY_PRODUCTS_KEY =
    "shopmax-products";


/* =========================================================
   STATE
========================================================= */

let apiProducts = [];

let products = [];

let archivedProducts = [];

let productOverrides = {};

let orders = [];

let selectedProductId = "";

let selectedArchiveProductId = "";


/* =========================================================
   DOM - STATS
========================================================= */

const totalProducts =
    document.getElementById(
        "totalProducts"
    );

const inStockProducts =
    document.getElementById(
        "inStockProducts"
    );

const lowStockProducts =
    document.getElementById(
        "lowStockProducts"
    );

const outOfStockProducts =
    document.getElementById(
        "outOfStockProducts"
    );


/* =========================================================
   DOM - FILTER
========================================================= */

const productSearch =
    document.getElementById(
        "productSearch"
    );

const productCategoryFilter =
    document.getElementById(
        "productCategoryFilter"
    );

const productStatusFilter =
    document.getElementById(
        "productStatusFilter"
    );

const productsTableBody =
    document.getElementById(
        "productsTableBody"
    );

const mobileProducts =
    document.getElementById(
        "mobileProducts"
    );

const productEmpty =
    document.getElementById(
        "productEmpty"
    );

const refreshProductsBtn =
    document.getElementById(
        "refreshProductsBtn"
    );


/* =========================================================
   DOM - DETAILS MODAL
========================================================= */

const productDetailsModal =
    document.getElementById(
        "productDetailsModal"
    );

const productModalOverlay =
    document.getElementById(
        "productModalOverlay"
    );

const productModalClose =
    document.getElementById(
        "productModalClose"
    );

const productModalTitle =
    document.getElementById(
        "productModalTitle"
    );

const productModalBody =
    document.getElementById(
        "productModalBody"
    );


/* =========================================================
   DOM - EDIT MODAL
========================================================= */

const productEditModal =
    document.getElementById(
        "productEditModal"
    );

const productEditForm =
    document.getElementById(
        "productEditForm"
    );

const editProductIdentity =
    document.getElementById(
        "editProductIdentity"
    );


/* =========================================================
   DOM - ARCHIVE MODAL
========================================================= */

const productArchiveModal =
    document.getElementById(
        "productArchiveModal"
    );

const archiveProductText =
    document.getElementById(
        "archiveProductText"
    );

const confirmArchiveProduct =
    document.getElementById(
        "confirmArchiveProduct"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initProducts
);


async function initProducts() {

    loadAdminStorage();

    migrateLegacyProductData();

    setupEvents();

    await loadProductsFromAPI();

}


/* =========================================================
   LOAD ADMIN STORAGE
========================================================= */

function loadAdminStorage() {

    productOverrides =
        readObject(
            PRODUCT_OVERRIDES_KEY
        );


    archivedProducts =
        readArray(
            ARCHIVED_PRODUCTS_KEY
        );


    orders =
        readArray(
            ORDERS_KEY
        );

}


/* =========================================================
   SAVE OVERRIDES
========================================================= */

function saveProductOverrides() {

    localStorage.setItem(
        PRODUCT_OVERRIDES_KEY,
        JSON.stringify(
            productOverrides
        )
    );

}


/* =========================================================
   SAVE ARCHIVED
========================================================= */

function saveArchivedProducts() {

    localStorage.setItem(
        ARCHIVED_PRODUCTS_KEY,
        JSON.stringify(
            archivedProducts
        )
    );

}


/* =========================================================
   SAVE ORDERS
========================================================= */

function saveOrders() {

    localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(
            orders
        )
    );

}


/* =========================================================
   LEGACY MIGRATION
========================================================= */

function migrateLegacyProductData() {

    const legacyProducts =
        readArray(
            LEGACY_PRODUCTS_KEY
        );


    if (
        !legacyProducts.length
    ) {

        return;

    }


    let changed =
        false;


    legacyProducts.forEach(
        product => {

            if (
                !product ||
                product.id === undefined ||
                product.id === null
            ) {

                return;

            }


            const id =
                String(
                    product.id
                );


            const override =
                productOverrides[id] ||
                {};


            if (
                product.title !== undefined
            ) {

                override.title =
                    String(
                        product.title
                    );

                changed =
                    true;

            }


            if (
                product.category !== undefined
            ) {

                override.category =
                    String(
                        product.category
                    );

                changed =
                    true;

            }


            if (
                product.price !== undefined &&
                Number.isFinite(
                    Number(
                        product.price
                    )
                )
            ) {

                override.price =
                    Number(
                        product.price
                    );

                changed =
                    true;

            }


            if (
                product.stock !== undefined &&
                product.stock !== null &&
                product.stock !== "" &&
                Number.isFinite(
                    Number(
                        product.stock
                    )
                )
            ) {

                override.stock =
                    Math.max(
                        0,
                        Math.floor(
                            Number(
                                product.stock
                            )
                        )
                    );

                changed =
                    true;

            }


            if (
                product.sales !== undefined &&
                Number.isFinite(
                    Number(
                        product.sales
                    )
                )
            ) {

                override.sales =
                    Math.max(
                        0,
                        Math.floor(
                            Number(
                                product.sales
                            )
                        )
                    );

                changed =
                    true;

            }


            if (
                product.image !== undefined
            ) {

                override.image =
                    String(
                        product.image
                    );

                changed =
                    true;

            }


            if (
                product.description !== undefined
            ) {

                override.description =
                    String(
                        product.description
                    );

                changed =
                    true;

            }


            if (
                Object.keys(
                    override
                ).length
            ) {

                productOverrides[id] =
                    override;

            }

        }
    );


    if (
        changed
    ) {

        saveProductOverrides();

    }

}


/* =========================================================
   LOAD PRODUCTS FROM API
========================================================= */

async function loadProductsFromAPI() {

    showLoading();


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `API request failed: ${response.status}`
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
                "Invalid product data received from API."
            );

        }


        apiProducts =
            data.map(
                normalizeAPIProduct
            );


        /*
           Rebuild active admin product list
           from API + local admin state.
        */

        rebuildProducts();


        renderEverything();

    }

    catch (
        error
    ) {

        console.error(
            "ShopMax Product API Error:",
            error
        );


        showAPIError();

    }

}


/* =========================================================
   NORMALIZE API PRODUCT
========================================================= */

function normalizeAPIProduct(
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
            ),

        rating:
            {

                rate:
                    Number(
                        product?.rating?.rate
                    ) || 0,

                count:
                    Number(
                        product?.rating?.count
                    ) || 0

            }

    };

}


/* =========================================================
   REBUILD PRODUCTS
========================================================= */

function rebuildProducts() {

    const archivedIds =
        new Set(
            archivedProducts
                .map(
                    item =>
                        String(
                            item?.id ?? ""
                        )
                )
        );


    products =
        apiProducts
            .filter(
                product =>
                    !archivedIds.has(
                        String(
                            product.id
                        )
                    )
            )
            .map(
                apiProduct => {

                    const id =
                        String(
                            apiProduct.id
                        );


                    const override =
                        productOverrides[id] ||
                        {};


                    const hasStockOverride =
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
                        );


                    /*
                       IMPORTANT FIX:

                       Fake Store API has no stock field.

                       Therefore default stock MUST be null,
                       not 0.
                    */

                    const stock =
                        hasStockOverride
                            ? Math.max(
                                0,
                                Math.floor(
                                    Number(
                                        override.stock
                                    )
                                )
                            )
                            : null;


                    const calculatedSales =
                        calculateProductSales(
                            id
                        );


                    const hasSalesOverride =
                        Object.prototype.hasOwnProperty.call(
                            override,
                            "sales"
                        )
                        &&
                        Number.isFinite(
                            Number(
                                override.sales
                            )
                        );


                    const sales =
                        hasSalesOverride
                            ? Math.max(
                                0,
                                Math.floor(
                                    Number(
                                        override.sales
                                    )
                                )
                            )
                            : calculatedSales;


                    return {

                        ...apiProduct,

                        id:


                            id,


                        title:
                            override.title ??
                            apiProduct.title,


                        category:
                            override.category ??
                            apiProduct.category,


                        price:
                            Number.isFinite(
                                Number(
                                    override.price
                                )
                            )
                                ? Number(
                                    override.price
                                )
                                : apiProduct.price,


                        image:
                            override.image ??
                            apiProduct.image,


                        description:
                            override.description ??
                            apiProduct.description,


                        /*
                           FIXED STOCK
                        */

                        stock:
                            stock,


                        sales:
                            sales,


                        hasStockOverride:
                            hasStockOverride,


                        updatedAt:
                            override.updatedAt ??
                            null

                    };

                }
            );

}


/* =========================================================
   CALCULATE SALES FROM ORDERS
========================================================= */

function calculateProductSales(
    productId
) {

    let totalSold =
        0;


    orders.forEach(
        order => {

            const items =
                extractOrderItems(
                    order
                );


            items.forEach(
                item => {

                    const itemId =
                        String(
                            item?.id ??
                            item?.productId ??
                            ""
                        );


                    if (
                        itemId !==
                        String(
                            productId
                        )
                    ) {

                        return;

                    }


                    const quantity =
                        Number(
                            item?.quantity ??
                            item?.qty ??
                            1
                        );


                    if (
                        Number.isFinite(
                            quantity
                        )
                    ) {

                        totalSold +=
                            Math.max(
                                0,
                                quantity
                            );

                    }

                }
            );

        }
    );


    return Math.floor(
        totalSold
    );

}


/* =========================================================
   EXTRACT ORDER ITEMS
========================================================= */

function extractOrderItems(
    order
) {

    if (
        Array.isArray(
            order?.items
        )
    ) {

        return order.items;

    }


    if (
        Array.isArray(
            order?.products
        )
    ) {

        return order.products;

    }


    if (
        Array.isArray(
            order?.cart
        )
    ) {

        return order.cart;

    }


    if (
        Array.isArray(
            order?.orderItems
        )
    ) {

        return order.orderItems;

    }


    return [];

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {

    updateStats();

    populateCategories();

    renderProducts();

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total =
        products.length;


    /*
       IMPORTANT:

       null means inventory has not been configured.
       It must NOT be counted as out-of-stock.
    */

    const stockTracked =
        products.filter(
            product =>
                product.stock !== null &&
                product.stock !== undefined &&
                product.stock !== ""
        );


    const inStock =
        stockTracked.filter(
            product =>
                getStockStatus(
                    product.stock
                ) ===
                "in-stock"
        ).length;


    const lowStock =
        stockTracked.filter(
            product =>
                getStockStatus(
                    product.stock
                ) ===
                "low-stock"
        ).length;


    const outOfStock =
        stockTracked.filter(
            product =>
                getStockStatus(
                    product.stock
                ) ===
                "out-of-stock"
        ).length;


    if (
        totalProducts
    ) {

        totalProducts.textContent =
            total;

    }


    if (
        inStockProducts
    ) {

        inStockProducts.textContent =
            inStock;

    }


    if (
        lowStockProducts
    ) {

        lowStockProducts.textContent =
            lowStock;

    }


    if (
        outOfStockProducts
    ) {

        outOfStockProducts.textContent =
            outOfStock;

    }

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function populateCategories() {

    if (
        !productCategoryFilter
    ) {

        return;

    }


    const currentValue =
        productCategoryFilter.value;


    const categories =
        [
            ...new Set(
                products.map(
                    product =>
                        product.category
                )
            )
        ]
            .filter(
                Boolean
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b
                    )
            );


    productCategoryFilter.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            productCategoryFilter.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            currentValue
        )
    ) {

        productCategoryFilter.value =
            currentValue;

    }

}


/* =========================================================
   GET FILTERED PRODUCTS
========================================================= */

function getFilteredProducts() {

    const search =
        String(
            productSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const category =
        productCategoryFilter?.value ||
        "all";


    const status =
        productStatusFilter?.value ||
        "all";


    return products.filter(
        product => {

            /*
               Search
            */

            if (
                search
            ) {

                const searchable =
                    [

                        product.title,

                        product.category,

                        product.description,

                        product.id

                    ]
                        .join(
                            " "
                        )
                        .toLowerCase();


                if (
                    !searchable.includes(
                        search
                    )
                ) {

                    return false;

                }

            }


            /*
               Category
            */

            if (
                category !==
                    "all"
                &&
                product.category !==
                    category
            ) {

                return false;

            }


            /*
               Status
            */

            if (
                status !==
                    "all"
            ) {

                const productStatus =
                    getProductStatus(
                        product
                    );


                if (
                    productStatus !==
                    status
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getProductStatus(
    product
) {

    /*
       NO STOCK SET
    */

    if (
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
    ) {

        return "not-tracked";

    }


    return getStockStatus(
        product.stock
    );

}


/* =========================================================
   STOCK STATUS
========================================================= */

function getStockStatus(
    stock
) {

    /*
       IMPORTANT FIX:

       Do NOT convert null to Number(null).
    */

    if (
        stock ===
            null
        ||
        stock ===
            undefined
        ||
        stock ===
            ""
    ) {

        return "not-tracked";

    }


    const quantity =
        Number(
            stock
        );


    if (
        !Number.isFinite(
            quantity
        )
    ) {

        return "not-tracked";

    }


    if (
        quantity <=
        0
    ) {

        return "out-of-stock";

    }


    if (
        quantity <=
        5
    ) {

        return "low-stock";

    }


    return "in-stock";

}


/* =========================================================
   STATUS TEXT
========================================================= */

function getStatusText(
    product
) {

    const status =
        getProductStatus(
            product
        );


    if (
        status ===
        "out-of-stock"
    ) {

        return "Out of Stock";

    }


    if (
        status ===
        "low-stock"
    ) {

        return "Low Stock";

    }


    if (
        status ===
        "in-stock"
    ) {

        return "In Stock";

    }


    return "Not Set";

}


/* =========================================================
   STATUS CSS
========================================================= */

function getStatusClass(
    product
) {

    const status =
        getProductStatus(
            product
        );


    if (
        status ===
        "out-of-stock"
    ) {

        return "out-of-stock";

    }


    if (
        status ===
        "low-stock"
    ) {

        return "low-stock";

    }


    if (
        status ===
        "in-stock"
    ) {

        return "in-stock";

    }


    /*
       Current CSS doesn't have not-tracked.
       We'll add this class and inject a tiny
       style below so it looks neutral.
    */

    return "not-tracked";

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const list =
        getFilteredProducts();


    if (
        productsTableBody
    ) {

        productsTableBody.innerHTML =
            list
                .map(
                    createDesktopRow
                )
                .join("");

    }


    if (
        mobileProducts
    ) {

        mobileProducts.innerHTML =
            list
                .map(
                    createMobileCard
                )
                .join("");

    }


    bindProductActions();


    if (
        list.length ===
        0
    ) {

        productEmpty?.classList.add(
            "show"
        );

    } else {

        productEmpty?.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   DESKTOP ROW
========================================================= */

function createDesktopRow(
    product
) {

    const statusClass =
        getStatusClass(
            product
        );


    const statusText =
        getStatusText(
            product
        );


    const stockValue =
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
            ? "—"
            : String(
                product.stock
            );


    const stockClass =
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
            ? ""
            : product.stock <= 0
                ? "stock-zero"
                : product.stock <= 5
                    ? "stock-low"
                    : "";


    return `

        <tr>

            <td>

                <div
                    class="product-cell"
                >

                    <div
                        class="product-image"
                    >

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
                                        onerror="
                                            this.style.display='none';
                                            this.nextElementSibling.style.display='grid';
                                        "
                                    >


                                    <div
                                        class="
                                            product-image-placeholder
                                        "
                                        style="
                                            display:none;
                                        "
                                    >

                                        <i
                                            class="
                                                fa-solid
                                                fa-image
                                            "
                                        ></i>

                                    </div>

                                `

                                : `

                                    <div
                                        class="
                                            product-image-placeholder
                                        "
                                    >

                                        <i
                                            class="
                                                fa-solid
                                                fa-image
                                            "
                                        ></i>

                                    </div>

                                `
                        }

                    </div>


                    <div>

                        <span
                            class="
                                product-name
                            "
                            title="${escapeHTML(
                                product.title
                            )}"
                        >

                            ${escapeHTML(
                                product.title
                            )}

                        </span>


                        <span
                            class="
                                product-id
                            "
                        >

                            API #${escapeHTML(
                                product.id
                            )}

                        </span>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHTML(
                    product.category
                )}

            </td>


            <td>

                <span
                    class="
                        product-price
                    "
                >

                    ${formatMoney(
                        product.price
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        stock-number
                        ${stockClass}
                    "
                >

                    ${escapeHTML(
                        stockValue
                    )}

                </span>

            </td>


            <td>

                ${product.sales}

            </td>


            <td>

                <span
                    class="
                        product-status
                        ${statusClass}
                    "
                >

                    ${statusText}

                </span>

            </td>


            <td>

                <div
                    class="
                        product-actions
                    "
                >

                    <button
                        type="button"
                        class="action-btn"
                        data-view-product="${escapeHTML(
                            product.id
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
                        data-edit-product="${escapeHTML(
                            product.id
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


                    <button
                        type="button"
                        class="
                            action-btn
                            danger
                        "
                        data-archive-product="${escapeHTML(
                            product.id
                        )}"
                        title="Archive Product"
                    >

                        <i
                            class="
                                fa-solid
                                fa-box-archive
                            "
                        ></i>

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
    product
) {

    const statusClass =
        getStatusClass(
            product
        );


    const statusText =
        getStatusText(
            product
        );


    const stockValue =
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
            ? "—"
            : String(
                product.stock
            );


    return `

        <article
            class="
                mobile-product-card
            "
        >

            <div
                class="
                    mobile-product-top
                "
            >

                <div
                    class="
                        mobile-product-main
                    "
                >

                    <div
                        class="
                            product-image
                        "
                    >

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

                                    <div
                                        class="
                                            product-image-placeholder
                                        "
                                    >

                                        <i
                                            class="
                                                fa-solid
                                                fa-image
                                            "
                                        ></i>

                                    </div>

                                `
                        }

                    </div>


                    <div
                        class="
                            mobile-product-title
                        "
                    >

                        <strong>

                            ${escapeHTML(
                                product.title
                            )}

                        </strong>


                        <span>

                            ${escapeHTML(
                                product.category
                            )}

                        </span>

                    </div>

                </div>


                <span
                    class="
                        product-status
                        ${statusClass}
                    "
                >

                    ${statusText}

                </span>

            </div>


            <div
                class="
                    mobile-product-meta
                "
            >

                <div>

                    <small>
                        PRICE
                    </small>


                    <strong>

                        ${formatMoney(
                            product.price
                        )}

                    </strong>

                </div>


                <div>

                    <small>
                        STOCK
                    </small>


                    <strong>

                        ${escapeHTML(
                            stockValue
                        )}

                    </strong>

                </div>


                <div>

                    <small>
                        SALES
                    </small>


                    <strong>

                        ${product.sales}

                    </strong>

                </div>

            </div>


            <div
                class="
                    mobile-product-actions
                "
            >

                <button
                    type="button"
                    class="action-btn"
                    data-view-product="${escapeHTML(
                        product.id
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
                    data-edit-product="${escapeHTML(
                        product.id
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
   ACTION BINDING
========================================================= */

function bindProductActions() {

    document
        .querySelectorAll(
            "[data-view-product]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openProductDetails(
                            button.getAttribute(
                                "data-view-product"
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-edit-product]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openProductEdit(
                            button.getAttribute(
                                "data-edit-product"
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-archive-product]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openProductArchive(
                            button.getAttribute(
                                "data-archive-product"
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================================
   PRODUCT DETAILS
========================================================= */

function openProductDetails(
    productId
) {

    const product =
        products.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );


    if (
        !product
    ) {

        showToast(
            "Product not found.",
            true
        );

        return;

    }


    selectedProductId =
        String(
            product.id
        );


    if (
        productModalTitle
    ) {

        productModalTitle.textContent =
            product.title;

    }


    const rating =
        Number(
            product.rating?.rate
        ) || 0;


    const reviewCount =
        Number(
            product.rating?.count
        ) || 0;


    const statusClass =
        getStatusClass(
            product
        );


    const statusText =
        getStatusText(
            product
        );


    const stockDisplay =
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
            ? "Not Set"
            : String(
                product.stock
            );


    if (
        productModalBody
    ) {

        productModalBody.innerHTML = `

            <div
                class="
                    product-detail-top
                "
            >

                <div
                    class="
                        product-detail-image
                    "
                >

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
                                >

                            `

                            : `

                                <div
                                    class="
                                        product-image-placeholder
                                    "
                                >

                                    <i
                                        class="
                                            fa-solid
                                            fa-image
                                        "
                                    ></i>

                                </div>

                            `
                    }

                </div>


                <div
                    class="
                        product-detail-main
                    "
                >

                    <h4>

                        ${escapeHTML(
                            product.title
                        )}

                    </h4>


                    <p>

                        ${escapeHTML(
                            product.description ||
                            "No description available."
                        )}

                    </p>


                    <div
                        class="
                            product-detail-price
                        "
                    >

                        ${formatMoney(
                            product.price
                        )}

                    </div>


                    <div
                        class="
                            product-detail-badges
                        "
                    >

                        <span
                            class="
                                product-status
                                ${statusClass}
                            "
                        >

                            ${statusText}

                        </span>


                        <span
                            class="
                                detail-badge
                            "
                        >

                            ${escapeHTML(
                                product.category
                            )}

                        </span>

                    </div>

                </div>

            </div>


            <div
                class="
                    product-detail-grid
                "
            >

                <div
                    class="
                        product-detail-stat
                    "
                >

                    <span>
                        PRODUCT ID
                    </span>


                    <strong>

                        API #${escapeHTML(
                            product.id
                        )}

                    </strong>

                </div>


                <div
                    class="
                        product-detail-stat
                    "
                >

                    <span>
                        STOCK
                    </span>


                    <strong>

                        ${escapeHTML(
                            stockDisplay
                        )}

                    </strong>

                </div>


                <div
                    class="
                        product-detail-stat
                    "
                >

                    <span>
                        SALES
                    </span>


                    <strong>

                        ${product.sales}

                    </strong>

                </div>


                <div
                    class="
                        product-detail-stat
                    "
                >

                    <span>
                        RATING
                    </span>


                    <strong>

                        ${rating.toFixed(1)}
                        / 5

                    </strong>

                </div>


                <div
                    class="
                        product-detail-stat
                    "
                >

                    <span>
                        REVIEWS
                    </span>


                    <strong>

                        ${reviewCount}

                    </strong>

                </div>

            </div>

        `;

    }


    productDetailsModal?.classList.add(
        "show"
    );


    productDetailsModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function openProductEdit(
    productId
) {

    const product =
        products.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );


    if (
        !product
    ) {

        showToast(
            "Product not found.",
            true
        );

        return;

    }


    if (
        !productEditForm
    ) {

        return;

    }


    selectedProductId =
        String(
            product.id
        );


    if (
        editProductIdentity
    ) {

        editProductIdentity.textContent =
            `${product.title} · API #${product.id}`;

    }


    if (
        productEditForm.elements.title
    ) {

        productEditForm.elements.title.value =
            product.title || "";

    }


    if (
        productEditForm.elements.category
    ) {

        productEditForm.elements.category.value =
            product.category || "";

    }


    if (
        productEditForm.elements.price
    ) {

        productEditForm.elements.price.value =
            product.price ?? 0;

    }


    /*
       Blank if stock has never been configured.
    */

    if (
        productEditForm.elements.stock
    ) {

        productEditForm.elements.stock.value =
            product.stock ===
                null
            ||
            product.stock ===
                undefined
            ||
            product.stock ===
                ""
                ? ""
                : product.stock;

    }


    if (
        productEditForm.elements.sales
    ) {

        productEditForm.elements.sales.value =
            Number(
                product.sales
            ) || 0;

    }


    if (
        productEditForm.elements.image
    ) {

        productEditForm.elements.image.value =
            product.image || "";

    }


    productEditModal?.classList.add(
        "show"
    );


    productEditModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   SAVE PRODUCT EDIT
========================================================= */

productEditForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (
            !selectedProductId
        ) {

            return;

        }


        const product =
            products.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        selectedProductId
                    )
            );


        if (
            !product
        ) {

            showToast(
                "Product not found.",
                true
            );

            return;

        }


        const formData =
            new FormData(
                productEditForm
            );


        const title =
            String(
                formData.get(
                    "title"
                ) ||
                ""
            ).trim();


        const category =
            String(
                formData.get(
                    "category"
                ) ||
                ""
            ).trim();


        const priceRaw =
            String(
                formData.get(
                    "price"
                ) ||
                ""
            ).trim();


        const stockRaw =
            String(
                formData.get(
                    "stock"
                ) ||
                ""
            ).trim();


        const salesRaw =
            String(
                formData.get(
                    "sales"
                ) ||
                ""
            ).trim();


        const image =
            String(
                formData.get(
                    "image"
                ) ||
                ""
            ).trim();


        const price =
            Number(
                priceRaw
            );


        const stock =
            stockRaw ===
                ""
                ? null
                : Number(
                    stockRaw
                );


        const sales =
            salesRaw ===
                ""
                ? 0
                : Number(
                    salesRaw
                );


        /*
           Validation
        */

        if (
            !title
        ) {

            showToast(
                "Product name is required.",
                true
            );

            return;

        }


        if (
            !Number.isFinite(
                price
            )
            ||
            price < 0
        ) {

            showToast(
                "Please enter a valid price.",
                true
            );

            return;

        }


        if (
            stock !== null
            &&
            (
                !Number.isFinite(
                    stock
                )
                ||
                stock < 0
            )
        ) {

            showToast(
                "Please enter a valid stock quantity.",
                true
            );

            return;

        }


        if (
            !Number.isFinite(
                sales
            )
            ||
            sales < 0
        ) {

            showToast(
                "Please enter a valid sales number.",
                true
            );

            return;

        }


        const id =
            String(
                product.id
            );


        const existingOverride =
            productOverrides[id] ||
            {};


        /*
           Store admin-managed fields.
        */

        const updatedOverride = {

            ...existingOverride,

            title:
                title,

            category:
                category ||
                "Uncategorized",

            price:
                Number(
                    price.toFixed(
                        2
                    )
                ),

            sales:
                Math.floor(
                    sales
                ),

            image:
                image,

            updatedAt:
                new Date().toISOString()

        };


        /*
           STOCK FIX

           Blank = no inventory tracking.
           Number = admin inventory value.
        */

        if (
            stock === null
        ) {

            delete updatedOverride.stock;

        } else {

            updatedOverride.stock =
                Math.floor(
                    stock
                );

        }


        productOverrides[id] =
            updatedOverride;


        saveProductOverrides();


        /*
           Rebuild API + local state.
        */

        rebuildProducts();

        renderEverything();


        closeEditModal();


        showToast(
            "Product updated successfully."
        );

    }
);


/* =========================================================
   ARCHIVE
========================================================= */

function openProductArchive(
    productId
) {

    const product =
        products.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    productId
                )
        );


    if (
        !product
    ) {

        showToast(
            "Product not found.",
            true
        );

        return;

    }


    selectedArchiveProductId =
        String(
            product.id
        );


    if (
        archiveProductText
    ) {

        archiveProductText.textContent =
            `Archive "${product.title}" from the active product list?`;

    }


    productArchiveModal?.classList.add(
        "show"
    );


    productArchiveModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CONFIRM ARCHIVE
========================================================= */

confirmArchiveProduct?.addEventListener(
    "click",
    () => {

        if (
            !selectedArchiveProductId
        ) {

            return;

        }


        const product =
            products.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        selectedArchiveProductId
                    )
            );


        if (
            !product
        ) {

            showToast(
                "Product not found.",
                true
            );

            closeArchiveModal();

            return;

        }


        const alreadyArchived =
            archivedProducts.some(
                item =>
                    String(
                        item?.id ?? ""
                    ) ===
                    String(
                        product.id
                    )
            );


        if (
            !alreadyArchived
        ) {

            archivedProducts.unshift({

                id:
                    String(
                        product.id
                    ),

                title:
                    product.title,

                category:
                    product.category,

                price:
                    product.price,

                image:
                    product.image,

                description:
                    product.description,

                rating:
                    product.rating,

                stock:
                    product.stock,

                sales:
                    product.sales,

                archivedAt:
                    new Date().toISOString(),

                archivedBy:
                    "Admin"

            });


            saveArchivedProducts();

        }


        closeArchiveModal();


        rebuildProducts();

        renderEverything();


        showToast(
            `${product.title} archived successfully.`
        );

    }
);


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetails() {

    productDetailsModal?.classList.remove(
        "show"
    );


    productDetailsModal?.setAttribute(
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

    productEditModal?.classList.remove(
        "show"
    );


    productEditModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedProductId =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   CLOSE ARCHIVE
========================================================= */

function closeArchiveModal() {

    productArchiveModal?.classList.remove(
        "show"
    );


    productArchiveModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedArchiveProductId =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    productSearch?.addEventListener(
        "input",
        renderProducts
    );


    productCategoryFilter?.addEventListener(
        "change",
        renderProducts
    );


    productStatusFilter?.addEventListener(
        "change",
        renderProducts
    );


    refreshProductsBtn?.addEventListener(
        "click",
        async () => {

            loadAdminStorage();

            await loadProductsFromAPI();

            showToast(
                "Products refreshed successfully."
            );

        }
    );


    productModalOverlay?.addEventListener(
        "click",
        closeDetails
    );


    productModalClose?.addEventListener(
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
       Global search
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


    /*
       Cross-tab sync
    */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                    PRODUCT_OVERRIDES_KEY
                ||
                event.key ===
                    ARCHIVED_PRODUCTS_KEY
                ||
                event.key ===
                    ORDERS_KEY
            ) {

                loadAdminStorage();

                rebuildProducts();

                renderEverything();

            }

        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    if (
        !productsTableBody
    ) {

        return;

    }


    productEmpty?.classList.remove(
        "show"
    );


    productsTableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="
                    text-align:center;
                    padding:70px 20px;
                "
            >

                <i
                    class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "
                    style="
                        font-size:24px;
                        color:#2864e8;
                        margin-bottom:10px;
                    "
                ></i>


                <div
                    style="
                        color:#718096;
                        font-size:10px;
                        font-weight:700;
                    "
                >

                    Loading products...

                </div>

            </td>

        </tr>

    `;


    if (
        mobileProducts
    ) {

        mobileProducts.innerHTML =
            "";

    }

}


/* =========================================================
   API ERROR
========================================================= */

function showAPIError() {

    if (
        productsTableBody
    ) {

        productsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:70px 20px;
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-triangle-exclamation
                        "
                        style="
                            font-size:32px;
                            color:#c74444;
                            margin-bottom:12px;
                        "
                    ></i>


                    <h3
                        style="
                            margin-bottom:7px;
                        "
                    >

                        Unable to load products

                    </h3>


                    <p
                        style="
                            color:#718096;
                            font-size:10px;
                            margin-bottom:15px;
                        "
                    >

                        Please check your internet connection
                        and try again.

                    </p>


                    <button
                        type="button"
                        onclick="loadProductsFromAPI()"
                        style="
                            border:0;
                            background:#2864e8;
                            color:#fff;
                            padding:10px 15px;
                            border-radius:7px;
                            font-size:9px;
                            font-weight:800;
                            cursor:pointer;
                        "
                    >

                        Try Again

                    </button>

                </td>

            </tr>

        `;

    }


    if (
        mobileProducts
    ) {

        mobileProducts.innerHTML =
            "";

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
            "productToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "productToast";


        toast.style.cssText = `

            position:fixed;

            right:20px;

            bottom:20px;

            z-index:11000;

            max-width:350px;

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
        window.__productToastTimer
    );


    window.__productToastTimer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

            },
            2500
        );

}


/* =========================================================
   NEUTRAL "NOT SET" STATUS STYLE
========================================================= */

(function addNotTrackedStyle() {

    if (
        document.getElementById(
            "shopmaxNotTrackedStyle"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "shopmaxNotTrackedStyle";


    style.textContent = `

        .product-status.not-tracked {

            background:#f1f5f9;

            color:#64748b;

        }

    `;


    document.head.appendChild(
        style
    );

})();


/* =========================================================
   GLOBAL
========================================================= */

window.loadProductsFromAPI =
    loadProductsFromAPI;


/* =========================================================
   END
========================================================= */