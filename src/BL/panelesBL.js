/**
 * En este archivo se define la lógica del proceso, administrando el control de acceso al controller de paneles,
 * implementando validaciones y manejando los resultados obtenidos en conjunto con el log de eventos y errores.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 20/Febrero/2020
 */

const controller = require('../Controller/panelesController'); //Constante que hace uso de la clase controller de los paneles.
const log = require('../../config/logConfig'); //Constante que instancia el modelo del log de eventos y errores.

function validarDatos(panelModel) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP } = panelModel;

	if (vNombreMaterialFot.length == 0 || vMarca.length == 0 || fPotencia.length == 0 || fPrecio.length == 0 ||
		vTipoMoneda.length == 0 || fISC.length == 0 || fVOC.length == 0 || fVMP.length == 0) {
		throw new Error('Los campos no pueden estar vacios.');
	}

	/*if (typeof vNombreMaterialFot !== 'string') {
		throw new Error('El nombre del material debe ser solo texto.');
	}*/

	/*if (isNaN(data.salario)) {
		throw new Error('El salario debe tener valores numéricos.');
	}*/
}

module.exports.insertar = async function (panelModel, response) {
	validarDatos(panelModel);

	result = await controller.insertar(panelModel);

	if(result !== true) {
		log.errores('Insertar Panel', 'Ocurrió un error al insertar los datos del panel "' + panelModel.vNombreMaterialFot + '" en la base de datos.');
		throw new Error('Ocurrió un error al insertar los datos del panel.');
	}

	log.eventos('Insertar Panel', 'Se ha insertado correctamente el panel "' + panelModel.vNombreMaterialFot + '" en la base de datos.');
	return result;
}

module.exports.eliminar = async function (panelModel, response) {
	if (panelModel.idPanel.length == 0) {
		throw new Error('El ID no puede estar vacio.');
	}

	result = await controller.eliminar(panelModel);

	if(result !== true) {
		log.errores('Eliminar Panel', 'Ocurrió un error al eliminar los datos del panel de la base de datos.');
		throw new Error('Ocurrió un error al eliminar el panel.');
	}

	log.eventos('Eliminar Panel', 'Se ha eliminado correctamente el panel de la base de datos.');
	return result;
}

module.exports.actualizar = async function (panelModel, response) {
	validarDatos(panelModel);

	result = await controller.actualizar(panelModel);

	if(result !== true) {
		log.errores('Actualizar Panel', 'Ocurrió un error al actualizar los datos del panel "' + panelModel.vNombreMaterialFot + '" en la base de datos.');
		throw new Error('Ocurrió un error al actualizar el panel.');
	}

	log.eventos('Actualizar Panel', 'Se ha actualizado correctamente el panel "' + panelModel.vNombreMaterialFot + '" en la base de datos.');
	return result;
}

module.exports.consultar = async function (response) {
	const result = await controller.consultar();

	log.eventos('Consultar Paneles', 'Se han consultado: ' + result.length + ' registros.');
	return result;
}
