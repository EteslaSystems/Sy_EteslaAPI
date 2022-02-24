const Panel = require('../Entities/Panel');
const Log = require('../../config/logConfig');

//Propuesta
module.exports.getPanelesPropuesta = async function(potenciaNecesaria){
	try{
		let _paneles = await this.consulta();
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
		await Log.generateLog({ tipo: 'Error', contenido: 'getPanelesPropuesta(): ' +error });
		throw 'Error PanelController getPanelesPropuesta: '+error;
	}
}

//CRUD
module.exports.insertar = async function(datas){
	return await Panel.insertarBD(datas);
}

module.exports.eliminar = async function(datas){
	return await Panel.eliminarBD(datas);
}

module.exports.editar = async function(datas){
	return await Panel.editarBD(datas);
}

module.exports.consulta = async function(){
	return await Panel.consultaBD;
}

module.exports.buscar = async function(datas){
	return await Panel.buscarBD(datas);
}