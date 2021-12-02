/*
- @description: 		Operaciones BD de entidad Irradiacion.
- @author: 				LH420
- @date: 				26/03/2020
*/
const mysqlConnection = require('../../config/database');

/*#region BajaTension*/
async function getIrradiacionBT(origen){
    if(origen == 'CDMX' || origen == 'Puebla'){
        return 5.42;
    }
    else{
        return 4.6;
    }
}
/*#endregion*/

/*#region MediaTension*/
async function irradiacionFiltered(vMunicipio){
    var vMunicipio = vMunicipio;
    return new Promise((resolve, reject) => {
        mysqlConnection.query('SELECT HEX(idIrradiacion) AS idIrradiacion, vMunicipio, fIrradiacion, created_at, updated_at, deleted_at FROM irradiacion WHERE vMunicipio LIKE ?;', [vMunicipio], (error, rows) => {
            if(error){
                const response = {
                    status: false,
                    message: error
                }
                resolve(response);
            }
            else{
                const response = {
                    status: true,
                    message: rows[0]
                }
                resolve(response);
            }       
        });
    });
}
/*#endregion*/

//MT
module.exports.buscarIrradiacionFiltrada = async function(municipio){
    const result = await irradiacionFiltered(municipio);

    if(result.status == true)
    {
        return result.message;
    }
    else{
        return result.message;
    }
}

//BT
module.exports.irradiacion_BT = async function(origen){
    const result = await getIrradiacionBT(origen);
    return result;
}