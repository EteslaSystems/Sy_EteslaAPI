/*
- @description: 		Cotizacion del proyecto fotovoltaico 
- @author: 				LH420
- @date: 				20/03/2020
*/
const paneles = require('../Controller/panelesController');
const inversores = require('../Controller/inversorController');
const estructuras = require('../Controller/estructuraController');
const viaticos = require('../Controller/opcionesViaticsController');
const otrosMateriales = require('./otrosMaterialesController');

var cotizacionInd = [];

async function cotizacionIndividual(data){
    let panel = null, inversor = null, estructura = null;
    let Cotizacion = { panel: null, inversor: null, estructura: null };
    let equipos = [];

    try{
        if(data.cotizacionIndividual.equipos.paneles != null){
            panel = await paneles.buscar({ idPanel: data.cotizacionIndividual.equipos.paneles.modelo });
            panel = panel.message; //Array
            panel = panel[0]; //Object
            panel = Object.assign(panel,{ noModulos: parseInt(data.cotizacionIndividual.equipos.paneles.cantidad), costoTotal: Math.round(parseFloat((panel.fPrecio * panel.fPotencia) * data.cotizacionIndividual.equipos.paneles.cantidad)) }); //Se agregan propiedades de 'noModulos' y 'precioTotal'
            Cotizacion.panel = panel;
        }

        if(data.cotizacionIndividual.equipos.inversores != null){
            inversor = await inversores.buscar({ idInversor: data.cotizacionIndividual.equipos.inversores.modelo });
            inversor = inversor.message; //Array
            inversor = inversor[0]; //Object
            inversor = Object.assign(inversor,{ numeroDeInversores: parseInt(data.cotizacionIndividual.equipos.inversores.cantidad), precioTotal: Math.round((inversor.fPrecio * data.cotizacionIndividual.equipos.inversores.cantidad) * 100) / 100 });
            Cotizacion.inversor = inversor;
        }

        if(data.cotizacionIndividual.equipos.estructuras != null){
            estructura = await estructuras.buscar({ id: data.cotizacionIndividual.equipos.estructuras.modelo });
            estructura = estructura.message; //Array
            estructura = estructura[0]; //Object
            estructura = Object.assign(estructura,{ cantidad: parseInt(data.cotizacionIndividual.equipos.estructuras.cantidad), costoTotal: Math.round(estructura.fPrecio * data.cotizacionIndividual.equipos.estructuras.cantidad) });
            Cotizacion.estructura = estructura;
        }

        equipos[0] = Cotizacion;

        let objectToSellViatics = {
            idCliente: data.cotizacionIndividual.cliente.id,
            arrayBTI: equipos,
            origen: data.origen,
            destino: data.cotizacionIndividual.cliente.direccion,
            tipoCotizacion: 'individual',
            idUsuario: data.idUsuario,
            data
        };

        let cotIndViaticos = await viaticos.calcularViaticosBTI(objectToSellViatics);

        return cotIndViaticos;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);
    return result;
}