const DolarController = require('../Controller/dolar.controller');

module.exports.obtenerPrecioDolar = async function(){
    return await DolarController.getDollarPrice();
}

module.exports.actualizarPrecioDolar = async function(){
    return await DolarController.saveDollarPrice();
}