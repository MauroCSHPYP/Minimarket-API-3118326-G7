const express = require('express');
const ruta = express.Router();

// 31/07/2026: Reportes.
// COMPLETADO
module.exports = function (conexion) {

    // Reporte de productos vendidos (en el rango de fecha seleccionado): 
    ruta.get('/reportes/:FECH_INI/:FECH_FIN', (req, res) => {

        const fecha_ini = req.params.FECH_INI;
        const fecha_fin = req.params.FECH_FIN;
        const sql = 'SELECT P.NOMBRE_PRODUCTO, SUM(DT.CANTIDAD) AS CANTIDAD FROM ticket AS T JOIN detalle_ticket AS DT ON T.ID_TICKET = DT.ID_TICKET JOIN producto AS P ON DT.ID_ITEM = P.ID_PRODUCTO WHERE DATE(T.FECHA_COMPRA) BETWEEN DATE(?) AND IFNULL(?, T.FECHA_COMPRA) GROUP BY P.NOMBRE_PRODUCTO;';
        var msg = "";

        conexion.query(sql, [fecha_ini, fecha_fin], (error, filas) => {
            if (error) {
                msg = "Error al obtener el reporte."
                console.log(msg, error)

                res.status(500).send({
                    mensaje: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron resultados"
                res.status(400).send({
                    mensaje: msg
                });
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    return ruta;
}