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
                const response = await fetch(API_URL_U_INVENTARIO, {
                    method: 'PUT',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(inventario_prod_obj)
                });

                const data = await response.json();

                mostrar_mensaje(data.message);
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

                mostrar_mensaje(data.message);
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
        document.getElementById('txt_nombre_producto').value = empty;
        document.getElementById('txt_cantidad').value = "0";
        document.getElementById('spn_tipo_producto').innerText = "0";
        document.getElementById('spn_precio').innerText = "0";
        document.getElementById('spn_descripcion').innerText = "-";
        document.getElementById('spn_marca').innerText = "-";

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
        var inicio_html = '<input type="text" id="buscar-elemento" onkeyup="filtrar_productos()" placeholder="Digite el nombre del producto" title="Digite el nombre del producto" />';
        var inicio_tabla = '<table id="tbl_dyn_productos">';
        var encabezado = '<tr><th>Producto</th><th>Tipo</th><th>Precio ($)</th><th>Descripción</th><th>Marca</th><th>Cantidad</th><th>Acción</th></tr>';
        var fila = "<tr {9}><td>{0}</td><td><span id='{1}{1}'>{1}</span></td><td><span id='{2}{2}'>{2}</span></td><td><span id='{3}{3}'>{3}</span></td><td><span id='{4}{4}'>{4}</span></td><td><span id='{5}{5}'>{5}</span></td><td><a href='#' id='lnk_edit_{6}' onclick='seleccionar_producto_en_inventario(\"{7}\")'>{10}</a> - <a href='#' id='lnk_delete_{6}' onclick='eliminar_inventario_del_producto(\"{7}\")'>Eliminar</a><span id='{11}{6}' class='hdf_data'>{8}</span></td></tr>";
        var temp_fila = "";
        var cuerpo_tabla = "";
        var final_tabla = '</table>';
        var is_new_inventory = "";

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

                // Establecer el nuevo ID para los campos:
                is_new_inventory = (data[i]["ID_INVENTARIO"] == null) ? "span_null_" + i : "";

                // Armar los ítems (es decir, personas) disponibles para su selección y consulta: 
                temp_fila = temp_fila.replace("{0}", data[i]["NOMBRE_PRODUCTO"]);
                temp_fila = temp_fila.replace("{1}", (is_new_inventory != "") ? "span_tipo_producto_null_" : "span_tipo_producto_");
                temp_fila = temp_fila.replace("{1}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{1}", obtener_nombre_detalle("TIPO_PRODUCTO", data[i]["ID_TIPO_PRODUCTO"], "ID_TIPO_PRODUCTO", "NOMBRE_TIPO_PRODUCTO"));
                temp_fila = temp_fila.replace("{2}", (is_new_inventory != "") ? "span_valor_null_" : "span_valor_");
                temp_fila = temp_fila.replace("{2}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{2}", formatter.format(data[i]["VALOR"]));
                temp_fila = temp_fila.replace("{3}", (is_new_inventory != "") ? "span_descr_null_" : "span_descr_");
                temp_fila = temp_fila.replace("{3}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{3}", data[i]["DESCRIPCION_PRODUCTO"]);
                temp_fila = temp_fila.replace("{4}", (is_new_inventory != "") ? "span_marca_null_" : "span_marca_");
                temp_fila = temp_fila.replace("{4}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{4}", obtener_nombre_detalle("MARCA", data[i]["ID_MARCA"], "ID_MARCA", "NOMBRE_MARCA"));
                temp_fila = temp_fila.replace("{5}", (is_new_inventory != "") ? "span_cantidad_null_" : "span_cantidad_");
                temp_fila = temp_fila.replace("{5}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{5}", (!data[i]["CANTIDAD"]) ? "0" : data[i]["CANTIDAD"]);

                temp_fila = temp_fila.replace("{6}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{6}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{6}", (data[i]["ID_INVENTARIO"] == null) ? i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{7}", (data[i]["ID_INVENTARIO"] == null) ? "-" + i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{7}", (data[i]["ID_INVENTARIO"] == null) ? "-" + i : data[i]["ID_INVENTARIO"]);
                temp_fila = temp_fila.replace("{8}", JSON.stringify(data[i]));
                temp_fila = temp_fila.replace("{9}", (!data[i]["CANTIDAD"]) ? 'class="tr_missing_inventory" title="No hay inventario para este producto."' : "");
                temp_fila = temp_fila.replace("{10}", (!data[i]["CANTIDAD"]) ? "Crear" : "Editar");
                temp_fila = temp_fila.replace("{11}", (data[i]["ID_INVENTARIO"] == null) ? "span_null_" : "span_data_");

                // Armar el cuerpo de la tabla - es decir, las filas de la tabla:
                cuerpo_tabla += temp_fila;
            }

            // Agregar todo el HTML creado en el div dinámico:
            document.getElementById("div_dynamic_table_productos").innerHTML = inicio_html + inicio_tabla + encabezado + cuerpo_tabla + final_tabla;
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
 * Filtrar productos en la tabla de productos en inventario.
 * Source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_table
 */
function filtrar_productos() {
    try {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("buscar-elemento");
        filter = input.value.toUpperCase();
        table = document.getElementById("tbl_dyn_productos");
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    } catch (ex) {
        mostrar_mensaje("Hubo un error al filtrar productos. Intente de nuevo");
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

    try {

        if (id_inventario.indexOf("-") == -1) {
            spn = document.getElementById("span_data_" + id_inventario);
        }
        else {
            create_invent = true;
            id_inventario = id_inventario.split('-')[1];
            spn = document.getElementById("span_null_" + id_inventario);
        }

        if (spn != null && spn.innerText != undefined) {
            var data_inventario_prod = JSON.parse(spn.innerText);
            document.getElementById("spn_index_producto").innerText = data_inventario_prod["ID_PRODUCTO"];
            document.getElementById("spn_index_inventario").innerText = (create_invent == false) ? id_inventario : "";
            document.getElementById('txt_nombre_producto').value = data_inventario_prod["NOMBRE_PRODUCTO"];
            document.getElementById("txt_cantidad").value = (data_inventario_prod["CANTIDAD"] == null) ? "0" : data_inventario_prod["CANTIDAD"];
            document.getElementById('spn_tipo_producto').innerText = document.getElementById("span_tipo_producto_" + ((create_invent == false) ? "" : "null_") + id_inventario).innerText;
            document.getElementById('spn_precio').innerText = document.getElementById("span_valor_" + ((create_invent == false) ? "" : "null_") + id_inventario).innerText;
            document.getElementById('spn_descripcion').innerText = data_inventario_prod["DESCRIPCION_PRODUCTO"];
            document.getElementById('spn_marca').innerText = document.getElementById("span_marca_" + ((create_invent == false) ? "" : "null_") + id_inventario).innerText;
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