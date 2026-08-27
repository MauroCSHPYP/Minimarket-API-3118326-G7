document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmResetPassword');

    /**
     * Evento OnClick del botón. 
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var num_doc = document.getElementById('txt_numDoc').value.trim();
        var contrasena = document.getElementById('txt_contrasena').value.trim();
        var confirm_contrasena = document.getElementById('txt_confirm_contrasena').value.trim();
        var msg = "";

        if (!contrasena) {
            mostrar_mensaje('Ingrese la contraseña.');
            return;
        }
        if (!confirm_contrasena) {
            mostrar_mensaje('Confirme la contraseña.');
            return;
        }
        if (contrasena != confirm_contrasena) {
            mostrar_mensaje('Las contraseñas no coinciden.');
            return;
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            var API_URL_U_USER = URL_BASE_APP + "usuarios/login/reset_password";

            const usuario_obj = {
                "NUMERO_IDENTIFICACION": num_doc,
                "CONTRASENA": contrasena
            };

            const response = await fetch(API_URL_U_USER, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(usuario_obj)
            });

            const data = await response.json();

            mostrar_mensaje(data.mensaje);
            if (data.affectedRows) {
                redirigir_login_page();
            } else {
                limpiar_form();
            }

            return;

        } catch (ex) {
            mostrar_mensaje('No se pudo establecer conexión con el servidor.');
            console.log(ex);
            return;
        }
    });
});

/**
 * Limpiar los campos del formulario.
 */
async function limpiar_form() {
    try {
        var empty = "";
        document.getElementById('txt_numDoc').value = empty;
        document.getElementById('txt_contrasena').value = empty;
        document.getElementById('txt_confirm_contrasena').value = empty;

    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Limpiar variables y redirigir a la página de inicio de sesión.
 */
async function redirigir_login_page() {
    try {
        localStorage.clear();
        sessionStorage.clear();
        window.location = "../html/login.html";
    } catch (error) {
        console.log("Error al redirigir a la página de inicio.");
    }
}