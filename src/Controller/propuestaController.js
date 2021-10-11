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
	try{
		let daysOfExpire = await configFile.getArrayOfConfigFile();
		daysOfExpire = parseInt(daysOfExpire.propuesta_cotizacion.tiempoExpiracion);
		let Propuesta = typeof objPropuesta.propuesta === "object" ? objPropuesta.propuesta : JSON.parse(objPropuesta.propuesta); //Formating to Array
		Propuesta = Array.isArray(Propuesta) === true ? Propuesta[0] : Propuesta; //Formating
		let dataToSave = { panel: null, inversor: null, estructura: null, cliente: null, usuario: null, tipoCotizacion: null, consumoPromedioKw: null, /*(Bimestral o anual)*/ tarifa: null,  potenciaPropuesta: null, nuevoConsumoBimestralKw: null, nuevoConsumoAnualKw: null, descuento: null, porcentajePropuesta: null, totalSinIvaMXN: null, totalConIvaMXN: null, totalSinIvaUSD: null, totalConIvaUSD: null, statusProjectFV: 0, daysOfExpire: daysOfExpire /* Dias de expiracion */ };

		/* #region Formating Data to Save PROPUESTA */
		dataToSave.cliente = { 
			id: Propuesta.cliente.idCliente,
			nombre: Propuesta.cliente.vNombrePersona + ' ' + Propuesta.cliente.vPrimerApellido + ' ' + Propuesta.cliente.vSegundoApellido
		} || null;

		dataToSave.usuario = {
			id: Propuesta.vendedor.idUsuario,
			nombre: Propuesta.vendedor.vNombrePersona + ' ' + Propuesta.vendedor.vPrimerApellido + ' ' + Propuesta.vendedor.vSegundoApellido
		} || null;

		dataToSave.tipoCotizacion = Propuesta.tipoCotizacion || null;
		dataToSave.totalSinIvaMXN = Propuesta.totales.precioMXNSinIVA || null;
		dataToSave.totalConIvaMXN = Propuesta.totales.precioMXNConIVA || null;
		dataToSave.totalSinIvaUSD = Propuesta.totales.precio || null;
		dataToSave.totalConIvaUSD = Propuesta.totales.precioMasIVA || null;

		if(Propuesta.tipoCotizacion === "bajaTension" || Propuesta.tipoCotizacion === "mediaTension" || Propuesta.tipoCotizacion === "CombinacionCotizacion"){
			dataToSave.consumoPromedioKw = parseFloat(Propuesta.promedioConsumosBimestrales) || null;
			dataToSave.tarifa = { vieja: Propuesta.power.old_dac_o_nodac, nueva: Propuesta.power.new_dac_o_nodac };
			dataToSave.descuento = Propuesta.descuento || null;
			dataToSave.porcentajePropuesta = Propuesta.power.porcentajePotencia || null;
		}

		if(Propuesta.paneles){
			dataToSave.panel = {
				modelo: Propuesta.paneles.nombre || Propuesta.paneles.vNombreMaterialFot,
				cantidad: Propuesta.paneles.noModulos
			} || null;

			dataToSave.potenciaPropuesta = Propuesta.paneles.potenciaReal;
		}
		
		if(Propuesta.estructura._estructuras != null){
			dataToSave.estructura = {
				marca: Propuesta.estructura._estructuras.vMarca,
				cantidad: Propuesta.estructura.cantidad
			} || null;
		}

		if(Propuesta.inversores){
			dataToSave.inversor = {
				modelo: Propuesta.inversores.vNombreMaterialFot,
				cantidad: Propuesta.inversores.numeroDeInversores
			} || null;
		}

		if(Propuesta.power){
			if(Propuesta.tipoCotizacion === "bajaTension" || Propuesta.tipCotizacion === "bajaTension" && Propuesta.tipoCotizacion === "CombinacionCotizacion"){ //BajaTension || BajaTension c/Commbinaciones
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
		try{
			//Se valida que la propuesta tenga -Agregados-
			if(Propuesta.agregados._agregados != null){
				let idPropuesta = respuesta.idPropuesta;

				let _agregados = Propuesta.agregados._agregados;

				//Iterar _agregados
				for(i in _agregados)
				{
					let data = { idPropuesta: idPropuesta, cantidad: _agregados[i].cantidadAgregado, agregado: _agregados[i].nombreAgregado, costo: parseFloat(_agregados[i].precioAgregado) };
					respuesta = await agregados.insertar(data);

					if(respuesta.status === false){
						throw 'Algo salio mal al intentar insertar -Agregados- en la BD.\n'+respuesta.message;
					}
				}
			}
		}
		catch(error){
			throw error;
		}
		/*#endregion*/

		return respuesta;
	}
	catch(error){
		throw 'Algo salio mal al intenetar guardar la propuesta:\n'+error;
	}
}

/*----------------------------------------------------------------*/

function insertarBD(datas){
	/* Cliente */
	let idCliente = datas.cliente.id;
	let nombreCliente = datas.cliente.nombre;
	/* Consumos - Cliente */
	let consumoPromedio = datas.consumoPromedioKw || null; //Bimestral
	let actualTarifa = datas.tarifa != null ? datas.tarifa.vieja : null;
	let nuevaTarifa = datas.tarifa != null ? datas.tarifa.nueva : null;
	/* Vendedor */
	let idVendedor = datas.usuario.id;
	let usuario = datas.usuario.nombre;
	/* Panel */
	let modeloPanel = null;
	let cantidadPanel = null;
	/* Inversor */
	let modeloInversor = null;
	let cantidadInversor = null;
	/* Estructura */
	let marcaEstructura = null;
	let cantidadEstructura = null;
	/* Energia */
	let nuevoConsumoMensual = datas.nuevoConsumoMensual || null;
	let nuevoConsumoBimestral = datas.nuevoConsumoBimestralKw || null;
	let nuevoConsumoAnual = datas.nuevoConsumoAnualKw || null;
	/* Propuesta */
	let tipoCotizacion = datas.tipoCotizacion;
	let descuento = datas.descuento || null;
	let potenciaPropuesta = datas.potenciaPropuesta || null; //PotenciaPropuesta
	let porcentajeDePropuesta = datas.porcentajePropuesta || null;
	let totalSinIvaMXN = datas.totalSinIvaMXN;
	let totalConIvaMXN = datas.totalConIvaMXN;
	let totalSinIvaUSD = datas.totalSinIvaUSD;
	let totalConIvaUSD = datas.totalConIvaUSD;

	//Validation != null
	if(datas.panel){
		modeloPanel = datas.panel.modelo;
		cantidadPanel = datas.panel.cantidad;
	}

	if(datas.inversor){
		modeloInversor = datas.inversor.modelo;
		cantidadInversor = datas.inversor.cantidad;
	}

	if(datas.estructura){
		marcaEstructura = datas.estructura.marca;
		cantidadEstructura = datas.estructura.cantidad;
	}

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, idCliente, idVendedor, nombreCliente, actualTarifa, consumoPromedio, usuario, modeloPanel, cantidadPanel, modeloInversor, cantidadInversor, marcaEstructura, cantidadEstructura, potenciaPropuesta, nuevoConsumoMensual, nuevoConsumoBimestral, nuevoConsumoAnual, nuevaTarifa, tipoCotizacion, descuento, porcentajeDePropuesta, totalSinIvaMXN, totalConIvaMXN, totalSinIvaUSD, totalConIvaUSD, 0, 30]/* 15 = Dias de expiracion */, (error, rows) => {
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
	const { id } = data;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
