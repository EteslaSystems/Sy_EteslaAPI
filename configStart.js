/**
 * En este archivo se definen las variables y constantes que instancian las librerias a utilizar y se crea el punto de inicio del servidor.
 * @author: Eduardo Herrera Aldaraca
 * @version: 0.0.1x
 * @date: 11/Febrero/2020
 */
//Requires
const path = require('path');
const express = require('express'); //Constante que instancia la libreria 'express'.
const http = require('http');

//Routes - Directory
const panelesRoutes = require('./src/Routes/panel.routes');
const inversoresRoutes = require('./src/Routes/inversor.routes');
const estructurasRoutes = require('./src/Routes/estructura.routes');
const cotizacionRoutes = require('./src/Routes/cotizacion.routes');
const propuestaRoutes = require('./src/Routes/propuesta.routes');
const clienteRoutes = require('./src/Routes/clientes.routes');
const usuarioRoutes = require('./src/Routes/usuario.routes');

//Initializations
const app = express(); //Constante que inicializa express para su uso en la aplicacion.
const server = http.createServer(app); //Constante que crea/inicializa el servidor

//Settings
app.set('port', process.env.PORT || 3000); //Esta variable obtiene el numero de puerto que queramos poner, si no recibe nada le asigna el valor '3000'.

app.get('/', (req, res) => {
    res.json({
        name: 'API Etesla',
        author: '@SistemasEtesla[2019-2021?]',
        description: 'Interfaz de Programacion de Aplicaciones',
        version: '0.0.1?'
    });
});

//Middlewares - Routes\
app.use('/api/paneles', panelesRoutes);
app.use('/api/inversores', inversoresRoutes);
app.use('/api/estructuras', estructurasRoutes);
app.use('/api/cotizacion', cotizacionRoutes);
app.use('/api/propuesta', propuestaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuario', usuarioRoutes);

//Arranque
server.listen(app.get('port'), () => { //Se da inicio al servidor con los parametros antes declarados.
    console.log('Servidor iniciado de manera exitosa en el puerto: ', app.get('port'));
});
    