const log = require('../../config/logConfig');

/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				LH420
- @date: 				18/08/2020
*/
/*#region CRUD*/
const mysqlConnection = require('../../config/database');
const agregados = require('../Controller/agregadosController');

const Notificacion = require('../Controller/notificationController');

async function savePropuesta(objPropuesta){
	let _agregados = null;

	try{
		let Propuesta = typeof objPropuesta.propuesta === "object" ? objPropuesta.propuesta : JSON.parse(objPropuesta.propuesta); //Formating to Array
		Propuesta = Array.isArray(Propuesta) === true ? Propuesta[0] : Propuesta; //Formating

		//Se encapsulan el array de [agregados]
		if(Propuesta.agregados._agregados != null){
			_agregados = Propuesta.agregados._agregados;
		}

		//Quitar la paja de la data, para que esta sea factible para guardar
		Propuesta = filtrarData(Propuesta);

		let respuesta = await insertarBD(Propuesta);
		
		/*#region Agregados*/
		try{
			//Se valida que la propuesta tenga -Agregados-
			if(_agregados != null){
				let idPropuesta = respuesta.idPropuesta;

				//Iterar _agregados
				for(let Agregado of _agregados)
				{
					let data = { 
						idPropuesta: idPropuesta, 
						cantidad: Agregado.cantidadAgregado, 
						agregado: Agregado.nombreAgregado, 
						costo: parseFloat(Agregado.precioUnitarioMXN) 
					};

					respuesta = await agregados.insertar(data);

					if(respuesta.status === false){
						throw 'Algo salio mal al intentar insertar -Agregados- en la BD.\n'+respuesta.message;
					}
				}
			}

			//Notificar
			// await Notificacion.notificar({ message: { cotizacion: Propuesta, estado: "Guardada" } });

			return respuesta;
		}
		catch(error){
			throw new Error(error);
		}
		/*#endregion*/
	}
	catch(error){
		console.log(error);
		await log.generateLog({ tipo: 'Error', contenido: 'Propuesta / savePropuesta ' + error.message });
		throw new Error('Algo salio mal al intenetar guardar la propuesta:\n'+error);
	}
}

function filtrarData(Propuesta){
	let dataFiltrada = {
		panel: null, 
		inversor: null, 
		estructura: null,
		agregadosCostoTotal: null,
		cliente: null, 
		usuario: null, 
		tipoCombinacion: null, 
		tipoCotizacion: null, 
		consumoPromedioKw: null, /*(Bimestral o anual)*/ 
		tarifa: null,  
		potenciaPropuesta: null, 
		nuevoConsumoBimestralKw: null, 
		nuevoConsumoAnualKw: null, 
		descuento: null, 
		porcentajePropuesta: null, 
		totalSinIvaMXN: null, 
		totalConIvaMXN: null, 
		totalSinIvaUSD: null, 
		totalConIvaUSD: null, 
		statusProjectFV: 0, 
		expiracion: 0 /* Dias de expiracion */ 
	};
	
	try{
		dataFiltrada.cliente = { 
			id: Propuesta.cliente.idCliente,
			nombre: Propuesta.cliente.vNombrePersona + ' ' + Propuesta.cliente.vPrimerApellido + ' ' + Propuesta.cliente.vSegundoApellido
		} || null;

		dataFiltrada.usuario = {
			id: Propuesta.vendedor.idUsuario,
			nombre: Propuesta.vendedor.vNombrePersona + ' ' + Propuesta.vendedor.vPrimerApellido + ' ' + Propuesta.vendedor.vSegundoApellido
		} || null;

		//*CotizacionSencilla* o *CotizacionCombinacion* 
		if(Propuesta.combinacion){
			dataFiltrada.tipoCombinacion = Propuesta.tipoCombinacion;
		}

		//
		dataFiltrada.tipoCotizacion = Propuesta.tipoCotizacion || null;
		dataFiltrada.totalSinIvaMXN = Propuesta.totales.precioMXNSinIVA || null;
		dataFiltrada.totalConIvaMXN = Propuesta.totales.precioMXNConIVA || null;
		dataFiltrada.totalSinIvaUSD = Propuesta.totales.precio || null;
		dataFiltrada.totalConIvaUSD = Propuesta.totales.precioMasIVA || null;
		dataFiltrada.expiracion = Propuesta.expiracion || null;

		if(Propuesta.tipoCotizacion != "individual"){
			dataFiltrada.consumoPromedioKw = parseFloat(Propuesta.promedioConsumosBimestrales) || null;
			dataFiltrada.tarifa = { vieja: Propuesta.power.old_dac_o_nodac, nueva: Propuesta.power.new_dac_o_nodac };
			dataFiltrada.porcentajePropuesta = Propuesta.power.porcentajePotencia || null;
		}

		dataFiltrada.descuento = Propuesta.descuento || null;

		if(Propuesta.paneles){
			dataFiltrada.panel = {
				modelo: Propuesta.paneles.nombre || Propuesta.paneles.vNombreMaterialFot,
				cantidad: Propuesta.paneles.noModulos
			} || null;

			dataFiltrada.potenciaPropuesta = Propuesta.paneles.potenciaReal;
		}
		
		if(Propuesta.estructura._estructuras != null){
			dataFiltrada.estructura = {
				marca: Propuesta.estructura._estructuras.vMarca,
				cantidad: Propuesta.estructura.cantidad
			} || null;
		}

		if(Propuesta.agregados._agregados != null){
			dataFiltrada.agregadosCostoTotal = Propuesta.agregados.costoTotal;
		}

		if(Propuesta.inversores){
			dataFiltrada.inversor = {
				modelo: Propuesta.inversores.vNombreMaterialFot,
				cantidad: Propuesta.inversores.numeroDeInversores
			} || null;
		}

		if(Propuesta.power){
			if(Propuesta.tipoCotizacion === "bajaTension" || Propuesta.tipCotizacion === "bajaTension" && Propuesta.tipoCotizacion === "Combinacion"){ //BajaTension || BajaTension c/Commbinaciones
				dataFiltrada.nuevoConsumoBimestralKw = Propuesta.power.nuevosConsumos.promedioNuevoConsumoBimestral || null;
				dataFiltrada.nuevoConsumoAnualKw = Propuesta.power.nuevosConsumos.nuevoConsumoAnual || null;
			}
			else{ //MediaTension
				dataFiltrada.nuevoConsumoBimestralKw = Propuesta.power.generacion.promedioGeneracionBimestral || null;
				dataFiltrada.nuevoConsumoAnualKw = Propuesta.power.generacion.produccionAnualKwh || null;
			}
		}

		return dataFiltrada;
	}
	catch(error){
		console.log(error);
	}
}

/*-------------------------[ CRUD ]-------------------------------*/

function insertarBD(datas){
	try{
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
		let tipoCombinacion = datas.tipoCombinacion || null;
		let tipoCotizacion = datas.tipoCotizacion || null;
		let descuento = datas.descuento.porcentaje || null;
		let potenciaPropuesta = datas.potenciaPropuesta || null; //PotenciaPropuesta
		let porcentajeDePropuesta = datas.porcentajePropuesta || null;
		let totalSinIvaMXN = datas.totalSinIvaMXN;
		let totalConIvaMXN = datas.totalConIvaMXN;
		let totalSinIvaUSD = datas.totalSinIvaUSD;
		let totalConIvaUSD = datas.totalConIvaUSD;
		let diasExpiracion = datas.expiracion.cantidad;

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
			mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, idCliente, idVendedor, nombreCliente, actualTarifa, consumoPromedio, usuario, modeloPanel, cantidadPanel, modeloInversor, cantidadInversor, marcaEstructura, cantidadEstructura, potenciaPropuesta, nuevoConsumoMensual, nuevoConsumoBimestral, nuevoConsumoAnual, nuevaTarifa, tipoCotizacion, tipoCombinacion, descuento, porcentajeDePropuesta, totalSinIvaMXN, totalConIvaMXN, totalSinIvaUSD, totalConIvaUSD, 0, diasExpiracion], (error, rows) => {
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
	catch(error){
		console.log(error);
		throw error;
	}
}

function eliminarBD(data){
	const { idPropuesta } = data;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject (response);
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
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
			} 
			else {
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
    	mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

/*-------------------------[ EXPORTS ]-------------------------------*/

module.exports.guardar = async function (datas) {
	const result = await savePropuesta(datas);
	return result;
}

module.exports.eliminar = async function ({ idPropuesta }) {
	const result = await eliminarBD({ idPropuesta });
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

module.exports.filtrarData = function(data){
	const result = filtrarData(data);
	return result;
}
/*#endregion*/
