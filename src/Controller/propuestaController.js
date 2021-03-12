/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				LH420
- @date: 				18/08/2020
*/
/*#region CRUD*/
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');

async function savePropuesta(objPropuesta/*Obj*/){
	let daysOfExpire = await configFile.getArrayOfConfigFile();
	daysOfExpire = parseInt(daysOfExpire.propuesta_cotizacion.tiempoExpiracion);
	let Propuesta = JSON.parse(objPropuesta.propuesta); //Formating to Array
	Propuesta = Propuesta[0]; //Formating to Object

	///Formating Data to Save PROPUESTA
	let dataToSave = {
		idPanel: Propuesta.paneles.idPanel, 
		idInversor: Propuesta.inversores.id, 
		idCliente: objPropuesta.idCliente, 
		idUsuario: objPropuesta.idVendedor, 
		tipoCotizacion: Propuesta.tipoCotizacion, ////Ver como se puede traer este dato [En 'Viaticos' esta la respuesta]
		promedioKw: parseFloat(Propuesta.promedioConsumosBimestrales), /*(Bimestral o anual)*/
		tarifa: Propuesta.tarifa, ////Ver como se puede traer este dato [En 'Viaticos' esta la respuesta]
		cantidadPaneles: Propuesta.paneles.noModulos, 
		cantidadInversores: parseInt(Propuesta.inversores.numeroDeInversores), 
		potenciaPropuesta: Propuesta.paneles.potenciaReal, 
		nuevoConsumoBimestralKw: Propuesta.power.nuevosConsumos.promedioConsumoBimestral, //Estos son promedios
		nuevoConsumoAnualKw: Propuesta.power.nuevosConsumos.nuevoConsumoAnual, //Estos son promedios
		descuento: Propuesta.descuento, 
		porcentajePropuesta: Propuesta.power.porcentajePotencia,
		subtotal: Propuesta.totales.precio, //$-USD 
		total: Propuesta.totales.precioMasIVAMXN, //$-MXN 
		statusProjectFV: 0, 
		daysOfExpire: 30
	};

	let respuesta = await insertarBD(dataToSave);

	return respuesta;
}

/*----------------------------------------------------------------*/

function insertarBD(datas){
	const { idPanel, idInversor, idCliente, idUsuario, tipoCotizacion, promedioKw,  tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, nuevoConsumoBimestralKw, nuevoConsumoAnualKw,  descuento, porcentajePropuesta, subtotal, total, statusProjectFV, daysOfExpire } = datas;
	
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, idCliente, null, idPanel, idInversor, idUsuario, tipoCotizacion, promedioKw, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, nuevoConsumoBimestralKw, nuevoConsumoAnualKw, descuento, porcentajePropuesta, subtotal, total, statusProjectFV, daysOfExpire], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject (response);
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
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

				reject(response);
			}
		});
  	});
}

function editarBD(datas) {
	const { idPanel, idInversor, promedioKw, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, nuevoConsumoBimestralKw, nuevoConsumoAnualKw, descuento, porcentajePropuesta, subtotal, total } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, null, idPanel, idInversor, null, null, promedioKw, tarifa, cantidadPaneles, cantidadInversores, potenciaPropuesta, nuevoConsumoBimestralKw, nuevoConsumoAnualKw, descuento, porcentajePropuesta, subtotal, total, null, null], (error, rows) => {
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

				reject(response);
			}
		});
  	});
}

function consultaBD() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarBD(idPropuesta){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

module.exports.guardar = async function (datas) {
	const result = await savePropuesta(datas);
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
