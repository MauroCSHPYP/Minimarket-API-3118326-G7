document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmUsuario');
    const API_URL_R_TIPOS_DOC = URL_BASE_APP + "tiposDocumentos";
    const API_URL_R_ROLES = URL_BASE_APP + "roles";

    cargar_lista(API_URL_R_TIPOS_DOC, "ddlTipoDocumento", "ID_TIPO_DOCUMENTO", "NOMBRE_DOCUMENTO");
    cargar_lista(API_URL_R_ROLES, "ddlRol", "ID_ROL", "NOMBRE_ROL");
    recargar_tabla_personas();

    /**
     * Evento OnClick del botón. Gestiona tanto la creación como la actualización de registros en esta página.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_persona = document.getElementById("spn_index_persona").innerText;
        var nombres = document.getElementById('txt_nombres').value.trim();
        var apellidos = document.getElementById('txt_apellidos').value.trim();
        var fecha_nacim = document.getElementById('datepicker').value.trim();
        fecha_nacim = $("#datepicker").datepicker("getDate").toISOString();
        var tipo_doc = document.getElementById('ddlTipoDocumento').value;
        var num_doc = document.getElementById('txt_numDoc').value.trim();
        var rol_seleccionado = document.getElementById('ddlRol').value;
        var contrasena = document.getElementById('txt_contrasena').value.trim();
        var confirm_contrasena = document.getElementById('txt_confirm_contrasena').value.trim();
        var div_passwords = document.getElementById('dynamicDiv');
        var alias = document.getElementById('txt_alias').value.trim();
        var msg = "";

        if (div_passwords.style.display == 'block') {
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
        } else {
            alias = txt_nombres.substring(0, 3) + apellidos.substring(0, 3) + num_doc.substring(0, 3);
            contrasena = num_doc;
            confirm_contrasena = num_doc;
        }

        if (!txt_nombres) {
            msg = "El nombre es requerido";
        }
        if (!apellidos) {
            msg += "El campo 'apellido(s)' es requerido." + text_break_line;
        }
        if (tipo_doc == 0) {
            msg += "Seleccione el tipo de documento." + text_break_line;
        }
        if (rol_seleccionado == 0) {
            msg += "Seleccione el rol para este usuario." + text_break_line;
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            const API_URL_C_USER = URL_BASE_APP + "usuarios";
            var API_URL_U_USER = URL_BASE_APP + "usuarios/" + selected_persona;

            const usuario_obj = {
                "NOMBRE": nombres,
                "APELLIDOS": apellidos,
                "FECHA_NACIMIENTO": fecha_nacim.split("T")[0],
                "ID_TIPO_DOCUMENTO": tipo_doc,
                "ID_ROL": rol_seleccionado,
                "NUMERO_IDENTIFICACION": num_doc,
                "ALIAS": alias,
                "CONTRASENA": contrasena
            };

            if (selected_persona != "") {
                const response = await fetch(API_URL_U_USER, {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(usuario_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.message);
                if (data.affectedRows) {
                    recargar_tabla_personas();
                    limpiar_form();
                }

            } else {
                const response = await fetch(API_URL_C_USER, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(usuario_obj)
                });

                const data = await response.json();

                // response.ok && data.success
                // response.ok && data.ID_USUARIO

                mostrar_mensaje(data.message);
                if (data.ID_USUARIO) {
                    recargar_tabla_personas();
                    limpiar_form();
                }
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
        document.getElementById("spn_index_persona").innerText = empty;
        document.getElementById('txt_nombres').value = empty;
        document.getElementById('txt_apellidos').value = empty;
        document.getElementById('datepicker').value = empty;
        document.getElementById('ddlTipoDocumento').value = "0";
        document.getElementById('txt_numDoc').value = empty;
        document.getElementById('ddlRol').value = "0";
        checkFieldsVisibility();
        document.getElementById('txt_contrasena').value = empty;
        document.getElementById('txt_confirm_contrasena').value = empty;
        document.getElementById('txt_alias').value = empty;
        document.getElementById('dynamicDiv').style.display = "none";
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar la tabla de usuarios registrados en el sistema.
 * @returns async
 */
async function recargar_tabla_personas() {
    try {

        // Variables: 
        const API_URL_R_USER = URL_BASE_APP + "usuarios";
        var inicio_tabla = '<table id="tbl_personas">';
        var encabezado = '<tr><th>Nombre(s)</th><th>Apellido(s)</th><th>Fecha de nacimiento</th><th>Acción</th></tr>';
        var fila = "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td><a href='#' id='lnk_edit_{3}' onclick='seleccionar_usuario(\"{4}\")'>Editar</a> - <a href='#' id='lnk_delete_{3}' onclick='eliminar_persona(\"{4}\")'>Eliminar</a><span id='span_data_{5}' class='hdf_data'>{6}</span></td></tr>";
        var temp_fila = "";
        var cuerpo_tabla = "";
        var final_tabla = '</table>';
        var fecha_user = "";

        // Limpiar div:  
        document.getElementById("div_dynamic_table_personas").innerHTML = "";

        const response = await fetch(API_URL_R_USER, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.message) {
            // Armar los ítems (es decir, personas) disponibles para su selección y consulta: 
            for (var i = 0; i < data.length; i++) {

                // Crear una copia para el reemplazo de los datos: 
                temp_fila = fila;

                // Armar los ítems (es decir, personas) disponibles para su selección y consulta: 
                temp_fila = temp_fila.replace("{0}", data[i]["NOMBRE"]);
                temp_fila = temp_fila.replace("{1}", data[i]["APELLIDOS"]);

                try {
                    fecha_user = data[i]["FECHA_NACIMIENTO"].split("T")[0];
                    fecha_user = new Date(fecha_user);
                    fecha_user = addZero(fecha_user.getDate() + 1) + "/" + addZero((fecha_user.getMonth() + 1)) + "/" + fecha_user.getFullYear();
                    temp_fila = temp_fila.replace("{2}", fecha_user);
                }
                catch (ex) {
                    temp_fila = temp_fila.replace("{2}", data[i]["FECHA_NACIMIENTO"]);
                    console.log("Error: ");
                    console.log(ex);
                }

                temp_fila = temp_fila.replace("{3}", i);
                temp_fila = temp_fila.replace("{3}", i);
                temp_fila = temp_fila.replace("{4}", data[i]["ID_USUARIO"]);
                temp_fila = temp_fila.replace("{4}", data[i]["ID_USUARIO"]);
                temp_fila = temp_fila.replace("{5}", data[i]["ID_USUARIO"]);
                temp_fila = temp_fila.replace("{6}", JSON.stringify(data[i]));

                // Armar el cuerpo de la tabla - es decir, las filas de la tabla:
                cuerpo_tabla += temp_fila;
            }

            // Agregar todo el HTML creado en el div dinámico:
            document.getElementById("div_dynamic_table_personas").innerHTML = inicio_tabla + encabezado + cuerpo_tabla + final_tabla;
        } else {
            mostrar_mensaje(data.message);
            return;
        }

    } catch (ex) {
        console.log("No se pudo cargar los usuarios.");
        console.log(ex);
    }
}

/**
 * Cargar la información del usuario seleccionado - ésta se encuentra oculta en el span correspondiente en objeto JSON.
 * Se hace así para evitar múltiples llamadas al servidor.
 * @param {int} id_user ID del usuario seleccionado.
 */
async function seleccionar_usuario(id_user) {
    try {
        var spn = document.getElementById("span_data_" + id_user);
        if (spn.innerText != undefined) {
            var data_user = JSON.parse(spn.innerText);
            document.getElementById("spn_index_persona").innerText = data_user["ID_USUARIO"];
            document.getElementById('txt_nombres').value = data_user["NOMBRE"];
            document.getElementById('txt_apellidos').value = data_user["APELLIDOS"];
            //document.getElementById('datepicker').value = data_user["FECHA_NACIMIENTO"].split("T")[0];
            $("#datepicker").datepicker("setDate", new Date(data_user["FECHA_NACIMIENTO"]));
            establecer_seleccion("ddlTipoDocumento", data_user["ID_TIPO_DOCUMENTO"]);
            document.getElementById('txt_numDoc').value = data_user["NUMERO_IDENTIFICACION"];
            establecer_seleccion("ddlRol", data_user["ID_ROL"]);
            checkFieldsVisibility();
            document.getElementById('txt_contrasena').value = data_user["CONTRASENA"];
            document.getElementById('txt_confirm_contrasena').value = data_user["CONTRASENA"];
            document.getElementById('txt_alias').value = data_user["ALIAS"];
        }

    } catch (error) {
        console.log("No se pudo mostrar la información del usuario seleccionado.")
        console.log(error);
    }
}

/**
 * Eliminar usuario seleccionado.
 * @param {int} id_user ID del usuario seleccionado.
 */
async function eliminar_persona(id_user) {
    try {
        if (confirm("¿Está seguro que desea eliminar este registro?")) {

            var API_URL_D_USER = URL_BASE_APP + "usuarios/" + id_user;
            const response = await fetch(API_URL_D_USER, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' }
            });

            const data = await response.json();


            mostrar_mensaje(data.mensaje);
            //data.detalleError
            recargar_tabla_personas();
            limpiar_form();
        }

    } catch (error) {
        console.log(error);
    }
}