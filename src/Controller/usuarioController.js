/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 			Yael Ramirez Herrerias / Jesus Daniel Carrera Falcón
- @date: 				10/03/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
	const { siRol, ttTipoUsuario, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vEmail } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, null, siRol, ttTipoUsuario, vContrasenia, vOficina, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, null, vEmail, null, null, null], (error, rows) => {
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

function eliminarBD (datas) {
	const { idPersona} = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}
				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha eliminado con éxito."
				}
				resolve(response);
			}
		});
  	});
}

function editarBD (datas) {
	const { idPersona, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido} = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, null, null, null, vContrasenia, vOficina, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, null, null, null, null, null, null], (error, rows) => {
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

function consultaBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function consultaIdBD (datas) {
	const { idPersona } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, null, null, null, null, idPersona, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function recuperarPasswordDB(datas) {
	const { vEmail } = datas;

	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, null, null, null, null, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
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

module.exports.insertar = async function (datas, response) {
	const result = await insertarBD(datas);

	return result;
}

module.exports.eliminar = async function (datas, response) {
	const result = await eliminarBD(datas);

	return result;
}

module.exports.editar = async function (datas, response) {
	const result = await editarBD(datas);

	return result;
}

module.exports.consultar = async function (response) {
	const result = await consultaBD();

	return result;
}

module.exports.consultarId = async function (datas, response) {
	const result = await consultaIdBD(datas);

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

module.exports.recuperarPassword = async function (datas, response) {
	const result = await recuperarPasswordDB(datas);

	return result;
}
