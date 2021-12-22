const DolarController = require('../Controller/dolar.controller');

class DolarBL{
    //Instancia
    dolarController = new DolarController();

    async obtenerPrecioDolar(){
        const result = dolarController.getDollarPrice();
        return result;
    }

    async actualizarPrecioDolar(){
        const result = dolarController.saveDollarPrice();
        return result;
    }
}

module.exports = DolarBL;