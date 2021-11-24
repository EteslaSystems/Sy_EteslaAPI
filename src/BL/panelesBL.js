/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 				Yael Ramirez (@iaelrmz)
- @date: 				19/02/2020
*/

const panel = require('../Controller/panelesController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/panelesMiddleware');

var moment = require('moment-timezone');

module.exports.insertar = async function (request, response) {
	let validate = await validations.panelValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			vNombreMaterialFot: request.nombrematerial,
			vMarca: request.marca,
			fPotencia: parseFloat(request.potencia),
			fPrecio: parseFloat(request.precio),
			vGarantia: request.garantia,
			vOrigen: request.origen,
			fISC: parseFloat(request.isc),
			fVOC: parseFloat(request.voc),
			fVMP: parseFloat(request.vmp),
			created_at: fecha
		};

		result = await panel.insertar(datas);

		if(result.status !== true) {
			log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / PANELES. ' + result.message });

			throw new Error('Error al insertar los datos.');
		}

		log.generateLog({ tipo: 'Evento', contenido: 'INSERTAR / PANELES.' + '1 fila insertada.' });

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminar = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		idPanel: request.id,
		deleted_at: fecha
	};

	result = await panel.eliminar(datas);

	if(result.status !== true) {
		log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / PANELES.' + result.message });

		throw new Error('Error al eliminar los datos.');
	}

	log.generateLog({ tipo: 'Evento', contenido: 'ELIMINAR / PANELES.' + '1 fila eliminada.' });

	return result.message;
}

module.exports.editar = async function (request, response) {
	let validate = await validations.panelValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			idPanel: request.id,
			vNombreMaterialFot: request.nombrematerial,
			vMarca: request.marca,
			fPotencia: parseFloat(request.potencia),
			fPrecio: parseFloat(request.precio),
			vGarantia: request.garantia,
			vOrigen: request.origen,
			fISC: parseFloat(request.isc),
			fVOC: parseFloat(request.voc),
			fVMP: parseFloat(request.vmp),
			updated_at: fecha
		};

		result = await panel.editar(datas);

		if(result.status !== true) {
			log.generateLog({ tipo: 'Error', contenido: 'EDITAR / PANELES. ' + result.message });

			throw new Error('Error al editar los datos.');
		}

		log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / PANELES.' + '1 fila editada.' });

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await panel.consultar();

	if(result.status !== true) {
		log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / PANELES.' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / PANELES.' + result.message.length + ' filas consultadas.' });

	return result.message;
}

module.exports.buscar = async function (request, response) {
	const datas = {
		idPanel: request.id
	};

	result = await panel.buscar(datas);

	if(result.status !== true) {
		log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA / PANELES. ' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	log.generateLog({ tipo: 'Evento', contenido: 'BUSQUEDA / PANELES. ' + result.message.length + ' filas consultadas.' });

	return result.message;
}