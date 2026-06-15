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

const protectedViews = new Set(["menu", "deposit", "sendmoney", "transactions"]);

const getUser = () => {
    const storedUser = sessionStorage.getItem("walletUser");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        sessionStorage.removeItem("walletUser");
        return null;
    }
};

const setUser = (user) => {
    sessionStorage.setItem("walletUser", JSON.stringify(user));
};

const emit = (eventName, payload) => {
    $(document).trigger(eventName, payload === undefined ? [] : [payload]);
};

const onEvent = (eventName, handler) => {
    $(document).on(eventName, handler);
};

const onView = (viewName, handler) => {
    onEvent("wallet:viewchange", function (_event, currentView) {
        if (currentView === viewName) {
            handler(currentView);
        }
    });
};

const triggerDataChange = () => {
    emit("wallet:datachange");
};

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

const setBalance = (balance) => {
    sessionStorage.setItem("walletBalance", String(balance));
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
    const storedTransactions = sessionStorage.getItem("walletTransactions");

    if (!storedTransactions) {
        sessionStorage.setItem("walletTransactions", JSON.stringify(defaultTransactions));
        return [...defaultTransactions];
    }

    try {
        const parsedTransactions = JSON.parse(storedTransactions);

        if (!Array.isArray(parsedTransactions)) {
            throw new Error("Invalid transactions");
        }

        return parsedTransactions;
    } catch {
        sessionStorage.setItem("walletTransactions", JSON.stringify(defaultTransactions));
        return [...defaultTransactions];
    }
};

const saveTransactions = (transactions) => {
    sessionStorage.setItem("walletTransactions", JSON.stringify(transactions));
};

const addTransaction = (transaction) => {
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    triggerDataChange();
};

const getContacts = () => {
    const storedContacts = sessionStorage.getItem("walletContacts");

    const normalizeContacts = (contacts) => {
        return contacts.map((contact) => ({
            ...contact,
            accountNumber: contact.accountNumber || contact.cbu || "",
        }));
    };

    if (!storedContacts) {
        sessionStorage.setItem("walletContacts", JSON.stringify(defaultContacts));
        return [...defaultContacts];
    }

    try {
        const parsedContacts = JSON.parse(storedContacts);

        if (!Array.isArray(parsedContacts)) {
            throw new Error("Invalid contacts");
        }

        const normalizedContacts = normalizeContacts(parsedContacts);
        saveContacts(normalizedContacts);
        return normalizedContacts;
    } catch {
        sessionStorage.setItem("walletContacts", JSON.stringify(defaultContacts));
        return [...defaultContacts];
    }
};

const saveContacts = (contacts) => {
    sessionStorage.setItem("walletContacts", JSON.stringify(contacts));
};

const addContact = (contact) => {
    const contacts = getContacts();
    contacts.push(contact);
    saveContacts(contacts);
    triggerDataChange();
};

window.walletApp = {
    formatCurrency,
    formatBalance,
    getCurrentTimeLabel,
    setAlert,
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
