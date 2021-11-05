/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/
const mysqlConnection = require('../../config/database');

function insertarBD(datas){
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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
	const { idPanel } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idPanel, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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
	const { idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarBD (datas) {
	const { idPanel } = datas;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idPanel, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
/*#region LH420*/
/*
- @description: 		Funciones para la cotizacion de media tension
- @author: 				LH420
- @date: 				01/04/2020
*/

async function numberOfModuls(potenciaNecesaria){
	try{
		let _arrayTodosPaneles = await getAllPanelsArray();
		let _arrayObjectsNoOfModuls = getArrayObjectsNoOfModuls(_arrayTodosPaneles,potenciaNecesaria);

		return _arrayObjectsNoOfModuls;
	}
	catch(error){
		console.log(error);
	}
}

async function getAllPanelsArray(){
	consultaPaneles = await consultaBD();
	consultaPaneles = consultaPaneles.message;
	return consultaPaneles;
}

function getArrayObjectsNoOfModuls(arrayAllOfPanels, energiaRequerida){
	let objNoDeModulosPorPotenciaDelPanel = {};
	arrayNoDeModulosPorPotenciaDelPanel = [];

	for(let i = 0; i < arrayAllOfPanels.length; i++)
	{
		let noModulos = Math.round(energiaRequerida / arrayAllOfPanels[i].fPotencia);
		let potenciaReal = Math.round((arrayAllOfPanels[i].fPotencia * noModulos) * 100) / 100; 
		

		objNoDeModulosPorPotenciaDelPanel = {
			idPanel: arrayAllOfPanels[i].idPanel,
			nombre: arrayAllOfPanels[i].vNombreMaterialFot,
			marca: arrayAllOfPanels[i].vMarca,
			fPotencia: parseFloat(arrayAllOfPanels[i].fPotencia),
			origen: arrayAllOfPanels[i].vOrigen,
			garantia: arrayAllOfPanels[i].vGarantia,
			potenciaReal: Math.round((potenciaReal / 1000) * 100) / 100, // wtts ===> kwp
			noModulos: noModulos,
			fPrecio: parseFloat(arrayAllOfPanels[i].fPrecio),
			costoTotal: 0,
			imgRuta: arrayAllOfPanels[i].imgRuta
		};

		arrayNoDeModulosPorPotenciaDelPanel[i] = objNoDeModulosPorPotenciaDelPanel;
	}
	return arrayNoDeModulosPorPotenciaDelPanel;
}

module.exports.numeroDePaneles = async function (potenciaNecesaria, irradiacion, eficiencia, topeProduccion){
	const result = await numberOfModuls(potenciaNecesaria, irradiacion, eficiencia, topeProduccion);

	return result;
}
/*#endregion*/

module.exports.insertar = async function (datas) {
	const result = await insertarBD(datas);
	return result;
}

module.exports.eliminar = async function (datas) {
	const result = await eliminarBD(datas);
	return result;
}

module.exports.buscar = async function (datas) {
	const result = await buscarBD(datas);
	return result;
}

module.exports.editar = async function (datas) {
	const result = await editarBD(datas);

	return result;
}

module.exports.consultar = async function(){
	const result = await consultaBD();
	return result;
}