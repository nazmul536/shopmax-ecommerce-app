"use strict";

/* =========================================================
   SHOPMAX - ARCHIVED PRODUCTS
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const ARCHIVED_PRODUCTS_KEY =
    "shopmax-archived-products";

const PRODUCT_OVERRIDES_KEY =
    "shopmax-product-overrides";


/* =========================================================
   STATE
========================================================= */

let archivedProducts = [];

let productOverrides = {};

let selectedRestoreProductId = "";

let selectedDetailsProductId = "";


/* =========================================================
   DOM - STATS
========================================================= */

const totalArchivedProducts =
    document.getElementById(
        "totalArchivedProducts"
    );


const archivedProductValue =
    document.getElementById(
        "archivedProductValue"
    );


/* =========================================================
   DOM - SEARCH
========================================================= */

const archivedProductSearch =
    document.getElementById(
        "archivedProductSearch"
    );


const archivedProductsTableBody =
    document.getElementById(
        "archivedProductsTableBody"
    );


const mobileArchivedProducts =
    document.getElementById(
        "mobileArchivedProducts"
    );


const archivedProductsEmpty =
    document.getElementById(
        "archivedProductsEmpty"
    );


const refreshArchivedProducts =
    document.getElementById(
        "refreshArchivedProducts"
    );


/* =========================================================
   DOM - DETAILS
========================================================= */

const archivedProductDetailsModal =
    document.getElementById(
        "archivedProductDetailsModal"
    );


const archivedProductModalOverlay =
    document.getElementById(
        "archivedProductModalOverlay"
    );


const archivedProductModalClose =
    document.getElementById(
        "archivedProductModalClose"
    );


const archivedProductModalTitle =
    document.getElementById(
        "archivedProductModalTitle"
    );


const archivedProductModalBody =
    document.getElementById(
        "archivedProductModalBody"
    );


/* =========================================================
   DOM - RESTORE
========================================================= */

const restoreProductModal =
    document.getElementById(
        "restoreProductModal"
    );


const restoreProductMessage =
    document.getElementById(
        "restoreProductMessage"
    );


const confirmRestoreProduct =
    document.getElementById(
        "confirmRestoreProduct"
    );


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initArchivedProducts
);


function initArchivedProducts() {

    loadStorage();

    renderEverything();

    setupEvents();

}


/* =========================================================
   LOAD STORAGE
========================================================= */

function loadStorage() {

    archivedProducts =
        readArray(
            ARCHIVED_PRODUCTS_KEY
        );


    productOverrides =
        readObject(
            PRODUCT_OVERRIDES_KEY
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
   APPLY OVERRIDE
========================================================= */

function applyOverride(
    product
) {

    if (
        !product
    ) {

        return null;

    }


    const id =
        String(
            product.id
        );


    const override =
        productOverrides[id] ||
        {};


    const result = {

        ...product,

        id:
            id,

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
                : Number(
                    product.price
                ) || 0,

        image:
            override.image ??
            product.image,

        description:
            override.description ??
            product.description,

        sales:
            Number.isFinite(
                Number(
                    override.sales
                )
            )
                ? Math.max(
                    0,
                    Math.floor(
                        Number(
                            override.sales
                        )
                    )
                )
                : Number(
                    product.sales
                ) || 0

    };


    /*
       Stock must remain null if
       admin never configured it.
    */

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

    } else if (
        product.stock !== undefined
        &&
        product.stock !== null
        &&
        product.stock !== ""
    ) {

        result.stock =
            product.stock;

    } else {

        result.stock =
            null;

    }


    return result;

}


/* =========================================================
   REFRESH ARCHIVED DATA WITH OVERRIDES
========================================================= */

function normalizeArchivedProduct(
    product
) {

    const normalized =
        applyOverride(
            product
        );


    if (
        !normalized
    ) {

        return null;

    }


    return {

        ...normalized,

        archivedAt:
            product.archivedAt ||
            null,

        archivedBy:
            product.archivedBy ||
            "Admin"

    };

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {

    updateStats();

    renderArchivedProducts();

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const products =
        archivedProducts
            .map(
                normalizeArchivedProduct
            )
            .filter(
                Boolean
            );


    const count =
        products.length;


    const totalValue =
        products.reduce(
            (
                total,
                product
            ) => {

                return (
                    total +
                    (
                        Number(
                            product.price
                        ) ||
                        0
                    )
                );

            },
            0
        );


    if (
        totalArchivedProducts
    ) {

        totalArchivedProducts.textContent =
            count;

    }


    if (
        archivedProductValue
    ) {

        archivedProductValue.textContent =
            formatMoney(
                totalValue
            );

    }

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredProducts() {

    const query =
        String(
            archivedProductSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const products =
        archivedProducts
            .map(
                normalizeArchivedProduct
            )
            .filter(
                Boolean
            );


    if (
        !query
    ) {

        return products;

    }


    return products.filter(
        product => {

            const searchable =
                [

                    product.title,

                    product.category,

                    product.id,

                    product.description

                ]
                    .join(
                        " "
                    )
                    .toLowerCase();


            return searchable.includes(
                query
            );

        }
    );

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderArchivedProducts() {

    const list =
        getFilteredProducts();


    if (
        archivedProductsTableBody
    ) {

        archivedProductsTableBody.innerHTML =
            list
                .map(
                    createDesktopRow
                )
                .join("");

    }


    if (
        mobileArchivedProducts
    ) {

        mobileArchivedProducts.innerHTML =
            list
                .map(
                    createMobileCard
                )
                .join("");

    }


    bindActions();


    if (
        list.length ===
        0
    ) {

        archivedProductsEmpty?.classList.add(
            "show"
        );

    } else {

        archivedProductsEmpty?.classList.remove(
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

    const stock =
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
            ? "—"
            : product.stock;


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
                            class="product-name"
                            title="${escapeHTML(
                                product.title
                            )}"
                        >

                            ${escapeHTML(
                                product.title
                            )}

                        </span>


                        <span
                            class="product-id"
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

                ${escapeHTML(
                    String(
                        stock
                    )
                )}

            </td>


            <td>

                ${Number(
                    product.sales
                ) || 0}

            </td>


            <td>

                <span
                    class="
                        archive-date
                    "
                >

                    ${escapeHTML(
                        formatDateTime(
                            product.archivedAt
                        )
                    )}

                </span>

            </td>


            <td>

                <div
                    class="action-group"
                >

                    <button
                        type="button"
                        class="action-btn"
                        data-view-archived-product="${escapeHTML(
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
                        class="
                            action-btn
                            restore
                        "
                        data-restore-product="${escapeHTML(
                            product.id
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
    product
) {

    const stock =
        product.stock ===
            null
        ||
        product.stock ===
            undefined
        ||
        product.stock ===
            ""
            ? "—"
            : product.stock;


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
                        archived-badge
                    "
                >

                    Archived

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
                            String(
                                stock
                            )
                        )}

                    </strong>

                </div>


                <div>

                    <small>
                        SALES
                    </small>


                    <strong>

                        ${Number(
                            product.sales
                        ) || 0}

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
                    data-view-archived-product="${escapeHTML(
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
                    class="
                        action-btn
                        restore
                    "
                    data-restore-product="${escapeHTML(
                        product.id
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

function bindActions() {

    document
        .querySelectorAll(
            "[data-view-archived-product]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openDetails(
                            button.getAttribute(
                                "data-view-archived-product"
                            )
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-restore-product]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openRestoreModal(
                            button.getAttribute(
                                "data-restore-product"
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

function openDetails(
    productId
) {

    const product =
        archivedProducts
            .map(
                normalizeArchivedProduct
            )
            .find(
                item =>
                    String(
                        item?.id
                    ) ===
                    String(
                        productId
                    )
            );


    if (
        !product
    ) {

        showToast(
            "Archived product not found.",
            true
        );

        return;

    }


    selectedDetailsProductId =
        String(
            product.id
        );


    if (
        archivedProductModalTitle
    ) {

        archivedProductModalTitle.textContent =
            product.title;

    }


    const stockText =
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
        archivedProductModalBody
    ) {

        archivedProductModalBody.innerHTML = `

            <div
                class="
                    detail-top
                "
            >

                <div
                    class="
                        detail-image
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
                        detail-main
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
                        class="detail-price"
                    >

                        ${formatMoney(
                            product.price
                        )}

                    </div>


                    <span
                        class="archived-badge"
                    >

                        Archived

                    </span>

                </div>

            </div>


            <div
                class="detail-grid"
            >

                <div
                    class="detail-stat"
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
                    class="detail-stat"
                >

                    <span>
                        CATEGORY
                    </span>


                    <strong>

                        ${escapeHTML(
                            product.category
                        )}

                    </strong>

                </div>


                <div
                    class="detail-stat"
                >

                    <span>
                        STOCK
                    </span>


                    <strong>

                        ${escapeHTML(
                            stockText
                        )}

                    </strong>

                </div>


                <div
                    class="detail-stat"
                >

                    <span>
                        SALES
                    </span>


                    <strong>

                        ${Number(
                            product.sales
                        ) || 0}

                    </strong>

                </div>


                <div
                    class="detail-stat"
                >

                    <span>
                        ARCHIVED
                    </span>


                    <strong>

                        ${escapeHTML(
                            formatDateTime(
                                product.archivedAt
                            )
                        )}

                    </strong>

                </div>


                <div
                    class="detail-stat"
                >

                    <span>
                        ARCHIVED BY
                    </span>


                    <strong>

                        ${escapeHTML(
                            product.archivedBy
                        )}

                    </strong>

                </div>

            </div>

        `;

    }


    archivedProductDetailsModal?.classList.add(
        "show"
    );


    archivedProductDetailsModal?.setAttribute(
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
    productId
) {

    const product =
        archivedProducts
            .map(
                normalizeArchivedProduct
            )
            .find(
                item =>
                    String(
                        item?.id
                    ) ===
                    String(
                        productId
                    )
            );


    if (
        !product
    ) {

        showToast(
            "Archived product not found.",
            true
        );

        return;

    }


    selectedRestoreProductId =
        String(
            product.id
        );


    if (
        restoreProductMessage
    ) {

        restoreProductMessage.textContent =
            `Restore "${product.title}" back to the active product list?`;

    }


    restoreProductModal?.classList.add(
        "show"
    );


    restoreProductModal?.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CONFIRM RESTORE
========================================================= */

confirmRestoreProduct?.addEventListener(
    "click",
    () => {

        if (
            !selectedRestoreProductId
        ) {

            return;

        }


        loadStorage();


        const archiveIndex =
            archivedProducts.findIndex(
                product =>
                    String(
                        product?.id
                    ) ===
                    String(
                        selectedRestoreProductId
                    )
            );


        if (
            archiveIndex ===
            -1
        ) {

            showToast(
                "Archived product not found.",
                true
            );

            closeRestoreModal();

            return;

        }


        const restoredProduct =
            archivedProducts[
                archiveIndex
            ];


        /*
           Remove from archive.
        */

        archivedProducts.splice(
            archiveIndex,
            1
        );


        saveArchivedProducts();


        /*
           We intentionally DO NOT remove
           productOverrides.

           This preserves admin changes such as:
           price, stock, title, category, image.
        */


        closeRestoreModal();


        renderEverything();


        showToast(
            `${
                restoredProduct.title ||
                "Product"
            } restored successfully.`
        );

    }
);


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetails() {

    archivedProductDetailsModal?.classList.remove(
        "show"
    );


    archivedProductDetailsModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   CLOSE RESTORE
========================================================= */

function closeRestoreModal() {

    restoreProductModal?.classList.remove(
        "show"
    );


    restoreProductModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedRestoreProductId =
        "";


    document.body.style.overflow =
        "";

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    archivedProductSearch?.addEventListener(
        "input",
        renderArchivedProducts
    );


    refreshArchivedProducts?.addEventListener(
        "click",
        () => {

            loadStorage();

            renderEverything();


            showToast(
                "Archived products refreshed."
            );

        }
    );


    archivedProductModalOverlay?.addEventListener(
        "click",
        closeDetails
    );


    archivedProductModalClose?.addEventListener(
        "click",
        closeDetails
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
       Cross-tab synchronization
    */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                    ARCHIVED_PRODUCTS_KEY
                ||
                event.key ===
                    PRODUCT_OVERRIDES_KEY
            ) {

                loadStorage();

                renderEverything();

            }

        }
    );


    /*
       When returning to this tab.
    */

    window.addEventListener(
        "focus",
        () => {

            loadStorage();

            renderEverything();

        }
    );


    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                loadStorage();

                renderEverything();

            }

        }
    );

}


/* =========================================================
   DATE
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
            `Failed to read ${key}`,
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
            `Failed to read ${key}`,
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
            "archivedProductToast"
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "archivedProductToast";


        toast.style.cssText = `

            position:fixed;

            right:20px;

            bottom:20px;

            z-index:11000;

            max-width:340px;

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
        window.__archivedProductToastTimer
    );


    window.__archivedProductToastTimer =
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