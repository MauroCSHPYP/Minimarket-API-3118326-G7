document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmVenta');
    const form2 = document.getElementById('frmVenta2');
    cargar_tabla_productos_en_caja();

    /**
     * Evento OnClick del botón. Envía el objeto que compone la venta/ticket/factura.
     */
    form2.addEventListener('submit', async (e) => {
        e.preventDefault();

        var msg = "";
        var arr_prods_en_caja = [];
        var cnt_prods = 0;

        try {
            arr_prods_en_caja = JSON.parse(localStorage.getItem("arr_prods_en_caja"));
            if (!arr_prods_en_caja) {
                arr_prods_en_caja = [];
            }
            cnt_prods = arr_prods_en_caja.length;
        } catch (err) {
            mostrar_mensaje("Hubo un error inesperado al procesar la factura. Contacte con el administrador.");
            console.log(err);
            return;
        }

        if (cnt_prods == 0) {
            msg += "- No hay productos a facturar." + text_break_line;
        }

        // Validar si el producto puede ser vendido - para controlar excepción de actualización en inventario: 
        try {
            for (let ind_p = 0; ind_p < arr_prods_en_caja.length; ind_p++) {
                if (arr_prods_en_caja[ind_p]["ID_INVENTARIO"] == null || arr_prods_en_caja[ind_p]["ID_INVENTARIO"] == undefined || arr_prods_en_caja[ind_p]["ID_INVENTARIO"] == 0) {
                    msg += `- Producto (${arr_prods_en_caja[ind_p]["T_NOMBRE_PRODUCTO"].toUpperCase()}) no posee inventario.${text_break_line}`;
                }
            }
        } catch (ex) {
            msg += "No se pudo validar el producto seleccionado: " + text_break_line;
            console.log(ex);
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han generado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            const API_URL_C_TICKET = URL_BASE_APP + "tickets";

            const ticket_obj = {
                "T_ID_USUARIO": JSON.parse(localStorage.getItem("usuario"))["ID_USUARIO"],
                "T_DETALLES": arr_prods_en_caja
            }

            const response = await fetch(API_URL_C_TICKET, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(ticket_obj)
            });

            const data = await response.json();

            msg = data.message;

            if (data.id_ticket_generado) {
                msg = data.message + text_break_line + "Total: " + formatter.format(data.total_pago_ticket);
                limpiar_form_venta();
                localStorage.removeItem("arr_prods_en_caja");
                cargar_tabla_productos_en_caja();
                // Abrir factura a imprimir: 
                window.open("../html/ticket.html?q=fct101&factura_id=" + data.id_ticket_generado, "_blank");
            } else {
                // Modificación (31/07/2026): Solo mostrar alerta cuando no se pudo completar la venta.
                mostrar_mensaje(msg);
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
async function limpiar_form_venta() {
    try {
        var empty = "";
        var arr_campos_formulario_caja = ["txt_nombre_producto", "txt_cantidad", "txt_precio", "spn_index_producto", "spn_precio_producto", "spn_prod_inv"];

        for (var i = 0; i < arr_campos_formulario_caja.length; i++) {

            switch (i) {
                case 1:
                    document.getElementById(arr_campos_formulario_caja[i]).value = "0";
                    break;
                case 2:
                    document.getElementById("spn_precio_producto").value = empty;
                    document.getElementById(arr_campos_formulario_caja[i]).value = empty;
                    break;
                case 5:
                    document.getElementById("spn_prod_inv").value = "0";
                    break;
                default:
                    document.getElementById(arr_campos_formulario_caja[i]).value = empty;
                    break;
            }
        }
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Limpia la tabla de productos a vender.
 */
function cancelar_venta() {
    try {
        if (confirm("¿Está seguro que desea cancelar la venta?")) {
            localStorage.removeItem("arr_prods_en_caja");
            mostrar_mensaje("Venta cancelada");
            cargar_tabla_productos_en_caja();
        }
    } catch (ex) {
        mostrar_mensaje("Hubo un error inesperado al cancelar la venta. Intente de nuevo.");
        console.log(ex);
    }
}

/**
 * Cargar la tabla de productos registrados en el sistema.
 * Estos son los productos que el cajero selecciona para crear la venta/factura/ticket.
 * NOTA: Crear otro endpoint para obtener los productos que estén en inventario : esto, para evitar error desde caja, pero, 
 * la causa del error es la falta de administración del inventario.
 * 02/09/2026: Se agrega validación para controlar este error. En todo caso, el error es operativo. El administrador debe estar pendiente del inventario.
 * @returns async
 */
async function cargar_productos() {
    try {

        // Variables: 
        //const API_URL_R_PRODUCTS = URL_BASE_APP + "productos"; // Todos los productos.
        const API_URL_R_PRODUCTS = URL_BASE_APP + "inventarios"; // Inventario - para validar si puede hacer la venta.

        const response = await fetch(API_URL_R_PRODUCTS, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.message) {
            localStorage.setItem("productos_disponibles", JSON.stringify(data));
            load_dt_productos();
        } else {
            mostrar_mensaje(data.message);
            return;
        }

    } catch (ex) {
        console.log("No se pudo cargar los productos.");
        console.log(ex);
    }
}

/**
 * Cargar la tabla de los productos en caja - listos para ser facturados.
 * Table: tbl_productos_en_caja
 */
async function cargar_tabla_productos_en_caja() {

    // Variables: 
    var total_venta = 0;
    var arr_prods_en_caja = [];
    var ds_products = [];

    try {

        // Cargar la variable de sesión en la variable local para procesarla: 
        arr_prods_en_caja = JSON.parse(localStorage.getItem("arr_prods_en_caja"));

        if (!arr_prods_en_caja) {
            arr_prods_en_caja = [];
        }

        // Obtener los productos establecidos al ingresar a esta página: 
        ds_products = JSON.parse(localStorage.getItem("productos_disponibles"));

        // Recorrer los productos en caja para calcular el total de la venta: 
        for (var i = 0; i < arr_prods_en_caja.length; i++) {

            // Total en caja: 
            try { total_venta += parseInt(arr_prods_en_caja[i]["PRECIO"]); }
            catch (ex) { }

            // Actualizar ID_INVENTARIO - esto, cuando se recarga la página: 
            for (var j = 0; j < ds_products.length; j++) {
                if (ds_products[j]["ID_PRODUCTO"] == arr_prods_en_caja[i]["ID_ITEM"]) {
                    arr_prods_en_caja[i]["ID_INVENTARIO"] = ds_products[j]["ID_INVENTARIO"];
                    //console.log(arr_prods_en_caja[i]["T_NOMBRE_PRODUCTO"] + " + ID_PROD: " + arr_prods_en_caja[i]["ID_ITEM"] + " + " + " - INVENT: " + arr_prods_en_caja[i]["ID_INVENTARIO"] + " - ACTUALIZAR A: " + ds_products[j]["ID_INVENTARIO"]);
                    break;
                }
            }
        }

        // Consolidar la actualización de datos en la variable: 
        localStorage.setItem("arr_prods_en_caja", JSON.stringify(arr_prods_en_caja));

        // Cargar el total calculado de la factura/venta/ticket y recargar la tabla de productos en caja: 
        document.getElementById("str_total").innerText = total_venta;
        document.getElementById("str_total").innerText = formatter.format(document.getElementById("str_total").innerText);
        load_dt_en_caja();

    } catch (ex) {
        mostrar_mensaje("Hubo un error al cargar la tabla de productos en caja. Intente de nuevo.");
        console.log(ex);
    }
}

/**
 * Agregar el producto - desde el formulario a la tabla de "productos en caja". 
 * NOTA: Se puede editar el presente código para que "al seleccionar el producto", se pueda cambiar 
 * los datos del producto seleccionado - se usaría para editar la cantidad. 
 * Para efectos de demostración, esto se omite.
 */
function agregar_producto_a_vender() {

    var arr_prods_en_caja = [];
    var temp_arr_producto = {};

    try {

        if (document.getElementById("spn_index_producto").value == "") {
            mostrar_mensaje("Debe seleccionar un producto.");
            return;
        }

        // Cargar los productos: 
        arr_prods_en_caja = JSON.parse(localStorage.getItem("arr_prods_en_caja"));
        if (!arr_prods_en_caja) {
            arr_prods_en_caja = [];
        }

        // Armar el objeto de producto - temporal: 
        temp_arr_producto = {
            // Valores informativos: 
            T_NOMBRE_PRODUCTO: document.getElementById("txt_nombre_producto").value,
            // Valores requeridos a enviar al endpoint: 
            CANTIDAD: document.getElementById("txt_cantidad").value,
            PRECIO: parseFloat(document.getElementById("txt_cantidad").value) * parseFloat(document.getElementById("spn_precio_producto").value),
            ID_ITEM: document.getElementById("spn_index_producto").value,
            ID_INVENTARIO: document.getElementById("spn_prod_inv").value
        };

        // BUG: (Durante las pruebas), ha dejado agregar productos vacíos - lo cual es incorrecto. Con esta línea se resuelve el bug.
        // No se coloca ANTES para usar como último recurso para la validación del objeto (i.e. producto) a agregar en la tabla de productos en caja.
        if (document.getElementById("txt_nombre_producto").value == "") {
            mostrar_mensaje("Debe seleccionar un producto.");
            return;
        }

        // Guardar la información en el arreglo global: 
        arr_prods_en_caja.push(temp_arr_producto);

        // Mostrar mensaje y guardar los cambios hechos en la variable de sesión: 
        //mostrar_mensaje("Producto agregado correctamente");
        localStorage.setItem("arr_prods_en_caja", JSON.stringify(arr_prods_en_caja));

        // Limpiar los campos del formulario para dejarlo listo y recargar los productos.
        limpiar_form_venta();
        cargar_tabla_productos_en_caja();
    } catch (ex) {
        mostrar_mensaje("Hubo un error al agregar el producto. Intente de nuevo");
        console.log(ex);
    }
}

/**
 * Calcular el precio del producto.
 * @param {int} e cantidad seleccionada en el campo "txt_cantidad".
 */
function calcular_precio(e) {
    var cantidad_producto = 0;
    var precio_oculto = 0;
    var precio_calculado = 0;

    try {
        cantidad_producto = parseInt(e.value);
        if (document.getElementById("spn_precio_producto").value != "") {
            precio_oculto = parseInt(document.getElementById("spn_precio_producto").value);
        }

        if (isNaN(precio_oculto)) {
            precio_oculto = 0;
        }

        precio_calculado = precio_oculto * cantidad_producto;
        document.getElementById("txt_precio").value = precio_calculado;

    } catch (ex) {
        mostrar_mensaje("Hubo un error al calcular el precio del producto. Intente de nuevo");
        console.log(ex);
    }
}

/**
 * Seleccionar producto a facturar y colocar su información en el formulario.
 * @param {int} ind_producto es el índice del producto seleccionado.
 */
function seleccionar_producto(ind_producto) {

    var temp_prod_seleccionado = [];

    try {

        // Cargar el producto seleccionado.
        temp_prod_seleccionado = JSON.parse(document.getElementById("inp_data_" + ind_producto).value);

        // Establecer los valores en los campos del formulario: 
        document.getElementById("txt_nombre_producto").value = temp_prod_seleccionado["NOMBRE_PRODUCTO"];
        document.getElementById("txt_cantidad").value = "1";
        document.getElementById("txt_precio").value = temp_prod_seleccionado["VALOR"];
        document.getElementById("spn_precio_producto").value = temp_prod_seleccionado["VALOR"];
        document.getElementById("spn_index_producto").value = temp_prod_seleccionado["ID_PRODUCTO"];
        document.getElementById("spn_prod_inv").value = temp_prod_seleccionado["ID_INVENTARIO"];

        // Cerrar ventana modal: 
        var modal = document.getElementById("myModal");
        modal.style.display = "none";

    } catch (ex) {
        mostrar_mensaje("Hubo un error al seleccionar el producto. Intente de nuevo");
        console.log(ex);
    }
}

/**
 * Quitar producto listado en la tabla de "productos en caja".
 * @param {int} id_selected_prod Index del producto seleccionado.
 */
async function remover_producto(id_selected_prod) {

    // Variables.
    var arr_prods_en_caja = [];
    var ind_found = 0;

    try {
        arr_prods_en_caja = JSON.parse(localStorage.getItem("arr_prods_en_caja"));

        for (var ind = 0; ind < arr_prods_en_caja.length; ind++) {

            if (arr_prods_en_caja[ind]["ID_ITEM"] == id_selected_prod) {
                ind_found = ind;
                break;
            }
        }

        if (confirm("¿Está seguro que desea quitar este producto?")) {
            arr_prods_en_caja.splice(ind_found, 1);
            //console.log("INDEX: " + ind_found + " - producto a borrar: ");
            //console.log(arr_prods_en_caja[ind_found]);
            localStorage.setItem("arr_prods_en_caja", JSON.stringify(arr_prods_en_caja));
            cargar_tabla_productos_en_caja();
        }

    } catch (error) {
        mostrar_mensaje("No se pudo remover el producto");
        console.log(error);
    }
}

/**
 * Cargar la tabla "tbl_productos_en_caja" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_en_caja() {
    // Limpiar el objeto DataTable para operarlo con la nueva configuración.
    // Source: https://stackoverflow.com/a/52284422/4092887
    $('#tbl_productos_en_caja').DataTable().clear().destroy();

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_productos_en_caja', {
        searching: true,
        //lengthMenu: [5, 10, 15, 20],
        retrieve: true,
        ordering: false,
        columnDefs: [
            { data: 'T_NOMBRE_PRODUCTO', targets: 0, title: "Producto" },
            {
                data: 'CANTIDAD', targets: 1, title: "Cantidad"
            },
            {
                data: 'PRECIO', targets: 2, title: "Precio ($)",
                render: function (data, type) {
                    if (type === 'display') {
                        return formatter.format(data);
                    }

                    return data;
                }
            },
            {
                data: 'ID_ITEM', targets: 3, searchable: false, title: "Acción",
                // Source: https://datatables.net/examples/basic_init/data_rendering.html
                render: function (data, type) {
                    if (type === 'display') {
                        return "<a href='#' onclick='remover_producto(" + data + ")'>Eliminar</a>";
                    }

                    return data;
                }
            }
        ],
        data: JSON.parse(localStorage.getItem("arr_prods_en_caja")),
        language: {
            decimal: "",
            emptyTable: "<strong>No hay productos a facturar</strong>",
            info: "Mostrando página _PAGE_ de _PAGES_", // Showing _START_ to _END_ of _TOTAL_ entries
            infoEmpty: "", //"No hay productos a facturar",
            infoFiltered: "(_TOTAL_ elementos filtrados de _MAX_ registros totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrando _MENU_ registros por página",
            loadingRecords: "Cargando...",
            processing: "",
            search: "Buscar:",
            zeroRecords: "No hay resultados que coincidan con el filtro",
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
    //$('#tbl_productos_en_caja').removeClass('dataTable');
}

/**
 * Cargar la tabla "tbl_productos_disponibles" con la configuración de DataTable.
 * Source: https://stackoverflow.com/a/52284422/4092887
 */
function load_dt_productos() {

    var ds_products = [];
    ds_products = JSON.parse(localStorage.getItem("productos_disponibles"));

    // Configuración completa del DataTable: 
    // Source: https://datatables.net/examples/i18n/options.html
    new DataTable('#tbl_productos_disponibles', {
        searching: true,
        lengthMenu: [5, 10, 15, 20],
        retrieve: true,
        ordering: true,
        columnDefs: [
            { data: 'NOMBRE_PRODUCTO', targets: 0, title: "Producto" },
            {
                data: 'ID_TIPO_PRODUCTO', targets: 1, title: "Tipo",
                render: function (data, type) {
                    if (type === 'display') {
                        return obtener_nombre_detalle("TIPO_PRODUCTO", data, "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO");
                    }

                    return data;
                }
            },
            {
                data: 'VALOR', targets: 2, title: "Precio ($)",
                render: function (data, type) {
                    if (type === 'display') {
                        return formatter.format(data);
                    }

                    return data;
                }
            },
            { data: 'DESCRIPCION_PRODUCTO', targets: 3, title: "Descripción" },
            {
                // NOTA: Para que filtre por marca, toca modificar la consulta para que traiga el nombre desde la BD.
                // En este caso, filtrará por el ID, no el nombre.
                data: 'ID_MARCA', targets: 4, title: "Marca",
                render: function (data, type) {
                    if (type === 'display') {
                        return obtener_nombre_detalle("MARCA", data, "ID_MARCA", "NOMBRE_MARCA");
                    }

                    return data;
                }
            },
            {
                data: 'ID_PRODUCTO', targets: 5, searchable: false, title: "Acción",
                // Source: https://datatables.net/examples/basic_init/data_rendering.html
                render: function (data, type, row) {
                    if (type === 'display') {
                        //console.log(row);
                        return "<a href='#' onclick='seleccionar_producto(" + data + ")'>Seleccionar</a><input type='hidden' id='inp_data_" + data + "' value='" + JSON.stringify(row) + "' class='hdf_data' />";
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
}