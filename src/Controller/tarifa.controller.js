const Tarifa = require('../Entities/Tarifa');

//CRUD
module.exports.consulta = async function(){
    return await Tarifa.consultaBD();
}

module.exports.buscar = async function(datas){
    return await Tarifa.buscarBD(datas);
}