/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias / Jesus Daniel Carrera Falcón
- @date: 				10/03/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
    const { siRol, ttTipoUsuario, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, null, siRol, ttTipoUsuario, vContrasenia, vOficina, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha guardado con éxito."
				}

				resolve(response);
			}
		});
  	});
}

function validarBD (datas) {
    const { vContrasenia, vEmail } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, null, null, null, vContrasenia, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: rows[0]
				}

				resolve(response);
			}
		});
  	});
}

function verificarEmailDB(datas) {
	const { vEmail } = datas;

	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [7, null, null, null, null, null, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}
				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El usuario se ha verificado con éxito."
				}
				resolve(response);
			}
		});
	});
}

module.exports.insertar = async function (datas, response) {
	const result = await insertarBD(datas);

	return result;
}

module.exports.validar = async function (datas, response) {
	const result = await validarBD(datas);

	return result;
}

module.exports.verificarEmail = async function (datas, response) {
	const result = await verificarEmailDB(datas);

	return result;
}
