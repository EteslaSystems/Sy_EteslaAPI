/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				LH420
- @date: 				10/03/2021
*/
/*#region CRUD*/
const mysqlConnection = require('../../config/database');

function insertarBD(datas){
	const { idPropuesta, cantidad, agregado/*nombreAgregado*/, costo } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [0, null, idPropuesta, cantidad, agregado, costo], (error, rows) => {
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

function eliminarBD(idAgregado){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [1, idAgregado, null, null, null, null], (error, rows) => {
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

// function editarBD(datas) {
// 	const { idPanel, idInversor, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, generacionPaneles, nuevoConsumoCFE, porcentajeDescuento, subtotal, precioConIVA, total } = datas;

//   	return new Promise((resolve, reject) => {
//     	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, idPropuesta, idPanel, idInversor, idUsuario, null, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, generacionPaneles, nuevoConsumoCFE, porcentajeDescuento, subtotal, precioConIVA, total, null, null], (error, rows) => {
// 			if (error) {
// 				const response = {
// 					status: false,
// 					message: error
// 				}

// 				resolve (response);
// 			} else {
// 				const response = {
// 					status: true,
// 					message: "El registro se ha editado con éxito."
// 				}

// 				resolve(response);
// 			}
// 		});
//   	});
// }

function consultaBD() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null], (error, rows) => {
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

module.exports.eliminar = async function (id) {
	const result = await eliminarBD(id);
	return result;
}

module.exports.consultar = async function (response) {
	const result = await consultaBD();
	return result;
}
/*#endregion*/