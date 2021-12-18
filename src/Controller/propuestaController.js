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
		let Propuesta = typeof objPropuesta.propuesta === "object" ? objPropuesta.propuesta : JSON.parse(objPropuesta.propuesta); //Formating to Array
		Propuesta = Array.isArray(Propuesta) === true ? Propuesta[0] : Propuesta; //Formating
		let dataToSave = { panel: null, inversor: null, estructura: null, cliente: null, usuario: null, tipoCotizacion: null, consumoPromedioKw: null, /*(Bimestral o anual)*/ tarifa: null,  potenciaPropuesta: null, nuevoConsumoBimestralKw: null, nuevoConsumoAnualKw: null, descuento: null, porcentajePropuesta: null, totalSinIvaMXN: null, totalConIvaMXN: null, totalSinIvaUSD: null, totalConIvaUSD: null, statusProjectFV: 0, expiracion: 0 /* Dias de expiracion */ };

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

		dataToSave.expiracion = Propuesta.expiracion || null;

		if(Propuesta.tipoCotizacion != "individual"){
			dataToSave.consumoPromedioKw = parseFloat(Propuesta.promedioConsumosBimestrales) || null;
			dataToSave.tarifa = { vieja: Propuesta.power.old_dac_o_nodac, nueva: Propuesta.power.new_dac_o_nodac };
			dataToSave.porcentajePropuesta = Propuesta.power.porcentajePotencia || null;
		}

		dataToSave.descuento = Propuesta.descuento || null;

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
		console.log(error);
		throw 'Algo salio mal al intenetar guardar la propuesta:\n'+error;
	}
}

/*----------------------------------------------------------------*/


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
/*#endregion*/
