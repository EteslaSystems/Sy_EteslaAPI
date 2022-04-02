const mysqlConnection = require('../../config/database');

module.exports.leer = (idMicroInversor) => {
    try{
        return new Promise((resolve, reject) => {
            mysqlConnection.query('CALL SP_Monitoreo(?, ?)', [0, idMicroInversor], (error, rows) => {
                if (error) {
                    reject({
                        status: false,
                        message: error
                    });
                } else {
                    resolve({
                        status: true,
                        message: rows[0]
                    });
                }
            });
        });
    }
    catch(error){
        throw error;
    }
};