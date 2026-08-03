document.addEventListener('DOMContentLoaded', () => {

    const searchParams = new URLSearchParams(window.location.href);

    try {
        // localStorage.getItem("factura_id")
        // localStorage.removeItem("factura_id")
        if (searchParams.has("factura_id")) {
            cargar_factura_seleccionada(searchParams.get("factura_id"));
        } else {
            cerrar_ventana();
        }
    } catch (ex) {
        cerrar_ventana();
    }
});

/**
 * Cargar la tabla de tipos de productos registrados en el sistema. 
 * @param {int} factura_id ID de la factura seleccionada.
 * @returns async
 */
async function cargar_factura_seleccionada(factura_id) {

    const API_URL_R_TICKET = URL_BASE_APP + "tickets/" + factura_id;
    var table_body = "";
    var dynamic_details = "";

    try {

        const response = await fetch(API_URL_R_TICKET, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.message) {

            // Detalles iniciales de la factura: 
            document.getElementById("spn_ticket_no").innerText = data["NO_TICKET"];
            document.getElementById("spn_fecha_compra").innerText = data["FECHA_COMPRA"];
            document.getElementById("spn_cajero").innerText = data["CAJERO"];

            // Productos - detalles de la compra: 
            for (var ind_prod = 0; ind_prod < data['PRODUCTOS'].length; ind_prod++) {
                dynamic_details += `<tr>
                                        <td class="description">${data['PRODUCTOS'][ind_prod]['PRODUCTO']}</td>
                                        <td class="quantity">${data['PRODUCTOS'][ind_prod]['CANTIDAD']}</td>
                                        <td class="price">${formatter.format(data['PRODUCTOS'][ind_prod]['PRECIO_UNIDAD'])}</td>
                                        <td class="subtotal">${formatter.format(data['PRODUCTOS'][ind_prod]['COSTO'])}</td>
                                    </tr>`;
            }

            // Armar la tabla en HTML y agregarla en la pantalla: 
            table_body = `<table class="details-detail">
                            <thead>
                                <tr>
                                    <td class="dotted-border" colspan="4"></td>
                                </tr>
                                <tr>
                                    <td class="empty-border" colspan="4"></td>
                                </tr>
                                <tr>
                                    <th class="description">Producto</th>
                                    <th class="quantity">Cant.</th>
                                    <th class="price">Precio</th>
                                    <th class="subtotal">Total</th>
                                </tr>
                                ${dynamic_details}
                                <tr>
                                    <td class="dotted-border" colspan="4"></td>
                                </tr>
                                <tr>
                                    <td class="empty-border" colspan="4"></td>
                                </tr>
                            </thead>
                            <tbody id="receipt-details"></tbody>
                        </table>`;

            document.getElementById("product_table").innerHTML = table_body;

            // Detalles finales de la factura: 
            document.getElementById("div_subtotal").innerText = formatter.format(data["TOTAL_TICKET"]);
        } else {
            mostrar_mensaje(data.message);
            return;
        }

    } catch (ex) {
        console.log("No se pudo cargar la factura seleccionada.");
        console.log(ex);
    }
}

/**
 * Cerrar la ventana modal "documento" actual.
 * Source: https://stackoverflow.com/a/54787080/4092887
 */
function cerrar_ventana() {
    try {
        window.open('', '_self').close();
    } catch (ex) {
        console.log(ex);
    }
}