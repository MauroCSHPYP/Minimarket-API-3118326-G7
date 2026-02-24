const express = require('express');
const ruta = express.Router();

// 16/01/2026: Tipo de producto.
// COMPLETADO
module.exports = function (conexion) {
    // Obtener todos los tipos de producto:
    ruta.get('/tiposproductos', (req, res) => {
        const sql = 'SELECT * from tipo_producto';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los tipos de producto"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron tipos de producto"
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar tipo de producto: 
    ruta.post('/tiposproductos', (req, res) => {
        let datos = {
            NOMBRE_TIPO_PRODUCTO: req.body.NOMBRE_TIPO_PRODUCTO,
            DESCRIPCION_TIPO_PRODUCTO: req.body.DESCRIPCION_TIPO_PRODUCTO,
            ID_TIPO_UNIDAD: req.body.ID_TIPO_UNIDAD
        }
        const insert_sql = 'INSERT INTO tipo_producto SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM tipo_producto WHERE UPPER(TRIM(nombre_tipo_producto)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.NOMBRE_TIPO_PRODUCTO], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de tipo de producto`;
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
                            msg = "Error al insertar el tipo de producto"
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Tipo de producto creado con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_TIPO_PRODUCTO: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un tipo de producto con este nombre (" + [datos.NOMBRE_TIPO_PRODUCTO] + "). Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar tipo de producto por ID: 
    ruta.get('/tiposproductos/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from tipo_producto WHERE ID_TIPO_PRODUCTO = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                msg = `Error al obtener el tipo de producto por el ID ${ID} especificado`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró tipo de producto con ID # (${ID})`
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un tipo de producto por ID: 
    ruta.put('/tiposproductos/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            NOMBRE_TIPO_PRODUCTO,
            DESCRIPCION_TIPO_PRODUCTO,
            ID_TIPO_UNIDAD
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE tipo_producto SET NOMBRE_TIPO_PRODUCTO = IFNULL(?, NOMBRE_TIPO_PRODUCTO), DESCRIPCION_TIPO_PRODUCTO = IFNULL(?, DESCRIPCION_TIPO_PRODUCTO), ID_TIPO_UNIDAD = IFNULL(?, ID_TIPO_UNIDAD) WHERE ID_TIPO_PRODUCTO = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            NOMBRE_TIPO_PRODUCTO,
            DESCRIPCION_TIPO_PRODUCTO,
            ID_TIPO_UNIDAD,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM tipo_producto WHERE UPPER(TRIM(nombre_tipo_producto)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados: 
        conexion.query(check_sql, datos, (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de tipo de producto`;
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
                            msg = `Error al actualizar el tipo de producto con ID (${ID_ITEM}). `;
                            console.error(msg, error);
                            res.status(500).send({
                                message: msg,
                                detalleError: error.code
                            });
                            return;
                        }

                        // 2. Validación de Actualización: 
                        if (resultado.affectedRows === 0) {
                            msg = `No se encontró un tipo de producto con ID (${ID_ITEM}) para actualizar.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            msg = `Tipo de producto con ID ${ID_ITEM} actualizado correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un tipo de producto con este nombre. Debe elegir otro nombre de tipo de producto. Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar tipo de producto por ID: 
    ruta.delete('/tiposproductos/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM tipo_producto WHERE ID_TIPO_PRODUCTO = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                msg = `Error al eliminar tipo de producto con ID # ${ID}:`;
                console.error(msg, error);
                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                msg = `No se encontró el tipo de producto con ID ${ID} para eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }

            msg = "Tipo de producto eliminado correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}