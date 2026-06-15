$(function () {
    const $transactionsList = $("#transactions-list");

    if ($transactionsList.length) {
        const { formatCurrency, getTransactions } = window.walletApp;
        const transactions = getTransactions();

        $transactionsList.html(
            transactions
                .map((transaction) => {
                    const amountClass = transaction.type === "deposit" ? "text-success" : "text-danger";
                    const amountPrefix = transaction.type === "deposit" ? "+" : "-";

                    return `
                        <li class="list-group-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h3 class="h5 mb-1">${transaction.title}</h3>
                                <small class="${amountClass}">${amountPrefix} $${formatCurrency(transaction.amount)}</small>
                            </div>
                            <small class="text-muted">${transaction.date}</small>
                        </li>
                    `;
                })
                .join(""),
        );
    }
});
