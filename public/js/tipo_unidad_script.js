document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmTipoUnidad');

    recargar_tipos_unidades();

    /**
     * Evento OnClick del botón. Gestiona tanto la creación como la actualización de registros en esta página.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_record = document.getElementById("spn_index_tu").innerText;
        var nombre = document.getElementById('txt_nombre_tu').value.trim();
        var msg = "";

        if (!nombre) {
            msg += "El nombre es requerido";
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            const API_URL_C_TIPO_UNIDAD = URL_BASE_APP + "tiposunidades";
            var API_URL_U_TIPO_UNIDAD = URL_BASE_APP + "tiposunidades/" + selected_record;

            const tipo_unidad_obj = {
                "NOMBRE_UNIDAD": nombre
            };

            if (selected_record != "") {
                const response = await fetch(API_URL_U_TIPO_UNIDAD, {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(tipo_unidad_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.mensaje);
                if (data.affectedRows) {
                    recargar_tipos_unidades();
                    limpiar_form();
                }

            } else {
                const response = await fetch(API_URL_C_TIPO_UNIDAD, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(tipo_unidad_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.mensaje);
                if (data.ID_TIPO_UNIDAD) {
                    recargar_tipos_unidades();
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
        document.getElementById("spn_index_tu").innerText = empty;
        document.getElementById('txt_nombre_tu').value = empty;
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar la tabla de tipos de unidades registradas en el sistema.
 * @returns async
 */
async function recargar_tipos_unidades() {
    try {

        // Variables: 
        const API_URL_R_TIPO_UNIDAD = URL_BASE_APP + "tiposunidades";

        const response = await fetch(API_URL_R_TIPO_UNIDAD, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.mensaje) {
            localStorage.setItem("TIPO_UNIDAD", JSON.stringify(data));
            load_dt_tipos_unidades();
        } else {
            mostrar_mensaje(data.mensaje);
            return;
        }

    } catch (ex) {
        console.log("No se pudo cargar los tipos de unidades.");
        console.log(ex);
    }
}

/**
 * Cargar la información del registro seleccionado - ésta se encuentra oculta en el span correspondiente en objeto JSON.
 * Se hace así para evitar múltiples llamadas al servidor.
 * @param {int} id_record ID del registro seleccionado.
 */
async function seleccionar_tipo_unidad(id_record) {
    try {
        var spn = document.getElementById("inp_data_" + id_record);
        if (spn.innerText != undefined) {
            var data_tipo_unidad = JSON.parse(spn.value);
            document.getElementById("spn_index_tu").innerText = data_tipo_unidad["ID_TIPO_UNIDAD"];
            document.getElementById('txt_nombre_tu').value = data_tipo_unidad["NOMBRE_UNIDAD"];
        }

    } catch (error) {
        console.log("No se pudo mostrar la información del tipo de unidad seleccionado.")
        console.log(error);
    }
}

/**
 * Eliminar registro seleccionado.
 * @param {int} id_user ID del registro seleccionado.
 */
async function eliminar_tipo_unidad(id_record) {
    try {
        if (confirm("¿Está seguro que desea eliminar este registro?")) {

            var API_URL_D_TIPO_UNIDAD = URL_BASE_APP + "tiposunidades/" + id_record;
            const response = await fetch(API_URL_D_TIPO_UNIDAD, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' }
            });

            const data = await response.json();

            mostrar_mensaje(data.mensaje);
            recargar_tipos_unidades();
            limpiar_form();
        }

    } catch (error) {
        console.log(error);
    }
}

/**
 * Cargar la tabla "tbl_tu" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_tipos_unidades() {

    var ds_records = [];
    ds_records = JSON.parse(localStorage.getItem("TIPO_UNIDAD"));

    // Limpiar el objeto DataTable para operarlo con la nueva configuración.
    // Source: https://stackoverflow.com/a/52284422/4092887
    $('#tbl_tu').DataTable().clear().destroy();

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_tu', {
        searching: true,
        retrieve: true,
        ordering: true,
        columnDefs: [
            { data: 'NOMBRE_UNIDAD', targets: 0, title: "Nombre tipo de unidad" },
            {
                data: 'ID_TIPO_UNIDAD', targets: 1, searchable: false, title: "Acción",
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<a href='#' id='lnk_edit_${row["ID_TIPO_UNIDAD"]}' onclick='seleccionar_tipo_unidad("${row["ID_TIPO_UNIDAD"]}")'>Editar</a> - <a href='#' id='lnk_delete_${row["ID_TIPO_UNIDAD"]}' onclick='eliminar_tipo_unidad("${row["ID_TIPO_UNIDAD"]}")'>Eliminar</a><input type='hidden' id='inp_data_${row["ID_TIPO_UNIDAD"]}' value='${JSON.stringify(row)}' class='hdf_data' />`;
                    }

                    return data;
                }
            }
        ],
        data: ds_records,
        language: {
            decimal: "",
            emptyTable: "<strong>No hay tipos de unidades registrados</strong>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay tipos de unidades registrados",
            infoFiltered: "(_TOTAL_ registros filtrados de _MAX_ registros totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrando _MENU_ tipos de unidades por página",
            loadingRecords: "Cargando...",
            processing: "",
            search: "Buscar producto:",
            zeroRecords: "No hay tipos de unidades que coincidan con el filtro",
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
    $('#tbl_tu').removeClass('dataTable');
}