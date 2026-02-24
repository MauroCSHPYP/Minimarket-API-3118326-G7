const express = require('express');
const ruta = express.Router();

// 16/01/2026: Rol.
// COMPLETADO
module.exports = function (conexion) {
    // Obtener todos los roles:
    ruta.get('/roles', (req, res) => {
        const sql = 'SELECT * from rol';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los roles"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron roles"
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar rol: 
    ruta.post('/roles', (req, res) => {
        let datos = {
            NOMBRE_ROL: req.body.NOMBRE_ROL,
            DESCRIPCION_ROL: req.body.DESCRIPCION_ROL
        }
        const insert_sql = 'INSERT INTO rol SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM rol WHERE UPPER(TRIM(nombre_rol)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.NOMBRE_ROL], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de rol.`;
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
                            msg = "Error al insertar el rol."
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Rol creado con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_ROL: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un rol con este nombre (" + [datos.NOMBRE_ROL] + "). Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar rol por ID: 
    ruta.get('/roles/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from rol WHERE id_rol = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                msg = `Error al obtener el rol por el ID ${ID} especificado`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró un rol con ID # (${ID})`
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un rol por ID: 
    ruta.put('/roles/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            NOMBRE_ROL,
            DESCRIPCION_ROL
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE rol SET NOMBRE_ROL = IFNULL(?, NOMBRE_ROL), DESCRIPCION_ROL = IFNULL(?, DESCRIPCION_ROL) WHERE id_rol = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            NOMBRE_ROL,
            DESCRIPCION_ROL,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM rol WHERE UPPER(TRIM(nombre_rol)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados:
        //console.log("=> NOMBRE_ROL # 2: (" + datos[0] + ")");
        conexion.query(check_sql, datos[0], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de rol`;
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
                console.log(fila);

                if (es_duplicado == 0) {
                    conexion.query(update_sql, datos, function (error, resultado) {

                        if (error) {
                            msg = `Error al actualizar rol con ID (${ID_ITEM}). `;
                            console.error(msg, error);
                            res.status(500).send({
                                message: msg,
                                detalleError: error.code
                            });
                            return;
                        }

                        // 2. Validación de Actualización: 
                        if (resultado.affectedRows === 0) {
                            msg = `No se encontró un rol con ID (${ID_ITEM}) para actualizar.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            msg = `Rol con ID ${ID_ITEM} actualizado correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un rol con este nombre. Debe elegir otro nombre de rol. Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar rol por ID: 
    ruta.delete('/roles/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM rol WHERE ID_ROL = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                msg = `Error al eliminar rol con ID # ${ID}:`;
                console.error(msg, error);
                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                msg = `No se encontró rol con ID ${ID} para eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }

            msg = "Rol eliminado correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}