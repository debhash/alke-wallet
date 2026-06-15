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

const getBalance = () => {
    const storedBalance = Number(sessionStorage.getItem("walletBalance"));

    if (Number.isNaN(storedBalance) || storedBalance <= 0) {
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
};

window.walletApp = {
    formatCurrency,
    getBalance,
    getTransactions,
    addTransaction,
    getContacts,
    addContact,
};

$(function () {
    const currentPage = window.location.pathname.split("/").pop() || "menu.html";

    $(".wallet-navbar .nav-link").each(function () {
        const $link = $(this);
        const isActive = $link.attr("href") === currentPage;

        $link.toggleClass("active", isActive);

        if (isActive) {
            $link.attr("aria-current", "page");
            return;
        }

        $link.removeAttr("aria-current");
    });

    $("#logout-button").on("click", function () {
        sessionStorage.clear();
        window.location.href = "login.html";
    });
});
