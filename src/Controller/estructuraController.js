const mysqlConnection = require('../../config/database');

function consultaBD(){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null], (error, rows) => {
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
	const { idEstructura } = datas;
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?)', [4, idEstructura, null, null, null, null], (error, rows) => {
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

module.exports.leer = async function(){
	const result = await consultaBD();
	return result;
}

module.exports.buscar = async function(data){
	const result = await buscarBD(datas);
	return result;
}