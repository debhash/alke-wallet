let selectedContact = null;

$(function () {
    const walletHelpers = window.walletApp;
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
    const $contactModal = $("#nuevoContactoModal");
    const $openContactModalButton = $("[data-bs-target='#nuevoContactoModal']");
    const $closeContactModalButton = $contactModal.find("[data-bs-dismiss='modal']");

    const showAlert = ($element, text, type) => walletHelpers.setAlert($element, text, type);
    const hideAlert = ($element) => walletHelpers.setAlert($element);

    const updateBalance = () => {
        $sendBalance.text(walletHelpers.formatBalance(walletHelpers.getBalance()));
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

    const resetTransferState = () => {
        selectedContact = null;
        $searchForm.trigger("reset");
        $sendMoneyForm.trigger("reset");
        $selectedContactCard.addClass("d-none");
        $transferSection.addClass("d-none");
        hideAlert($sendMessage);
    };

    const closeContactModal = () => {
        $contactModal.removeClass("show d-block").attr("aria-hidden", "true");
        $("body").removeClass("wallet-modal-open");
        $newContactForm.trigger("reset");
        hideAlert($contactMessage);
    };

    const openContactModal = () => {
        $contactModal.addClass("show d-block").attr("aria-hidden", "false");
        $("body").addClass("wallet-modal-open");
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

        walletHelpers.setBalance(newBalance);
        walletHelpers.addTransaction({
            title: transferTitle,
            amount,
            type: "send",
            date: walletHelpers.getCurrentTimeLabel(),
        });

        updateBalance();
        showAlert($sendMessage, `Transferencia exitosa por ${walletHelpers.formatBalance(amount)}.`, "success");
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
        closeContactModal();
    });

    $openContactModalButton.on("click", function () {
        openContactModal();
    });

    $closeContactModalButton.on("click", function () {
        closeContactModal();
    });

    $contactModal.on("click", function (event) {
        if (event.target === this) {
            closeContactModal();
        }
    });

    walletHelpers.onEvent("wallet:datachange", function () {
        updateBalance();
        renderContacts();
    });

    walletHelpers.onView("sendmoney", function () {
        updateBalance();
        renderContacts();
    });

    walletHelpers.onEvent("wallet:logout", function () {
        resetTransferState();
        closeContactModal();
    });
});
