require('dotenv').config();
const Fetch = require("node-fetch");

const PropuestaController = require('../Controller/propuestaController');

/* Notificar via -Telegram_Chatbot- */
module.exports.notificar = function(data){
    try{
        const uriApiNotification = process.env.URI_API_NOTIFICATION; //Ruta de la API del - Chatbot
        let routNotification = process.env.ROUT_NOTIFICATION; //Ruta a donde se tiene que apuntar para mandar notificaciones
        routNotification = uriApiNotification + routNotification;

        let notification = prepararNotificacion(data);

        return new Promise((resolve,reject) => {
            Fetch(routNotification,{
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(notification)
            })
            .then(result =>{
                resolve({
                    status: 200,
                    message: result
                });
            })
            .catch(error => {
                reject({
                    status: 500,
                    message: error
                });
            });
        });
    }
    catch(error){
        throw new Error(error);
    }
}

function prepararNotificacion(data){
    let clase = '';
    let mensaje = '';

    try{
        //Filtrar data
        let dataFiltrada = PropuestaController.filtrarData(data);

        //Identificar si hubo un descuento
        if(dataFiltrada.descuento.porcentaje > 0){
            clase = 'warning';
            mensaje = 'El usuario ' + dataFiltrada.usuario.nombre + ' a realizado un descuento de ' +dataFiltrada.descuento.porcentaje+'%';
        }
        else{
            clase = 'success',
            mensaje = 'Propuesta:';
        }

        return { clase, mensaje, json: dataFiltrada };
    }
    catch(error){
        console.log(error);
    }
}