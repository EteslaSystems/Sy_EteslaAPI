/**
 * En este archivo se define la lógica del proceso, administrando el control de acceso al controller de vendedor_cliente,
 * implementando validaciones y manejando los resultados obtenidos en conjunto con el log de eventos y errores.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 28/Febrero/2020
 */

const controller = require('../Controller/vendedor_clienteController'); //Constante que hace uso de la clase controller de vendedor_cliente.
const log = require('../../config/logConfig'); //Constante que instancia el modelo del log de eventos y errores.

module.exports.insertar = async function (vendedor_clienteModel, response) {
	result = await controller.insertar(vendedor_clienteModel);

	if(result !== true) {
		log.errores('Insertar Vendedor_Cliente', 'Ocurrió un error al insertar la relación de vendedor con cliente en la base de datos.');
		throw new Error('Ocurrió un error al insertar los datos de la relación vendedor/cliente.');
	}

	log.eventos('Insertar Vendedor_Cliente', 'Se ha insertado correctamente la relación de vendedor con cliente en la base de datos.');
	return result;
}

module.exports.actualizar = async function (vendedor_clienteModel, response) {

	result = await controller.actualizar(vendedor_clienteModel);

	if(result !== true) {
		log.errores('Actualizar Vendedor_Cliente', 'Ocurrió un error al actualizar el vendedor del cliente en la base de datos.');
		throw new Error('Ocurrió un error al actualizar el vendedor del cliente.');
	}

	log.eventos('Actualizar Vendedor_Cliente', 'Se ha actualizado correctamente el vendedor del cliente en la base de datos.');
	return result;
}
