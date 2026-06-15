const dummyClients = [
    {
        name: "Ana Perez",
        email: "ana@wallet.cl",
        password: "Ana123",
    },
    {
        name: "Pedro Soto",
        email: "pedro@wallet.cl",
        password: "Pedro123",
    },
];

$(function () {
    const { loginUser, onEvent, onView, setAlert } = window.walletApp;
    const $loginForm = $("#login-form");
    const $emailInput = $("#email");
    const $passwordInput = $("#password");
    const $loginMessage = $("#login-message");

    const hideMessage = () => {
        setAlert($loginMessage);
    };

    const resetLoginForm = () => {
        $loginForm.trigger("reset");
        hideMessage();
    };

    $loginForm.on("submit", function (event) {
        event.preventDefault();

        const email = $emailInput.val().trim().toLowerCase();
        const password = $passwordInput.val().trim();

        const client = dummyClients.find((item) => item.email === email && item.password === password);

        if (!client) {
            setAlert($loginMessage, "Credenciales incorrectas. Verifica el correo y la contraseña.", "danger");
            return;
        }

        loginUser(client);
        resetLoginForm();
    });

    onView("login", hideMessage);
    onEvent("wallet:logout", function () {
        resetLoginForm();
    });
});
