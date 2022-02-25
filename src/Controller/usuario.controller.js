const Usuario = require('../Entities/Usuario');
const Log = require('../../config/logConfig');

/*#region CRUD*/
module.exports.insertar = async function(datas){
	return await Usuario.insertarBD(datas);
}

module.exports.eliminar = async function(datas){
	return await Usuario.eliminarBD(datas);
}

module.exports.editar = async function(datas){
	return await Usuario.editarBD(datas);
}

module.exports.consultar = async function(){
	return await Usuario.consultaBD();
}

module.exports.consultarId = async function(datas){
	return await Usuario.consultaIdBD(datas);
}
/*#endregion*/

module.exports.validar = async function(datas){
	return await Usuario.validarBD(datas);
}

module.exports.verificarEmail = async function(datas){
	return await Usuario.verificarEmailDB(datas);
}

module.exports.recuperarPassword = async function(datas){
	return await Usuario.recuperarPasswordDB(datas);
}