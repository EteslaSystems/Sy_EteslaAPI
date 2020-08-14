/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				LH420
- @date: 				
*/
const mysqlConnection = require('../../config/database');

function consultaBD () {
    return new Promise((resolve, reject) => {
      mysqlConnection.query('CALL SP_Tarifas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
          if (error) {
              const response = {
                  status: false,
                  message: error
              }

              resolve (response);
          } else {
              const response = {
                  status: true,
                  message: rows[0]
              }

              resolve(response);
          }
      });
    });
}

function buscarBD (datas) {
  const { idTarifa } = datas;

    return new Promise((resolve, reject) => {
      mysqlConnection.query('CALL SP_Tarifas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idTarifa, null, null, null, null, null, null, null, null, null], (error, rows) => {
          if (error) {
              const response = {
                  status: false,
                  message: error
              }

              resolve (response);
          } else {
              const response = {
                  status: true,
                  message: rows[0]
              }

              resolve(response);
          }
      });
    });
}

module.exports.obtenerTodasLasTarifas = async function(){
    const result = await consultaBD();
    
    if(result.status === true){
        result = result.message;
        return result;
    }
}

module.exports.buscarTarifaFiltrada = async function(data){
    const result = await buscarBD(data);
    return result;
}