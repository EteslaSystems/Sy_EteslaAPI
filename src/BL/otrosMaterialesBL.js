/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 				Jesús Daniel Carrera Falcón
- @date: 				13/04/2020
*/

const otrosMateriales = require('../Controller/otrosMaterialesController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/otrosMaterialesMiddleware');
var moment = require('moment-timezone');

/* #region Categoría Otros Materiales */
module.exports.insertarCategoriaMaterialesBL = async function (request, response) {
	let validate = await validations.categoriaValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			nombreCategoOtrosMats: request.nombreCategoOtrosMats,
			created_at: fecha
		};

		result = await otrosMateriales.insertarCategoriaMateriales(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / CATEGORIA MATERIALES.', result.message);

			throw new Error('Error al insertar los datos.');
		}

		log.eventos('INSERTAR / CATEGORIA MATERIALES.', '1 fila insertada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminarCategoriaMaterialesBL = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		idCategOtrosMateriales: request.id,
		deleted_at: fecha
	};

	result = await otrosMateriales.eliminarCategoriaMateriales(datas);

	if(result.status !== true) {
		log.errores('ELIMINAR / CATEGORIA MATERIALES.', result.message);

		throw new Error('Error al eliminar los datos.');
	}

	log.eventos('ELIMINAR / CATEGORIA MATERIALES.', '1 fila eliminada.');

	return result.message;
}

module.exports.editarCategoriaMaterialesBL = async function (request, response) {
	let validate = await validations.categoriaValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			idCategOtrosMateriales: request.id,
			nombreCategoOtrosMats: request.nombreCategoOtrosMats,
			updated_at: fecha
		};

		result = await otrosMateriales.editarCategoriaMateriales(datas);

		if(result.status !== true) {
			log.errores('EDITAR / CATEGORIA MATERIALES.', result.message);

			throw new Error('Error al editar los datos.');
		}

		log.eventos('EDITAR / CATEGORIA MATERIALES.', '1 fila editada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultaCategoriaMaterialesBL = async function (response) {
	const result = await otrosMateriales.consultaCategoriaMateriales();

	if(result.status !== true) {
		log.errores('CONSULTA / CATEGORIA MATERIALES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('CONSULTA / CATEGORIA MATERIALES.', result.message.length + ' filas consultadas.');

	return result.message;
}

module.exports.buscarCategoriaMaterialesBL = async function (request, response) {
	const datas = {
		idCategOtrosMateriales: request.id
	};

	result = await otrosMateriales.buscarCategoriaMateriales(datas);

	if(result.status !== true) {
		log.errores('BUSQUEDA / CATEGORIA MATERIALES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('BUSQUEDA / CATEGORIA MATERIALES.', result.message.length + ' filas consultadas.');

	return result.message;
}
/* #endregion */

/* #region Otros Materiales */
module.exports.insertarOtroMaterialBL = async function (request, response) {
	let validate = await validations.materialesValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			id_CategOtrosMats: request.id_CategOtrosMats,
			partida: request.partida,
			unidad: request.unidad,
			precioUnitario: parseFloat(request.precioUnitario),
			created_at: fecha
		};

		result = await otrosMateriales.insertarOtroMaterial(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / OTROS MATERIALES.', result.message);

			throw new Error('Error al insertar los datos.');
		}

		log.eventos('INSERTAR / OTROS MATERIALES.', '1 fila insertada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminarOtroMaterialBL = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		idOtrosMateriales: request.id,
		deleted_at: fecha
	};

	result = await otrosMateriales.eliminarOtroMaterial(datas);

	if(result.status !== true) {
		log.errores('ELIMINAR / OTROS MATERIALES.', result.message);

		throw new Error('Error al eliminar los datos.');
	}

	log.eventos('ELIMINAR / OTROS MATERIALES.', '1 fila eliminada.');

	return result.message;
}

module.exports.editarOtroMaterialBL = async function (request, response) {
	let validate = await validations.materialesValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			idOtrosMateriales: request.id,
			id_CategOtrosMats: request.id_CategOtrosMats,
			partida: request.partida,
			unidad: request.unidad,
			precioUnitario: parseFloat(request.precioUnitario),
			updated_at: fecha
		};

		result = await otrosMateriales.editarOtroMaterial(datas);

		if(result.status !== true) {
			log.errores('EDITAR / OTROS MATERIALES.', result.message);

			throw new Error('Error al editar los datos.');
		}

		log.eventos('EDITAR / OTROS MATERIALES.', '1 fila editada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultaOtroMaterialBL = async function (response) {
	const result = await otrosMateriales.consultaOtroMaterial();

	if(result.status !== true) {
		log.errores('CONSULTA / OTROS MATERIALES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('CONSULTA / OTROS MATERIALES.', result.message.length + ' filas consultadas.');

	return result.message;
}

module.exports.buscarOtroMaterialBL = async function (request, response) {
	const datas = {
		idOtrosMateriales: request.id
	};

	result = await otrosMateriales.buscarOtroMaterial(datas);

	if(result.status !== true) {
		log.errores('BUSQUEDA / OTROS MATERIALES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('BUSQUEDA / OTROS MATERIALES.', result.message.length + ' filas consultadas.');

	return result.message;
}
/* #endregion */

/* #region Otros Materiales Propuesta */
module.exports.insertarMaterialesPropuestaBL = async function (request, response) {
	//let validate = await validations.panelValidation(request);

	if (validate.status == true) {
		const datas = {
			id_Propuesta: request.id_Propuesta,
			id_CategOtrosMateriales: request.id_CategOtrosMateriales
		};

		result = await otrosMateriales.insertarMaterialesPropuesta(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / OTROS MATERIALES PROPUESTA.', result.message);

			throw new Error('Error al insertar los datos.');
		}

		log.eventos('INSERTAR / OTROS MATERIALES PROPUESTA.', '1 fila insertada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminarMaterialesPropuestaBL = async function (request, response) {
	const datas = {
		idOtrosMatsPropuesta: request.id
	};

	result = await otrosMateriales.eliminarMaterialesPropuesta(datas);

	if(result.status !== true) {
		log.errores('ELIMINAR / OTROS MATERIALES PROPUESTA.', result.message);

		throw new Error('Error al eliminar los datos.');
	}

	log.eventos('ELIMINAR / OTROS MATERIALES PROPUESTA.', '1 fila eliminada.');

	return result.message;
}

module.exports.editarMaterialesPropuestaBL = async function (request, response) {
	//let validate = await validations.panelValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			idOtrosMatsPropuesta: request.id,
			id_Propuesta: request.id_Propuesta,
			id_CategOtrosMateriales: request.id_CategOtrosMateriales
		};

		result = await otrosMateriales.editarMaterialesPropuesta(datas);

		if(result.status !== true) {
			log.errores('EDITAR / OTROS MATERIALES PROPUESTA.', result.message);

			throw new Error('Error al editar los datos.');
		}

		log.eventos('EDITAR / OTROS MATERIALES PROPUESTA.', '1 fila editada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultaMaterialesPropuestaBL = async function (response) {
	const result = await otrosMateriales.consultaMaterialesPropuesta();

	if(result.status !== true) {
		log.errores('CONSULTA / OTROS MATERIALES PROPUESTA.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('CONSULTA / OTROS MATERIALES PROPUESTA.', result.message.length + ' filas consultadas.');

	return result.message;
}

module.exports.buscarMaterialesPropuestaBL = async function (request, response) {
	const datas = {
		idOtrosMatsPropuesta: request.id
	};

	result = await otrosMateriales.buscarMaterialesPropuesta(datas);

	if(result.status !== true) {
		log.errores('BUSQUEDA / OTROS MATERIALES PROPUESTA.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('BUSQUEDA / OTROS MATERIALES PROPUESTA.', result.message.length + ' filas consultadas.');

	return result.message;
}
/* #endregion */
