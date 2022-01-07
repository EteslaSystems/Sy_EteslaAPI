const Cliente = require('./Entities/Cliente');
const Log = require('../../config/logConfig');

// [ CRUD ]
module.exports.insertar = async function(datas){
    const result = await Cliente.insertarBD(datas);
    return result;
}

module.exports.eliminar = async function (datas){
    const result = await Cliente.eliminarBD(datas);
    return result;	
}

module.exports.editar = async function(datas){
    const result = await Cliente.editarBD(datas);
    return result;	
}

module.exports.consulta = async function(){
    const result = await Cliente.consultaBD();
    return result;	
}

module.exports.consultaId = async function(datas) {
    const result = await Cliente.consultaIdBD(datas);
    return result;	
}

module.exports.consultaUser = async function(datas) {
	const result = await Cliente.consultaUserBD(datas);
    return result;
}

module.exports.consultarNombre = async function(datas){
	const result = await Cliente.consultaPorNombre(datas);
    return result;
}