/*
- @description: Archivo correspondiente a las funciones de la API del módulo de media tensión.
- @author: 	 Jesus Daniel Carrera Falcón
- @date: 		 17/03/2020
*/

function promediarArray(array) {
  	return new Promise((resolve, reject) => {
  		const longitud = array.length;
  		var sumaObjetos = 0;
  		var promedio = 0;
  		if (longitud == 12) {
  			for (var i in array) {
  				var suma = 0;
  				for (var j in array[i]) {
  					suma = suma + array[i][j];
  				}
  				sumaObjetos = sumaObjetos + suma;
  			}
  			promedio = sumaObjetos / longitud;

  			const response = {
  				status: true,
  				message: promedio
  			}

  			resolve(response);
  		} else {
  			const faltantes = 12 - longitud;

  			for (var i in array) {
  				var suma = 0;
  				for (var j in array[i]) {
  					suma = suma + array[i][j];
  				}
  				sumaObjetos = sumaObjetos + suma;
  			}
  			promedio = sumaObjetos / longitud;

  			for(var i = 0; i < faltantes; i++) {
  				array.push(promedio);
  			}

  			const response = {
  				status: true,
  				message: array
  			}

  			resolve(response);
  		}
  	});
}

/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Media Tension
- @author: 				LH420
- @date: 				20/03/2020
*/

/*#region GDMTH*/
var propertyBkWh = [];
var propertyIkWh = [];
var propertyPkWh = [];
var propertyBkW = [];
var propertyIkW = [];
var propertyPkW = [];
var averageBkWh = 0.0;
var averageIkWh = 0.0;
var averagePkWh = 0.0;
var averageBkW = 0.0;
var averageIkW = 0.0;
var averagePkW = 0.0;

//Datos de consumo
function cotizacionGDMTH(data){
    promedioDePropiedadPeriodoGDMTH(data);
}

/*#endregion*/
/*#region GDMTO*/
/*#endregion*/

function promedioDePropiedadPeriodoGDMTH(data){
	if(obtenerEspaciosFaltantesDelArray(data) == null){
		data.forEach(function(){
			periodo => console.log(periodo.bkwh);
		});
	}
}

function obtenerEspaciosFaltantesDelArray(data){
    if(data.length < 2){
        return 12 - arrayGDMTH.length;
    }
    else if(data.length == 3){
        return null;
	}
}

module.exports.cotizarGDMTH = async function(data){
    await cotizacionGDMTH(data);
}

module.exports.promedioArray = async function (array, response) {
	const result = await promediarArray(array);
	return result;
}
