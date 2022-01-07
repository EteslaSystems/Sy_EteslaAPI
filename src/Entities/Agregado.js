const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

module.exports.insertarBD = async function(datas){
	const { idPropuesta, cantidad, agregado/*nombreAgregado*/, costo } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [0, null, idPropuesta, cantidad, agregado, costo], (error, rows) => {
				if (error){
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else {
					const response = {
						status: true,
						message: "El registro se ha guardado con éxito."
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Agregado.insertarBD(): ' +error.message });
        throw 'Error Agregado.insertarBD(): '+error;
	}
}

module.exports.eliminarBD = async function(datas){
	const { idAgregado } = datas;

	try{
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
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Agregado.eliminarBD(): ' +error.message });
        throw 'Error Agregado.eliminarBD(): '+error;
	}
}