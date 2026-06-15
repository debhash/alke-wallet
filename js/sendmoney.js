let selectedContact = null;

const walletHelpers = window.walletApp;

const getCurrentTimeLabel = () => {
    const now = new Date();
    const formattedHour = now.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `Hoy - ${formattedHour} hrs`;
};

$(function () {
    const $searchForm = $("#contact-search-form");
    const $contactSelect = $("#buscar-contacto");
    const $sendMessage = $("#send-message");
    const $sendBalance = $("#send-balance");
    const $selectedContactCard = $("#selected-contact-card");
    const $selectedContactName = $("#selected-contact-name");
    const $selectedContactBank = $("#selected-contact-bank");
    const $selectedContactAlias = $("#selected-contact-alias");
    const $transferSection = $("#transfer-section");
    const $sendMoneyForm = $("#send-money-form");
    const $transferAmountInput = $("#transfer-amount");
    const $transferNoteInput = $("#transfer-note");
    const $newContactForm = $("#new-contact-form");
    const $nameInput = $("#nombre-contacto");
    const $accountNumberInput = $("#numero-cuenta-contacto");
    const $aliasInput = $("#alias-contacto");
    const $bankInput = $("#banco-contacto");
    const $contactMessage = $("#contact-message");
    const contactModalElement = document.getElementById("nuevoContactoModal");
    const contactModal = bootstrap.Modal.getOrCreateInstance(contactModalElement);

    const showAlert = ($element, text, type) => {
        $element.text(text).attr("class", `alert alert-${type}`);
    };

    const hideAlert = ($element) => {
        $element.text("").attr("class", "alert d-none");
    };

    const updateBalance = () => {
        $sendBalance.text(`$ ${walletHelpers.formatCurrency(walletHelpers.getBalance())} CLP`);
    };

    const renderContacts = () => {
        const contacts = walletHelpers.getContacts();

        $contactSelect.html('<option value="">Selecciona un contacto</option>');

        contacts.forEach((contact) => {
            $("<option>").val(contact.id).text(`${contact.name} - ${contact.bank}`).appendTo($contactSelect);
        });
    };

    const renderSelectedContact = (contact) => {
        selectedContact = contact;
        $selectedContactName.text(contact.name);
        $selectedContactBank.text(`${contact.bank} | Cuenta: ${contact.accountNumber}`);
        $selectedContactAlias.text(`Alias: ${contact.alias}`);
        $selectedContactCard.removeClass("d-none");
        $transferSection.removeClass("d-none");
    };

    updateBalance();
    renderContacts();

    $searchForm.on("submit", function (event) {
        event.preventDefault();
        hideAlert($sendMessage);

        const selectedId = $contactSelect.val();

        if (!selectedId) {
            $selectedContactCard.addClass("d-none");
            $transferSection.addClass("d-none");
            showAlert($sendMessage, "Selecciona un contacto para continuar.", "danger");
            return;
        }

        const contact = walletHelpers.getContacts().find((item) => item.id === selectedId);

        if (!contact) {
            showAlert($sendMessage, "No se encontró el contacto seleccionado.", "danger");
            return;
        }

        renderSelectedContact(contact);
        showAlert($sendMessage, `Contacto ${contact.name} cargado correctamente.`, "success");
    });

    $sendMoneyForm.on("submit", function (event) {
        event.preventDefault();
        hideAlert($sendMessage);

        if (!selectedContact) {
            showAlert($sendMessage, "Primero debes seleccionar un contacto.", "danger");
            return;
        }

        const rawAmount = $transferAmountInput.val().trim();

        if (!/^\d+$/.test(rawAmount)) {
            showAlert($sendMessage, "Ingresa solo números enteros para transferir.", "danger");
            return;
        }

        const amount = Number(rawAmount);

        if (!Number.isInteger(amount) || amount <= 0) {
            showAlert($sendMessage, "Ingresa un monto válido mayor a cero.", "danger");
            return;
        }

        const currentBalance = walletHelpers.getBalance();

        if (amount > currentBalance) {
            showAlert($sendMessage, "No tienes saldo suficiente para realizar esta transferencia.", "danger");
            return;
        }

        const newBalance = currentBalance - amount;
        const note = $transferNoteInput.val().trim();
        const transferTitle = note
            ? `Transferencia a ${selectedContact.name} - ${note}`
            : `Transferencia a ${selectedContact.name}`;

        sessionStorage.setItem("walletBalance", String(newBalance));
        walletHelpers.addTransaction({
            title: transferTitle,
            amount,
            type: "send",
            date: getCurrentTimeLabel(),
        });

        updateBalance();
        showAlert($sendMessage, `Transferencia exitosa por $ ${walletHelpers.formatCurrency(amount)} CLP.`, "success");
        this.reset();
    });

    $newContactForm.on("submit", function (event) {
        event.preventDefault();
        hideAlert($contactMessage);

        const name = $nameInput.val().trim();
        const accountNumber = $accountNumberInput.val().trim();
        const alias = $aliasInput.val().trim();
        const bank = $bankInput.val().trim();

        if (!name || !alias || !bank || !/^\d+$/.test(accountNumber)) {
            showAlert(
                $contactMessage,
                "Completa todos los campos y usa solo números para el número de cuenta.",
                "danger",
            );
            return;
        }

        const newContact = {
            id: `contact-${Date.now()}`,
            name,
            accountNumber,
            alias,
            bank,
        };

        walletHelpers.addContact(newContact);
        renderContacts();
        $contactSelect.val(newContact.id);
        renderSelectedContact(newContact);
        showAlert($sendMessage, `Contacto ${name} agregado a la agenda.`, "success");
        this.reset();
        contactModal.hide();
    });

    $(contactModalElement).on("hidden.bs.modal", function () {
        $newContactForm.trigger("reset");
        hideAlert($contactMessage);
    });
});
