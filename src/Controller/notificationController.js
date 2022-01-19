require('dotenv').config();
const Fetch = require("node-fetch");

/* Notificar via -Telegram_Chatbot- */
module.exports.notificar = function(data){
    const uriApiNotification = process.env.URI_API_NOTIFICATION; //Ruta de la API del - Chatbot
    let routNotification = process.env.ROUT_NOTIFICATION; //Ruta a donde se tiene que apuntar para mandar notificaciones

    try{
        let { message } = data;
        routNotification = uriApiNotification + routNotification;

        return new Promise((resolve,reject) => {
            Fetch(routNotification,{
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(message)
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