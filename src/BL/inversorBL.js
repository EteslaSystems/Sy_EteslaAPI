const inversor = require('../Controller/inversorController');
const log = require('../../config/log');
const validations = require('../Middleware/inversorMiddleware');

var moment = require('moment-timezone');

module.exports.insertar = async function (request, response) {
	let validate = await validations.inversorValidation(request);

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
			iVMIN: parseInt(request.ivmin),
			iVMAX: parseInt(request.ivmax),
			iPMAX: parseInt(request.ipmax),
			iPMIN: parseInt(request.ipmin),
			created_at: fecha
		};

		console.log(datas);

		//result = await inversor.insertar(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / INVERSORES.', result.message);

			throw new Error('Error al insertar los datos.');
		}

		log.eventos('INSERTAR / INVERSORES.', '1 fila insertada.');

		return result.message;
	} else {
		console.log(validate.message);

		throw new Error(validate.message);
	}
}

module.exports.eliminar = async function (datas, response) {

	if (datas.idInversor.length == 0 || datas.deleted_at.length == 0) {
		throw new Error('Los campos no pueden estar vacios.');
	}

	// if (typeof datas.nombre !== 'string') {
	// 	throw new Error('El nombre no hace nada');
	// }

	// if (isNaN(datas.salario)) {
	// 	throw new Error('El salario debe tener valores numéricos.');
	// }

	result = await inversor.eliminar(datas);

	if(result.status !== true) {
		log.errores('ELIMINAR / INVERSORES.', result.message);

		throw new Error('Error al eliminar los datos.');
	}

	log.eventos('ELIMINAR / INVERSORES.', '1 fila eliminada.');

	return result.message;
}

module.exports.editar = async function (datas, response) {
	let validate = await validations.inversorValidation(request);

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
			iVMIN: parseInt(request.ivmin),
			iVMAX: parseInt(request.ivmax),
			iPMAX: parseInt(request.ipmax),
			iPMIN: parseInt(request.ipmin),
			created_at: fecha
		};

		console.log(datas);

		//result = await inversor.editar(datas);

		if(result.status !== true) {
			log.errores('EDITAR / INVERSORES.', result.message);

			throw new Error('Error al editar los datos.');
		}

		log.eventos('EDITAR / INVERSORES.', '1 fila editada.');

		return result.message;
	} else {
		console.log(validate.message);

		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await inversor.consultar();

	if(result.status !== true) {
		log.errores('CONSULTA / INVERSORES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('CONSULTA / INVERSORES.', result.message.length + ' filas consultadas.');

	return result.message;
}