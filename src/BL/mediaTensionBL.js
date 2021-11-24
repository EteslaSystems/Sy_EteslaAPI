/*
- @description: Archivo correspondiente a la sección de reglas a cumplir del módulo de media tensión.
- @author: 	 Jesus Daniel Carrera Falcon
- @date: 		 17/03/2020
*/

const log = require('../../config/logConfig');
const validations = require('../Middleware/promedioMiddleware');
const mediaTension = require('../Controller/mediaTensionController');

module.exports.promedioArray = async function (request, response) {
	if (request.length > 12) {
		throw new Error('La longitud del array no puede ser mayor a 12.');
	}

	for (var i in request) {
		for (let j in request[i]) {
			const data = { numero: request[i][j] };
			let validate = await validations.promedioValidation(data);
			if (validate.status != true) {
				throw new Error(validate.message);
			}
		}
	}

	result = await mediaTension.promedioArray(request);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'Promediar array. ' + result.message });
		throw new Error('Error al promediar los datos del array.');
	}

	return result.message;
}
