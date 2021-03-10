/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				LH420
- @date: 				18/08/2020
*/
/*#region CRUD*/
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');

var daysOfExpire = await configFile.getArrayOfConfigFile();
daysOfExpire = parseInt(daysOfExpire.propuesta_cotizacion.tiempoExpiracion);

function insertarBD(datas){
	const { idPanel, idInversor, idCliente, idUsuario, tipoCotizacion, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, generacionPaneles, nuevoConsumoCFE, descuento, subtotal, precioConIVA, total, statusProjectFV } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, idCliente, null, idPanel, idInversor, idUsuario, tipoCotizacion, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, generacionPaneles, nuevoConsumoCFE, descuento, subtotal, precioConIVA, total, 0, daysOfExpire], (error, rows) => {
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

function eliminarBD(idPropuesta){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function editarBD(datas) {
	const { idPanel, idInversor, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, generacionPaneles, nuevoConsumoCFE, porcentajeDescuento, subtotal, precioConIVA, total } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, idPropuesta, idPanel, idInversor, idUsuario, null, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, generacionPaneles, nuevoConsumoCFE, porcentajeDescuento, subtotal, precioConIVA, total, null, null], (error, rows) => {
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

function consultaBD() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarBD(idPropuesta){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

module.exports.buscar = async function (id) {
	const result = await buscarBD(id);
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
/*#endregion*/
