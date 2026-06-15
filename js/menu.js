$(function () {
    const { formatBalance, getBalance, onEvent, onView } = window.walletApp;
    const $menuBalance = $("#menu-balance");

    const renderBalance = () => {
        $menuBalance.text(formatBalance(getBalance()));
    };

    renderBalance();
    onEvent("wallet:datachange", renderBalance);
    onView("menu", renderBalance);
});
