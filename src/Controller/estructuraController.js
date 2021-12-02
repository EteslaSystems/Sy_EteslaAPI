const mysqlConnection = require('../../config/database');

function insertaBD(datas){
	const { vNombreMaterialFot, vMarca, fPrecio, vGarantia, vOrigen, imgRuta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPrecio, vGarantia, vOrigen, imgRuta], (error, rows) => {
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

function eliminarBD(data){
	const { id } = data;

	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [1, id, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
			} else {
				const response = {
					status: true,
					message: "El registro se ha borrado con éxito."
				}

				resolve(response);
			}
		});
  	});
}

function consultaBD(){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject (response);
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

function buscarBD(datas){
	const { id } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [4, id, null, null, null, null, null, null], (error, rows) => {
			if (error){
				const response = {
					status: false,
					message: error
				}

				reject(response);
			} else {
				const response = {
					status: true,
					message: rows[0][0]
				}

				resolve(response);
			}
		});
  	});
}

module.exports.insertar = async function(data){
	const result = await insertaBD(data);
	return result;
}

module.exports.eliminar = async function(data){
	const result = await eliminarBD(data);
	return result;
}

module.exports.leer = async function(){
	const result = await consultaBD();
	return result;
}

module.exports.buscar = async function(data){
	const result = await buscarBD(data);
	return result;
}