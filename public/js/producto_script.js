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

                mostrar_mensaje(data.message);
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

                mostrar_mensaje(data.message);
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
        var inicio_tabla = '<table id="tbl_dyn_productos">';
        var encabezado = '<tr><th>Producto</th><th>Tipo</th><th>Precio ($)</th><th>Descripción</th><th>Marca</th><th>Acción</th></tr>';
        var fila = "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td><a href='#' id='lnk_edit_{5}' onclick='seleccionar_producto(\"{6}\")'>Editar</a> - <a href='#' id='lnk_delete_{5}' onclick='eliminar_producto(\"{6}\")'>Eliminar</a><span id='span_data_{5}' class='hdf_data'>{7}</span></td></tr>";
        var temp_fila = "";
        var cuerpo_tabla = "";
        var final_tabla = '</table>';

        // Limpiar div:  
        document.getElementById("div_dynamic_table_productos").innerHTML = "";

        const response = await fetch(API_URL_R_PRODUCT, {
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
                temp_fila = temp_fila.replace("{1}", obtener_nombre_detalle("ddlTipoProducto", data[i]["ID_TIPO_PRODUCTO"], "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO"));
                temp_fila = temp_fila.replace("{2}", data[i]["VALOR"]);
                temp_fila = temp_fila.replace("{3}", data[i]["DESCRIPCION_PRODUCTO"]);
                temp_fila = temp_fila.replace("{4}", obtener_nombre_detalle("ddlMarca", data[i]["ID_MARCA"], "ID_MARCA", "NOMBRE_MARCA"));
                temp_fila = temp_fila.replace("{5}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{5}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{5}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{6}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{6}", data[i]["ID_PRODUCTO"]);
                temp_fila = temp_fila.replace("{7}", JSON.stringify(data[i]));

                // Armar el cuerpo de la tabla - es decir, las filas de la tabla:
                cuerpo_tabla += temp_fila;
            }

            // Agregar todo el HTML creado en el div dinámico:
            document.getElementById("div_dynamic_table_productos").innerHTML = inicio_tabla + encabezado + cuerpo_tabla + final_tabla;
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
            establecer_seleccion("ddlTipoProducto", data_product["ID_TIPO_PRODUCTO"]);
            document.getElementById('txt_precio_producto').value = data_product["VALOR"];
            document.getElementById('txt_descripcion_producto').value = data_product["DESCRIPCION_PRODUCTO"];
            establecer_seleccion("ddlMarca", data_product["ID_MARCA"]);
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