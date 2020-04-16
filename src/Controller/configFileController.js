const process = require('process'); 
const fs = require('fs');

module.exports.getArrayOfConfigFile = function(){
    var getFileRootOfConfiguration = process.cwd()+'/config/admin_confgs/parametroscotizador_suser-admin.json';

    return new Promise((resolve, reject) => {
        fs.readFile(getFileRootOfConfiguration, 'utf-8', (err, _$configCuadrilla) => {
            if(!err){
                _$configCuadrilla = JSON.parse(_$configCuadrilla);
                
                response = {
                    status: true,
                    message: _$configCuadrilla
                };
                
                resolve(response.message);
            }
            else{
                response = {
                    status: false,
                    message: err
                };

                resolve(response);
            }
        });
    });
}