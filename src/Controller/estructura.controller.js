const Estructura = require('../Entities/Estructura');
const Log = require('../../config/logConfig');

//@main
module.exports.obtenerEstructurasCotizacion = async function(data){
    try{
        let { marca, cantidad } = data;

        let EstructuraCollection =  await this.consultar();
        EstructuraCollection = EstructuraCollection.filter(Estructura => { Estructura.vMarca === marca });

        //Agregar :propiedades: -cantidad- && -costoTotal- al objetco [ Estructuras ]
        Object.assign(EstructuraCollection,{ cantidad, costoTotal });

        EstructuraCollection.cantidad = cantidad;
        EstructuraCollection.costoTotal = cantidad * Estructura.fPrecio;

        return EstructuraCollection;
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'EstructuraController.obtenerEstructurasCotizacion(): ' +error });
        throw 'Error EstructuraController.obtenerEstructurasCotizacion: '+error;
    }
}

/*#region CRUD*/
module.exports.insertar = async function(datas){
    return await Estructura.insertarBD(datas);
}

module.exports.eliminar = async function(datas){
    return await Estructura.eliminarBD(datas);
}

module.exports.buscar = async function(idInversor){
    return await Estructura.buscarBD(idInversor);
}

// module.exports.editar = async function(datas){
//     return await Estructura.editarBD(datas);
// }

module.exports.consultar = async function(){
    return await Estructura.consultaBD();
}
/*#endregion*/