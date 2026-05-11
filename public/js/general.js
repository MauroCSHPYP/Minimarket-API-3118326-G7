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

/** Salto de línea - line break. */
var text_break_line = "\r\n";

/** Salto de línea - HTML. */
var html_salto = "<br />";

/** URL base de la API. */
const URL_BASE_APP = "http://localhost:3000/app/";

/**
 * Create our number formatter.
 * Source: https://stackoverflow.com/a/16233919/4092887
 */
const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',

    // These options can be used to round to whole numbers.
    trailingZeroDisplay: 'stripIfInteger'   // This is probably what most people
    // want. It will only stop printing
    // the fraction when the input
    // amount is a round number (int)
    // already. If that's not what you
    // need, have a look at the options
    // below.
    //minimumFractionDigits: 0, // This suffices for whole numbers, but will
    // print 2500.10 as $2,500.1
    //maximumFractionDigits: 0, // Causes 2500.99 to be printed as $2,501
});

// sessionStorage.usuario
// Objeto JSON con los datos del usuario en sesión.
// Si este valor es null, vacío o undefined, se debe redirigir a la página de iniciar sesión.

/**
 * Mostrar alerta.
 * @param {string} mensaje Texto a mostrar en el "alert" de javascript.
 */
function mostrar_mensaje(mensaje) {
    alert(mensaje);
}

/**
 * Comprobar si la persona inició sesión.
 */
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

/**
 * Cerrar sesión.
 */
function cerrar_sesion() {
    try {

        localStorage.removeItem("usuario");

        // Variables que contienen información en sesión: 
        //sessionStorage.removeItem("arr_productos");
        //sessionStorage.removeItem("arr_personas");

        localStorage.clear();
        sessionStorage.clear();

        mostrar_mensaje("Gracias por usar esta aplicación");
        window.location = "../html/login.html";

    } catch (ex) {
        mostrar_mensaje("Hubo un error al cerrar la sesión. Intente de nuevo");
        console.log(ex);
    }
}

/**
 * Crear el menú - según el rol en sesión.
 */
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
                opciones_menu.push("Registrar producto|registrar producto.html");
                opciones_menu.push("Inventario|inventario.html");
                html_menu += agregar_lista_en_menu("Administrador ", opciones_menu);

                opciones_menu = [];
                opciones_menu.push("Ventas|ventas.html");
                html_menu += agregar_lista_en_menu("Cajero ", opciones_menu);
                break;
            case 2:
                // Cajero: 
                // Opciones del menú para "Cajero":
                opciones_menu.push("Ventas|ventas.html");
                html_menu += agregar_lista_en_menu("Cajero ", opciones_menu);
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

/**
 * Agregar lista desplegable en el menú.
 * @param {string} texto_encabezado es el texto a mostrar al inicio de la lista desplegable.
 * @param {string} opciones_menu son las opciones - guardadas en un Array - para mostrar las opciones de la lista desplegable.
 * @returns 
 */
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

/**
 * Agregar opción de menú.
 * @param {string} texto es el texto y el título a mostrar en la opción/ítem en el menú.
 * @param {string} ruta es la URL de la opción/ítem en el menú.
 * @returns 
 */
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

/**
 * Mostrar ícono - cuando la página se ajusta "en tamaño". 
 * Source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_responsive_navbar_dropdown
 */
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

/**
 * Crear lista desplegable "en campos HTML de tipo (select)".
 * @param {int} id_select ID del elemento HTML a agregarlos las opciones.
 * @param {object} options Los elementos/opciones a seleccionar en la lista desplegable.
 * @param {string} field_id Nombre del campo que contiene el ID del elemento.
 * @param {string} field_text Nombre del campo que contiene el texto a mostrar en el elemento.
 */
function crear_lista_desplegable(id_select, options, field_id, field_text) {
    try {
        var select = document.getElementById(id_select);
        var opt = document.createElement('option');
        opt.value = 0;
        opt.innerHTML = "-- Seleccione--";
        select.innerHTML = "";
        select.appendChild(opt);

        for (var i = 0; i < options.length; i++) {
            opt = document.createElement('option');
            opt.value = options[i][field_id];
            opt.innerHTML = options[i][field_text];
            select.appendChild(opt);
        }
    } catch (error) {
        console.log("No se pudo cargar la lista desplegable");
        console.log(error);
    }
}

/**
 * Establecer la selección en la lista desplegable - según el ID proporcionado.
 * @param {string} id_select ID de la lista desplegable - que contiene tanto el ID como el NAME para consultar.
 * @param {string} id_obtained ID a establecer como seleccionado en la lista desplegable.
 */
function establecer_seleccion(id_select, id_obtained) {
    try {
        document.getElementById(id_select).value = id_obtained;
    } catch (error) {
        console.log("No se pudo establecer el campo.");
        console.log(error);
    }
}

/**
 * Añadir "0" si el número es menor a 10. Esto se usa para ajustar las fechas "manualmente".
 * Fuente: https://www.w3schools.com/JSREF/tryit.asp?filename=tryjsref_datetime
 * @param {int} i Número a verificar para concaternarle un cero - si se cumple la condición.
 * @returns string
 */
function addZero(i) {
    if (i < 10) { i = "0" + i }
    return i;
}

/**
 * Llamar al endpoint correspondiente para cargar la lista desplegable "en campos HTML de tipo (select)".
 * @param {string} endpoint_url URL del endpoint API a consultar/cargar datos.
 * @param {int} id_select ID del elemento HTML a agregarlos las opciones.
 * @param {string} field_id Nombre del campo que contiene el ID del elemento.
 * @param {string} field_text Nombre del campo que contiene el texto a mostrar en el elemento.
 * @returns 
 */
async function cargar_lista(endpoint_url, id_select, field_id, field_text) {
    try {
        const response = await fetch(endpoint_url, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.message) {
            crear_lista_desplegable(id_select, data, field_id, field_text);

            // Guardar la data cargada en variables de sesión para su consulta en otras páginas.
            localStorage.setItem(id_select, JSON.stringify(data));

        } else {
            mostrar_mensaje(data.message);
            return;
        }
    } catch (ex) {
        mostrar_mensaje('No se pudo cargar la información inicial.');
        console.log(ex);
        return;
    }
}

/**
 * Obtener el nombre del detalle. Esta función se usa en las tablas.
 * @param {int} id_select ID de la variable en sesión donde se encuentran los datos.
 * @param {int} id_internal ID a consultar contra los datos en sesión.
 * @param {string} field_id Nombre del campo ID en la fuente de datos.
 * @param {string} field_text Nombre del campo a visualizar - detalle.
 * @returns string (Nombre del detalle).
 */
function obtener_nombre_detalle(id_select, id_internal, field_id, field_text) {
    var nombre_detalle = "";
    var data_in_session = [];

    try {
        data_in_session = JSON.parse(localStorage.getItem(id_select));

        if (!data_in_session) {
            return nombre_detalle;
        }

        for (let i = 0; i < data_in_session.length; i++) {
            const element = data_in_session[i];

            if (element[field_id] == id_internal) {
                nombre_detalle = element[field_text];
                break;
            }
        }

    } catch (ex) {
        console.log("No se pudo obtener el nombre del detalle");
        console.log(ex);
    }

    return nombre_detalle;
}

/**
 * Llamar al endpoint correspondiente para cargar la tabla detalle "en variables de sesión".
 * @param {string} endpoint_url URL del endpoint a consumir.
 * @param {string} detail_name Nombre a establecer en la variable de sesión.
 * @returns 
 */
async function cargar_tabla_detalle(endpoint_url, detail_name) {
    try {
        const response = await fetch(endpoint_url, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.message) {

            // Guardar la data cargada en variables de sesión para su consulta en otras páginas.
            localStorage.setItem(detail_name, JSON.stringify(data));

        } else {
            mostrar_mensaje(data.message);
            return;
        }
    } catch (ex) {
        mostrar_mensaje('No se pudo cargar la información del detalle.');
        console.log(ex);
        return;
    }
}