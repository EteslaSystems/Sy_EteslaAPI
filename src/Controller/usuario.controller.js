const Usuario = require('./Entities/Usuario');
const Log = require('../../config/logConfig');

/* #region CRUD */
module.exports.insertar = async function(datas){
	const result = await Usuario.insertarBD(datas);
	return result;
}

module.exports.eliminar = async function(datas){
	const result = await Usuario.eliminarBD(datas);
	return result;
}

module.exports.editar = async function(datas){
	const result = await Usuario.editarBD(datas);
	return result;
}

module.exports.consultar = async function(){
	const result = await Usuario.consultaBD();
	return result;
}

module.exports.consultarId = async function(datas){
	const result = await Usuario.consultaIdBD(datas);
	return result;
}
/* #endregion */

module.exports.validar = async function(datas){
	const result = await Usuario.validarBD(datas);
	return result;
}

module.exports.verificarEmail = async function(datas){
	const result = await Usuario.verificarEmailDB(datas);
	return result;
}

module.exports.recuperarPassword = async function(datas){
	const result = await Usuario.recuperarPasswordDB(datas);
	return result;
}