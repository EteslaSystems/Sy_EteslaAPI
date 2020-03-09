/**
 * En este archivo se definen las funciones necesarias para realizar las operaciones hacia base de datos.
 * En concreto a la tabla de Persona, Cliente y Vendedor_Cliente junto con sus respectivos procedimientos almacenados.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 2.0.0
 * @date: 28/Febrero/2020
 */

const mysqlConnection = require('../../config/database');

function insertarCliente(clienteModel) {
    const { fConsumo, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, vCalle, vMunicipio, vEstado } = clienteModel;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[0, null, fConsumo, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, null, null, null, vCalle, vMunicipio, vEstado], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

function eliminarCliente(clienteModel) {
	const { idPersona, deleted_at } = clienteModel;
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Cliente(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[1, null, null, idPersona, null, null, null, null, null, null, null, null, deleted_at, null, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function actualizarCliente(clienteModel) {
	const { fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, updated_at, vCalle, vMunicipio, vEstado } = clienteModel;
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Cliente(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[2, null, fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, null, updated_at, null, null, vCalle, vMunicipio, vEstado], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function consultarClientes() {
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Cliente(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

function consultarClientesPorId(idPersona) {
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Cliente(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[4, null, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

function consultarClientesPorUsuario(idUsuario) {
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Cliente(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[5, idUsuario, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

module.exports.insertar = async function (clienteModel, response) {
	const result = await insertarCliente(clienteModel);
	return result;
}

module.exports.eliminar = async function (clienteModel, response) {
	const result = await eliminarCliente(clienteModel);
	return result;
}

module.exports.actualizar = async function (clienteModel, response) {
	const result = await actualizarCliente(clienteModel);
	return result;
}

module.exports.consultar = async function (response) {
	const result = await consultarClientes();
	return result;
}

module.exports.consultarPorId = async function (idPersona, response) {
	const result = await consultarClientesPorId(idPersona);
	return result;
}

module.exports.consultarPorUsuario = async function (idUsuario, response) {
	const result = await consultarClientesPorUsuario(idUsuario);
	return result;
}
