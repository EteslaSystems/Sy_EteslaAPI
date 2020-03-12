/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias / Jesus Daniel Carrera Falcón
- @date: 				10/03/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD(datas) {
    const { id_Usuario, id_Cliente } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Vendedor_Cliente(?, ?, ?, ?)', [0, null, id_Usuario, id_Cliente], (error, rows) => {
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

function actualizarBD(datas) {
	const { id_Usuario, id_Cliente } = datas;
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

module.exports.insertar = async function (datas, response) {
	const result = await insertarBD(datas);

	return result;
}

module.exports.actualizar = async function (datas, response) {
	const result = await actualizarBD(datas);

	return result;
}
