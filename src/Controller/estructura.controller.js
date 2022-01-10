let Estructura = require('../Entities/Estructura');
const Log = require('../../config/logConfig');

//@
module.exports.obtenerEstructurasCotizacion = async function(data){
    try{
        let { marca, cantidad } = data;

        let Estructura =  await this.consultar();
        Estructura = Estructura.filter(estructura => { estructura.vMarca === marca });

        //Agregar :propiedades: -cantidad- && -costoTotal- al objetco [ Estructuras ]
        Object.assign(Estructura,{ cantidad, costoTotal });

        Estructura.cantidad = cantidad;
        Estructura.costoTotal = cantidad * Estructura.fPrecio;
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'EstructuraController.obtenerEstructurasCotizacion(): ' +error });
        throw 'Error EstructuraController.obtenerEstructurasCotizacion: '+error;
    }
}

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