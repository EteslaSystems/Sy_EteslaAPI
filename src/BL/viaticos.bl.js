const ViaticoController = require('../Controller/viaticos.controller');
const Log = require('../../config/logConfig');

/*#region CRUD*/
module.exports.eliminar = async function(data){
    return await ViaticoController.eliminar(data);
}

module.exports.editar = async function(data){
    return await ViaticoController.editar(data);
}

module.exports.consulta = async function(){
    return await ViaticoController.consulta;
}
/*#endregion*/