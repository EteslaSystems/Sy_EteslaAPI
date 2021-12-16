/*
- @description: 		Funciones para la cotizacion de media tension
- @author: 				LH420
- @date: 				01/04/2020
*/
const Panel = require('../Entities/Panel');
const Log = require('../../config/logConfig');

class PanelController{
	//Instancia
	panel = new Panel();

	//Propuesta
	async getPanelesPropuesta(potenciaNecesaria){
		try{
			let _paneles = await panel.consultaBD();
			let _result = [];
	
			_paneles.find(Panel => {
				let numeroDeModulos = Math.round(potenciaNecesaria / Panel.fPotencia);
				let potenciaReal = Math.round((Panel.fPotencia * numeroDeModulos) * 100) / 100;
	
				//Agregar propiedades al objeto [Panel]
				Object.assign(Panel, {
					potenciaReal: potenciaReal / 1000, /*[PotenciaInstalada] wtts => kwp */
					numeroDeModulos: numeroDeModulos
				});
	
				_result.push(Panel);
			});
	
			return _result;
		}
		catch(error){
			Log.generateLog({ tipo: 'Error', contenido: 'getPanelesPropuesta(): ' +error });
			throw 'Error PanelController getPanelesPropuesta: '+error;
		}
	}

	//CRUD
	async insertar(datas){
		const result = await panel.insertarBD(datas);
		return result;
	}

	async eliminar(datas){
		const result = await panel.eliminarBD(datas);
		return result;
	}

	async editar(datas){
		const result = await panel.editarBD(datas);
		return result;
	}

	async consulta(){
		const result = await panel.consultaBD;
		return result;
	}

	async buscar(datas){
		const result = await panel.buscarBD(datas);
		return result;
	}
}

module.exports = PanelController;