const express = require('express');
const ruta = express.Router();

// 23/02/2026: Ticket (detalle_ticket e inventario).
module.exports = function (conexion) {
    /**
     * 
     * Crear ticket y detalles de la venta: 
     * 
     * TO-DO:
     * - Validar que la cantidad comprada no supere al inventario.
     * - El "NO_TICKET" no debería estar repetido, pero, se debe generar un mejor código para evitar duplicados.
     * 
     * NOTAS:
     * - Aquí no es lógico tener que validar que el producto exista en el inventario, pero, se deja la notación para futuros casos.
     */
    ruta.post('/tickets', async (req, res) => {

        // Variables locales: 
        let total_ticket = 0;
        let id_ticket_creado = 0; // ID_TICKET de la tabla "TICKET".
        var temp_date = new Date();
        var no_ticket_sample = 1;

        // Generar NO_TICKET: 
        try {
            no_ticket_sample = temp_date.getTime() - (Math.floor(Math.random() * 10));
        } catch { no_ticket_sample = 1; }

        // Valores declarados en el body de la petición: 
        const { T_ID_USUARIO, T_DETALLES } = req.body;

        // Validaciones iniciales: 
        if (!T_ID_USUARIO || !T_DETALLES || T_DETALLES.length <= 0) {
            return res.status(400).send({
                message: "Complete la información del ticket. Verifique."
            });
        }

        // Recorrer detalles de la venta: 
        for (const item of T_DETALLES) {
            if (item.ID_ITEM <= 0 || item.PRECIO <= 0 || item.CANTIDAD <= 0) {
                return res.status(400).send({
                    message: "Detalles de la venta incorrectos. Verifique."
                });
            }

            // Calcular total del ticket = el precio ya viene calculado. 
            total_ticket += item.PRECIO;
        }

        // Uso de la variable global de conexión - se usará en las transacciones a continuación: 
        let connection = conexion;

        // Uso de "promises" para la ejecución de las consultas en la transacción: 
        const queryPromise = (sql, values) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, values, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
        };

        // Inicio del bloque de la transacción: 
        try {
            await queryPromise('START TRANSACTION');

            // Valores a registrar en "TICKET": 
            const ticketData = {
                ID_USUARIO: T_ID_USUARIO,
                NO_TICKET: no_ticket_sample,
                FECHA_COMPRA: new Date(),
                TOTAL: total_ticket
            };

            const insertTicket_sql = 'INSERT INTO TICKET SET ?';
            const ticketResult = await queryPromise(insertTicket_sql, ticketData);

            // Se obtiene el ID_TICKET para su uso en "DETALLE_TICKET": 
            id_ticket_creado = ticketResult.insertId;

            // Insertar registros en "DETALLE_TICKET" por cada producto seleccionado: 
            for (const producto of T_DETALLES) {
                const detalleTicketData = {
                    ID_TICKET: id_ticket_creado,
                    ID_ITEM: producto.ID_ITEM,
                    CANTIDAD: producto.CANTIDAD
                };

                const insertDetalleTicket_sql = 'INSERT INTO DETALLE_TICKET SET ?';
                await queryPromise(insertDetalleTicket_sql, detalleTicketData);

                // Actualizar inventario: 
                const updateInventario_sql = "UPDATE INVENTARIO SET CANTIDAD = CANTIDAD - ? WHERE ID_PRODUCTO = ?";
                const inventarioResult = await queryPromise(updateInventario_sql, [producto.CANTIDAD, producto.ID_ITEM]);

                // Validación: 
                if (inventarioResult.affectedRows == 0) {
                    throw new Error(`Producto # ${producto.id_item} no encontrado en el inventario.`);
                }
            }

            // Enviar transacción a la base de datos: 
            await queryPromise("COMMIT");

            // Retornar mensaje exitoso: 
            res.status(201).send({
                message: `Ticket # ${no_ticket_sample} facturado.`,
                id_ticket_generado: id_ticket_creado,
                total_pago_ticket: total_ticket
            });

        } catch (error) {
            // Rollback a la transacción en curso: 
            console.error("ROLLBACK ejecutado por excepción no controlada");
            console.log(error.message);
            //console.log(error.stack);

            try {
                await queryPromise("ROLLBACK");
            } catch (rollbackError) {
                console.error("Error al revertir la transacción: ", rollbackError);
            }

            res.status(500).send({
                message: "Hubo un error inesperado al procesar el ticket.",
                errorDetails: error.message
            });
        }
        // Fin del bloque de la transacción.
    });

    // Buscar ticket por ID: 
    ruta.get('/tickets/:ID', (req, res) => {

        var msg = "";
        const ID = req.params.ID;
        const sql = `SELECT T.ID_TICKET, T.NO_TICKET, U.ALIAS AS CAJERO, T.FECHA_COMPRA, P.NOMBRE_PRODUCTO, P.VALOR, DT.CANTIDAD, (P.VALOR * DT.CANTIDAD) AS TOTAL, T.TOTAL AS TOTAL_TICKET
FROM ticket AS T JOIN usuario AS U 
ON T.ID_USUARIO = U.ID_USUARIO 
JOIN detalle_ticket DT ON T.ID_TICKET = DT.ID_TICKET 
JOIN producto AS P ON DT.ID_ITEM = P.ID_PRODUCTO
WHERE T.ID_TICKET = ?`;
        var msg = "";

        conexion.query(sql, [ID], (error, filas) => {
            if (error) {
                //msg = `Error al obtener el detalle del ticket con ID # (${ID})`
                msg = `Error al obtener el detalle del ticket`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                //msg = `No se encontró un ticket con ID # (${ID})`
                msg = `No se encontró un ticket con la información seleccionada`
                res.status(404).send({
                    message: msg
                })
            }

            // Estructurar la respuesta: 
            const ticketDetails = {
                ID_TICKET: filas[0].ID_TICKET,
                NO_TICKET: filas[0].NO_TICKET,
                CAJERO: filas[0].CAJERO,
                FECHA_COMPRA: filas[0].FECHA_COMPRA,
                PRODUCTOS: [],
                TOTAL_TICKET: filas[0].TOTAL_TICKET
            };

            // Extraer los detalles del ticket: 
            filas.forEach(fila => {
                ticketDetails.PRODUCTOS.push({
                    PRODUCTO: fila.NOMBRE_PRODUCTO,
                    CANTIDAD: fila.CANTIDAD,
                    PRECIO_UNIDAD: fila.VALOR,
                    COSTO: fila.TOTAL
                });
            });

            // Retornar respuesta estructurada: 
            res.status(200).send(ticketDetails);
        });
    });


    return ruta;
}