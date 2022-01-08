let Estructura = require('../Entities/Estructura');

//CRUD
module.exports.insertar = async function(datas){
    const result = await estructura.insertarBD(datas);
    return result;
}

module.exports.eliminar = async function(datas){
    const result = await estructura.eliminarBD(datas);
    return result;
}

module.exports.buscar = async function(idInversor){
    const result = await estructura.buscarBD(idInversor);
    return result;
}

// async editar(datas){
//     const result = await estructura.editarBD(datas);
//     return result;
// }

module.exports.consultar = async function(){
    const result = await estructura.consultaBD();
    return result;
}