/*#region LH420*/
/*
- @description: 		Funciones para la cotizacion de media tension
- @author: 				LH420
- @date: 				01/04/2020
*/
const Panel = require('../Entities/Panel');

//CRUD
module.exports.insertar = async function(datas){
	const result = await Panel.insertarBD(datas);
	return result;
};

module.exports.eliminar = async function(datas){
	const result = await Panel.eliminarBD(datas);
	return result;
};

module.exports.editar = async function(datas){
	const result = await Panel.editarBD(datas);
	return result;
};

module.exports.consulta = async function(){
	const result = await Panel.consultaBD;
	return result;
};

module.exports.buscar = async function(datas){
	const result = await Panel.buscarBD(datas);
	return result;
}

//Propuesta
module.exports = async function getPanelesPropuesta(potenciaNecesaria){
	try{
		let _paneles = await Panel.consultaBD();
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
		console.log(error);
	}
}
/*#endregion*/

