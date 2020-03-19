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

module.exports.promedioArray = async function (array, response) {
	const result = await promediarArray(array);
	return result;
}
