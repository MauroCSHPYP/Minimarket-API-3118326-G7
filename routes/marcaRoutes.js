const express = require('express');
const ruta = express.Router();

// 14/01/2026: Marca.
// COMPLETADO
module.exports = function (conexion) {
    // Obtener todas las marcas:
    ruta.get('/marcas', (req, res) => {
        const sql = 'SELECT * from marca';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener las marcas"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron marcas"
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar marca: 
    ruta.post('/marcas', (req, res) => {
        let datos = {
            NOMBRE_MARCA: req.body.NOMBRE_MARCA
        }
        const insert_sql = 'INSERT INTO marca SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM marca WHERE UPPER(TRIM(nombre_marca)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.NOMBRE_MARCA], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de marca`;
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
                            msg = "Error al insertar la marca"
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Marca creada con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_MARCA: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe una marca con este nombre (" + [datos.NOMBRE_MARCA] + "). Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar marca por ID: 
    ruta.get('/marcas/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from marca WHERE ID_MARCA = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                msg = `Error al obtener la marca por el ID ${ID} especificado`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró marca con ID # (${ID})`
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar una marca por ID: 
    ruta.put('/marcas/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            NOMBRE_MARCA
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE marca SET NOMBRE_MARCA = ? WHERE ID_MARCA = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            NOMBRE_MARCA,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM marca WHERE UPPER(TRIM(nombre_marca)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados: 
        conexion.query(check_sql, datos[0], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de marca`;
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

                //console.log("CONTEO!: " + es_duplicado + " - NOMBRE: " + datos);
                //console.log("CONTEO!: " + es_duplicado + " - NOMBRE: (" + datos[0] + ")");

                if (es_duplicado == 0) {
                    conexion.query(update_sql, datos, function (error, resultado) {

                        if (error) {
                            msg = `Error al actualizar marca con ID (${ID_ITEM}). `;
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
                            msg = `No se encontró una marca con ID (${ID_ITEM}) para actualizar.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            // Éxito 200: La marca fue encontrada y actualizada.
                            msg = `Marca con ID ${ID_ITEM} actualizada correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe una marca con este nombre. Debe elegir otro nombre de marca. Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar marca por ID: 
    ruta.delete('/marcas/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM marca WHERE ID_MARCA = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                msg = `Error al eliminar marca con ID # ${ID}:`;
                console.error(msg, error);
                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                // Si no se afectó ninguna fila, el producto no existe.
                msg = `No se encontró la marca con ID ${ID} para eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }/* else {
                // Éxito 204: Eliminación exitosa. El código 204 (No Content)
                // es el estándar para operaciones DELETE exitosas que no devuelven cuerpo.
                res.status(204).send(); // No se envía contenido en el cuerpo
            }*/

            msg = "Marca eliminada correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}