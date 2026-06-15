const walletHelpers = window.walletApp;

$(function () {
    const $depositForm = $("#deposit-form");
    const $amountInput = $("#monto");
    const $depositMessage = $("#deposit-message");
    const $balanceAmount = $("#balance-amount");

    const showMessage = (text, type) => {
        $depositMessage.text(text).attr("class", `alert alert-${type}`);
    };

    const updateBalanceView = () => {
        $balanceAmount.text(`$ ${walletHelpers.formatCurrency(walletHelpers.getBalance())} CLP`);
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
        const now = new Date();
        const formattedHour = now.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
        });

        sessionStorage.setItem("walletBalance", String(newBalance));
        walletHelpers.addTransaction({
            title: "Depósito realizado",
            amount,
            type: "deposit",
            date: `Hoy - ${formattedHour} hrs`,
        });
        updateBalanceView();
        showMessage(
            `Depósito realizado con éxito. Se abonaron $ ${walletHelpers.formatCurrency(amount)} CLP.`,
            "success",
        );
        this.reset();
    });
});
