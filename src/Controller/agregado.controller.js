const Cotizacion = require('../Entities/Cotizacion');

//@extends
module.exports.obtenerCostoTotalAgregados = async function(_agregados, precioDolar){
    /* #NOTA: Retornar el total de todos los agregados en USD */
    let totalUSD = 0, totalMXN = 0;

    try{
        _agregados.map(Agregado => {
            //Se agrega el subtotal de ese agregado pero en USD
            Object.assign(Agregado,{
                totalUSD: Agregado.totalMXN / precioDolar
            });

            totalUSD += Agregado.totalUSD;
            totalMXN += Agregado.totalMXN;
        });

        return { _agregados, totalUSD, totalMXN };
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerCostoTotalAgregados(): ' +error });
        throw 'Error Viaticos.obtenerCostoTotalAgregados(): '+error;
    }
}

/* #region CRUD */
//@extends
module.exports.insertar = async function(datas){
    const result = await Cotizacion.insertarBD;
    return result
}

//@extends
module.exports.eliminar = async function(datas){
    const result = await Cotizacion.eliminarBD;
    return result;
}

//@extends
module.exports.consulta = async function(){
    const result = await Cotizacion.consultaBD;
    return result;
}
/* #endregion */