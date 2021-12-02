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

                mysqlConnection.destroy();

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

                mysqlConnection.destroy();

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

                mysqlConnection.destroy();

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

                mysqlConnection.destroy();

				resolve(response);
			}
		});
  	});
}

module.exports = { 
    insertarBD,
    eliminarBD,
    editarBD,
    consultaBD,
    buscarBD
};