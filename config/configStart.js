/**
 * En este archivo se definen las variables y constantes que instancian las librerias a utilizar y se crea el punto de inicio del servidor.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 11/Febrero/2020
 */

const express = require('express'); //Constante que instancia la libreria 'express'.
const app = express(); //Constante encargada de crear el punto de partida del servidor.

const googleMapsClient = require('@google/maps').createClient({
	//Cotizador eTesla
  	key: 'AIzaSyDuS_dytlN0a3y4dzvYfIOtSQgMbbxw6xo'
	//Cotizador Prueba
  	//key: 'AIzaSyD0twIme1kniXDHRnupU6SLmKQzpmomJOY'
	//API del wey del vídeo :v
	//key: 'AIzaSyBEax08O5Hkz82GiVyd7kCU_qxAkfl5JnE'
});

app.use(express.json()); //Se le indica al servidor que la salida de la comunicación sera a través de un objeto json.
app.use(require('../src/Routes/web.js')); //Instancia del archivo de rutas del servidor.
app.set('port', process.env.PORT || 3000); //Esta variable obtiene el numero de puerto que queramos poner, si no recibe nada le asigna el valor '3000'.

app.listen(app.get('port'), () => { //Se da inicio al servidor con los parametros antes declarados.
	console.log('Servidor iniciado de manera exitosa en el puerto: ', app.get('port'));

	/* Geocode an address.
	googleMapsClient.geocode({ address: '1600 Amphitheatre Parkway, Mountain View, CA' }, function(err, response) {
        if (!err) console.log(response.json.results);
        else console.log(err);
    });*/
});
