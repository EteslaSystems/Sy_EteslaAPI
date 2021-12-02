/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 			Jesús Daniel Carrera Falcón
- @date: 				13/04/2020
*/

const opcionesViatics = require('../Controller/opcionesViaticsController');
const log = require('../../config/logConfig');
//const validations = require('../Middleware/otrosMaterialesMiddleware');
var moment = require('moment-timezone');

module.exports.insertar = async function (request, response) {
	//let validate = await validations.panelValidation(request);

	if (validate.status == true) {
		const datas = {
			id_Propuesta: request.id_Propuesta,
			id_Opciones_Viatics: request.id_Opciones_Viatics
		};

		result = await opcionesViatics.insertarOpcionesVPropuesta(datas);

		if(result.status !== true) {
			await log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / OPCIONES VIATICS. ' + result.message });

			throw new Error('Error al insertar los datos.');
		}

		await log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / OPCIONES VIATICS. ' + '1 fila insertada.' });

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminar = async function (request, response) {
	const datas = {
		idOpcionesV_Propuesta: request.id
	};

	result = await opcionesViatics.eliminarOpcionesVPropuesta(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / OPCIONES VIATICS. ' + result.message });

		throw new Error('Error al eliminar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'ELIMINAR / OPCIONES VIATICS. ' + '1 fila eliminada.' });

	return result.message;
}

module.exports.editar = async function (request, response) {
	//let validate = await validations.panelValidation(request);

	if (validate.status == true) {
		const datas = {
			idOpcionesV_Propuesta: request.id,
			id_Propuesta: request.id_Propuesta,
			id_Opciones_Viatics: request.id_Opciones_Viatics
		};

		result = await opcionesViatics.editarOpcionesVPropuesta(datas);

		if(result.status !== true) {
			await log.generateLog({ tipo: 'Error', contenido: 'EDITAR / OPCIONES VIATICS. ' + result.message });

			throw new Error('Error al editar los datos.');
		}

		await log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / OPCIONES VIATICS. ' + '1 fila editada.' });

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await opcionesViatics.consultaOpcionesVPropuesta();

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / OPCIONES VIATICS. ' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / OPCIONES VIATICS. ' + result.message.length + ' filas consultadas.' });

	return result.message;
}

module.exports.buscar = async function (request, response) {
	const datas = {
		idOpcionesV_Propuesta: request.id
	};

	result = await opcionesViatics.buscarOpcionesVPropuesta(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA / OPCIONES VIATICS. ' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'BUSQUEDA / OPCIONES VIATICS. ' + result.message.length + ' filas consultadas.' });

	return result.message;
}
