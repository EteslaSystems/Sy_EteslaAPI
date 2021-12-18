const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

class Estructura{
	async insertarBD(datas){
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
			await Log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / INVERSORES.' + error.message });
			throw 'Error Estructura.insertarBD(): '+error;
		}
	}

	async eliminarBD(datas){
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
			await Log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / ESTRUCTURAS.' + error.message });
			throw 'Error Estructura.eliminar(): '+error;
		}
	}

	async consultaBD(){
		try{
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null], (error, rows) => {
					if (error) {
						const response = {
							status: false,
							message: error
						}
		
						reject (response);
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
			await Log.generateLog({ tipo: 'Error', contenido: 'consultaBD / INVERSORES.' + error.message });
			throw 'Error Estructura.consultaBD(): '+error;
		}
	}

	async buscarBD(datas){
		try{
			const { id } = datas;

			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Estructuras(?, ?, ?, ?, ?, ?, ?, ?)', [4, id, null, null, null, null, null, null], (error, rows) => {
					if (error){
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
			await Log.generateLog({ tipo: 'Error', contenido: 'buscarBD / INVERSORES.' + error.message });
			throw 'Error Estructura.buscarBD(): '+error;
		}
	}
}
module.exports = Estructura;