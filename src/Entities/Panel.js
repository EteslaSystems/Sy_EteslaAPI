const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

class Panel{
	async insertarBD(datas){
		const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta } = datas;
		
		try{
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta], (error, rows) => {
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
							message: "El registro se ha guardado con éxito."
						}
		
						resolve(response);
					}
				});
			});
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Panel.insertarBD(): ' +error.message });
			throw 'Error PanelController insertarBD: '+error;
		}
	}
	
	async eliminarBD(datas) {
		try{
			const { idPanel } = datas;
	
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idPanel, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
							message: "El registro se ha eliminado con éxito."
						}
		
						resolve(response);
					}
				});
			});
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Panel.eliminarBD(): ' +error.message });
			throw 'Error PanelController eliminarBD(): '+error;
		}
	}
	
	async editarBD(datas){
		try{
			const { idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta } = datas;
	
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vGarantia, vOrigen, fISC, fVOC, fVMP, imgRuta], (error, rows) => {
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
							message: "El registro se ha editado con éxito."
						}
		
						resolve(response);
					}
				});
			});
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'Panel.editarBD(): ' +error.message });
			throw 'Error PanelController editarBD: '+error;
		}
	}
	
	async consultaBD(){
		try{
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
			await Log.generateLog({ tipo: 'Error', contenido: 'Panel.consultaBD(): ' +error.message });
			throw 'Error PanelController consultaBD: '+error;
		}
	}
	
	async buscarBD(datas){
		try{
			const { idPanel } = datas;
		
			return new Promise((resolve, reject) => {
				mysqlConnection.query('CALL SP_Panel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idPanel, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
			await Log.generateLog({ tipo: 'Error', contenido: 'Panel.buscarBD(): ' +error.message });
			throw 'Error PanelController buscarBD: '+error;
		}
	}
}

module.exports = Panel;