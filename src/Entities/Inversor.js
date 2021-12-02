const mysqlConnection = require('../../config/database');

function insertarBD(datas) {
	let { vTipoInversor, vNombreMaterialFot, vInversor1, vInversor2, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta } = datas;

	if(vTipoInversor === 'Combinacion'){
		vNombreMaterialFot = vInversor1 + '+' + vInversor2;
	}

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta], (error, rows) => {
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
	const { idInversor } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function editarBD(datas) {
	const { idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta], (error, rows) => {
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

function consultaBD() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarBD(datas) {
	const { idInversor } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarTipoInversor(datas){
	const { vTipoInversor } = datas;

	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, vTipoInversor, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarInversorPorNombre(datas){
	const { vNombreMaterialFot } = datas;

	return new Promise ((resolve, reject) => {
		mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, vNombreMaterialFot, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
    editarBD,
    consultaBD,
    buscarBD,
    buscarTipoInversor,
    buscarInversorPorNombre
};