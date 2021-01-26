/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias / Jesus Daniel Carrera Falcón
- @date: 				10/03/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD(datas) {
    const { fConsumo, vNombrePersona, vPrimerApellido, bTienePropuesta, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, vCalle, vMunicipio, vEstado } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, fConsumo, bTienePropuesta, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, null, null, null, vCalle, vMunicipio, vEstado], (error, rows) => {
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

function eliminarBD(datas) {
	const { idPersona, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, null, idPersona, null, null, null, null, null, null, null, null, deleted_at, null, null, null, null], (error, rows) => {
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
	const { fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, updated_at, vCalle, vMunicipio, vEstado } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, fConsumo, null, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, null, updated_at, null, null, vCalle, vMunicipio, vEstado], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha editado con éxito."
				}

				resolve(response);
			}
		});
  	});
}

function consultaBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, null, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

				reject(response);
			}
		});
  	});
}

function consultaUserBD (datas) {
	const { idUsuario } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, idUsuario, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function destruirBD(datas) {
	const { idCliente } = datas;

  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, idCliente, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
			} else {
				const response = {
					status: true,
					message: "Error al insertar los datos."
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

module.exports.consultarUser = async function (datas, response) {
	const result = await consultaUserBD(datas);

	return result;
}

module.exports.destruir = async function (datas, response) {
	const result = await destruirBD(datas);

	return result;
}