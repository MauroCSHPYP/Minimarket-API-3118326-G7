const express = require('express');
const ruta = express.Router();

// 20/01/2026: Tipo documento.
// COMPLETADO
module.exports = function (conexion) {
    // Obtener todos los tipos de documento:
    ruta.get('/tiposDocumentos', (req, res) => {
        const sql = 'SELECT * from tipo_documento';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los tipos de documento"
                console.log(msg, error)

                res.status(500).send({
                    mensaje: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron tipos de documento"
                res.status(400).send({
                    mensaje: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar tipo de documento: 
    ruta.post('/tiposDocumentos', (req, res) => {
        let datos = {
            NOMBRE_DOCUMENTO: req.body.NOMBRE_DOCUMENTO
        }
        const insert_sql = 'INSERT INTO tipo_documento SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM tipo_documento WHERE UPPER(TRIM(nombre_documento)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, datos.NOMBRE_DOCUMENTO, (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de tipo de documento.`;
                console.log(msg, error);
                es_duplicado = -1;

                res.status(500).send({
                    mensaje: msg,
                    error: error.code
                });
                return;
            }
            else {
                es_duplicado = fila[0].CONTEO;

                if (es_duplicado == 0) {
                    conexion.query(insert_sql, datos, function (error, resultado) {
                        if (error) {
                            msg = "Error al insertar el tipo de documento."
                            console.log(msg, error)

                            res.status(500).send({
                                mensaje: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Tipo de documento creado con éxito"
                            res.status(201).send({
                                mensaje: msg,
                                ID_TIPO_DOCUMENTO: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un tipo de documento con este nombre (" + datos.NOMBRE_DOCUMENTO + ")."; // Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        mensaje: msg
                    });
                }
            }
        })
    });

    // Buscar tipo de documento por ID: 
    ruta.get('/tiposDocumentos/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from tipo_documento WHERE ID_TIPO_DOCUMENTO = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                msg = `Error al obtener el tipo de documento especificado`
                console.log(msg, error)

                res.status(500).send({
                    mensaje: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró el tipo de documento`
                res.status(400).send({
                    mensaje: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un tipo de documento por ID: 
    ruta.put('/tiposDocumentos/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            NOMBRE_DOCUMENTO
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE tipo_documento SET NOMBRE_DOCUMENTO = IFNULL(?, NOMBRE_DOCUMENTO) WHERE ID_TIPO_DOCUMENTO = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            NOMBRE_DOCUMENTO,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM tipo_documento WHERE UPPER(TRIM(nombre_documento)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados:
        conexion.query(check_sql, datos[0], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de tipo de documento`;
                console.log(msg, error);
                es_duplicado = -1;

                res.status(500).send({
                    mensaje: msg,
                    error: error.code
                });
                return;
            }
            else {
                es_duplicado = fila[0].CONTEO;
                //console.log(fila);

                if (es_duplicado == 0) {
                    conexion.query(update_sql, datos, function (error, resultado) {

                        if (error) {
                            msg = `Error al actualizar tipo de documento seleccionado. `;
                            console.error(msg, error);
                            res.status(500).send({
                                mensaje: msg,
                                detalleError: error.code
                            });
                            return;
                        }

                        // 2. Validación de Actualización: 
                        if (resultado.affectedRows === 0) {
                            msg = `No se encontró un tipo de documento para actualizar.`;
                            res.status(404).send({
                                mensaje: msg
                            });
                        } else {
                            msg = `Tipo de documento actualizado correctamente.`
                            res.status(200).send({
                                mensaje: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un tipo de documento con este nombre. Debe elegir otro nombre de tipo de documento."; // Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        mensaje: msg
                    });
                }
            }
        })
    });

    // Eliminar tipo de documento por ID: 
    ruta.delete('/tiposDocumentos/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM tipo_documento WHERE ID_TIPO_DOCUMENTO = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                msg = `Error al eliminar tipo de documento:`;
                console.error(msg, error);
                res.status(500).send({
                    mensaje: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                msg = `No se encontró tipo de documento para eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }

            msg = "Tipo de documento eliminado correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}