/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				LH420
- @date: 				18/08/2020
*/
/*#region CRUD*/
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');
const agregados = require('../Controller/agregadosController');

async function savePropuesta(objPropuesta/*Obj*/){
	let daysOfExpire = await configFile.getArrayOfConfigFile();
	daysOfExpire = parseInt(daysOfExpire.propuesta_cotizacion.tiempoExpiracion);
	let Propuesta = JSON.parse(objPropuesta.propuesta); //Formating to Array
	Propuesta = Propuesta[0]; //Formating to Object
	let dataToSave = { idPanel: null, idInversor: null, idCliente: null, idUsuario: null, tipoCotizacion: null, promedioKw: null, /*(Bimestral o anual)*/ tarifa: null, cantidadPaneles: null, cantidadInversores: null, potenciaPropuesta: null, nuevoConsumoBimestralKw: null, nuevoConsumoAnualKw: null, descuento: null, porcentajePropuesta: null, subtotal: null, total: null, statusProjectFV: 0, daysOfExpire: 30 };

	///Formating Data to Save PROPUESTA
	dataToSave.idCliente = objPropuesta.idCliente || null;
	dataToSave.idUsuario = objPropuesta.idVendedor || null;
	dataToSave.tipoCotizacion = Propuesta.tipoCotizacion || null;
	dataToSave.subtotal = Propuesta.totales.precio || null;
	dataToSave.total = Propuesta.totales.precioMasIVAMXN || null;

	if(Propuesta.tipoCotizacion === "bajaTension" || Propuesta.tipoCotizacion === "mediaTension"){
		dataToSave.promedioKw = parseFloat(Propuesta.promedioConsumosBimestrales) || null;
		dataToSave.tarifa = Propuesta.tarifa || null;
		dataToSave.descuento = Propuesta.descuento || null;
		dataToSave.porcentajePropuesta = Propuesta.power.porcentajePotencia || null;
	}

	if(Propuesta.paneles){
		dataToSave.idPanel = Propuesta.paneles.idPanel || null;
		dataToSave.cantidadPaneles = Propuesta.paneles.noModulos || null;
		dataToSave.potenciaPropuesta = Propuesta.paneles.potenciaReal || null;
	}
	
	if(Propuesta.inversores){
		dataToSave.idInversor = Propuesta.inversores.id || null;
		dataToSave.cantidadInversores = parseInt(Propuesta.inversores.numeroDeInversores) || null;
	}

	if(Propuesta.power){
		if(Propuesta.tipoCotizacion === "bajaTension"){
			dataToSave.nuevoConsumoBimestralKw = Propuesta.power.nuevosConsumos.promedioConsumoBimestral || null;
			dataToSave.nuevoConsumoAnualKw = Propuesta.power.nuevosConsumos.nuevoConsumoAnual || null;
		}
		else{
			dataToSave.nuevoConsumoBimestralKw = Propuesta.power.generacion.promedioGeneracionBimestral || null;
			dataToSave.nuevoConsumoAnualKw = Propuesta.power.generacion.produccionAnualKwh || null;
		}
	}

	let respuesta = await insertarBD(dataToSave);
	
	/*#region Agregados*/
	if(Propuesta.tipoCotizacion === "mediaTension"){
		let idPropuesta = respuesta.idPropuesta;

		//Validar si hay agregados
		if(Propuesta.agregados._agregados != null){
			let _agregados = Propuesta.agregados._agregados;

			//Iterar _agregados
			for(i in _agregados)
			{
				let data = { idPropuesta: idPropuesta, cantidad: _agregados[i].cantidadAgregado, agregado: _agregados[i].nombreAgregado, costo: parseFloat(_agregados[i].precioAgregado) };
				respuesta = await agregados.insertar(data);

				if(respuesta.status === false){
					break;
				}
			}
		}
	}
	/*#endregion*/

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
					idPropuesta: rows[0][0].xIdPropuesta,
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

function consultaBD(data) {
	const { idCliente } = data;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, idCliente, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

module.exports.consultar = async function (idCliente) {
	let result = await consultaBD(idCliente);
	result = result.message;
	return result;
}
/*#endregion*/
