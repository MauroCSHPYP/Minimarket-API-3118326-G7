document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmTipoProducto');
    const API_URL_R_TIPO_UNIDAD = URL_BASE_APP + "tiposunidades";

    cargar_lista(API_URL_R_TIPO_UNIDAD, "ddlTipoUnidad", "ID_TIPO_UNIDAD", "NOMBRE_UNIDAD");

    recargar_tipos_productos();

    /**
     * Evento OnClick del botón. Gestiona tanto la creación como la actualización de registros en esta página.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_record = document.getElementById("spn_index_tp").innerText;
        var nombre = document.getElementById('txt_nombre_tp').value.trim();
        var descripcion = document.getElementById('txt_descripcion_tp').value.trim();
        var tipo_unidad_seleccionada = document.getElementById('ddlTipoUnidad').value;
        var msg = "";

        if (!nombre) {
            msg += "El nombre es requerido";
        }

        if (!tipo_unidad_seleccionada) {
            msg += "El tipo de unidad es requerido";
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            const API_URL_C_TIPO_PRODUCTO = URL_BASE_APP + "tiposproductos";
            var API_URL_U_TIPO_PRODUCTO = URL_BASE_APP + "tiposproductos/" + selected_record;

            const tipo_producto_obj = {
                NOMBRE_TIPO_PRODUCTO: nombre,
                DESCRIPCION_TIPO_PRODUCTO: descripcion,
                ID_TIPO_UNIDAD: tipo_unidad_seleccionada
            };

            if (selected_record != "") {
                const response = await fetch(API_URL_U_TIPO_PRODUCTO, {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(tipo_producto_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.mensaje);
                if (data.affectedRows) {
                    recargar_tipos_productos();
                    limpiar_form();
                }

            } else {
                const response = await fetch(API_URL_C_TIPO_PRODUCTO, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(tipo_producto_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.mensaje);
                if (data.ID_TIPO_PRODUCTO) {
                    recargar_tipos_productos();
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
        document.getElementById("spn_index_tp").innerText = empty;
        document.getElementById('txt_nombre_tp').value = empty;
        document.getElementById('txt_descripcion_tp').value = empty;
        document.getElementById('ddlTipoUnidad').value = "0";
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar la tabla de tipos de productos registrados en el sistema.
 * @returns async
 */
async function recargar_tipos_productos() {

    const API_URL_R_TIPO_PRODUCTO = URL_BASE_APP + "tiposproductos";

    try {

        const response = await fetch(API_URL_R_TIPO_PRODUCTO, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.mensaje) {
            localStorage.setItem("TIPO_PRODUCTO", JSON.stringify(data));
            load_dt_tipos_productos();
        } else {
            mostrar_mensaje(data.mensaje);
            return;
        }

    } catch (ex) {
        console.log("No se pudo cargar los tipos de productos.");
        console.log(ex);
    }
}

/**
 * Cargar la información del registro seleccionado - ésta se encuentra oculta en el span correspondiente en objeto JSON.
 * Se hace así para evitar múltiples llamadas al servidor.
 * @param {int} id_record ID del registro seleccionado.
 */
async function seleccionar_tipo_producto(id_record) {
    try {
        var spn = document.getElementById("inp_data_" + id_record);
        if (spn.innerText != undefined) {
            var data_tp = JSON.parse(spn.value);
            document.getElementById("spn_index_tp").innerText = data_tp["ID_TIPO_PRODUCTO"];
            document.getElementById('txt_nombre_tp').value = data_tp["NOMBRE_TIPO_PRODUCTO"];
            document.getElementById('txt_descripcion_tp').value = data_tp["DESCRIPCION_TIPO_PRODUCTO"];
            establecer_seleccion("ddlTipoUnidad", data_tp["ID_TIPO_UNIDAD"]);
        }

    } catch (error) {
        console.log("No se pudo mostrar la información del tipo de producto seleccionado.")
        console.log(error);
    }
}

/**
 * Eliminar registro seleccionado.
 * @param {int} id_user ID del registro seleccionado.
 */
async function eliminar_tipo_producto(id_record) {
    try {
        if (confirm("¿Está seguro que desea eliminar este registro?")) {

            var API_URL_D_TIPO_PRODUCTO = URL_BASE_APP + "tiposproductos/" + id_record;
            const response = await fetch(API_URL_D_TIPO_PRODUCTO, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' }
            });

            const data = await response.json();

            mostrar_mensaje(data.mensaje);
            recargar_tipos_productos();
            limpiar_form();
        }

    } catch (error) {
        console.log(error);
    }
}

/**
 * Cargar la tabla "tbl_tp" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_tipos_productos() {

    var ds_records = [];
    ds_records = JSON.parse(localStorage.getItem("TIPO_PRODUCTO"));

    // Limpiar el objeto DataTable para operarlo con la nueva configuración.
    // Source: https://stackoverflow.com/a/52284422/4092887
    $('#tbl_tp').DataTable().clear().destroy();

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_tp', {
        searching: true,
        retrieve: true,
        ordering: true,
        columnDefs: [
            { data: 'NOMBRE_TIPO_PRODUCTO', targets: 0, title: "Nombre tipo de producto" },
            { data: 'DESCRIPCION_TIPO_PRODUCTO', targets: 1, title: "Descripción" },
            {
                data: 'ID_TIPO_UNIDAD', targets: 2, title: "Tipo de unidad",
                render: function (data, type, row) {
                    if (type === 'display') {
                        var control_id = "span_tipo_unidad_tp_" + row["ID_TIPO_PRODUCTO"];
                        return `<span id='${control_id}'>${obtener_nombre_detalle("TIPO_UNIDAD", data, "ID_TIPO_UNIDAD", "NOMBRE_UNIDAD")}</span>`;
                    }

                    return data;
                }
            },
            {
                data: 'ID_TIPO_PRODUCTO', targets: 3, searchable: false, title: "Acción",
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<a href='#' id='lnk_edit_${row["ID_TIPO_PRODUCTO"]}' onclick='seleccionar_tipo_producto("${row["ID_TIPO_PRODUCTO"]}")'>Editar</a> - <a href='#' id='lnk_delete_${row["ID_TIPO_PRODUCTO"]}' onclick='eliminar_tipo_producto("${row["ID_TIPO_PRODUCTO"]}")'>Eliminar</a><input type='hidden' id='inp_data_${row["ID_TIPO_PRODUCTO"]}' value='${JSON.stringify(row)}' class='hdf_data' />`;
                    }

                    return data;
                }
            }
        ],
        data: ds_records,
        language: {
            decimal: "",
            emptyTable: "<strong>No hay tipos de productos registrados</strong>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay tipos de productos registrados",
            infoFiltered: "(_TOTAL_ registros filtrados de _MAX_ registros totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrando _MENU_ tipos de productos por página",
            loadingRecords: "Cargando...",
            processing: "",
            search: "Buscar tipo de producto:",
            zeroRecords: "No hay tipos de productos que coincidan con el filtro",
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
    $('#tbl_tp').removeClass('dataTable');
}