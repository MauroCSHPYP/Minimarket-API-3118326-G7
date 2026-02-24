const express = require('express');
const ruta = express.Router();

// 16/01/2026: Tipo de unidad.
// COMPLETADO
module.exports = function (conexion) {
    // Obtener todos los tipos de unidad:
    ruta.get('/tiposunidades', (req, res) => {
        const sql = 'SELECT * from tipo_unidad';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los tipos de unidad"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron tipos de unidad"
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar tipo de unidad: 
    ruta.post('/tiposunidades', (req, res) => {
        let datos = {
            NOMBRE_UNIDAD: req.body.NOMBRE_UNIDAD
        }
        const insert_sql = 'INSERT INTO tipo_unidad SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM tipo_unidad WHERE UPPER(TRIM(nombre_unidad)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.NOMBRE_UNIDAD], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de tipo de unidad`;
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
                            msg = "Error al insertar el tipo de unidad"
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Tipo de unidad creada con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_TIPO_UNIDAD: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un tipo de unidad con este nombre (" + [datos.NOMBRE_UNIDAD] + "). Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar tipo de unidad por ID: 
    ruta.get('/tiposunidades/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from tipo_unidad WHERE ID_TIPO_UNIDAD = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                msg = `Error al obtener el tipo de unidad por el ID ${ID} especificado`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró tipo de unidad con ID # (${ID})`
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un tipo de unidad por ID: 
    ruta.put('/tiposunidades/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            NOMBRE_UNIDAD
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE tipo_unidad SET NOMBRE_UNIDAD = ? WHERE ID_TIPO_UNIDAD = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            NOMBRE_UNIDAD,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM tipo_unidad WHERE UPPER(TRIM(nombre_unidad)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados: 
        conexion.query(check_sql, datos, (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de tipo de unidad`;
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
                            msg = `Error al actualizar el tipo unidad con ID (${ID_ITEM}). `;
                            console.error(msg, error);
                            res.status(500).send({
                                message: msg,
                                detalleError: error.code
                            });
                            return;
                        }

                        // 2. Validación de Actualización: 
                        if (resultado.affectedRows === 0) {
                            // Error 404: Si la consulta no afectó ninguna fila, el ID no existe.
                            msg = `No se encontró un tipo de unidad con ID (${ID_ITEM}) para actualizar.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            msg = `Tipo de unidad con ID ${ID_ITEM} actualizada correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un tipo de unidad con este nombre. Debe elegir otro nombre de tipo de unidad. Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar tipo de unidad por ID: 
    ruta.delete('/tiposunidades/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM tipo_unidad WHERE ID_TIPO_UNIDAD = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                msg = `Error al eliminar tipo de unidad con ID # ${ID}:`;
                console.error(msg, error);
                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                msg = `No se encontró el tipo de unidad con ID ${ID} para eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }

            msg = "Tipo de unidad eliminada correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}