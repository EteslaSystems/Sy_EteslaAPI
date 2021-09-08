/**
 * En este archivo se definen las variables y constantes que instancian las librerias a utilizar y se crea el punto de inicio del servidor.
 * @author: Eduardo Herrera Aldaraca
 * @version: 0.0.1x
 * @date: 11/Febrero/2020
 */
//Requires
/* const compression = require('compression'); */ //Compression GZIP - Necesaria
const path = require('path');
const express = require('express'); //Constante que instancia la libreria 'express'.
const http = require('http'); /////\\\\
const exphbs = require('express-handlebars'); //Borrar cuando se deje de utilizar el testeo de la plantilla del PDF

//Initializations
const app = express(); //Constante que inicializa express para su uso en la aplicacion.
const server = http.createServer(app); //Constante que crea/inicializa el servidor.  /////\\\\

//Settings
app.set('port', process.env.PORT || 3000); //Esta variable obtiene el numero de puerto que queramos poner, si no recibe nada le asigna el valor '3000'.
app.set('views', path.join(process.cwd(),'src','PDF','templates'));//Borrar cuando se deje de utilizar el testeo de la plantilla del PDF
app.engine('.hbs', exphbs({ layoutsDir: app.get('views'), defaultLayout: 'cotizacion', extname: '.hbs' }));//Borrar cuando se deje de utilizar el testeo de la plantilla del PDF
app.set('view engine','.hbs');//Borrar cuando se deje de utilizar el testeo de la plantilla del PDF

//Middlewares
// app.use(express.static(path.join(__dirname, 'src')));
app.use(require(__dirname+'/src/Routes/web.js')); //Instancia del archivo de rutas del servidor.

//Arranque
server.listen(app.get('port'), () => { //Se da inicio al servidor con los parametros antes declarados.
    console.log('Servidor iniciado de manera exitosa en el puerto: ', app.get('port'));
});
    