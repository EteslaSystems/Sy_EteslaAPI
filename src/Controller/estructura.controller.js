let Estructura = require('../Entities/Estructura');

class EstructuraController{
    //Instancia
	estructura = new Estructura();

    //CRUD
    async insertar(datas){
        const result = await estructura.insertarBD(datas);
        return result;
    }

    async eliminar(datas){
        const result = await estructura.eliminarBD(datas);
        return result;
    }

    async buscar(idInversor){
        const result = await estructura.buscarBD(idInversor);
        return result;
    }

    // async editar(datas){
    //     const result = await estructura.editarBD(datas);
    //     return result;
    // }

    async consultar(){
        const result = await estructura.consultaBD();
        return result;
    }
}

module.exports = EstructuraController;