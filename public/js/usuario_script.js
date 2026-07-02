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
            alias = nombres.substring(0, 3) + apellidos.substring(0, 3) + num_doc.substring(0, 3);
            contrasena = num_doc;
            confirm_contrasena = num_doc;
        }

        if (!nombres) {
            msg = "El nombre es requerido" + text_break_line;
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

                mostrar_mensaje(data.mensaje);
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

                mostrar_mensaje(data.mensaje);
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

        const response = await fetch(API_URL_R_USER, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.mensaje) {
            localStorage.setItem("personas_disponibles", JSON.stringify(data));
            load_dt_usuarios();
        } else {
            mostrar_mensaje(data.mensaje);
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
        var spn = document.getElementById("inp_data_" + id_user);
        if (spn.innerText != undefined) {
            var data_user = JSON.parse(spn.value);
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

/**
 * Cargar la tabla "tbl_personas" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_usuarios() {

    var ds_staff = [];
    ds_staff = JSON.parse(localStorage.getItem("personas_disponibles"));

    // Limpiar el objeto DataTable para operarlo con la nueva configuración.
    // Source: https://stackoverflow.com/a/52284422/4092887
    $('#tbl_personas').DataTable().clear().destroy();

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_personas', {
        searching: true,
        retrieve: true,
        ordering: true,
        columnDefs: [
            { data: 'NOMBRE', targets: 0, title: "Nombre(s)" },
            { data: 'APELLIDOS', targets: 1, title: "Apellidos" },
            { data: 'FECHA_NACIMIENTO', targets: 2, title: "Fecha de nacimiento" },
            {
                data: 'ID_USUARIO', targets: 3, searchable: false, title: "Acción",
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<a href='#' id='lnk_edit_${row["ID_USUARIO"]}' onclick='seleccionar_usuario("${row["ID_USUARIO"]}")'>Editar</a> - <a href='#' id='lnk_delete_${row["ID_USUARIO"]}' onclick='eliminar_persona("${row["ID_USUARIO"]}")'>Eliminar</a><input type='hidden' id='inp_data_${row["ID_USUARIO"]}' value='${JSON.stringify(row)}' class='hdf_data' />`;
                    }

                    return data;
                }
            }
        ],
        data: ds_staff,
        language: {
            decimal: "",
            emptyTable: "<strong>No hay usuarios registrados</strong>",
            info: "Mostrando página _PAGE_ de _PAGES_", // Showing _START_ to _END_ of _TOTAL_ entries
            infoEmpty: "No hay usuarios",
            infoFiltered: "(_TOTAL_ usuarios filtrados de _MAX_ registros totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrando _MENU_ usuarios por página",
            loadingRecords: "Cargando...",
            processing: "",
            search: "Buscar producto:",
            zeroRecords: "No hay usuarios que coincidan con el filtro",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            },
            aria: {
                orderable: "Ordenar por esta columna",
                orderableReverse: "Orden inverso de esta columna"
            }
        }
    });

    // Source: https://stackoverflow.com/a/21181021/4092887
    $('#tbl_personas').removeClass('dataTable');
}