const Tarifa = require('../Entities/Tarifa');

class TarifaController{
    //Instancia
    tarifa = new Tarifa();

    //CRUD
    async consulta(){
        const result = tarifa.consultaBD();
        return result;
    }

    async buscar(datas){
        const result = tarifa.buscarBD(datas);
        return result;
    }
};

module.exports = TarifaController;