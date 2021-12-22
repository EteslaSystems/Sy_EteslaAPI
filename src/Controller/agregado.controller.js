const Cotizacion = require('../Entities/Cotizacion');

class AgregadoController{
    //Instancia
    cotizacion = new Cotizacion();

    async insertar(datas){
        const result = cotizacion.insertarBD;
        return result
    }

    async eliminar(datas){
        const result = cotizacion.eliminarBD;
        return result;
    }

    async consulta(){
        const result = cotizacion.consultaBD;
        return result;
    }
}

module.exports = AgregadoController;