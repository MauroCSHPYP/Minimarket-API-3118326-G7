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
                msg = data.message + text_break_line + "Total: $" + data.total_pago_ticket;
                limpiar_form_venta();
                localStorage.removeItem("arr_prods_en_caja");
                cargar_tabla_productos_en_caja();
            }

            mostrar_mensaje(msg);

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
        var arr_campos_formulario_caja = ["txt_nombre_producto", "txt_cantidad", "txt_precio", "spn_index_producto"];

        for (var i = 0; i < arr_campos_formulario_caja.length; i++) {

            switch (i) {
                case 1:
                    document.getElementById(arr_campos_formulario_caja[i]).value = "1";
                    break;
                case 2:
                    document.getElementById("spn_precio_producto").value = empty;
                    document.getElementById(arr_campos_formulario_caja[i]).value = empty;
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
 * @returns async
 */
async function cargar_productos() {
    try {

        // Variables: 
        const API_URL_R_USER = URL_BASE_APP + "productos";
        var inicio_cuerpo_tabla = '<table id="tbl_personas">';
        var encabezado = '<tr><th>Producto</th><th>Tipo</th><th>Precio ($)</th><th>Descripción</th><th>Marca</th><th>Acción</th></tr>';
        var fila = "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td><a href='#' id='lnk_edit_{5}' onclick='seleccionar_producto(\"{6}\")'>Seleccionar</a><span id='span_data_{5}' class='hdf_data'>{7}</span></td></tr>";
        var temp_fila = "";
        var filas_a_generar = "";
        var final_cuerpo_tabla = '</table>';
        var fecha_user = "";

        // Limpiar div:  
        document.getElementById("div_dynamic_table_productos").innerHTML = "";

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
                temp_fila = temp_fila.replace("{0}", data[i]["NOMBRE_PRODUCTO"]);
                temp_fila = temp_fila.replace("{1}", obtener_nombre_detalle("TIPO_PRODUCTO", data[i]["ID_TIPO_PRODUCTO"], "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO"));
                temp_fila = temp_fila.replace("{2}", formatter.format(data[i]["VALOR"]));
                temp_fila = temp_fila.replace("{3}", data[i]["DESCRIPCION_PRODUCTO"]);
                temp_fila = temp_fila.replace("{4}", obtener_nombre_detalle("MARCA", data[i]["ID_MARCA"], "ID_MARCA", "NOMBRE_MARCA"));
                temp_fila = temp_fila.replace("{5}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{5}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{6}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{7}", JSON.stringify(data[i]));

                // Armar el cuerpo de la tabla - es decir, las filas de la tabla:
                filas_a_generar += temp_fila;
            }

            // Agregar todo el HTML creado en el div dinámico:
            document.getElementById("div_dynamic_table_productos").innerHTML = inicio_cuerpo_tabla + encabezado + filas_a_generar + final_cuerpo_tabla;
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
    var inicio_cuerpo_tabla = '<tbody>';
    var encabezado = '<thead><tr><th>Producto</th><th>Cantidad</th><th>Precio($)</th><th>Acción</th></tr></thead>';
    var fila = "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td><a href='#' id='lnk_delete_{3}' onclick='remover_producto(\"{4}\")'>Eliminar</a></td></tr>";
    var temp_fila = "";
    var filas_a_generar = "";
    var final_cuerpo_tabla = '</tbody>';
    var total_venta = 0;
    var arr_prods_en_caja = [];

    try {

        // Limpiar div:  
        document.getElementById("tbl_productos_en_caja").innerHTML = "";

        // Cargar la variable de sesión en la variable local para procesarla: 
        arr_prods_en_caja = JSON.parse(localStorage.getItem("arr_prods_en_caja"));

        if (!arr_prods_en_caja) {
            arr_prods_en_caja = [];
        }

        // Armar los ítems (es decir, personas) disponibles para su selección y consulta: 
        for (var i = 0; i < arr_prods_en_caja.length; i++) {

            // Crear una copia para el reemplazo de los datos: 
            temp_fila = fila;

            // Armar los ítems (es decir, personas) disponibles para su selección y consulta: 
            temp_fila = temp_fila.replace("{0}", arr_prods_en_caja[i]["T_NOMBRE_PRODUCTO"]);
            temp_fila = temp_fila.replace("{1}", arr_prods_en_caja[i]["CANTIDAD"]);
            temp_fila = temp_fila.replace("{2}", formatter.format(arr_prods_en_caja[i]["PRECIO"]));
            temp_fila = temp_fila.replace("{3}", i);
            temp_fila = temp_fila.replace("{4}", i);

            // Total en caja: 
            try { total_venta += parseInt(arr_prods_en_caja[i]["PRECIO"]); }
            catch (ex) { }

            // Armar el cuerpo de la tabla - es decir, las filas de la tabla:
            filas_a_generar += temp_fila;
        }

        // Cargar el total calulado de la factura/venta/ticket: 
        document.getElementById("str_total").innerText = (filas_a_generar.trim() == "") ? "0" : total_venta;
        document.getElementById("str_total").innerText = formatter.format(document.getElementById("str_total").innerText);

        // Agregar todo el HTML creado en el div dinámico:
        document.getElementById("tbl_productos_en_caja").innerHTML = inicio_cuerpo_tabla + encabezado + filas_a_generar + final_cuerpo_tabla;

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
    var arr_campos_formulario_caja = ["txt_nombre_producto", "txt_cantidad", "txt_precio", "spn_index_producto"];

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
            // Valores requeridos a enviar al endpoint: 
            ID_ITEM: document.getElementById("spn_index_producto").value,
            CANTIDAD: document.getElementById("txt_cantidad").value,
            PRECIO: parseFloat(document.getElementById("txt_cantidad").value) * parseFloat(document.getElementById("spn_precio_producto").value),
            // Valores informativos: 
            T_NOMBRE_PRODUCTO: document.getElementById("txt_nombre_producto").value
        };

        // Guardar la información en el arreglo global: 
        arr_prods_en_caja.push(temp_arr_producto);

        // Mostrar mensaje y guardar los cambios hechos en la variable de sesión: 
        mostrar_mensaje("Producto agregado correctamente");
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
        temp_prod_seleccionado = JSON.parse(document.getElementById("span_data_" + ind_producto).innerText);

        // Establecer los valores en los campos del formulario: 
        document.getElementById("txt_nombre_producto").value = temp_prod_seleccionado["NOMBRE_PRODUCTO"];
        document.getElementById("txt_cantidad").value = "1";
        document.getElementById("txt_precio").value = temp_prod_seleccionado["VALOR"];
        document.getElementById("spn_precio_producto").value = temp_prod_seleccionado["VALOR"];
        document.getElementById("spn_index_producto").value = temp_prod_seleccionado["ID_PRODUCTO"];

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
 * @param {int} ind_tipo_prod Index del producto seleccionado.
 */
async function remover_producto(ind_tipo_prod) {

    var arr_prods_en_caja = [];
    try {
        arr_prods_en_caja = JSON.parse(localStorage.getItem("arr_prods_en_caja"));

        if (confirm("¿Está seguro que desea quitar este producto?")) {
            arr_prods_en_caja.splice(ind_tipo_prod, 1);
            localStorage.setItem("arr_prods_en_caja", JSON.stringify(arr_prods_en_caja));
            cargar_tabla_productos_en_caja();
        }

    } catch (error) {
        mostrar_mensaje("No se pudo remover el producto");
        console.log(error);
    }
}