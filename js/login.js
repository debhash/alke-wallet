$(function () {
    const { authenticateUser, loginUser, onEvent, onView, registerUser, setAlert } = window.walletApp;
    const $loginForm = $("#login-form");
    const $usernameInput = $("#login-username");
    const $passwordInput = $("#login-password");
    const $loginMessage = $("#login-message");
    const $registerForm = $("#register-form");
    const $registerNameInput = $("#register-name");
    const $registerUsernameInput = $("#register-username");
    const $registerPasswordInput = $("#register-password");
    const $registerMessage = $("#register-message");
    const $registerModal = $("#registerModal");
    const $openRegisterModalButton = $("[data-bs-target='#registerModal']");
    const $closeRegisterModalButton = $registerModal.find("[data-bs-dismiss='modal']");

    const hideMessage = () => {
        setAlert($loginMessage);
    };

    const hideRegisterMessage = () => {
        setAlert($registerMessage);
    };

    const resetLoginForm = () => {
        $loginForm.trigger("reset");
        hideMessage();
    };

    const resetRegisterForm = () => {
        $registerForm.trigger("reset");
        hideRegisterMessage();
    };

    const closeRegisterModal = () => {
        if ($registerModal.find(":focus").length) {
            $registerModal.find(":focus").trigger("blur");
        }

        $registerModal.removeClass("show d-block").attr("aria-hidden", "true");
        $("body").removeClass("wallet-modal-open");
        resetRegisterForm();
    };

    const openRegisterModal = () => {
        $registerModal.addClass("show d-block").attr("aria-hidden", "false");
        $("body").addClass("wallet-modal-open");
        hideRegisterMessage();
    };

    $loginForm.on("submit", function (event) {
        event.preventDefault();

        const username = $usernameInput.val().trim();
        const password = $passwordInput.val().trim();

        const user = authenticateUser(username, password);

        if (!user) {
            setAlert($loginMessage, "Usuario o contraseña incorrectos.", "danger");
            return;
        }

        loginUser(user);
        resetLoginForm();
    });

    $registerForm.on("submit", function (event) {
        event.preventDefault();

        const result = registerUser({
            name: $registerNameInput.val(),
            username: $registerUsernameInput.val(),
            password: $registerPasswordInput.val(),
        });

        if (!result.ok) {
            setAlert($registerMessage, result.message, "danger");
            return;
        }

        setAlert($registerMessage, "Registro completado. Ya puedes iniciar sesión con tu usuario.", "success");
        $usernameInput.val(result.user.username);
        $passwordInput.val("");
        closeRegisterModal();
    });

    $openRegisterModalButton.on("click", function () {
        openRegisterModal();
    });

    $closeRegisterModalButton.on("click", function () {
        closeRegisterModal();
    });

    $registerModal.on("click", function (event) {
        if (event.target === this) {
            closeRegisterModal();
        }
    });

    onView("login", function () {
        hideMessage();
        hideRegisterMessage();
    });

    onEvent("wallet:logout", function () {
        resetLoginForm();
        closeRegisterModal();
    });
});
