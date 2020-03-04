const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at, null, null], (error, rows) => {
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

function eliminarBD(datas) {
	const { idInversor, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
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
	const { idInversor, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, null, updated_at, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

// const mysqlConnection = require('../Config/database');

// module.exports = {
// 	read() {
// 		return new Promise((resolve, reject) => {
// 			mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null], 
// 			(error, rows) => {
// 				if (error) {
// 					reject (error);
// 				} else {
// 					resolve(rows[0]);
// 				}
// 			});
// 		});
// 	},
// 	updated() {
// 		return new Promise((resolve, reject) => {
// 			mysqlConnection.query('CALL CRUDEmpresa(?, ?, ?, ?, ?, ?, ?, ?)', [2, id, vEmpresa, vEmail, vContrasenia, null, updated_at, null],
// 			(error) => {
// 				if (error) {
// 					reject (error);
// 				} else {
// 					resolve();
// 				}
// 			});
// 		});
// 	},
// 	delete() {
// 		return new Promise((resolve, reject) => {
// 			mysqlConnection.query('CALL CRUDEmpresa(?, ?, ?, ?, ?, ?, ?, ?)', [1, id, null, null, null, null, null, deleted_at],
// 			(error) => {
// 				if (error) {
// 					reject (error);
// 				} else {
// 					resolve();
// 				}
// 			});
// 		});
// 	},
// 	create() {
// 		return new Promise((resolve, reject) => {
// 			mysqlConnection.query('CALL CRUDEmpresa(?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vEmpresa, vEmail, vContrasenia, created_at, null, null],
// 			(error) => {
// 				if (error) {
// 					reject (error);
// 				} else {
// 					resolve();
// 				}
// 			});
// 		});
// 	}
// }