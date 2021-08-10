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
	let dataToSave = { panel: null, inversor: null, estructura: null, cliente: null, usuario: null, tipoCotizacion: null, consumoPromedioKw: null, /*(Bimestral o anual)*/ tarifa: null,  potenciaPropuesta: null, nuevoConsumoBimestralKw: null, nuevoConsumoAnualKw: null, descuento: null, porcentajePropuesta: null, totalSinIvaMXN: null, totalConIvaMXN: null, totalSinIvaUSD: null, totalConIvaUSD: null, statusProjectFV: 0, daysOfExpire: 15 /* Dias de expiracion */ };

	/* #region Formating Data to Save PROPUESTA */
	dataToSave.cliente = { 
		id: Propuesta.cliente.idPersona,
		nombre: Propuesta.cliente.vNombrePersona + ' ' + Propuesta.cliente.vPrimerApellido + ' ' + Propuesta.cliente.vSegundoApellido
	} || null;

	dataToSave.usuario = {
		id: Propuesta.vendedor.idPersona,
		nombre: Propuesta.vendedor.vNombrePersona + ' ' + Propuesta.vendedor.vPrimerApellido + ' ' + Propuesta.vendedor.vSegundoApellido
	} || null;

	dataToSave.tipoCotizacion = Propuesta.tipoCotizacion || null;
	dataToSave.totalSinIvaMXN = Propuesta.totales.precioMXNSinIVA || null;
	dataToSave.totalConIvaMXN = Propuesta.totales.precioMXNConIVA || null;
	dataToSave.totalSinIvaUSD = Propuesta.totales.precio || null;
	dataToSave.totalConIvaUSD = Propuesta.totales.precioMasIVA || null;

	if(Propuesta.tipoCotizacion === "bajaTension" || Propuesta.tipoCotizacion === "mediaTension"){
		dataToSave.consumoPromedioKw = parseFloat(Propuesta.promedioConsumosBimestrales) || null;
		dataToSave.tarifa = { vieja: Propuesta.power.old_dac_o_nodac, nueva: Propuesta.power.new_dac_o_nodac };
		dataToSave.descuento = Propuesta.descuento || null;
		dataToSave.porcentajePropuesta = Propuesta.power.porcentajePotencia || null;
	}

	if(Propuesta.paneles){
		dataToSave.panel = {
			modelo: Propuesta.paneles.nombre,
			cantidad: Propuesta.paneles.noModulos
		} || null;

		dataToSave.potenciaPropuesta = Propuesta.paneles.potenciaReal;
	}
	
	if(Propuesta.estructura){
		dataToSave.estructura = {
			marca: Propuesta.estructura.vMarca,
			cantidad: Propuesta.paneles.noModulos
		} || null;
	}

	if(Propuesta.inversores){
		dataToSave.inversor = {
			modelo: Propuesta.inversores.vNombreMaterialFot,
			cantidad: Propuesta.inversores.numeroDeInversores
		} || null;
	}

	if(Propuesta.power){
		if(Propuesta.tipoCotizacion === "bajaTension"){ //BajaTension
			dataToSave.nuevoConsumoBimestralKw = Propuesta.power.nuevosConsumos.promedioNuevoConsumoBimestral || null;
			dataToSave.nuevoConsumoAnualKw = Propuesta.power.nuevosConsumos.nuevoConsumoAnual || null;
		}
		else{ //MediaTension
			dataToSave.nuevoConsumoBimestralKw = Propuesta.power.generacion.promedioGeneracionBimestral || null;
			dataToSave.nuevoConsumoAnualKw = Propuesta.power.generacion.produccionAnualKwh || null;
		}
	}
	/* #endregion */

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
	/* Cliente */
	let idCliente = datas.cliente.id;
	let nombreCliente = datas.cliente.nombre;
	/* Consumos - Cliente */
	let consumoPromedio = datas.consumoPromedioKw; //Bimestral
	let actualTarifa = datas.tarifa.vieja;
	/* Vendedor */
	let idVendedor = datas.usuario.id;
	let usuario = datas.usuario.nombre;
	/* Panel */
	let modeloPanel = datas.panel.modelo;
	let cantidadPanel = datas.panel.cantidad;
	/* Inversor */
	let modeloInversor = datas.inversor.modelo;
	let cantidadInversor = datas.inversor.cantidad;
	/* Estructura */
	let marcaEstructura = datas.estructura.marca;
	let cantidadEstructura = datas.estructura.cantidad;
	/* Energia */
	let nuevoConsumoMensual = datas.nuevoConsumoMensual || null;
	let nuevoConsumoBimestral = datas.nuevoConsumoBimestralKw || null;
	let nuevoConsumoAnual = datas.nuevoConsumoAnualKw || null;
	let nuevaTarifa = datas.tarifa.nueva;
	/* Propuesta */
	let tipoCotizacion = datas.tipoCotizacion;
	let descuento = datas.descuento;
	let potenciaPropuesta = datas.potenciaPropuesta; //PotenciaPropuesta
	let porcentajeDePropuesta = datas.porcentajePropuesta;
	let totalSinIvaMXN = datas.totalSinIvaMXN;
	let totalConIvaMXN = datas.totalConIvaMXN;
	let totalSinIvaUSD = datas.totalSinIvaUSD;
	let totalConIvaUSD = datas.totalConIvaUSD;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, idCliente, idVendedor, nombreCliente, actualTarifa, consumoPromedio, usuario, modeloPanel, cantidadPanel, modeloInversor, cantidadInversor, marcaEstructura, cantidadEstructura, potenciaPropuesta, nuevoConsumoMensual, nuevoConsumoBimestral, nuevoConsumoAnual, nuevaTarifa, tipoCotizacion, descuento, porcentajeDePropuesta, totalSinIvaMXN, totalConIvaMXN, totalSinIvaUSD, totalConIvaUSD, 0, 15]/* 15 = Dias de expiracion */, (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject (response);
			} 
			else {
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
