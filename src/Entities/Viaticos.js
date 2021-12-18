const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

class Viaticos{
    //CRUD
    async insertarBD(datas){
        try{

        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.insertarBD(): ' +error.message });
            throw 'Error Viaticos.insertarBD(): '+error;
        }
    }

    async eliminarBD(idViatico){
        try{

        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.eliminarBD(): ' +error.message });
            throw 'Error Viaticos.eliminarBD(): '+error;
        }
    }

    async consultaBD(){
        try{
            
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.consultaBD(): ' +error.message });
            throw 'Error Viaticos.consultaBD(): '+error;
        }
    }

    async editarBD(datas){
        try{

        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.editarBD(): ' +error.message });
            throw 'Error Viaticos.editarBD(): '+error;
        }
    }
}

module.exports = Viaticos;