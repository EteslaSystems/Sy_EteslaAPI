const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

//CRUD
module.exports.eliminarBD = async function(idViatico){
	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Viaticos(?, ?, ?, ?, ?, ?)', [1, null, null, null, null, null], (error, rows) => {
				if(error){
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else{
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.eliminarBD(): ' +error.message });
		throw 'Error Viaticos.eliminarBD(): '+error;
	}
}

module.exports.consultaBD = async function(){
	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Viaticos(?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null], (error, rows) => {
				if(error){
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else{
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.consultaBD(): ' +error.message });
		throw 'Error Viaticos.consultaBD(): '+error;
	}
}

module.exports.editarBD = async function(datas){
	const { idViatico, cTipoCotizacion, vConcepto, fCosto, cMoneda } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Viaticos(?, ?, ?, ?, ?, ?)', [4, idViatico, cTipoCotizacion, vConcepto, fCosto, cMoneda], (error, rows) => {
				if(error){
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else{
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.editarBD(): ' +error.message });
		throw 'Error Viaticos.editarBD(): '+error;
	}
}