/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const inversor = require('../Controller/inversorController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/inversorMiddleware');

var moment = require('moment-timezone');

module.exports.insertar = async function (request, response) {
	// let validate = await validations.inversorValidation(request);

	let validate = { status: true };

	if (validate.status == true) {
		const datas = {
			vNombreMaterialFot: request.nombrematerial || null,
			vMarca: request.marca || null,
			fPotencia: request.potencia != null ? parseFloat(request.potencia) : null,
			fPrecio: request.precio != null ? parseFloat(request.precio) : null,
			vGarantia: request.garantia || null,
			vOrigen: request.origen || null,
			fISC: request.isc != null ? parseFloat(request.isc) : null,
			iVMIN: request.ivmin != null ? parseInt(request.ivmin) : null,
			iVMAX: request.ivmax != null ? parseInt(request.ivmax) : null,
			iPMAX: request.ipmax != null ? parseInt(request.ipmax) : null,
			iPMIN: request.ipmin != null ? parseInt(request.ipmin) : null,
			vTipoInversor: request.vTipoInversor || null,
			vInversor1: request.microInversor1 || null,
			vInversor2: request.microInversor2 || null,
			imgRuta: request.imgRuta || null,
			siPanelSoportados: request.panelesSoportados != null ? parseInt(request.panelesSoportados) : null
		};

		result = await inversor.insertar(datas);

		if(result.status !== true) {
			await log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / INVERSORES.' + result.message });

			throw new Error('Error al insertar los datos.');
		}

		await log.generateLog({ tipo: 'Evento', contenido: 'INSERTAR / INVERSORES. ' + '1 fila insertada.' });

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminar = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		idInversor: request.id,
		deleted_at: fecha
	};

	result = await inversor.eliminar(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / INVERSORES. ' + result.message });

		throw new Error('Error al eliminar los datos.');
	}

	await log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / INVERSORES. ' + '1 fila eliminada.' });

	return result.message;
}

module.exports.editar = async function (request, response) {
	let validate = await validations.inversorValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			idInversor: request.id,
			vNombreMaterialFot: request.nombrematerial,
			vMarca: request.marca,
			fPotencia: parseFloat(request.potencia),
			fPrecio: parseFloat(request.precio),
			vTipoMoneda: request.moneda,
			vGarantia: request.garantia,
			vOrige: request.origen,
			fISC: parseFloat(request.isc),
			iVMIN: parseInt(request.ivmin),
			iVMAX: parseInt(request.ivmax),
			iPMAX: parseInt(request.ipmax),
			iPMIN: parseInt(request.ipmin),
			updated_at: fecha
		};

		result = await inversor.editar(datas);

		if(result.status !== true) {
			await log.generateLog({ tipo: 'Error', contenido: 'EDITAR / INVERSORES. ' + result.message });

			throw new Error('Error al editar los datos.');
		}

		await log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / INVERSORES. ' + '1 fila editada.' });

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await inversor.consultar();

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / INVERSORES.' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / INVERSORES. ' + result.message.length + ' filas consultadas.' });

	return result.message;
}

module.exports.buscar = async function (request, response) {
	const datas = {
		idInversor: request.id
	};

	result = await inversor.buscar(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA / INVERSORES. ' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'BUSQUEDA / INVERSORES. ' + result.message.length + ' filas consultadas.' });

	return result.message;
}

module.exports.obtenerEquiposTipo = async function (request, response) {
	const datas = {
		vTipoInversor: request.vTipoInversor
	};

	result = await inversor.consultarTipoEquipos(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA[vTipoInversor] / INVERSORES. ' + result.message });

		throw new Error('Error en BUSQUEDA[vTipoInversor].');
	}

	await log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA[vTipoInversor] / INVERSORES. ' + result.message.length + ' filas consultadas.' });

	return result.message;
}