const express = require('express')
const mysql = require('mysql2')
const cors = require('cors');
const marcaRoutes = require('./routes/marcaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const tipoUnidadRoutes = require('./routes/tipoUnidadRoutes');
const tipoProductoRoutes = require('./routes/tipoProductoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const tipoDocumentoRoutes = require('./routes/tipoDocumentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

var app = express();
app.use(express.json());
app.use(cors());
var puerto = 3000;

// Prueba de conexión con servidor local: 
app.listen(puerto, function () {
    console.log('Conexión con éxito - OK')
});

// Primera ruta de acceso con GET: 
app.get('/', function (req, res) {
    res.send('Primera ruta de inicio.')
});

// Parámetros de conexión a la BD: 
var conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SENAPassword1@',
    database: 'Minimarket_DB'
});

// Prueba de conexión: 
conexion.connect(function (error) {
    if (error) {
        throw error;
    } else {
        console.log('Conexión exitosa');
    }
});

// Conexión de rutas modularizadas: 
app.use('/app', marcaRoutes(conexion));
app.use('/app', productoRoutes(conexion));
app.use('/app', tipoUnidadRoutes(conexion));
app.use('/app', tipoProductoRoutes(conexion));
app.use('/app', inventarioRoutes(conexion));
app.use('/app', rolRoutes(conexion));
app.use('/app', tipoDocumentoRoutes(conexion));
app.use('/app', usuarioRoutes(conexion));
app.use('/app', ticketRoutes(conexion));