const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

//CRUD
module.exports.insertarBD = async function(datas){
    try{
        /* Cliente */
        let idCliente = datas.cliente.id;
        let nombreCliente = datas.cliente.nombre;
        /* Consumos - Cliente */
        let consumoPromedio = datas.consumoPromedioKw || null; //Bimestral
        let actualTarifa = datas.tarifa != null ? datas.tarifa.vieja : null;
        let nuevaTarifa = datas.tarifa != null ? datas.tarifa.nueva : null;
        /* Vendedor */
        let idVendedor = datas.usuario.id;
        let usuario = datas.usuario.nombre;
        /* Panel */
        let modeloPanel = null;
        let cantidadPanel = null;
        /* Inversor */
        let modeloInversor = null;
        let cantidadInversor = null;
        /* Estructura */
        let marcaEstructura = null;
        let cantidadEstructura = null;
        /* Energia */
        let nuevoConsumoMensual = datas.nuevoConsumoMensual || null;
        let nuevoConsumoBimestral = datas.nuevoConsumoBimestralKw || null;
        let nuevoConsumoAnual = datas.nuevoConsumoAnualKw || null;
        /* Propuesta */
        let tipoCotizacion = datas.tipoCotizacion;
        let descuento = datas.descuento.porcentaje || null;
        let potenciaPropuesta = datas.potenciaPropuesta || null; //PotenciaPropuesta
        let porcentajeDePropuesta = datas.porcentajePropuesta || null;
        let totalSinIvaMXN = datas.totalSinIvaMXN;
        let totalConIvaMXN = datas.totalConIvaMXN;
        let totalSinIvaUSD = datas.totalSinIvaUSD;
        let totalConIvaUSD = datas.totalConIvaUSD;
        let diasExpiracion = datas.expiracion.cantidad;

        //Validation != null
        if(datas.panel){
            modeloPanel = datas.panel.modelo;
            cantidadPanel = datas.panel.cantidad;
        }

        if(datas.inversor){
            modeloInversor = datas.inversor.modelo;
            cantidadInversor = datas.inversor.cantidad;
        }

        if(datas.estructura){
            marcaEstructura = datas.estructura.marca;
            cantidadEstructura = datas.estructura.cantidad;
        }

        return new Promise((resolve, reject) => {
            mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, idCliente, idVendedor, nombreCliente, actualTarifa, consumoPromedio, usuario, modeloPanel, cantidadPanel, modeloInversor, cantidadInversor, marcaEstructura, cantidadEstructura, potenciaPropuesta, nuevoConsumoMensual, nuevoConsumoBimestral, nuevoConsumoAnual, nuevaTarifa, tipoCotizacion, descuento, porcentajeDePropuesta, totalSinIvaMXN, totalConIvaMXN, totalSinIvaUSD, totalConIvaUSD, 0, diasExpiracion], (error, rows) => {
                if (error) {
                    const response = {
                        status: false,
                        message: error
                    }

                    reject (response);
                } 
                else {
                    const response = {
                        idPropuesta: rows[0][0].xIdPropuesta,
                        status: true,
                        message: "El registro se ha guardado con éxito."
                    }

                    resolve(response);
                }
            });
        });
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Cotizacion.insertarBD(): ' +error.message });
        throw 'Error Cotizacion insertarBD: '+error;
    }
}

module.exports.eliminarBD = async function(datas){
    const { idPropuesta } = data;

    try{
        return new Promise((resolve, reject) => {
            mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
                if(error){
                    const response = {
                        status: false,
                        message: error
                    }
    
                    reject(response);
                } 
                else {
                    const response = {
                        status: true,
                        message: "El registro se ha eliminado con éxito."
                    }
    
                    resolve(response);
                }
            });
        });
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Cotizacion.eliminarBD(): ' +error.message });
        throw 'Error Cotizacion eliminarBD: '+error;
    }
}

module.exports.consultaBD = async function(data){
    const { id } = data;

    try{
        return new Promise((resolve, reject) => {
            mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
                if (error) {
                    const response = {
                        status: false,
                        message: error
                    }
    
                    reject(response);
                } 
                else {
                    const response = {
                        status: true,
                        message: rows[0]
                    }
    
                    resolve(response);
                }
            });
        });
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Cotizacion.consultaBD(): ' +error.message });
        throw 'Error Cotizacion consultaBD: '+error;
    }
}

module.exports.buscarBD = async function(datas){
    const { idPropuesta } = datas;
    
    try{
        return new Promise((resolve, reject) => {
            mysqlConnection.query('CALL SP_Propuesta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, idPropuesta, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
                if (error) {
                    const response = {
                        status: false,
                        message: error
                    }
    
                    reject(response);
                } 
                else {
                    const response = {
                        status: true,
                        message: rows[0]
                    }
    
                    resolve(response);
                }
            });
        });
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Cotizacion.buscarBD(): ' +error.message });
        throw 'Error Cotizacion buscarBD: '+error;
    }
}