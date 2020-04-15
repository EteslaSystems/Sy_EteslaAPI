/*
- @description: 		Funciones para calcular los materiales que no son paneles o inversores, 
					pero que igual van incluidos en una instalación (estructuras, etc)
- @author: 			LH420 & Jesús Daniel Carrera Falcón
- @date: 				03/04/2020
*/

const mysqlConnection = require('../../config/database');

/*#region Paneles*/
var costoEstructura = 45; //Este dato tiene que ser dinamico y extraido de una tabla de BD (Nota: agregar tabla "otros_materiales" a la Bd)

function getCostPanelsStructures(numberOfPanels){
    structuresCost = numberOfPanels * costoEstructura;
    return structuresCost;
}
/*#endregion*/
/*#region Inversores*/
/*#endregion*/

module.exports.obtenerCostoDeEstructuras = function (numeroDePaneles){
    const result = getCostPanelsStructures(numeroDePaneles);
    return result;
}

/* #region Categoría Otros Materiales */
function insertarCategoriaMaterialesBD (datas) {
	const { nombreCategoOtrosMats, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_CategOtrosMateriales(?, ?, ?, ?, ?, ?)', [0, null, nombreCategoOtrosMats, created_at, null, null], (error, rows) => {
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

function eliminarCategoriaMaterialesBD(datas) {
	const { idCategOtrosMateriales, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_CategOtrosMateriales(?, ?, ?, ?, ?, ?)', [1, idCategOtrosMateriales, null, null, null, deleted_at], (error, rows) => {
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

function editarCategoriaMaterialesBD (datas) {
	const { idCategOtrosMateriales, nombreCategoOtrosMats, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_CategOtrosMateriales(?, ?, ?, ?, ?, ?)', [2, idCategOtrosMateriales, nombreCategoOtrosMats, null, updated_at, null], (error, rows) => {
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

function consultaCategoriaMaterialesBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_CategOtrosMateriales(?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null], (error, rows) => {
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

function buscarCategoriaMaterialesBD (datas) {
	const { idCategOtrosMateriales } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_CategOtrosMateriales(?, ?, ?, ?, ?, ?)', [4, idCategOtrosMateriales, null, null, null, null], (error, rows) => {
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

module.exports.insertarCategoriaMateriales = async function (datas, response) {
	const result = await insertarCategoriaMaterialesBD(datas);

	return result;
}

module.exports.eliminarCategoriaMateriales = async function (datas, response) {
	const result = await eliminarCategoriaMaterialesBD(datas);

	return result;
}

module.exports.editarCategoriaMateriales = async function (datas, response) {
	const result = await editarCategoriaMaterialesBD(datas);

	return result;
}

module.exports.consultaCategoriaMateriales = async function (response) {
	const result = await consultaCategoriaMaterialesBD();

	return result;
}

module.exports.buscarCategoriaMateriales = async function (datas, response) {
	const result = await buscarCategoriaMaterialesBD(datas);

	return result;
}
/* #endregion */

/* #region Otros Materiales */
function insertarOtroMaterialBD (datas) {
	const { id_CategOtrosMats, partida, unidad, precioUnitario, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMateriales(?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, id_CategOtrosMats, partida, unidad, precioUnitario, created_at, null, null], (error, rows) => {
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

function eliminarOtroMaterialBD(datas) {
	const { idOtrosMateriales, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMateriales(?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idOtrosMateriales, null, null, null, null, null, null, deleted_at], (error, rows) => {
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

function editarOtroMaterialBD (datas) {
	const { idOtrosMateriales, id_CategOtrosMats, partida, unidad, precioUnitario, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMateriales(?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idOtrosMateriales, id_CategOtrosMats, partida, unidad, precioUnitario, null, updated_at, null], (error, rows) => {
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

function consultaOtroMaterialBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMateriales(?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarOtroMaterialBD (datas) {
	const { idOtrosMateriales } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMateriales(?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idOtrosMateriales, null, null, null, null, null, null, null], (error, rows) => {
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

module.exports.insertarOtroMaterial = async function (datas, response) {
	const result = await insertarOtroMaterialBD(datas);

	return result;
}

module.exports.eliminarOtroMaterial = async function (datas, response) {
	const result = await eliminarOtroMaterialBD(datas);

	return result;
}

module.exports.editarOtroMaterial = async function (datas, response) {
	const result = await editarOtroMaterialBD(datas);

	return result;
}

module.exports.consultaOtroMaterial = async function (response) {
	const result = await consultaOtroMaterialBD();

	return result;
}

module.exports.buscarOtroMaterial = async function (datas, response) {
	const result = await buscarOtroMaterialBD(datas);

	return result;
}
/* #endregion */

/* #region Otros Materiales Propuesta */
function insertarMaterialesPropuestaBD (datas) {
	const { id_Propuesta, id_CategOtrosMateriales } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMatsPropuesta(?, ?, ?, ?)', [0, null, id_Propuesta, id_CategOtrosMateriales], (error, rows) => {
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

function eliminarMaterialesPropuestaBD(datas) {
	const { idOtrosMatsPropuesta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMatsPropuesta(?, ?, ?, ?)', [1, idOtrosMatsPropuesta, null, null], (error, rows) => {
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

function editarMaterialesPropuestaBD (datas) {
	const { idOtrosMatsPropuesta, id_Propuesta, id_CategOtrosMateriales } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMatsPropuesta(?, ?, ?, ?)', [2, idOtrosMatsPropuesta, id_Propuesta, id_CategOtrosMateriales], (error, rows) => {
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

function consultaMaterialesPropuestaBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMatsPropuesta(?, ?, ?, ?)', [3, null, null, null], (error, rows) => {
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

function buscarMaterialesPropuestaBD (datas) {
	const { idOtrosMatsPropuesta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_OtrosMatsPropuesta(?, ?, ?, ?)', [4, idOtrosMatsPropuesta, null, null], (error, rows) => {
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

module.exports.insertarMaterialesPropuesta = async function (datas, response) {
	const result = await insertarMaterialesPropuestaBD(datas);

	return result;
}

module.exports.eliminarMaterialesPropuesta = async function (datas, response) {
	const result = await eliminarMaterialesPropuestaBD(datas);

	return result;
}

module.exports.editarMaterialesPropuesta = async function (datas, response) {
	const result = await editarMaterialesPropuestaBD(datas);

	return result;
}

module.exports.consultaMaterialesPropuesta = async function (response) {
	const result = await consultaMaterialesPropuestaBD();

	return result;
}

module.exports.buscarMaterialesPropuesta = async function (datas, response) {
	const result = await buscarMaterialesPropuestaBD(datas);

	return result;
}
/* #endregion */