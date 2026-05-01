document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario = document.getElementById('txt_usuario').value.trim();
        const contrasena = document.getElementById('txt_contrasena').value.trim();

        if (!usuario || !contrasena) {
            mostrar_mensaje('Ingrese el usuario y la contraseña.');
            return;
        }

        try {

            const API_URL_LOGIN = "http://localhost:3000/app/usuarios/login";

            const response = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ alias: usuario, pass: contrasena })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("usuario", JSON.stringify(data.user));

                switch (data.user.ID_ROL) {
                    case 1:
                        window.location = "registrar usuario.html";
                        break;
                    case 2:
                        window.location = "ventas.html";
                        break;
                    default:
                        break;
                }

            } else {
                mostrar_mensaje(data.message);
                return;
            }
        } catch (ex) {
            mostrar_mensaje('No se pudo establecer conexión con el servidor.');
            console.log(ex);
            return;
        }
    });
});