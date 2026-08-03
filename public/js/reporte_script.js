document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('frmReportes');

    /**
     * Evento OnClick del botón.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var msg = "";
        var fecha_ini = document.getElementById('datepicker_ini').value.trim();
        fecha_ini = $("#datepicker_ini").datepicker("getDate").toISOString();

        var fecha_fin = document.getElementById('datepicker_fin').value.trim();
        if (fecha_fin) {
            fecha_fin = $("#datepicker_fin").datepicker("getDate").toISOString();
        }

        if (!fecha_ini) {
            msg = "La fecha de inicio es requerida" + text_break_line;
        }
        if (fecha_fin.trim() != "" && (fecha_fin < fecha_ini)) {
            msg += "La fecha fin no puede ser menor a la fecha de inicio." + text_break_line;
        }
        if (document.getElementById('ddl_reportes').value == "0") {
            msg += "Debe seleccionar el tipo de reporte a generar." + text_break_line;
        }

        if (msg.trim() != "") {
            mostrar_mensaje("Se han detectado los siguientes errores: " + text_break_line + msg);
            return;
        }

        try {

            var tipo_reporte_seleccionado = document.getElementById('ddl_reportes').value;

            switch (tipo_reporte_seleccionado) {
                case "rpt_productos_vendidos":
                    generate_rpt_productos_vendidos();
                    break;
                default:
                    break;
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
        document.getElementById('ddl_reportes').value = "0";
        document.getElementById('datepicker_ini').value = empty;
        document.getElementById('datepicker_fin').value = empty;
        document.getElementById('piechart').innerHTML = "";
    } catch (error) {
        console.log("Error al limpiar los campos del formulario.");
    }
}

/**
 * Cargar el reporte de productos vendidos - según los parámetros suministrados.
 * @returns async
 */
async function generate_rpt_productos_vendidos() {
    try {

        // Variables: 
        document.getElementById('piechart').innerHTML = "";
        var fecha_ini = document.getElementById('datepicker_ini').value.trim();
        var fecha_fin = document.getElementById('datepicker_fin').value.trim();
        if (!fecha_fin) {
            fecha_fin = fecha_ini;
        }

        const API_URL_R_REPORTS = URL_BASE_APP + "reportes/" + get_date_for_parameter(fecha_ini) + "/" + get_date_for_parameter(fecha_fin);

        const response = await fetch(API_URL_R_REPORTS, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok && !data.mensaje) {
            //localStorage.setItem("resultados_reporte", JSON.stringify(data));
            google.charts.load('current', { packages: ['corechart'] });
            //google.charts.setOnLoadCallback(drawChart);
            google.charts.setOnLoadCallback(function () { drawChart(data); });

        } else {
            mostrar_mensaje(data.mensaje);
            return;
        }

    } catch (ex) {
        var msg = "No se pudo cargar los resultados del reporte.";
        mostrar_mensaje(msg);
        console.log(msg);
        console.log(ex);
    }
}

/**
 * Dibujar el Pie Chart/gráfico - usando Google Visualization API.
 * TO-DO: Mirar cómo hacer más grande el resultado de la gráfica generada.
 * @param {Array} report_data Data a mostrar en el reporte.
 */
function drawChart(report_data) {

    var arr_results = [];
    arr_results.push(['NOMBRE_PRODUCTO', 'CANTIDAD']);
    for (var ind_data = 0; ind_data < report_data.length; ind_data++) {
        arr_results.push([report_data[ind_data]['NOMBRE_PRODUCTO'], parseInt(report_data[ind_data]['CANTIDAD'])]);
    }

    var data = google.visualization.arrayToDataTable(arr_results);

    var options = {
        title: 'Reporte de productos vendidos',
        is3D: true,
        pieSliceText: 'none'
    };

    if (data.getNumberOfRows() == 0) {
        $('#piechart').append('No hay resultados');
    } else {
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
    }
}

/**
 * Obtener la fecha en formato (yyyy-MM-dd) para ser utilizada en el llamado de los endpoints de reportes.
 * @param {Date} dt Fecha seleccionada.
 * @returns yyyy-MM-dd
 */
function get_date_for_parameter(dt) {
    var formatted_dt = "";
    dt = dt.split("/");

    formatted_dt = dt[2] + "-" + dt[1] + "-" + dt[0];

    return formatted_dt;
}