const express = require('express');
const ruta = express.Router();

// 16/01/2026: Productos.
// TO-DO: Crear y probar requests.
// 20/01/2026: Los endpoints creados han sido testeados y son funcionales.
// Agregar más endopints: (cargar productos "con relación de tablas", etc.)
module.exports = function (conexion) {
    // Obtener todos los productos:
    ruta.get('/productos', (req, res) => {
        const sql = 'SELECT * from producto';
        var msg = "";

        conexion.query(sql, (error, filas) => {
            if (error) {
                msg = "Error al obtener los productos"
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (filas.length === 0) {
                msg = "No se encontraron productos"
                res.status(400).send({
                    message: msg
                });
            }
            else {
                res.status(200).send(filas);
            }
        })
    });

    // Insertar producto: 
    ruta.post('/productos', (req, res) => {
        let datos = {
            ID_TIPO_PRODUCTO: req.body.ID_TIPO_PRODUCTO,
            ID_MARCA: req.body.ID_MARCA,
            NOMBRE_PRODUCTO: req.body.NOMBRE_PRODUCTO,
            DESCRIPCION_PRODUCTO: req.body.DESCRIPCION_PRODUCTO,
            VALOR: req.body.VALOR
        }
        const insert_sql = 'INSERT INTO producto SET ?';
        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM producto WHERE UPPER(TRIM(nombre_producto)) = UPPER(TRIM(?))';
        var msg = "";
        var es_duplicado = 0;

        // Validación de duplicados: 
        conexion.query(check_sql, [datos.NOMBRE_PRODUCTO], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de producto`;
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
                            msg = "Error al insertar el producto"
                            console.log(msg, error)

                            res.status(500).send({
                                message: msg,
                                error: error.code
                            });
                        } else {
                            msg = "Producto creado con éxito"
                            res.status(201).send({
                                message: msg,
                                ID_PRODUCTO: resultado.insertId
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un producto con este nombre (" + [datos.NOMBRE_PRODUCTO] + "). Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Buscar producto por ID: 
    // TO-DO: Buscar más de un producto -> crear filtro de campo(s).
    // Ejemplo de consulta: SELECT * FROM producto WHERE ID_TIPO_PRODUCTO = IFNULL(?, ID_TIPO_PRODUCTO) 
    // OR ID_MARCA = IFNULL(?, ID_MARCA) OR NOMBRE_PRODUCTO = IFNULL(?, NOMBRE_PRODUCTO) OR DESCRIPCION_PRODUCTO = IFNULL(?, DESCRIPCION_PRODUCTO) 
    // OR VALOR = IFNULL(?, VALOR) OR ID_PRODUCTO = IFNULL(?, ID_PRODUCTO)
    ruta.get('/productos/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'SELECT * from producto WHERE ID_PRODUCTO = ?';
        var msg = "";

        conexion.query(sql, [ID], (error, fila) => {
            if (error) {
                //msg = `Error al obtener el producto por el ID ${ID} especificado`
                msg = `Error al obtener el producto especificado`
                console.log(msg, error)

                res.status(500).send({
                    message: msg,
                    detalleError: error.code
                });
                return;
            }

            if (fila.length === 0) {
                //msg = `No se encontró producto con ID # (${ID})`
                msg = `No se encontró el producto seleccionado`
                res.status(400).send({
                    message: msg
                });
            }
            else {
                res.status(200).send(fila[0]);
            }
        })
    });

    // Editar un producto por ID: 
    ruta.put('/productos/:ID', (req, res) => {

        const ID_ITEM = req.params.ID;

        // Obtenemos los datos del cuerpo de la solicitud
        // Usamos la destructuración de req.body para mayor claridad
        const {
            ID_TIPO_PRODUCTO,
            ID_MARCA,
            NOMBRE_PRODUCTO,
            DESCRIPCION_PRODUCTO,
            VALOR
        } = req.body;

        // El orden de los placeholders en la SQL debe coincidir con el orden en el array de valores.
        const update_sql = "UPDATE producto SET ID_TIPO_PRODUCTO = IFNULL(?, ID_TIPO_PRODUCTO), ID_MARCA = IFNULL(?, ID_MARCA), NOMBRE_PRODUCTO = IFNULL(?, NOMBRE_PRODUCTO), DESCRIPCION_PRODUCTO = IFNULL(?, DESCRIPCION_PRODUCTO), VALOR = IFNULL(?, VALOR) WHERE ID_PRODUCTO = ?";

        // Array de valores, asegurando el orden correcto de los datos
        const datos = [
            ID_TIPO_PRODUCTO,
            ID_MARCA,
            NOMBRE_PRODUCTO,
            DESCRIPCION_PRODUCTO,
            VALOR,
            ID_ITEM // El ID es el último valor del WHERE = es la variable constante
        ];

        const check_sql = 'SELECT COUNT(1) AS CONTEO FROM producto WHERE UPPER(TRIM(nombre_producto)) = UPPER(TRIM(?))';
        var es_duplicado = 0;
        var msg = "";

        // Validación de duplicados: 
        // PROBAR! datos[NOMBRE_PRODUCTO]
        //console.log(datos);
        //console.log("=> NOMBRE_PRODUCTO: (" + datos[2] + ")");
        conexion.query(check_sql, datos[2], (error, fila) => {
            if (error) {
                msg = `Error al validar duplicidad de producto`;
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
                            //msg = `Error al actualizar producto con ID (${ID_ITEM}). `;
                            msg = `Error al actualizar el producto.`;
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
                            //msg = `No se encontró un producto con ID (${ID_ITEM}) para actualizar.`;
                            msg = `No se encontró el producto para actualizarlo.`;
                            res.status(404).send({
                                message: msg
                            });
                        } else {
                            //msg = `Producto con ID ${ID_ITEM} actualizado correctamente.`
                            msg = `Producto actualizado correctamente.`
                            res.status(200).send({
                                message: msg,
                                affectedRows: resultado.affectedRows
                            });
                        }
                    });
                } else {
                    msg = "Ya existe un producto con este nombre. Debe elegir otro nombre de producto. Cantidad: " + es_duplicado;
                    console.log(msg)

                    res.status(500).send({
                        message: msg
                    });
                }
            }
        })
    });

    // Eliminar producto por ID: 
    ruta.delete('/productos/:ID', (req, res) => {

        const ID = req.params.ID;
        const sql = 'DELETE FROM producto WHERE ID_PRODUCTO = ?';
        var msg = "";

        conexion.query(sql, [ID], function (error, resultado) {

            if (error) {
                //msg = `Error al eliminar producto con ID # ${ID}:`;
                msg = `Error al eliminar el producto seleccionado`;
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
                //msg = `No se encontró el producto con ID ${ID} para eliminar.`;
                msg = `No se encontró el producto a eliminar.`;
                return res.status(404).json({
                    mensaje: msg
                });
            }

            msg = "Producto eliminado correctamente.";
            res.status(200).json({
                mensaje: msg
            });
        });
    });

    return ruta;
}