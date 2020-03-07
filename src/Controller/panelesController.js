/**
 * En este archivo se definen las funciones necesarias para realizar las operaciones hacia base de datos.
 * En concreto a la tabla de Paneles y su procedimiento almacenado.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 2.0.0
 * @date: 20/Febrero/2020
 */

const mysqlConnection = require('../../config/database');

function insertarPanel(panelModel) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, created_at } = panelModel;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, created_at, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function eliminarPanel(panelModel) {
	const { idPanel, deleted_at } = panelModel;
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Panel(?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[1, idPanel, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function actualizarPanel(panelModel) {
	const { idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, updated_at } = panelModel;
  	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Panel(?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[2, idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, null, updated_at, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(true);
			}
		});
  	});
}

function consultarPaneles() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Panel(?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[3, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

function consultarPanelesPorId(idPanel) {
  	return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_Panel(?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[4, idPanel, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				resolve(error);
			} else {
				resolve(rows[0]);
			}
		});
  	});
}

module.exports.insertar = async function (panelModel, response) {
	const result = await insertarPanel(panelModel);
	return result;
}

module.exports.eliminar = async function (panelModel, response) {
	const result = await eliminarPanel(panelModel);
	return result;
}

module.exports.actualizar = async function (panelModel, response) {
	const result = await actualizarPanel(panelModel);
	return result;
}

module.exports.consultar = async function (response) {
	const result = await consultarPaneles();
	return result;
}

module.exports.consultarPorId = async function (idPanel, response) {
    const result = await consultarPanelesPorId(idPanel);
	return result;
}
