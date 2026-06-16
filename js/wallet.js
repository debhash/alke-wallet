// Initial data
const initialBalance = 350000;
const defaultContacts = [
    {
        id: "contact-1",
        name: "Bruce Lee",
        accountNumber: "1234567890123456789012",
        alias: "bruce.lee",
        bank: "Banco Estado",
    },
    {
        id: "contact-2",
        name: "Jackie Chan",
        accountNumber: "2345678901234567890123",
        alias: "jackie.chan",
        bank: "Cuenta RUT",
    },
    {
        id: "contact-3",
        name: "Jet Li",
        accountNumber: "3456789012345678901234",
        alias: "jet.li",
        bank: "Banco de Chile",
    },
    {
        id: "contact-4",
        name: "Chuck Norris",
        accountNumber: "4567890123456789012345",
        alias: "chuck.norris",
        bank: "Banco Santander",
    },
];
const defaultTransactions = [
    {
        title: "Depósito de Freddie Mercury",
        amount: 120000,
        type: "deposit",
        date: "Hoy - 09:15 hrs",
    },
    {
        title: "Transferencia a Frida Kahlo",
        amount: 35000,
        type: "send",
        date: "Ayer - 18:40 hrs",
    },
    {
        title: "Depósito de David Bowie",
        amount: 80000,
        type: "deposit",
        date: "Ayer - 11:05 hrs",
    },
    {
        title: "Transferencia a Audrey Hepburn",
        amount: 22500,
        type: "send",
        date: "02 Jun - 16:20 hrs",
    },
    {
        title: "Depósito de Bruce Lee",
        amount: 54000,
        type: "deposit",
        date: "01 Jun - 13:30 hrs",
    },
];

const defaultAuthUsers = [
    {
        // demo account for testing
        name: "Demo User",
        username: "demo",
        password: "Demo123",
    },
];

// Display helpers
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL").format(amount);
};

const formatBalance = (amount) => {
    return `$ ${formatCurrency(amount)} CLP`;
};

const getCurrentTimeLabel = () => {
    const now = new Date();

    return `Hoy - ${now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} hrs`;
};

const setAlert = ($element, text, type) => {
    if (!text) {
        $element.text("").attr("class", "alert d-none");
        return;
    }

    $element.text(text).attr("class", `alert alert-${type}`);
};

// Shared storage helpers
const normalizeUsername = (username) => {
    return username.trim().toLowerCase();
};

const cloneList = (items) => {
    return items.map((item) => ({ ...item }));
};

const writeStoredJson = (storage, key, value) => {
    storage.setItem(key, JSON.stringify(value));
};

const readStoredObject = (storage, key) => {
    const storedValue = storage.getItem(key);

    if (!storedValue) {
        return null;
    }

    try {
        return JSON.parse(storedValue);
    } catch {
        storage.removeItem(key);
        return null;
    }
};

const readStoredList = (storage, key, fallback, options = {}) => {
    const { isValidItem = () => true, normalizeItems = (items) => items } = options;
    const fallbackItems = normalizeItems(cloneList(fallback));
    const storedValue = storage.getItem(key);

    if (!storedValue) {
        writeStoredJson(storage, key, fallbackItems);
        return fallbackItems;
    }

    try {
        const parsedValue = JSON.parse(storedValue);

        if (!Array.isArray(parsedValue)) {
            throw new Error("Invalid list");
        }

        const nextItems = normalizeItems(parsedValue.filter(isValidItem));
        writeStoredJson(storage, key, nextItems);
        return nextItems;
    } catch {
        writeStoredJson(storage, key, fallbackItems);
        return fallbackItems;
    }
};

const saveStoredList = (storage, key, items) => {
    writeStoredJson(storage, key, items);
};

const saveStoredValue = (storage, key, value) => {
    storage.setItem(key, String(value));
};

// Authentication helpers
const getAuthUsers = () => {
    return readStoredList(localStorage, "walletUsers", defaultAuthUsers, {
        isValidItem: (user) =>
            user &&
            typeof user.name === "string" &&
            typeof user.username === "string" &&
            typeof user.password === "string",
    });
};

const saveAuthUsers = (users) => {
    saveStoredList(localStorage, "walletUsers", users);
};

const authenticateUser = (username, password) => {
    const normalizedUsername = normalizeUsername(username);

    return getAuthUsers().find(
        (user) => normalizeUsername(user.username) === normalizedUsername && user.password === password,
    );
};

const registerUser = ({ name, username, password }) => {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();
    const normalizedUsername = normalizeUsername(username);

    if (!trimmedName || !normalizedUsername || !trimmedPassword) {
        return { ok: false, message: "Completa nombre, usuario y contraseña." };
    }

    const users = getAuthUsers();
    const usernameExists = users.some((user) => normalizeUsername(user.username) === normalizedUsername);

    if (usernameExists) {
        return { ok: false, message: "Ese nombre de usuario ya está registrado." };
    }

    const newUser = {
        name: trimmedName,
        username: normalizedUsername,
        password: trimmedPassword,
    };

    users.push(newUser);
    saveAuthUsers(users);

    return { ok: true, user: newUser };
};

const getUser = () => {
    return readStoredObject(sessionStorage, "walletUser");
};

const setUser = (user) => {
    writeStoredJson(sessionStorage, "walletUser", user);
};

// Custom events and view changes
const emit = (eventName, payload) => {
    $(document).trigger(eventName, payload === undefined ? [] : [payload]);
};

const onEvent = (eventName, handler) => {
    $(document).on(eventName, handler);
};

const onView = (viewName, handler) => {
    onEvent("wallet:viewchange", function (_event, currentView) {
        if (currentView === viewName) {
            handler();
        }
    });
};

const triggerDataChange = () => {
    emit("wallet:datachange");
};

const protectedViews = new Set(["menu", "deposit", "sendmoney", "transactions"]);

const updateNavState = (viewName) => {
    $(".wallet-navbar .nav-link").each(function () {
        const $link = $(this);
        const isActive = $link.data("view") === viewName;

        $link.toggleClass("active", isActive);

        if (isActive) {
            $link.attr("aria-current", "page");
            return;
        }

        $link.removeAttr("aria-current");
    });
};

const showView = (viewName) => {
    const nextView = protectedViews.has(viewName) && !getUser() ? "login" : viewName;

    $(".app-view").addClass("d-none");
    $(`#view-${nextView}`).removeClass("d-none");
    $("#app-navbar").toggleClass("d-none", nextView === "login");
    $("#wallet-navbar-content").removeClass("show");
    updateNavState(nextView);
    emit("wallet:viewchange", nextView);

    return nextView;
};

const loginUser = (user) => {
    setUser(user);
    showView("menu");
};

const logoutUser = () => {
    sessionStorage.clear();
    emit("wallet:logout");
    showView("login");
};

// Wallet state
const setBalance = (balance) => {
    saveStoredValue(sessionStorage, "walletBalance", balance);
    triggerDataChange();
};

const getBalance = () => {
    const storedBalanceValue = sessionStorage.getItem("walletBalance");

    if (storedBalanceValue === null) {
        sessionStorage.setItem("walletBalance", String(initialBalance));
        return initialBalance;
    }

    const storedBalance = Number(storedBalanceValue);

    if (!Number.isFinite(storedBalance) || storedBalance < 0) {
        sessionStorage.setItem("walletBalance", String(initialBalance));
        return initialBalance;
    }

    return storedBalance;
};

const getTransactions = () => {
    return readStoredList(sessionStorage, "walletTransactions", defaultTransactions);
};

const saveTransactions = (transactions) => {
    saveStoredList(sessionStorage, "walletTransactions", transactions);
};

const addTransaction = (transaction) => {
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    triggerDataChange();
};

const getContacts = () => {
    const normalizeContacts = (contacts) => {
        return contacts.map((contact) => ({
            ...contact,
            accountNumber: contact.accountNumber || contact.cbu || "",
        }));
    };

    return readStoredList(sessionStorage, "walletContacts", defaultContacts, {
        normalizeItems: normalizeContacts,
    });
};

const saveContacts = (contacts) => {
    saveStoredList(sessionStorage, "walletContacts", contacts);
};

const addContact = (contact) => {
    const contacts = getContacts();
    contacts.push(contact);
    saveContacts(contacts);
    triggerDataChange();
};

// Shared API for the page scripts
window.walletApp = {
    formatCurrency,
    formatBalance,
    getCurrentTimeLabel,
    setAlert,
    authenticateUser,
    registerUser,
    getUser,
    showView,
    loginUser,
    logoutUser,
    onEvent,
    onView,
    getBalance,
    setBalance,
    getTransactions,
    addTransaction,
    getContacts,
    addContact,
};

// Global DOM bindings
$(function () {
    $("[data-view]").on("click", function (event) {
        event.preventDefault();

        const targetView = $(this).data("view");

        if (typeof targetView === "string" && targetView) {
            showView(targetView);
        }
    });

    $(".navbar-toggler").on("click", function () {
        $("#wallet-navbar-content").toggleClass("show");
    });

    $("#logout-button").on("click", function () {
        logoutUser();
    });

    showView(getUser() ? "menu" : "login");
});
