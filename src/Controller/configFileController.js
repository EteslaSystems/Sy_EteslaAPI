const process = require('process'); 
const fs = require('fs');
var { response } = require('express');

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

module.exports.getArrayJSONDollarPrice = function(fileName){
    var getFileRootOfConfiguration = process.cwd()+'/config/dirDollarPrice/'+fileName;

    return new Promise((resolve, reject) => {
        fs.readFile(getFileRootOfConfiguration, 'utf-8', (err, dollarPrice) => {
            if(!err){
                response = {
                    status: true,
                    message: dollarPrice
                };

                resolve(response);
            }
            else{
                dollarPrice = 23;

                response = {
                    status: false,
                    message: err,
                    valueOfDollar: dollarPrice
                };

                resolve(response);
            }
        });
    });
}

module.exports.ifExistConfigFile = function(root, fileName){
    rootFile = root+fileName;

    fs.open('./Sy_EteslaAPI/config/dirDollarPrice/'+fileName, function(err){
        if(!err){
            return true;
        }
        else if(err.code === 'ENOENT'){
            return false;
        }
    });
}

/*---  Lectura del Handlebars-Template para el PDF  ---*/
module.exports.getHandlebarsTemplate = function(fileName){
    var getFileRootOfTemplate = process.cwd()+'/src/PDF/templates/'+fileName;

    return new Promise((resolve, reject) => {
        fs.readFile(getFileRootOfTemplate, 'utf-8', (err, template) => {
            if(!err){
                response = {
                    status: true,
                    message: template
                };

                resolve(response);
            }
            else{
                response = {
                    status: false,
                    message: template
                };

                resolve(response);
            }
        });
    });
}