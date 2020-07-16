/**
 * En este archivo se definen las variables y constantes que instancian las librerias a utilizar y se crea el punto de inicio del servidor.
 * @author: Eduardo Herrera Aldaraca
 * @version: 1.0.0
 * @date: 11/Febrero/2020
 */

const express = require('express'); //Constante que instancia la libreria 'express'.
const app = express(); //Constante encargada de crear el punto de partida del servidor.

const http = require('http');
const path = require('path');

app.use(express.json()); //Se le indica al servidor que la salida de la comunicación sera a través de un objeto json.
app.use(require('../src/Routes/web.js')); //Instancia del archivo de rutas del servidor.
app.set('port', process.env.PORT || 3000); //Esta variable obtiene el numero de puerto que queramos poner, si no recibe nada le asigna el valor '3000'.

app.listen(app.get('port'), () => { //Se da inicio al servidor con los parametros antes declarados.
    console.log('Servidor iniciado de manera exitosa en el puerto: ', app.get('port'));
});

const server = http.createServer(app);
