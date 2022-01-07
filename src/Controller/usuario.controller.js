const Usuario = require('./Entities/Usuario');
const Log = require('../../config/logConfig');

/* #region CRUD */
module.exports.insertar = async function(datas){
	const result = await usuario.insertarBD(datas);
	return result;
}

module.exports.eliminar = async function(datas){
	const result = await usuario.eliminarBD(datas);
	return result;
}

module.exports.editar = async function(datas){
	const result = await usuario.editarBD(datas);
	return result;
}

module.exports.consultar = async function(){
	const result = await usuario.consultaBD();
	return result;
}

module.exports.consultarId = async function(datas){
	const result = await usuario.consultaIdBD(datas);
	return result;
}
/* #endregion */

module.exports.validar = async function(datas){
	const result = await usuario.validarBD(datas);
	return result;
}

module.exports.verificarEmail = async function(datas){
	const result = await usuario.verificarEmailDB(datas);
	return result;
}

module.exports.recuperarPassword = async function(datas){
	const result = await usuario.recuperarPasswordDB(datas);
	return result;
}