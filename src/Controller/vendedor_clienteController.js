/**
 * En este archivo se definen las funciones necesarias para realizar las operaciones hacia base de datos.
 * En concreto a la tabla de Vendedor_Cliente junto con su respectivo procedimiento almacenado.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 28/Febrero/2020
 */

const mysqlConnection = require('../../config/database');

function insertarVendedorCliente(vendedor_clienteModel) {
    const { id_Usuario, id_Cliente } = vendedor_clienteModel;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Vendedor_Cliente(?,?,?,?)',
		[0, null, id_Usuario, id_Cliente], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function actualizarVendedorCliente(vendedor_clienteModel) {
	const { id_Usuario, id_Cliente } = vendedor_clienteModel;
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Vendedor_Cliente(?,?,?,?)',
		[1, null, id_Usuario, id_Cliente], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

module.exports.insertar = async function (vendedor_clienteModel, response) {
	const result = await insertarVendedorCliente(vendedor_clienteModel);
	return result;
}

module.exports.actualizar = async function (vendedor_clienteModel, response) {
	const result = await actualizarVendedorCliente(vendedor_clienteModel);
	return result;
}
