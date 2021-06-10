/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/
const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, fVOC, fVMP, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, fVOC, fVMP, created_at, null, null], (error, rows) => {
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

function eliminarBD(datas) {
	const { idPanel, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idPanel, null, null, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
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
	const { idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, fVOC, fVMP, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, fVOC, fVMP, null, updated_at, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarBD (datas) {
	const { idPanel } = datas;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idPanel, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
/*#region LH420*/
/*
- @description: 		Funciones para la cotizacion de media tension
- @author: 				LH420
- @date: 				01/04/2020
*/
const otrosMateriales = require('./otrosMaterialesController');

var objNoDeModulosPorPotenciaDelPanel = {};

async function numberOfModuls(potenciaNecesaria){
	/* potenciaRequeridaEnKwp = await getSystemPowerInKwp(promedioConsumoMensual, irradiation, efficiency, topeProduccion);
	var _potenciaRequeridaEnW = await getSystemPowerInWatts(potenciaRequeridaEnKwp); */
	let _arrayTodosPaneles = await getAllPanelsArray();
	_arrayObjectsNoOfModuls = await getArrayObjectsNoOfModuls(_arrayTodosPaneles,potenciaNecesaria);

	return _arrayObjectsNoOfModuls;
}

async function getAllPanelsArray(){
	consultaPaneles = await consultaBD();
	consultaPaneles = consultaPaneles.message;
	return consultaPaneles;
}

async function getArrayObjectsNoOfModuls(arrayAllOfPanels, energiaRequerida){
	arrayNoDeModulosPorPotenciaDelPanel = [];

	for(var i = 0; i < arrayAllOfPanels.length; i++)
	{
		idPanel = arrayAllOfPanels[i].idPanel;
		_nombre = arrayAllOfPanels[i].vNombreMaterialFot;
		_marca = arrayAllOfPanels[i].vMarca;
		_precio = parseFloat(arrayAllOfPanels[i].fPrecio);
		origen = arrayAllOfPanels[i].vOrigen;
		garantia = arrayAllOfPanels[i].vGarantia;
		potenciaDelPanel = parseFloat(arrayAllOfPanels[i].fPotencia);
		NoOfModuls = Math.ceil(energiaRequerida / potenciaDelPanel);
		structuresCost = await otrosMateriales.obtenerCostoDeEstructuras(NoOfModuls);
		_potenciaReal = Math.round(((potenciaDelPanel * NoOfModuls) / 1000) * 100) / 100; //KWp - wtts ===> kwp

		objNoDeModulosPorPotenciaDelPanel = {
			idPanel: idPanel,
			nombre: _nombre,
			marca: _marca,
			potencia: potenciaDelPanel,
			origen: origen,
			garantia: garantia,
			potenciaReal: _potenciaReal,
			noModulos: NoOfModuls,
			precioPorPanel: _precio,
			costoDeEstructuras: structuresCost,
			costoTotal: 0
		};

		arrayNoDeModulosPorPotenciaDelPanel[i] = objNoDeModulosPorPotenciaDelPanel;
	}
	return arrayNoDeModulosPorPotenciaDelPanel;
}

async function getSystemPowerInWatts(powerRequired){
	potenciaRequeridaEnW = Math.round((powerRequired/1000) * 100)/100;
	return potenciaRequeridaEnW;
}

async function getSystemPowerInKwp(monthlyAvarageConsumption, irradiation, efficiency, topeProduccion){
	potenciaRequeridaEnKwp = Math.round((monthlyAvarageConsumption / (irradiation * efficiency * 30/*dias*/)) * 100) / 100;
	potenciaRequeridaEnKwp = potenciaRequeridaEnKwp >= topeProduccion ? topeProduccion : potenciaRequeridaEnKwp;
	return potenciaRequeridaEnKwp;
}

module.exports.numeroDePaneles = async function (potenciaNecesaria, irradiacion, eficiencia, topeProduccion){
	const result = await numberOfModuls(potenciaNecesaria, irradiacion, eficiencia, topeProduccion);

	return result;
}
/*#endregion*/

module.exports.insertar = async function (datas, response) {
	const result = await insertarBD(datas);

	return result;
}

module.exports.eliminar = async function (datas, response) {
	const result = await eliminarBD(datas);

	return result;
}

module.exports.buscar = async function (datas) {
	const result = await buscarBD(datas);

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