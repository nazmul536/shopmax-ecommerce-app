"use strict";


/* =========================================================
   SHOPMAX - SETTINGS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupSidebar();

        setupSettings();

        setupProfileModal();

        setupPasswordModal();

        setupDangerZone();

    }
);



/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    storeName:
        "ShopMax",

    storeEmail:
        "admin@shopmax.com",

    storePhone:
        "",

    storeAddress:
        "",

    currency:
        "USD",

    language:
        "en",

    storeStatus:
        true,


    /* Orders */

    orderConfirmation:
        "automatic",

    minimumOrder:
        0,

    guestCheckout:
        "allowed",

    orderCancellation:
        "allowed",

    cancellationLimit:
        "30",


    /* Products */

    lowStockThreshold:
        5,

    productsPerPage:
        "20",

    outOfStockPurchase:
        "disabled",

    showSku:
        "visible",

    showStock:
        "visible",


    /* Customers */

    customerRegistration:
        "allowed",

    emailVerification:
        "required",

    customerApproval:
        "automatic",


    /* Notifications */

    notifyOrders:
        true,

    notifyCustomers:
        true,

    notifyLowStock:
        true,

    emailNotifications:
        true,


    /* Storefront */

    homepageTitle:
        "ShopMax - Online Store",

    homepageDescription:
        "Shop quality products at ShopMax.",

    featuredProducts:
        "enabled",


    /* Security */

    sessionTimeout:
        "60"

};



/* =========================================================
   STORAGE
========================================================= */

function getSettings() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "shopmax-settings"
                ) || "null"
            );


        return {

            ...DEFAULT_SETTINGS,

            ...(saved || {})

        };

    }

    catch (error) {

        console.error(
            "ShopMax settings could not be loaded.",
            error
        );


        return {
            ...DEFAULT_SETTINGS
        };

    }

}


function saveSettings(settings) {

    try {

        localStorage.setItem(
            "shopmax-settings",
            JSON.stringify(settings)
        );


        return true;

    }

    catch (error) {

        console.error(
            "ShopMax settings could not be saved.",
            error
        );


        showToast(
            "Unable to save settings."
        );


        return false;

    }

}



/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

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


    const mobileSidebarToggle =
        document.getElementById(
            "mobileSidebarToggle"
        );


    const sidebarMobileClose =
        document.getElementById(
            "sidebarMobileClose"
        );


    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );


    sidebarToggleBtn?.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <= 900
            ) {

                return;

            }


            const collapsed =
                adminLayout?.classList.toggle(
                    "sidebar-collapsed"
                );


            const icon =
                sidebarToggleBtn.querySelector(
                    "i"
                );


            if (icon) {

                icon.classList.toggle(
                    "fa-xmark",
                    !collapsed
                );


                icon.classList.toggle(
                    "fa-bars",
                    collapsed
                );

            }

        }
    );


    mobileSidebarToggle?.addEventListener(
        "click",
        openMobileSidebar
    );


    sidebarMobileClose?.addEventListener(
        "click",
        closeMobileSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeMobileSidebar
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

                closeMobileSidebar();

            }

        }
    );

}


function openMobileSidebar() {

    document
        .getElementById(
            "adminSidebar"
        )
        ?.classList.add(
            "open"
        );


    document
        .getElementById(
            "sidebarOverlay"
        )
        ?.classList.add(
            "show"
        );

}


function closeMobileSidebar() {

    document
        .getElementById(
            "adminSidebar"
        )
        ?.classList.remove(
            "open"
        );


    document
        .getElementById(
            "sidebarOverlay"
        )
        ?.classList.remove(
            "show"
        );

}



/* =========================================================
   SETTINGS INITIALIZATION
========================================================= */

function setupSettings() {

    const settings =
        getSettings();


    setValue(
        "storeName",
        settings.storeName
    );


    setValue(
        "storeEmail",
        settings.storeEmail
    );


    setValue(
        "storePhone",
        settings.storePhone
    );


    setValue(
        "storeAddress",
        settings.storeAddress
    );


    setValue(
        "currency",
        settings.currency
    );


    setValue(
        "language",
        settings.language
    );


    setChecked(
        "storeStatus",
        settings.storeStatus
    );


    /* Orders */

    setValue(
        "orderConfirmation",
        settings.orderConfirmation
    );


    setValue(
        "minimumOrder",
        settings.minimumOrder
    );


    setValue(
        "guestCheckout",
        settings.guestCheckout
    );


    setValue(
        "orderCancellation",
        settings.orderCancellation
    );


    setValue(
        "cancellationLimit",
        settings.cancellationLimit
    );


    /* Products */

    setValue(
        "lowStockThreshold",
        settings.lowStockThreshold
    );


    setValue(
        "productsPerPage",
        settings.productsPerPage
    );


    setValue(
        "outOfStockPurchase",
        settings.outOfStockPurchase
    );


    setValue(
        "showSku",
        settings.showSku
    );


    setValue(
        "showStock",
        settings.showStock
    );


    /* Customers */

    setValue(
        "customerRegistration",
        settings.customerRegistration
    );


    setValue(
        "emailVerification",
        settings.emailVerification
    );


    setValue(
        "customerApproval",
        settings.customerApproval
    );


    /* Notifications */

    setChecked(
        "notifyOrders",
        settings.notifyOrders
    );


    setChecked(
        "notifyCustomers",
        settings.notifyCustomers
    );


    setChecked(
        "notifyLowStock",
        settings.notifyLowStock
    );


    setChecked(
        "emailNotifications",
        settings.emailNotifications
    );


    /* Storefront */

    setValue(
        "homepageTitle",
        settings.homepageTitle
    );


    setValue(
        "homepageDescription",
        settings.homepageDescription
    );


    setValue(
        "featuredProducts",
        settings.featuredProducts
    );


    /* Security */

    setValue(
        "sessionTimeout",
        settings.sessionTimeout
    );


    updateStoreStatusUI();


    setupStoreStatus();


    setupSaveButton();


    setupCancelButton();

}



/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    element.value =
        value ?? "";

}


function setChecked(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    element.checked =
        Boolean(value);

}



/* =========================================================
   STORE STATUS
========================================================= */

function setupStoreStatus() {

    const storeStatus =
        document.getElementById(
            "storeStatus"
        );


    storeStatus?.addEventListener(
        "change",
        () => {

            const settings =
                getSettings();


            settings.storeStatus =
                storeStatus.checked;


            saveSettings(
                settings
            );


            updateStoreStatusUI();


            showToast(
                storeStatus.checked
                    ? "Store is now open."
                    : "Store is now closed."
            );

        }
    );

}


function updateStoreStatusUI() {

    const storeStatus =
        document.getElementById(
            "storeStatus"
        );


    const title =
        document.getElementById(
            "storeStatusTitle"
        );


    const description =
        document.getElementById(
            "storeStatusDescription"
        );


    if (
        !storeStatus ||
        !title ||
        !description
    ) {

        return;

    }


    if (
        storeStatus.checked
    ) {

        title.textContent =
            "Store is open";


        description.textContent =
            "Customers can currently browse and purchase products.";

    }

    else {

        title.textContent =
            "Store is closed";


        description.textContent =
            "Customers cannot currently place new purchases.";

    }

}



/* =========================================================
   SAVE SETTINGS
========================================================= */

function setupSaveButton() {

    const button =
        document.getElementById(
            "saveSettings"
        );


    button?.addEventListener(
        "click",
        saveAllSettings
    );

}


function saveAllSettings() {

    const settings = {


        /* General */

        storeName:
            getValue(
                "storeName"
            ) ||
            "ShopMax",


        storeEmail:
            getValue(
                "storeEmail"
            ),


        storePhone:
            getValue(
                "storePhone"
            ),


        storeAddress:
            getValue(
                "storeAddress"
            ),


        currency:
            getValue(
                "currency"
            ) ||
            "USD",


        language:
            getValue(
                "language"
            ) ||
            "en",


        storeStatus:
            getChecked(
                "storeStatus"
            ),



        /* Orders */

        orderConfirmation:
            getValue(
                "orderConfirmation"
            ),


        minimumOrder:
            Number(
                getValue(
                    "minimumOrder"
                )
            ) || 0,


        guestCheckout:
            getValue(
                "guestCheckout"
            ),


        orderCancellation:
            getValue(
                "orderCancellation"
            ),


        cancellationLimit:
            getValue(
                "cancellationLimit"
            ),



        /* Products */

        lowStockThreshold:
            Number(
                getValue(
                    "lowStockThreshold"
                )
            ) || 0,


        productsPerPage:
            getValue(
                "productsPerPage"
            ),


        outOfStockPurchase:
            getValue(
                "outOfStockPurchase"
            ),


        showSku:
            getValue(
                "showSku"
            ),


        showStock:
            getValue(
                "showStock"
            ),



        /* Customers */

        customerRegistration:
            getValue(
                "customerRegistration"
            ),


        emailVerification:
            getValue(
                "emailVerification"
            ),


        customerApproval:
            getValue(
                "customerApproval"
            ),



        /* Notifications */

        notifyOrders:
            getChecked(
                "notifyOrders"
            ),


        notifyCustomers:
            getChecked(
                "notifyCustomers"
            ),


        notifyLowStock:
            getChecked(
                "notifyLowStock"
            ),


        emailNotifications:
            getChecked(
                "emailNotifications"
            ),



        /* Storefront */

        homepageTitle:
            getValue(
                "homepageTitle"
            ),


        homepageDescription:
            getValue(
                "homepageDescription"
            ),


        featuredProducts:
            getValue(
                "featuredProducts"
            ),



        /* Security */

        sessionTimeout:
            getValue(
                "sessionTimeout"
            )

    };


    if (
        saveSettings(
            settings
        )
    ) {

        showToast(
            "Settings saved successfully."
        );

    }

}



/* =========================================================
   CANCEL
========================================================= */

function setupCancelButton() {

    const button =
        document.getElementById(
            "resetSettings"
        );


    button?.addEventListener(
        "click",
        () => {

            const saved =
                getSettings();


            populateSettings(
                saved
            );


            showToast(
                "Unsaved changes cancelled."
            );

        }
    );

}


function populateSettings(
    settings
) {

    Object.keys(
        settings
    ).forEach(
        key => {

            const element =
                document.getElementById(
                    key
                );


            if (!element) {

                return;

            }


            if (
                element.type ===
                "checkbox"
            ) {

                element.checked =
                    Boolean(
                        settings[key]
                    );

            }

            else {

                element.value =
                    settings[key] ?? "";

            }

        }
    );


    updateStoreStatusUI();

}



/* =========================================================
   GETTERS
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";

}


function getChecked(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.checked
        : false;

}



/* =========================================================
   PROFILE MODAL
========================================================= */

function setupProfileModal() {

    const openButton =
        document.getElementById(
            "editProfileBtn"
        );


    const saveButton =
        document.getElementById(
            "saveProfile"
        );


    openButton?.addEventListener(
        "click",
        () => {

            const profile =
                getProfile();


            setValue(
                "profileName",
                profile.name
            );


            setValue(
                "profileEmail",
                profile.email
            );


            openModal(
                "profileModal"
            );

        }
    );


    saveButton?.addEventListener(
        "click",
        saveProfile
    );


    document
        .querySelectorAll(
            '[data-close-modal="profileModal"]'
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            "profileModal"
                        );

                    }
                );

            }
        );

}


function getProfile() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "shopmax-admin-profile"
            )
        ) || {

            name:
                "Administrator",

            email:
                "admin@shopmax.com"

        };

    }

    catch {

        return {

            name:
                "Administrator",

            email:
                "admin@shopmax.com"

        };

    }

}


function saveProfile() {

    const name =
        getValue(
            "profileName"
        );


    const email =
        getValue(
            "profileEmail"
        );


    if (!name) {

        showToast(
            "Please enter your name."
        );

        return;

    }


    if (
        !email ||
        !email.includes("@")
    ) {

        showToast(
            "Please enter a valid email."
        );

        return;

    }


    const profile = {

        name,
        email

    };


    localStorage.setItem(
        "shopmax-admin-profile",
        JSON.stringify(
            profile
        )
    );


    updateProfileUI(
        profile
    );


    closeModal(
        "profileModal"
    );


    showToast(
        "Profile updated successfully."
    );

}


function updateProfileUI(
    profile
) {

    const name =
        document.getElementById(
            "adminName"
        );


    const email =
        document.getElementById(
            "adminEmail"
        );


    const avatar =
        document.getElementById(
            "accountAvatar"
        );


    if (name) {

        name.textContent =
            profile.name;

    }


    if (email) {

        email.textContent =
            profile.email;

    }


    if (avatar) {

        avatar.textContent =
            profile.name
                .charAt(0)
                .toUpperCase();

    }

}


function loadProfile() {

    const profile =
        getProfile();


    updateProfileUI(
        profile
    );

}


loadProfile();



/* =========================================================
   PASSWORD MODAL
========================================================= */

function setupPasswordModal() {

    const button =
        document.getElementById(
            "changePasswordBtn"
        );


    const saveButton =
        document.getElementById(
            "savePassword"
        );


    button?.addEventListener(
        "click",
        () => {

            clearPasswordFields();

            openModal(
                "passwordModal"
            );

        }
    );


    saveButton?.addEventListener(
        "click",
        savePassword
    );


    document
        .querySelectorAll(
            '[data-close-modal="passwordModal"]'
        )
        .forEach(
            closeButton => {

                closeButton.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            "passwordModal"
                        );

                    }
                );

            }
        );

}


function savePassword() {

    const current =
        getValue(
            "currentPassword"
        );


    const password =
        getValue(
            "newPassword"
        );


    const confirm =
        getValue(
            "confirmPassword"
        );


    if (!current) {

        showToast(
            "Enter your current password."
        );

        return;

    }


    if (
        password.length < 6
    ) {

        showToast(
            "New password must be at least 6 characters."
        );

        return;

    }


    if (
        password !== confirm
    ) {

        showToast(
            "New passwords do not match."
        );

        return;

    }


    /*
       Front-end demo only.
       Real password authentication must be
       handled by a backend.
    */

    localStorage.setItem(
        "shopmax-password-changed",
        "true"
    );


    closeModal(
        "passwordModal"
    );


    clearPasswordFields();


    showToast(
        "Password updated successfully."
    );

}


function clearPasswordFields() {

    setValue(
        "currentPassword",
        ""
    );


    setValue(
        "newPassword",
        ""
    );


    setValue(
        "confirmPassword",
        ""
    );

}



/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(
    id
) {

    const modal =
        document.getElementById(id);


    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(
    id
) {

    const modal =
        document.getElementById(id);


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !document.querySelector(
            ".settings-modal.show"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}



/* =========================================================
   CLOSE MODAL BY BACKDROP / ESC
========================================================= */

document.addEventListener(
    "click",
    event => {

        const modal =
            event.target.closest(
                ".settings-modal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeModal(
                modal.id
            );

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        document
            .querySelectorAll(
                ".settings-modal.show"
            )
            .forEach(
                modal => {

                    closeModal(
                        modal.id
                    );

                }
            );

    }
);



/* =========================================================
   DANGER ZONE
========================================================= */

function setupDangerZone() {

    const resetButton =
        document.getElementById(
            "dangerResetBtn"
        );


    const clearButton =
        document.getElementById(
            "clearSettingsBtn"
        );


    resetButton?.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Reset all ShopMax settings to their default values?"
                );


            if (!confirmed) {

                return;

            }


            saveSettings(
                {
                    ...DEFAULT_SETTINGS
                }
            );


            populateSettings(
                DEFAULT_SETTINGS
            );


            showToast(
                "Settings restored to defaults."
            );

        }
    );


    clearButton?.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Clear all saved ShopMax settings from this browser?"
                );


            if (!confirmed) {

                return;

            }


            localStorage.removeItem(
                "shopmax-settings"
            );


            populateSettings(
                DEFAULT_SETTINGS
            );


            showToast(
                "Saved settings data cleared."
            );

        }
    );

}



/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "settingsToast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


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
            2600
        );

}