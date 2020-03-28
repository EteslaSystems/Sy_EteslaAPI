/*
- @description: 		Operaciones BD de entidad Irradiacion.
- @author: 				LH420
- @date: 				26/03/2020
*/
const mysqlConnection = require('../../config/database');

function irradiacionFiltered(vMunicipio){
    return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_Irradiacion(?, ?, ?, ?, ?, ?, ?)', [4,null,vMunicipio,null,null,null,null], (error, rows) => {
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