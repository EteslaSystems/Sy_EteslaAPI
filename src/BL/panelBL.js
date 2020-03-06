const panel = require('../Controller/panelController');
const log = require('../../config/log');
const validations = require('../Middleware/panelMiddleware');

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
			vTipoMoneda: request.moneda,
			fISC: parseFloat(request.isc),
			fVOC: parseFloat(request.voc),
			fVMP: parseFloat(request.vmp),
			created_at: fecha
		};

		result = await panel.insertar(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / PANELES.', result.message);

			throw new Error('Error al insertar los datos.');
		}

		log.eventos('INSERTAR / PANELES.', '1 fila insertada.');

		return result.message;
	} else {
		console.log(validate.message);

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
		log.errores('ELIMINAR / PANELES.', result.message);

		throw new Error('Error al eliminar los datos.');
	}

	log.eventos('ELIMINAR / PANELES.', '1 fila eliminada.');

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
			vTipoMoneda: request.moneda,
			fISC: parseFloat(request.isc),
			fVOC: parseFloat(request.voc),
			fVMP: parseFloat(request.vmp),
			updated_at: fecha
		};

		result = await panel.editar(datas);

		if(result.status !== true) {
			log.errores('EDITAR / PANELES.', result.message);

			throw new Error('Error al editar los datos.');
		}

		log.eventos('EDITAR / PANELES.', '1 fila editada.');

		return result.message;
	} else {
		console.log(validate.message);

		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await panel.consultar();

	if(result.status !== true) {
		log.errores('CONSULTA / PANELES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('CONSULTA / PANELES.', result.message.length + ' filas consultadas.');

	return result.message;
}

module.exports.buscar = async function (request, response) {
	const datas = {
		idPanel: request.id
	};

	result = await panel.buscar(datas);

	if(result.status !== true) {
		log.errores('BUSQUEDA / PANELES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('BUSQUEDA / PANELES.', result.message.length + ' filas consultadas.');

	return result.message;
}