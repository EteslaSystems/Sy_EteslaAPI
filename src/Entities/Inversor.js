const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

class Inversor{
	async insertarBD(datas) {
		try{
			let { vTipoInversor, vNombreMaterialFot, vInversor1, vInversor2, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta } = datas;
	
			if(vTipoInversor === 'Combinacion'){
				vNombreMaterialFot = vInversor1 + '+' + vInversor2;
			}
			
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta], (error, rows) => {
					if(error){
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
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.insertarBD(): ' +error.message });
			throw 'Error Inversor insertarBD: '+error;
		}
	}
	
	async eliminarBD(datas) {
		try{
			const { idInversor } = datas;
	
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
					if(error){
						const response = {
							status: false,
							message: error
						}
		
						reject(response);
					} 
					else {
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
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.eliminarBD(): ' +error.message });
			throw 'Error InversorController eliminarBD: '+error;
		}
	}
	
	async editarBD(datas) {
		try{
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
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.editarBD(): ' +error.message });
			throw 'Error Inversor editarBD: '+error;
		}
	}
	
	async consultaBD() {
		try{
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
							message: rows[0]
						}
		
						resolve(response);
					}
				});
			});
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.consultaBD(): ' +error.message });
			throw 'Error Inversor consultaBD: '+error;
		}
	}
	
	async buscarBD(datas) {
		try{
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
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.buscarBD(): ' +error.message });
			throw 'Error Inversor buscarBD: '+error;
		}
	}
	
	async buscarTipoInversor(datas){
		try{
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
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.buscarTipoInversor(): ' +error.message });
			throw 'Error Inversor buscarTipoInversor: '+error;
		}
	}
	
	async buscarInversorPorNombre(datas){
		try{
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
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Inversor.buscarInversorPorNombre(): ' +error.message });
			throw 'Error Inversor buscarInversorPorNombre: '+error;
		}
	}
}

module.exports = Inversor;
