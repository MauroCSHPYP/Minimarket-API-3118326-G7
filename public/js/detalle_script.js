document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmDetalle');

    /**
     * Evento OnClick del botón. Gestiona tanto la creación como la actualización de registros en esta página.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_record = document.getElementById("spn_index").innerText;
        var nombre = document.getElementById('txt_nombre').value.trim();
        var msg = "";
        var valor_pagina = "";
        var response = [];
        var data = [];

        valor_pagina = localStorage.getItem("pagina_detalle");

        if (valor_pagina.trim() == "") {
            mostrar_mensaje("No se puede determinar la acción sobre el detalle.");
            return;
        }

        switch (valor_pagina) {
            case "TIPO_DOCUMENTO":
                var detalle_obj = {
                    "NOMBRE_DOCUMENTO": nombre
                };

                break;
            case "MARCA":
                var detalle_obj = {
                    "NOMBRE_MARCA": nombre
                };
                break;

            default:
                break;
        }

        if (!nombre) {
            msg += "El nombre es requerido";
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            const API_URL_C_TIPO_DOCUMENTO = URL_BASE_APP + "tiposdocumentos";
            var API_URL_U_TIPO_DOCUMENTO = URL_BASE_APP + "tiposdocumentos/" + selected_record;

            const API_URL_C_MARCA = URL_BASE_APP + "marcas";
            var API_URL_U_MARCA = URL_BASE_APP + "marcas/" + selected_record;

            if (selected_record != "") {

                switch (valor_pagina) {
                    case "TIPO_DOCUMENTO":
                        response = await fetch(API_URL_U_TIPO_DOCUMENTO, {
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify(detalle_obj)
                        });

                        data = await response.json();

                        mostrar_mensaje(data.mensaje);
                        if (data.affectedRows) {
                            recargar_detalles();
                            limpiar_form();
                        }
                        break;

                    case "MARCA":
                        response = await fetch(API_URL_U_MARCA, {
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify(detalle_obj)
                        });

                        data = await response.json();

                        mostrar_mensaje(data.mensaje);
                        if (data.affectedRows) {
                            recargar_detalles();
                            limpiar_form();
                        }
                        break;

                    default:
                        break;
                }

            } else {

                switch (valor_pagina) {
                    case "TIPO_DOCUMENTO":
                        response = await fetch(API_URL_C_TIPO_DOCUMENTO, {
                            method: 'POST',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify(detalle_obj)
                        });

                        data = await response.json();

                        mostrar_mensaje(data.mensaje);
                        if (data.ID_TIPO_DOCUMENTO) {
                            recargar_detalles();
                            limpiar_form();
                        }
                        break;

                    case "MARCA":
                        response = await fetch(API_URL_C_MARCA, {
                            method: 'POST',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify(detalle_obj)
                        });

                        data = await response.json();

                        mostrar_mensaje(data.mensaje);
                        if (data.ID_MARCA) {
                            recargar_detalles();
                            limpiar_form();
                        }
                        break;

                    default:
                        break;
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
 * (Dependiendo del valor de la variable en sesión "pagina_detalle"), determinar el contenido 
 * a cargar en esta página. El propósito de esta página es administrar las tablas que tengan la misma 
 * estructura - reutilizando código.
 */
async function determinar_contenido() {
    var valor_pagina = "";

    try {
        valor_pagina = localStorage.getItem("pagina_detalle");

        switch (valor_pagina) {
            case "TIPO_DOCUMENTO":
                document.getElementById("h2_element_title").innerText = "Registrar tipos de documento";
                document.getElementById("h4_element_title").innerText = "Tipos de documento";
                document.getElementById("i_descr_detalle").innerHTML = "En esta sección se administran los tipos de documento disponibles para los usuarios registrados en la aplicación de Minimarket.";
                break;

            case "MARCA":
                document.getElementById("h2_element_title").innerText = "Registrar marcas";
                document.getElementById("h4_element_title").innerText = "Marcas";
                document.getElementById("i_descr_detalle").innerHTML = "En esta sección se administran las marcas disponibles para los productos registrados en la aplicación de Minimarket.";
                break;

            default:
                document.getElementById("h2_element_title").innerText = "-";
                document.getElementById("h4_element_title").innerText = "-";
                document.getElementById("i_descr_detalle").innerHTML = "-";
                document.getElementById("btn_registrar").style.display = "none";
                break;
        }
    } catch (ex) {
        mostrar_mensaje("Hubo un error inesperado al cargar esta página");
        console.log(ex);
    }
}

/**
 * Limpiar los campos del formulario.
 */
async function limpiar_form() {
    try {
        var empty = "";
        document.getElementById("spn_index").innerText = empty;
        document.getElementById('txt_nombre').value = empty;
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar la tabla de detalles (dependiendo del valor de la variable en sesión "pagina_detalle") registrados en el sistema.
 * @returns async
 */
async function recargar_detalles() {
    // Variables: 
    var valor_pagina = "";
    var response = [];
    var data = [];

    try {

        valor_pagina = localStorage.getItem("pagina_detalle");
        var API_URL_R_TIPOS_DOC = URL_BASE_APP + "tiposDocumentos";
        var API_URL_R_MARCAS = URL_BASE_APP + "marcas";

        switch (valor_pagina) {
            case "TIPO_DOCUMENTO":
                response = await fetch(API_URL_R_TIPOS_DOC, {
                    method: 'GET',
                    headers: { 'Content-type': 'application/json' }
                });

                data = await response.json();

                if (response.ok && !data.mensaje) {
                    localStorage.setItem(valor_pagina, JSON.stringify(data));
                    load_dt_detalles();
                } else {
                    mostrar_mensaje(data.mensaje);
                    return;
                }
                break;

            case "MARCA":
                response = await fetch(API_URL_R_MARCAS, {
                    method: 'GET',
                    headers: { 'Content-type': 'application/json' }
                });

                data = await response.json();

                if (response.ok && !data.mensaje) {
                    localStorage.setItem(valor_pagina, JSON.stringify(data));
                    load_dt_detalles();
                } else {
                    mostrar_mensaje(data.mensaje);
                    return;
                }
                break;

            default:

                break;
        }

    } catch (ex) {
        console.log("No se pudo cargar los detalles en esta página.");
        console.log(ex);
    }
}

/**
 * Cargar la información del registro seleccionado - ésta se encuentra oculta en el span correspondiente en objeto JSON.
 * Se hace así para evitar múltiples llamadas al servidor.
 * @param {int} id_record ID del registro seleccionado.
 */
async function seleccionar_detalle(id_record) {
    // Variables: 
    var valor_pagina = "";
    var nombre_campo = "";

    try {
        valor_pagina = localStorage.getItem("pagina_detalle");

        if (!valor_pagina) {
            mostrar_mensaje("No se pudo obtener el detalle");
            return;
        }
        var spn = document.getElementById("inp_data_" + id_record);
        if (spn.innerText != undefined) {
            var data_user = JSON.parse(spn.value);
            document.getElementById("spn_index").innerText = data_user["ID_" + valor_pagina];

            switch (valor_pagina) {
                case "TIPO_DOCUMENTO":
                    nombre_campo = "NOMBRE_" + valor_pagina.replace("TIPO_", "");
                    break;
                default:
                    nombre_campo = "NOMBRE_" + valor_pagina;
                    break;
            }

            document.getElementById('txt_nombre').value = data_user[nombre_campo];
        }

    } catch (error) {
        console.log("No se pudo mostrar la información del detalle seleccionado.")
        console.log(error);
    }
}

/**
 * Eliminar registro seleccionado.
 * @param {int} id_user ID del registro seleccionado.
 */
async function eliminar_detalle(id_record) {
    // Variables: 
    var valor_pagina = "";
    var response = [];
    var data = [];

    try {
        valor_pagina = localStorage.getItem("pagina_detalle");

        if (confirm("¿Está seguro que desea eliminar este registro?")) {

            var API_URL_D_TIPO_DOCUMENTO = URL_BASE_APP + "tiposdocumentos/" + id_record;
            var API_URL_D_MARCA = URL_BASE_APP + "marcas/" + id_record;

            switch (valor_pagina) {
                case "TIPO_DOCUMENTO":
                    response = await fetch(API_URL_D_TIPO_DOCUMENTO, {
                        method: 'DELETE',
                        headers: { 'Content-type': 'application/json' }
                    });

                    data = await response.json();

                    mostrar_mensaje(data.mensaje);
                    recargar_detalles();
                    limpiar_form();
                    break;

                case "MARCA":
                    response = await fetch(API_URL_D_MARCA, {
                        method: 'DELETE',
                        headers: { 'Content-type': 'application/json' }
                    });

                    data = await response.json();

                    mostrar_mensaje(data.mensaje);
                    recargar_detalles();
                    limpiar_form();
                    break;

                default:
                    break;
            }
        }

    } catch (error) {
        console.log(error);
    }
}

/**
 * Cargar la tabla "tbl_detalle" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_detalles() {

    var ds_records = [];
    var valor_pagina = "";
    var campo_id = "";
    var campo_nombre = "";

    try {
        valor_pagina = localStorage.getItem("pagina_detalle");
        switch (valor_pagina) {
            case "TIPO_DOCUMENTO":
                campo_id = "ID_" + valor_pagina;
                campo_nombre = valor_pagina;
                campo_nombre = "NOMBRE_" + campo_nombre.replace("TIPO_", "");
                break;

            case "MARCA":
                campo_id = "ID_" + valor_pagina;
                campo_nombre = "NOMBRE_" + valor_pagina;
                break;

            default:
                break;
        }
    } catch (error) {
        console.log(error);
        return;
    }

    ds_records = JSON.parse(localStorage.getItem(valor_pagina));

    // Limpiar el objeto DataTable para operarlo con la nueva configuración.
    // Source: https://stackoverflow.com/a/52284422/4092887
    $('#tbl_detalle').DataTable().clear().destroy();

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_detalle', {
        searching: true,
        retrieve: true,
        ordering: true,
        columnDefs: [
            { data: campo_nombre, targets: 0, title: "Nombre" },
            {
                data: campo_id, targets: 1, searchable: false, title: "Acción",
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<a href='#' id='lnk_edit_${row[campo_id]}' onclick='seleccionar_detalle("${row[campo_id]}")'>Editar</a> - <a href='#' id='lnk_delete_${row[campo_id]}' onclick='eliminar_detalle("${row[campo_id]}")'>Eliminar</a><input type='hidden' id='inp_data_${row[campo_id]}' value='${JSON.stringify(row)}' class='hdf_data' />`;
                    }

                    return data;
                }
            }
        ],
        data: ds_records,
        language: {
            decimal: "",
            emptyTable: "<strong>No hay registrados</strong>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay registros",
            infoFiltered: "(_TOTAL_ registros filtrados de _MAX_ registros totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrando _MENU_ registros por página",
            loadingRecords: "Cargando...",
            processing: "",
            search: "Buscar producto:",
            zeroRecords: "No hay registros que coincidan con el filtro",
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
    $('#tbl_detalle').removeClass('dataTable');
}