/**
 * En este archivo se define la lógica del proceso, administrando el control de acceso al controller de cliente,
 * implementando validaciones y manejando los resultados obtenidos en conjunto con el log de eventos y errores.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 3.0.0
 * @date: 28/Febrero/2020
 */

const controller = require('../Controller/clienteController'); //Constante que hace uso de la clase controller de Cliente.
const vendedor_clienteBL = require('./vendedor_clienteBL'); //Constante que instancia la clase BL de vendedor_cliente con sus métodos.
const log = require('../../config/logConfig'); //Constante que instancia el modelo del log de eventos y errores.

module.exports.insertar = async function (clienteModel, response) {
	const nombreCompleto = clienteModel.vNombrePersona + ' ' + clienteModel.vPrimerApellido + ' ' + clienteModel.vSegundoApellido;

	result = await controller.insertar(clienteModel);

	if(result.propertyIsEnumerable(0) !== true) {
		log.errores('Insertar Cliente', 'Ocurrió un error al insertar los datos del cliente "' + nombreCompleto + '" en la base de datos.');
		throw new Error('Ocurrió un error al insertar los datos del cliente.');
	}

	clienteModel.id_Cliente = result[0].idCliente;

	vendedor_clienteBL.insertar(clienteModel)
	.then(panel => {
		log.eventos('Insertar Cliente', 'Se ha insertado correctamente el cliente "' + nombreCompleto + '" en la base de datos.');
		return result;
	})
	.catch(error => {
		throw new Error(error.message);
	});
}

module.exports.eliminar = async function (clienteModel, response) {
	result = await controller.eliminar(clienteModel);

	if(result !== true) {
		log.errores('Eliminar Cliente', 'Ocurrió un error al eliminar los datos del cliente de la base de datos.');
		throw new Error('Ocurrió un error al eliminar el cliente.');
	}

	log.eventos('Eliminar Cliente', 'Se ha eliminado correctamente el cliente de la base de datos.');
	return result;
}

module.exports.actualizar = async function (clienteModel, response) {
	const nombreCompleto = clienteModel.vNombrePersona + ' ' + clienteModel.vPrimerApellido + ' ' + clienteModel.vSegundoApellido;

	result = await controller.actualizar(clienteModel);

	if(result !== true) {
		log.errores('Actualizar Cliente', 'Ocurrió un error al actualizar los datos del cliente "' + nombreCompleto + '" en la base de datos.');
		throw new Error('Ocurrió un error al actualizar el cliente.');
	}

	log.eventos('Actualizar Cliente', 'Se ha actualizado correctamente el cliente "' + nombreCompleto + '" en la base de datos.');
	return result;
}

module.exports.consultar = async function (response) {
	const result = await controller.consultar();
	if (result.propertyIsEnumerable(0) !== true) {
		log.errores('Consultar Clientes', 'Ocurrió un error al consultar los registros de los clientes de la base de datos.');
		throw new Error('Ocurrió un error al consultar los clientes.');
	}

	log.eventos('Consultar Clientes', 'Se han consultado: ' + result.length + ' registros.');
	return result;
}

module.exports.consultarPorId = async function (idPersona, response) {
	const result = await controller.consultarPorId(idPersona);
	if (result.propertyIsEnumerable(0) !== true) {
		log.errores('Consultar Cliente', 'Ocurrió un error al consultar los datos del cliente de la base de datos.');
		throw new Error('Ocurrió un error al consultar los datos del cliente.');
	}

	log.eventos('Consultar Cliente', 'Se han consultado los datos del cliente de la base de datos.');
	return result;
}

module.exports.consultarPorUsuario = async function (idUsuario, response) {
	const result = await controller.consultarPorUsuario(idUsuario);

    if (result.hasOwnProperty('sqlMessage')) {
        log.errores('Consultar Clientes de Usuario', 'Ocurrió un error al consultar los clientes del usuario: ' + result.sqlMessage);
		throw new Error('Ocurrió un error al consultar los clientes del usuario.');
    } else if (result.propertyIsEnumerable(0) !== true) {
        log.errores('Consultar Clientes de Usuario', 'Este vendedor no tiene clientes registrados aún.');
		throw new Error('Este vendedor no tiene clientes registrados aún.');
    }

	log.eventos('Consultar Clientes de Usuario', 'Se han consultado los clientes del usuario de la base de datos.');
	return result;
}
