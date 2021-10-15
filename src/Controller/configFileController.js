const process = require('process'); 
const fs = require('fs');
var { response } = require('express');

module.exports.getArrayOfConfigFile = function(){
    let getFileRootOfConfiguration = process.cwd()+'/config/admin/parametroscotizador_suser-admin.json';

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

module.exports.getConfiguracionPropuesta = function(){
    let uriFile = process.cwd()+'/config/admin/propuesta.json';

    return new Promise((resolve, reject) => {
        fs.readFile(uriFile, 'utf-8', (err, configPropuesta) => {
            if(!err){
                configPropuesta = JSON.parse(configPropuesta);
                
                response = {
                    status: true,
                    message: configPropuesta
                };
                
                resolve(response.message);
            }
            else{
                response = {
                    status: false,
                    message: err
                };

                reject(response);
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