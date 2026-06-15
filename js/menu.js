$(function () {
    const $menuBalance = $("#menu-balance");

    if ($menuBalance.length) {
        const { formatCurrency, getBalance } = window.walletApp;
        $menuBalance.text(`$ ${formatCurrency(getBalance())} CLP`);
    }
});
