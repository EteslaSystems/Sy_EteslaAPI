/*
- @description: 		Archivo correspondiente a las funciones del calculo de viaticos
- @author: 				LH420
- @date: 				09/04/2020
*/
var request = require('request');

/*#region API-GoogleMaps*/

function obtenerDistanciaEnKm(origen, destino){
    var apikey = 'AIzaSyD0cJDO0IwwolWkvCCnzVFTmbsvQjsdOyo';
    var distanciaEnKm = 0;
    origen = origen.replace(/\s/g,"+");
    destino = destino.replace(/\s/g,"+");

    request.get("https://maps.googleapis.com/maps/api/distancematrix/json?origins="+origen+"&destinations="+destino+"&key="+apikey, (error, response, body) => {
        if(!error){
            body = JSON.parse(body);
            body = body.rows[0].elements;

            for(var i=0; i<body.length; i++){
                distanciaEnKm = body[i].distance.value;
            }

            distanciaEnKm = Math.ceil(distanciaEnKm / 1000);
            console.log('obtenerDistanciaEnKm(origen, destino) says: '+distanciaEnKm+' km');
            return distanciaEnKm;
        }
        else{
            console.log(error);
        }
    });   
}

/*#endregion */
module.exports.main = function(oficina, direccionCliente){
    var destino = direccionCliente;
    var origen = oficina;
    obtenerDistanciaEnKm(origen, destino);
}

//Clave API GOOGLE:
//AIzaSyCmixyi6v0bnLCfJYbp4RTcatXG4yb7NR8 