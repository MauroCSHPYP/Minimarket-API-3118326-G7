/**
 * Funciones genéricas que usa toda la aplicación de Minimarket.
 * Presentado por: Mauricio Arias Olave.
 * SENA - ADSO - Grupo 7 - 3118326
 * 
 * Miembros del grupo 7:
 * 
 * - Mauricio Arias Olave
 * - Daniel Alexander Ortega Cabrera
 * - Álvaro Fabian Salamanca Sánchez
 */

var text_break_line = "\r\n";
var html_salto = "<br />";

// sessionStorage.usuario
// Objeto JSON con los datos del usuario en sesión.
// Si este valor es null, vacío o undefined, se debe redirigir a la página de iniciar sesión.

// Mostrar alerta.
function mostrar_mensaje(mensaje) {
    alert(mensaje);
}

// Comprobar si la persona inició sesión.
function comprobar_sesion() {

    var usuario = "";

    try {

        usuario = localStorage.getItem("usuario");

        if (usuario == "" || usuario == null || usuario == undefined) {
            window.location = "login.html";
        } else {
            // Crear menú: 
            crear_menu();
        }
    } catch (ex) {
        mostrar_mensaje("Hubo un error al detectar la sesión. Intente de nuevo");
        console.log(ex);
    }
}

// Cerrar sesión.
function cerrar_sesion() {
    try {

        localStorage.removeItem("usuario");

        // Variables que contienen información en sesión: 
        //sessionStorage.removeItem("arr_productos");
        //sessionStorage.removeItem("arr_personas");

        mostrar_mensaje("Gracias por usar esta aplicación");
        window.location = "../html/login.html";

    } catch (ex) {
        mostrar_mensaje("Hubo un error al cerrar la sesión. Intente de nuevo");
        console.log(ex);
    }
}

// Crear el menú - según el rol en sesión.
function crear_menu() {

    var usuario_en_sesion = "";
    var html_menu = "";
    var opciones_menu = [];

    try {
        usuario_en_sesion = JSON.parse(localStorage.getItem("usuario"));

        switch (usuario_en_sesion.ID_ROL) {
            case 1:
                // Administrador: 

                // Opciones del menú para "Administrador":
                opciones_menu.push("Registrar usuario|registrar usuario.html");
                html_menu = agregar_lista_en_menu("Administrador ", opciones_menu);

                opciones_menu = [];
                opciones_menu.push("Registrar producto|registrar producto.html");
                html_menu += agregar_lista_en_menu("Cajero ", opciones_menu);
                break;
            case 2:
                // Cajero: 
                // Opciones del menú para "Cajero":
                opciones_menu.push("Ventas|ventas.html");
                html_menu = agregar_lista_en_menu("Cajero ", opciones_menu);
                break;
            default:
                break;
        }

        // Agregar las otras opciones generales al menú: 
        html_menu += '<a href="#" onclick="cerrar_sesion()" title="Cerrar sesión">Cerrar sesión</a>' +
            '<a href="javascript:void(0);" class="icon" onclick="show_responsive_icon()">&#9776;</a>';

        // Agregar todo el contenido armado del menú: 
        document.getElementById("myTopnav").innerHTML = html_menu;

    } catch (ex) {
        mostrar_mensaje("Hubo un error al procesar la página. Intente de nuevo");
        console.log(ex);
    }
}

// Agregar lista desplegable en el menú.
// "texto_encabezado" es el texto a mostrar al inicio de la lista desplegable.
// "opciones_menu" son las opciones - guardadas en un Array - para mostrar las opciones de la lista desplegable.
function agregar_lista_en_menu(texto_encabezado, opciones_menu) {

    var lista_desplegable = '<div class="dropdown"><button class="dropbtn">{0}{1}</button><div class="dropdown-content">{2}</div></div>';
    var flecha_con_opciones = '<i class="fa fa-caret-down"></i>';
    var tiene_opciones = false;
    var html_opciones = ""; // Contiene las opciones "en HTML" creadas por la función "agregar_opcion_menu(texto, ruta)".
    var temp_texto = "";
    var temp_ruta = "";

    try {

        tiene_opciones = opciones_menu.length > 0 ? true : false;

        lista_desplegable = lista_desplegable.replace("{0}", texto_encabezado);
        lista_desplegable = lista_desplegable.replace("{1}", tiene_opciones == true ? flecha_con_opciones : "");

        // Obtener el HTML de las opciones a agregar: 
        if (tiene_opciones == true) {
            for (var i = 0; i < opciones_menu.length; i++) {
                temp_texto = opciones_menu[i].split('|')[0];
                temp_ruta = opciones_menu[i].split('|')[1];
                html_opciones += agregar_opcion_menu(temp_texto, temp_ruta);
            }
        }

        // Armar la lista desplegable completa para ser agregada en el menú: 
        lista_desplegable = lista_desplegable.replace("{2}", tiene_opciones == true ? html_opciones : "");

    } catch (ex) {
        lista_desplegable = "";
        mostrar_mensaje("Hubo un error al procesar el menú en la página. Intente de nuevo");
        console.log(ex);
    }

    return lista_desplegable;
}

// Agregar opción de menú.
// "texto" es el texto y el título a mostrar en la opción/ítem en el menú.
// "ruta"  es la URL de la opción/ítem en el menú.
function agregar_opcion_menu(texto, ruta) {

    var opcion_menu = "<a href='{0}' title='{1}'>{1}</a>";

    try {
        opcion_menu = opcion_menu.replace("{0}", ruta);
        opcion_menu = opcion_menu.replace("{1}", texto);
        opcion_menu = opcion_menu.replace("{1}", texto);

    } catch (ex) {
        opcion_menu = "";
        mostrar_mensaje("Hubo un error al procesar la página. Intente de nuevo");
        console.log(ex);
    }

    return opcion_menu;
}

// Mostrar ícono - cuando la página se ajusta "en tamaño". 
// Source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_responsive_navbar_dropdown
function show_responsive_icon() {
    try {
        var x = document.getElementById("myTopnav");
        if (x.className === "topnav") {
            x.className += " responsive";
        } else {
            x.className = "topnav";
        }
    } catch (ex) {
        console.log(ex);
    }
}