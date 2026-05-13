document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmProducto');
    const API_URL_R_MARCAS = URL_BASE_APP + "marcas";
    const API_URL_R_TIPOS_PRODUCTO = URL_BASE_APP + "tiposproductos";

    cargar_lista(API_URL_R_MARCAS, "ddlMarca", "ID_MARCA", "NOMBRE_MARCA");
    cargar_lista(API_URL_R_TIPOS_PRODUCTO, "ddlTipoProducto", "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO");
    recargar_tabla_productos();

    /**
     * Evento OnClick del botón. Gestiona tanto la creación como la actualización de registros en esta página.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_producto = document.getElementById("spn_index_producto").innerText;
        var nombre_producto = document.getElementById('txt_nombre_producto').value.trim();
        var tipo_producto = document.getElementById('ddlTipoProducto').value;
        var precio_producto = document.getElementById('txt_precio_producto').value.trim();
        var descripcion_producto = document.getElementById('txt_descripcion_producto').value.trim();
        var marca_seleccionada = document.getElementById('ddlMarca').value;
        var msg = "";

        if (!nombre_producto) {
            msg = "El nombre del producto requerido";
        }
        if (!precio_producto) {
            msg += "El campo 'precio' es requerido." + text_break_line;
        } else if (parseFloat(precio_producto) <= 0) {
            msg += "El precio debe ser mayor a $0." + text_break_line;
        }

        if (tipo_producto == 0) {
            msg += "Seleccione el tipo de producto." + text_break_line;
        }
        if (marca_seleccionada == 0) {
            msg += "Seleccione la marca asociada a este producto." + text_break_line;
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            const API_URL_C_PRODUCT = URL_BASE_APP + "productos";
            var API_URL_U_PRODUCT = URL_BASE_APP + "productos/" + selected_producto;

            const producto_obj = {
                "ID_TIPO_PRODUCTO": tipo_producto,
                "ID_MARCA": marca_seleccionada,
                "NOMBRE_PRODUCTO": nombre_producto,
                "DESCRIPCION_PRODUCTO": descripcion_producto,
                "VALOR": precio_producto
            };

            if (selected_producto != "") {
                const response = await fetch(API_URL_U_PRODUCT, {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(producto_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.mensaje);
                if (data.affectedRows) {
                    recargar_tabla_productos();
                    limpiar_form_productos();
                }

            } else {
                const response = await fetch(API_URL_C_PRODUCT, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(producto_obj)
                });

                const data = await response.json();

                // response.ok && data.success
                // response.ok && data.ID_PRODUCTO

                mostrar_mensaje(data.mensaje);
                if (data.ID_PRODUCTO) {
                    recargar_tabla_productos();
                    limpiar_form_productos();
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
 * Limpiar los campos del formulario de productos.
 */
async function limpiar_form_productos() {
    try {
        var empty = "";
        document.getElementById("spn_index_producto").innerText = empty;
        document.getElementById('txt_nombre_producto').value = empty;
        document.getElementById('ddlTipoProducto').value = "0";
        document.getElementById('txt_precio_producto').value = empty;
        document.getElementById('txt_descripcion_producto').value = empty;
        document.getElementById('ddlMarca').value = "0";
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar la tabla de productos registrados en el sistema.
 * @returns async
 */
async function recargar_tabla_productos() {
    try {

        // Variables: 
        const API_URL_R_PRODUCT = URL_BASE_APP + "productos";

        const response = await fetch(API_URL_R_PRODUCT, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.mensaje) {
            localStorage.setItem("productos_disponibles", JSON.stringify(data));
            load_dt_productos();
        } else {
            mostrar_mensaje(data.mensaje);
            return;
        }

    } catch (ex) {
        console.log("No se pudo cargar los productos.");
        console.log(ex);
    }
}

/**
 * Cargar la información del producto seleccionado - ésta se encuentra oculta en el span correspondiente en objeto JSON.
 * Se hace así para evitar múltiples llamadas al servidor.
 * @param {int} id_product ID del producto seleccionado.
 */
async function seleccionar_producto(id_product) {
    try {
        var spn = document.getElementById("span_data_" + id_product);
        if (spn.innerText != undefined) {
            var data_product = JSON.parse(spn.innerText);
            document.getElementById("spn_index_producto").innerText = data_product["ID_PRODUCTO"];
            document.getElementById('txt_nombre_producto').value = data_product["NOMBRE_PRODUCTO"];
            //obtener_nombre_detalle("TIPO_PRODUCTO", data_product["ID_TIPO_PRODUCTO"], "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO");
            establecer_seleccion("ddlTipoProducto", data_product["ID_TIPO_PRODUCTO"]);
            document.getElementById('txt_precio_producto').value = data_product["VALOR"];
            document.getElementById('txt_descripcion_producto').value = data_product["DESCRIPCION_PRODUCTO"];
            establecer_seleccion("ddlMarca", data_product["ID_MARCA"]);
            //obtener_nombre_detalle("MARCA", data_product["ID_MARCA"], "ID_MARCA", "NOMBRE_MARCA");
        }

    } catch (error) {
        console.log("No se pudo mostrar la información del producto seleccionado.")
        console.log(error);
    }
}

/**
 * Eliminar producto seleccionado.
 * @param {int} id_product ID del producto seleccionado.
 */
async function eliminar_producto(id_product) {
    try {
        if (confirm("¿Está seguro que desea eliminar este registro?")) {

            var API_URL_D_PRODUCT = URL_BASE_APP + "productos/" + id_product;
            const response = await fetch(API_URL_D_PRODUCT, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' }
            });

            const data = await response.json();

            mostrar_mensaje(data.mensaje);
            //data.detalleError
            recargar_tabla_productos();
            limpiar_form_productos();
        }

    } catch (error) {
        console.log(error);
    }
}

/**
 * Cargar la tabla "tbl_dyn_productos" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_productos() {

    var ds_products = [];
    ds_products = JSON.parse(localStorage.getItem("productos_disponibles"));
    var incr = 0;

    // Limpiar el objeto DataTable para operarlo con la nueva configuración.
    // Source: https://stackoverflow.com/a/52284422/4092887
    $('#tbl_dyn_productos').DataTable().clear().destroy();

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_dyn_productos', {
        searching: true,
        retrieve: true,
        ordering: true,
        columnDefs: [
            { data: 'NOMBRE_PRODUCTO', targets: 0, title: "Producto" },
            {
                data: 'ID_TIPO_PRODUCTO', targets: 1, title: "Tipo",
                render: function (data, type, row) {
                    if (type === 'display') {
                        var control_id = "span_tipo_producto_" + row["ID_INVENTARIO"];
                        return `<span id='${control_id}'>${obtener_nombre_detalle("TIPO_PRODUCTO", data, "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO")}</span>`;
                    }

                    return data;
                }
            },
            {
                data: 'VALOR', targets: 2, title: "Precio ($)",
                render: function (data, type, row) {
                    if (type === 'display') {
                        var control_id = "span_valor_" + row["ID_PRODUCTO"];
                        return `<span id='${control_id}'>${formatter.format(data)}</span>`;
                    }

                    return data;
                }
            },
            { data: 'DESCRIPCION_PRODUCTO', targets: 3, title: "Descripción" },
            {
                // NOTA: Para que filtre por marca, toca modificar la consulta para que traiga el nombre desde la BD.
                // En este caso, filtrará por el ID, no el nombre.
                data: 'ID_MARCA', targets: 4, title: "Marca",
                render: function (data, type, row) {
                    if (type === 'display') {
                        var control_id = "span_marca_" + + row["ID_PRODUCTO"];
                        return `<span id='${control_id}'>${obtener_nombre_detalle("MARCA", data, "ID_MARCA", "NOMBRE_MARCA")}</span>`;
                    }

                    return data;
                }
            },
            {
                data: 'ID_PRODUCTO', targets: 5, searchable: false, title: "Acción",
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<a href='#' id='lnk_edit_${row["ID_PRODUCTO"]}' onclick='seleccionar_producto("${row["ID_PRODUCTO"]}")'>Editar</a> - <a href='#' id='lnk_delete_${row["ID_PRODUCTO"]}' onclick='eliminar_producto("${row["ID_PRODUCTO"]}")'>Eliminar</a><span id='span_data_${row["ID_PRODUCTO"]}' class='hdf_data'>${JSON.stringify(row)}</span>`;
                    }

                    return data;
                }
            }
        ],
        data: ds_products,
        language: {
            decimal: "",
            emptyTable: "<strong>No hay productos disponibles</strong>",
            info: "Mostrando página _PAGE_ de _PAGES_", // Showing _START_ to _END_ of _TOTAL_ entries
            infoEmpty: "No hay productos",
            infoFiltered: "(_TOTAL_ productos filtrados de _MAX_ registros totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrando _MENU_ productos por página",
            loadingRecords: "Cargando...",
            processing: "",
            search: "Buscar producto:",
            zeroRecords: "No hay productos que coincidan con el filtro",
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
    $('#tbl_dyn_productos').removeClass('dataTable');
}