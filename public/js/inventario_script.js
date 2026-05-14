document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmInventario');
    recargar_tbl_prods_en_inventario();

    /**
     * Evento OnClick del botón. Gestiona tanto la creación como la actualización de registros en esta página.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_producto = document.getElementById("spn_index_producto").innerText;
        var selected_inventario = document.getElementById("spn_index_inventario").innerText;
        var nombre_producto = document.getElementById("txt_nombre_producto").value;
        var cantidad = document.getElementById("txt_cantidad").value;
        var cnt_prod_selected = document.getElementById("spn_cantidad_invent").innerText;
        var msg = "";

        if (!selected_producto) {
            msg += "Seleccione el producto." + text_break_line;
        }

        if (!cantidad) {
            msg += "El campo 'cantidad' es requerido." + text_break_line;
        } else if ((parseFloat(cantidad) <= 0) && selected_producto) {
            msg += "La cantidad en inventario del producto (" + nombre_producto + ") debe ser mayor a 0." + text_break_line;
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg.trim());
            return;
        }

        try {

            const API_URL_C_INVENTARIO = URL_BASE_APP + "inventarios";
            var API_URL_U_INVENTARIO = URL_BASE_APP + "inventarios/" + selected_inventario;

            const inventario_prod_obj = {
                "ID_PRODUCTO": selected_producto,
                "CANTIDAD": cantidad
            };

            if (selected_inventario != "") {

                /**
                 * NOTA: El error: "Ya existe (1) inventario para el producto especificado. Solo puede haber (1) registro de inventario por producto." 
                 * se da porque la CANTIDAD del PRODUCTO seleccionado es LA MISMA QUE SE ENCUENTRA EN BASE DE DATOS; con esta validación se le informa al 
                 * usuario que no habrá cambios - puesto que no está cambiando nada realmente.
                 */
                if (cantidad == cnt_prod_selected) {
                    mostrar_mensaje("No hay cambios para guardar");
                    return;
                }


                const response = await fetch(API_URL_U_INVENTARIO, {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(inventario_prod_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.mensaje);
                if (data.affectedRows) {
                    recargar_tbl_prods_en_inventario();
                    limpiar_form_inventario();
                }

            } else {
                const response = await fetch(API_URL_C_INVENTARIO, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(inventario_prod_obj)
                });

                const data = await response.json();

                // response.ok && data.success
                // response.ok && data.ID_PRODUCTO

                mostrar_mensaje(data.mensaje);
                if (data.ID_INVENTARIO) {
                    recargar_tbl_prods_en_inventario();
                    limpiar_form_inventario();
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
async function limpiar_form_inventario() {
    try {
        var empty = "";
        document.getElementById("spn_index_producto").innerText = empty;
        document.getElementById("spn_index_inventario").innerText = empty;
        document.getElementById("txt_nombre_producto").value = empty;
        document.getElementById("txt_cantidad").value = "0";
        document.getElementById("spn_cantidad_invent").innerText = "0";
        document.getElementById("spn_tipo_producto").innerText = "0";
        document.getElementById("spn_precio").innerText = "0";
        document.getElementById("spn_descripcion").innerText = "-";
        document.getElementById("spn_marca").innerText = "-";

        // Cerrar ventana modal: 
        var modal = document.getElementById("myModal");
        modal.style.display = "none";
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar la tabla de productos registrados en el sistema.
 * @returns async
 */
async function recargar_tbl_prods_en_inventario() {
    try {

        // Variables: 
        const API_URL_R_PRODUCT = URL_BASE_APP + "inventarios";

        const response = await fetch(API_URL_R_PRODUCT, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.mensaje) {
            localStorage.setItem("productos_disponibles", JSON.stringify(data));
            load_dt_inventario_productos();
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
 * @param {int} id_inventario ID del producto seleccionado.
 */
async function seleccionar_producto_en_inventario(id_inventario) {

    var spn = null;
    var create_invent = false;
    var temp_field_id = "";

    try {

        if (id_inventario.indexOf("-") == -1) {
            spn = document.getElementById("inp_data_" + id_inventario);
        }
        else {
            create_invent = true;
            id_inventario = id_inventario.split('-')[1];
            spn = document.getElementById("inp_data_null_" + id_inventario);
        }

        if (spn != null && spn.value != undefined) {
            var data_inventario_prod = JSON.parse(spn.value);
            document.getElementById("spn_index_producto").innerText = data_inventario_prod["ID_PRODUCTO"];
            document.getElementById("spn_index_inventario").innerText = (create_invent == false) ? id_inventario : "";
            document.getElementById('txt_nombre_producto').value = data_inventario_prod["NOMBRE_PRODUCTO"];
            document.getElementById("txt_cantidad").value = (data_inventario_prod["CANTIDAD"] == null) ? "0" : data_inventario_prod["CANTIDAD"];
            document.getElementById("spn_cantidad_invent").innerText = (data_inventario_prod["CANTIDAD"] == null) ? "0" : data_inventario_prod["CANTIDAD"];
            temp_field_id = (create_invent == true) ? "span_tipo_producto_null_" + data_inventario_prod["ID_PRODUCTO"] : "span_tipo_producto_" + id_inventario;
            document.getElementById('spn_tipo_producto').innerText = document.getElementById(temp_field_id).innerText;
            temp_field_id = (create_invent == true) ? "span_valor_null_" + data_inventario_prod["ID_PRODUCTO"] : "span_valor_" + id_inventario;
            document.getElementById('spn_precio').innerText = document.getElementById(temp_field_id).innerText;
            document.getElementById('spn_descripcion').innerText = data_inventario_prod["DESCRIPCION_PRODUCTO"];
            temp_field_id = (create_invent == true) ? "span_marca_null_" + data_inventario_prod["ID_PRODUCTO"] : "span_marca_" + id_inventario;
            document.getElementById('spn_marca').innerText = document.getElementById(temp_field_id).innerText;
        }

        // Cerrar ventana modal: 
        var modal = document.getElementById("myModal");
        modal.style.display = "none";

    } catch (error) {
        console.log("No se pudo mostrar la información del producto seleccionado.")
        console.log(error);
    }
}

/**
 * Eliminar el inventario del producto seleccionado.
 * @param {int} id_product ID del producto seleccionado.
 */
async function eliminar_inventario_del_producto(id_product) {
    try {
        if (confirm("¿Está seguro que desea eliminar este registro?")) {

            var API_URL_D_INVENTARIO = URL_BASE_APP + "inventarios/" + id_product;
            const response = await fetch(API_URL_D_INVENTARIO, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' }
            });

            const data = await response.json();

            mostrar_mensaje(data.mensaje);
            //data.detalleError
            recargar_tbl_prods_en_inventario();
            limpiar_form_inventario();
        }

    } catch (error) {
        console.log(error);
    }
}

/**
 * Cargar la tabla "tbl_dyn_productos" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_inventario_productos() {

    var ds_products = [];
    ds_products = JSON.parse(localStorage.getItem("productos_disponibles"));

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
                        var control_id = "span_tipo_producto_";
                        if (row["ID_INVENTARIO"] == null) {
                            control_id = control_id + "null_" + row["ID_PRODUCTO"];
                        } else {
                            control_id = control_id + row["ID_INVENTARIO"];
                        }
                        return `<span id='${control_id}'>${obtener_nombre_detalle("TIPO_PRODUCTO", data, "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO")}</span>`;
                    }

                    return data;
                }
            },
            {
                data: 'VALOR', targets: 2, title: "Precio ($)",
                render: function (data, type, row) {
                    if (type === 'display') {
                        var control_id = "span_valor_";
                        if (row["ID_INVENTARIO"] == null) {
                            control_id = control_id + "null_" + row["ID_PRODUCTO"];
                        } else {
                            control_id = control_id + row["ID_INVENTARIO"];
                        }
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
                        var control_id = "span_marca_";
                        if (row["ID_INVENTARIO"] == null) {
                            control_id = control_id + "null_" + row["ID_PRODUCTO"];
                        } else {
                            control_id = control_id + row["ID_INVENTARIO"];
                        }
                        return `<span id='${control_id}'>${obtener_nombre_detalle("MARCA", data, "ID_MARCA", "NOMBRE_MARCA")}</span>`;
                        //return obtener_nombre_detalle("MARCA", data, "ID_MARCA", "NOMBRE_MARCA");
                    }

                    return data;
                }
            },
            {
                data: 'CANTIDAD', targets: 5, title: "Cantidad",
                render: function (data, type) {
                    if (type === 'display') {
                        return (data == null) ? "0" : data;
                    }

                    return data;
                }
            },
            {
                data: 'ID_PRODUCTO', targets: 6, searchable: false, title: "Acción",
                // Source: https://datatables.net/examples/basic_init/data_rendering.html
                render: function (data, type, row) {
                    if (type === 'display') {
                        var control_id = row["ID_INVENTARIO"] == null ? "inp_data_null_" + row["ID_PRODUCTO"] : "inp_data_" + row["ID_INVENTARIO"];
                        var id_to_set = row["ID_INVENTARIO"] == null ? "-" + row["ID_PRODUCTO"] : row["ID_INVENTARIO"];
                        var edit_or_create = (!row["CANTIDAD"]) ? "Crear" : "Editar";

                        if (row["ID_INVENTARIO"] == null) {
                            return `<a href='#' onclick='seleccionar_producto_en_inventario("${id_to_set}")' title='Crear el inventario para este producto.'>${edit_or_create}</a><input type='hidden' id='${control_id}' value='${JSON.stringify(row)}' class='hdf_data' />`;
                        } else {
                            return `<a href='#' onclick='seleccionar_producto_en_inventario("${id_to_set}")' title='Editar la cantidad en existencia de este producto.'>${edit_or_create}</a> - <a href='#' onclick='eliminar_inventario_del_producto("${id_to_set}")' title='Reduce el inventario de este producto a 0.'>Eliminar</a><input type='hidden' id='${control_id}' value='${JSON.stringify(row)}' class='hdf_data' />`;
                        }
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
        },
        createdRow: function (row, data, index) {
            if (data["ID_INVENTARIO"] == null) {
                // 'class="tr_missing_inventory" title="No hay inventario para este producto."'
                // Source: https://stackoverflow.com/a/66273557/4092887
                $('td', row).addClass("tr_missing_inventory").attr('title', 'No hay inventario para este producto.');
            }
            //console.log(row); // HTML
            //console.log(data); // JSON
            //console.log(index); // int
        }
    });

    // Source: https://stackoverflow.com/a/21181021/4092887
    $('#tbl_dyn_productos').removeClass('dataTable');
}