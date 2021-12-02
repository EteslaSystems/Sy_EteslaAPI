const mysqlConnection = require('../../config/database');

function insertarBD(datas){
	const { idPropuesta, cantidad, agregado/*nombreAgregado*/, costo } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [0, null, idPropuesta, cantidad, agregado, costo], (error, rows) => {
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

function eliminarBD(idAgregado){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [1, idAgregado, null, null, null, null], (error, rows) => {
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

function consultaBD() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null], (error, rows) => {
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

module.exports = {
    insertarBD,
    eliminarBD,
    consultaBD
};