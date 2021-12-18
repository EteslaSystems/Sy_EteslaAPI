const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

class Agregado{
	async insertarBD(datas){
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

	async eliminarBD(idAgregado){
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

	async consultaBD(){
		try{
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Agregados(?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null], (error, rows) => {
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
							message: rows[0]
						}
		
						resolve(response);
					}
				});
			});
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Agregado.consultaBD(): ' +error.message });
            throw 'Error Agregado.consultaBD(): '+error;
		}
	}
}

module.exports = Agregado;