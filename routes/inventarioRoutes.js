const express = require('express');
const ruta = express.Router();

// 14/01/2026: Inventario.
// TO-DO: Crear y probar requests.
module.exports = function (conexion) {
    // Obtener todos los inventarios:
    ruta.get('/inventarios', (req, res) => {
        const sql = 'SELECT * from inventario';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los inventarios"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron inventarios"
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar inventario: 
    ruta.post('/inventarios', (req, res) => {
        let datos = {
            ID_PRODUCTO: req.body.ID_PRODUCTO,
            CANTIDAD: req.body.CANTIDAD
        }
        const insert_sql = 'INSERT INTO inventario SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM inventario WHERE id_producto = ?';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.ID_PRODUCTO], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de inventario para el producto especificado.`;
                console.log(msg, error);
                es_duplicado = -1;

                res.status(500).send({
                    message: msg,
                    error: error.code
                });
                return;
            }
            else {
                es_duplicado = fila[0].CONTEO;

                if (es_duplicado == 0) {
                    conexion.query(insert_sql, datos, function (error, resultado) {
                        if (error) {
                            msg = "Error al insertar el inventario para el producto especificado."
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Inventario creado con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_INVENTARIO: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un inventario para el producto especificado. Cantidad: " + es_duplicado + ". Actualice la cantidad del producto.";
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar inventario por ID: 
    ruta.get('/inventarios/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from inventario WHERE id_inventario = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                msg = `Error al obtener el inventario por el ID ${ID} especificado`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró un inventario con ID # (${ID})`
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un inventario por ID: 
    ruta.put('/inventarios/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            ID_PRODUCTO,
            CANTIDAD
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE inventario SET ID_PRODUCTO = IFNULL(?, ID_PRODUCTO), CANTIDAD = IFNULL(?, CANTIDAD) WHERE ID_INVENTARIO = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            ID_PRODUCTO,
            CANTIDAD,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM inventario WHERE id_producto = ? AND CANTIDAD = ?';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados: 
        conexion.query(check_sql, datos, (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de inventario`;
                console.log(msg, error);
                es_duplicado = -1;

                res.status(500).send({
                    message: msg,
                    error: error.code
                });
                return;
            }
            else {
                es_duplicado = fila[0].CONTEO;

                if (es_duplicado == 0) {
                    conexion.query(update_sql, datos, function (error, resultado) {

                        if (error) {
                            msg = `Error al actualizar inventario con ID (${ID_ITEM}). `;
                            console.error(msg, error);
                            res.status(500).send({
                                message: msg,
                                detalleError: error.code
                            });
                            return;
                        }

                        // 2. Validación de Actualización: 
                        if (resultado.affectedRows === 0) {
                            msg = `No se encontró un inventario con ID (${ID_ITEM}) para actualizar.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            //msg = `Inventario con ID ${ID_ITEM} actualizado correctamente.`
                            msg = `Inventario actualizado correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un inventario para el producto especificado. Solo puede haber (1) inventario por producto. Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar inventario por ID: 
    ruta.delete('/inventarios/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM inventario WHERE ID_INVENTARIO = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                msg = `Error al eliminar inventario con ID # ${ID}:`;
                console.error(msg, error);
                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                msg = `No se encontró inventario con ID ${ID} para eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }

            msg = "Inventario eliminado correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}