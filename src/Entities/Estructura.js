const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

module.exports.insertarBD = async function(datas){
	try{
		const { vNombreMaterialFot, vMarca, fPrecio, vGarantia, vOrigen, imgRuta } = datas;

		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPrecio, vGarantia, vOrigen, imgRuta], (error, rows) => {
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Estructura.insertarBD()' + error.message });
		throw 'Error Estructura.insertarBD(): '+error;
	}
}

module.exports.eliminarBD = async function(datas){
	try{
		const { id } = data;

		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [1, id, null, null, null, null, null, null], (error, rows) => {
				if (error) {
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else {
					const response = {
						status: true,
						message: "El registro se ha borrado con éxito."
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Estructura.eliminar()' + error.message });
		throw 'Error Estructura.eliminar(): '+error;
	}
}

module.exports.consultaBD = async function(){
	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null], (error, rows) => {
				if (error) {
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else{
					const response = {
						status: true,
						message: rows[0]
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Estructura.consultaBD()' + error.message });
		throw 'Error Estructura.consultaBD(): '+error;
	}
}

module.exports.buscarBD = async function(datas){
	try{
		const { id } = datas;

		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [4, id, null, null, null, null, null, null], (error, rows) => {
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
						message: rows[0][0]
					}
  
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Estructura.buscarBD()' + error.message });
		throw 'Error Estructura.buscarBD(): '+error;
	}
}