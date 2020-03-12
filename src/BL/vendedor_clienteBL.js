/**
 * En este archivo se define la lógica del proceso, administrando el control de acceso al controller de vendedor_cliente,
 * implementando validaciones y manejando los resultados obtenidos en conjunto con el log de eventos y errores.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 28/Febrero/2020
 */

const vendedorCliente = require('../Controller/vendedor_clienteController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/cliente_vendedorMiddleware');

module.exports.insertar = async function (request, response) {
	let validate = await validations.clientevendedorValidation(request);

	if (validate.status == true) {
		const datas = {
	        id_Usuario: request.idUsuario,
			id_Cliente: request.idCliente
		};
		
		result = await vendedorCliente.insertar(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / CLIENTE.', result.message);

			const info = {
				status: 500,
				message: datas.id_Cliente
			};

      		return info;
		}

		log.eventos('INSERTAR / CLIENTE.', '1 fila insertada.');

		const info = {
			status: 200,
			message: result.message
		}

		return info;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.actualizar = async function (vendedor_clienteModel, response) {

	result = await vendedorCliente.actualizar(vendedor_clienteModel);

	if(result !== true) {
		log.errores('Actualizar Vendedor_Cliente', 'Ocurrió un error al actualizar el vendedor del cliente en la base de datos.');
		throw new Error('Ocurrió un error al actualizar el vendedor del cliente.');
	}

	log.eventos('Actualizar Vendedor_Cliente', 'Se ha actualizado correctamente el vendedor del cliente en la base de datos.');
	return result;
}
