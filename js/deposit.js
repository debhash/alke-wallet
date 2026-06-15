$(function () {
    const walletHelpers = window.walletApp;
    const $depositForm = $("#deposit-form");
    const $amountInput = $("#monto");
    const $depositMessage = $("#deposit-message");
    const $balanceAmount = $("#balance-amount");

    const showMessage = (text, type) => walletHelpers.setAlert($depositMessage, text, type);
    const hideMessage = () => walletHelpers.setAlert($depositMessage);

    const updateBalanceView = () => {
        $balanceAmount.text(walletHelpers.formatBalance(walletHelpers.getBalance()));
    };

    updateBalanceView();

    $depositForm.on("submit", function (event) {
        event.preventDefault();

        const rawAmount = $amountInput.val().trim();
        const isIntegerAmount = /^\d+$/.test(rawAmount);

        if (!isIntegerAmount) {
            showMessage("Ingresa solo números enteros, sin letras ni símbolos.", "danger");
            return;
        }

        const amount = Number(rawAmount);

        if (!Number.isInteger(amount) || amount <= 0) {
            showMessage("Ingresa un monto válido mayor a cero.", "danger");
            return;
        }

        const newBalance = walletHelpers.getBalance() + amount;
        walletHelpers.setBalance(newBalance);
        walletHelpers.addTransaction({
            title: "Depósito realizado",
            amount,
            type: "deposit",
            date: walletHelpers.getCurrentTimeLabel(),
        });
        updateBalanceView();
        showMessage(`Depósito realizado con éxito. Se abonaron ${walletHelpers.formatBalance(amount)}.`, "success");
        this.reset();
    });

    walletHelpers.onView("deposit", function () {
        updateBalanceView();
        hideMessage();
    });

    walletHelpers.onEvent("wallet:logout", function () {
        $depositForm.trigger("reset");
        hideMessage();
        updateBalanceView();
    });
});
