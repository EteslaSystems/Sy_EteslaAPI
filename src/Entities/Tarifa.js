const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

class Tarifa{
    async consultaBD(){
        try{
            return new Promise((resolve, reject) => {
                mysqlConnection.query('CALL SP_Tarifas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
                    if (error) {
                        const response = {
                            status: false,
                            message: error
                        }
          
                        reject(response);
                    } 
                    else {
                        const response = {
                            status: true,
                            message: rows[0]
                        }
          
                        resolve(response);
                    }
                });
            });
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Tarifa.consultaBD(): ' +error.message });
            throw 'Error Tarifa.consultaBD: '+error;
        }
    }

    async buscarBD(datas){
        const { idTarifa } = datas;

        try{
            return new Promise((resolve, reject) => {
                mysqlConnection.query('CALL SP_Tarifas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idTarifa, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Tarifa.buscarBD(): ' +error.message });
            throw 'Error Tarifa.buscarBD: '+error;
        }
    }
}

modules.export = Tarifa;