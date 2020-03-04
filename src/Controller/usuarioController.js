/**
 * En este archivo se definen las funciones necesarias para realizar las operaciones hacia base de datos.
 * En concreto a la tabla de Persona y Usuario junto con sus respectivos procedimientos almacenados.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 21/Febrero/2020
 */

const mysqlConnection = require('../../config/database');

function insertarUsuario(usuarioModel) {
    const { siRol, ttTipoUsuario, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at } = usuarioModel;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[0, null, null, siRol, ttTipoUsuario, vContrasenia, vOficina, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function validarUsuario(usuarioModel) {
    const { vContrasenia, vEmail } = usuarioModel;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[4, null, null, null, null, vContrasenia, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

module.exports.insertar = async function (usuarioModel, response) {
	const result = await insertarUsuario(usuarioModel);
	return result;
}

module.exports.validar = async function (usuarioModel, response) {
	const result = await validarUsuario(usuarioModel);
	return result;
}
