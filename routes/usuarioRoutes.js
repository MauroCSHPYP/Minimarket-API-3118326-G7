const express = require('express');
const ruta = express.Router();

// 20/01/2026: Usuarios.
// COMPLETADO
module.exports = function (conexion) {
    // Obtener todos los usuarios:
    ruta.get('/usuarios', (req, res) => {
        const sql = 'SELECT * from usuario';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los usuarios"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron usuarios"
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar usuario: 
    ruta.post('/usuarios', (req, res) => {
        let datos = {
            NOMBRE: req.body.NOMBRE,
            APELLIDOS: req.body.APELLIDOS,
            FECHA_NACIMIENTO: req.body.FECHA_NACIMIENTO,
            ID_TIPO_DOCUMENTO: req.body.ID_TIPO_DOCUMENTO,
            ID_ROL: req.body.ID_ROL,
            NUMERO_IDENTIFICACION: req.body.NUMERO_IDENTIFICACION,
            ALIAS: req.body.ALIAS,
            CONTRASENA: req.body.CONTRASENA
        }
        const insert_sql = 'INSERT INTO usuario SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM usuario WHERE UPPER(TRIM(NUMERO_IDENTIFICACION)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.NUMERO_IDENTIFICACION], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de usuario`;
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
                            msg = "Error al insertar el usuario"
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Usuario creado con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_USUARIO: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un usuario registrado con esta información. Contacte al administrador.";
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar usuario por número de identificación: 
    ruta.get('/usuarios/:NUM_IDENT', (req, res) => {

        const NUM_IDENT = req.params.NUM_IDENT;
        const sql = 'SELECT * from usuario WHERE NUMERO_IDENTIFICACION = ?';
        var msg = "";

        conexion.query(sql, [NUM_IDENT], (error, fila) => {
            if (error) {
                msg = `Error al obtener el usuario por el # de identificación (${NUM_IDENT}) especificado.`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                msg = `No se encontró usuario con # de identificación (${NUM_IDENT}) especificado.`
                res.status(400).send({
                    message: msg
                })
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un usuario por ID: 
    ruta.put('/usuarios/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            NOMBRE,
            APELLIDOS,
            FECHA_NACIMIENTO,
            ID_TIPO_DOCUMENTO,
            ID_ROL,
            NUMERO_IDENTIFICACION,
            ALIAS,
            CONTRASENA
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE usuario SET NOMBRE = IFNULL(?, NOMBRE), APELLIDOS = IFNULL(?, APELLIDOS), FECHA_NACIMIENTO = IFNULL(?, FECHA_NACIMIENTO), ID_TIPO_DOCUMENTO = IFNULL(?, ID_TIPO_DOCUMENTO), ID_ROL = IFNULL(?, ID_ROL), NUMERO_IDENTIFICACION = IFNULL(?, NUMERO_IDENTIFICACION), ALIAS = IFNULL(?, ALIAS), CONTRASENA = IFNULL(?, CONTRASENA) WHERE ID_USUARIO = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            NOMBRE,
            APELLIDOS,
            FECHA_NACIMIENTO,
            ID_TIPO_DOCUMENTO,
            ID_ROL,
            NUMERO_IDENTIFICACION,
            ALIAS,
            CONTRASENA,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM usuario WHERE UPPER(TRIM(NUMERO_IDENTIFICACION)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados: 
        //console.log(datos);
        conexion.query(check_sql, datos[5], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de usuario`;
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
                            //msg = `Error al actualizar usuario con ID # (${ID_ITEM}). `;
                            msg = `Error al actualizar el usuario. `;
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
                            //msg = `No se encontró un usuario con ID # (${ID_ITEM}) para actualizar.`;
                            msg = `No se encontró un usuario para actualizar.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            //msg = `Usuario con ID ${ID_ITEM} actualizado correctamente.`
                            msg = `Usuario actualizado correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un usuario con este número de identificación. Contacte con el administrador.";
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar usuario por ID: 
    ruta.delete('/usuarios/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM usuario WHERE ID_USUARIO = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                //msg = `Error al eliminar usuario con ID # ${ID}:`;
                msg = `Error al eliminar el usuario:`;
                console.error(msg, error);
                res.status(500).send({
                    mensaje: msg,
                    detalleError: error.code
                });
                return;
            }
            // Validación de Eliminación
            if (resultado.affectedRows === 0) {
                // Si no se afectó ninguna fila, el usuario no existe.
                //msg = `No se encontró el usuario con ID ${ID} para eliminar.`;
                msg = `No se encontró el usuario para eliminar.`;
                return res.status(404).json({
                    mensaje: msg,
                    detalleError: error.code
                });
            }

            msg = "Usuario eliminado correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    // Login - iniciar sesión: 
    ruta.post('/usuarios/login', (req, res) => {

        const { alias, pass } = req.body;

        if (!alias || !pass) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos.'
            });
        }

        const sql = "SELECT NOMBRE, APELLIDOS, ID_ROL, NUMERO_IDENTIFICACION, ALIAS, CONTRASENA FROM usuario WHERE ALIAS = ?";
        var msg = "";

        conexion.query(sql, [alias], (error, results) => {
            if (error) {
                msg = `Error al validar el usuario.`;
                console.log(msg, error);

                return res.status(500).send({
                    success: false,
                    message: msg
                });
            }

            if (results.length == 0) {
                msg = `No se encontró un usuario registrado.`;
                return res.status(401).send({
                    success: false,
                    message: msg
                });
            }

            const user_found = results[0];

            if (user_found.CONTRASENA != pass) {
                msg = `Contraseña incorrecta. Verifique.`;
                return res.status(401).send({
                    success: false,
                    message: msg
                });
            }

            delete user_found.CONTRASENA;

            msg = `Inicio de sesión existoso.`;
            res.status(200).json({
                success: true,
                message: msg,
                user: user_found
            });
        })
    });

    return ruta;
}