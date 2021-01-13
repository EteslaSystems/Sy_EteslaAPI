/*
- @description: 		Cotizacion del proyecto fotovoltaico 
- @author: 				LH420
- @date: 				20/03/2020
*/
const irradiacion = require('../Controller/irradiacionController');
const paneles = require('../Controller/panelesController');
const inversores = require('../Controller/inversorController');
const viaticos = require('../Controller/opcionesViaticsController');
const otrosMateriales = require('./otrosMaterialesController');

var cotizacionInd = [];
var objCotiIndividual = { panel: {}, 
    inversor: {
        fISC: 0,
        fPotencia: 0,
        fPrecio: 0,
        iPMAX: 0,
        iPMIN: 0,
        iVMAX: 0,
        iVMIN: 0,
        vGarantia: 0,
        vMarca: 0,
        vNombreMaterialFot: 0,
        vOrigen: 0,
        vTipoMoneda: 0,
        precioTotal: 0,
        numeroDeInversores: 0,
        porcentajeSobreDimens: 0,
        potenciaNominal: 0,
        potenciaPico: 0
    }};

async function cotizacionIndividual(data){
    var idPanel = data.idPanel;
    var idInversor = data.idInversor;
    var cantidadPaneles = parseInt(data.cantidadPaneles) || 0;
    var cantidadInversores = parseInt(data.cantidadInversores) || 0;


    var cantidadEstructuras = parseInt(data.cantidadEstructuras);
    // var bMonitoreo = data.monitoreo; //PENDIENTE

    
    var origen = data.origen;
    var destino = data.destino;
    var _costoEstructuras = 0;
    var _potenciaReal = 0;
    

    if(idPanel != "-1"){
        const datas = { idPanel: idPanel};
        panel = await paneles.buscar(datas);
        panel = panel.message;

        _potenciaReal = Math.round(((panel[0].fPotencia * cantidadPaneles)/1000) * 100) / 100;

		costoTotalPaneles = Math.round(parseFloat((panel[0].fPrecio * panel[0].fPotencia) * cantidadPaneles));
        _costoEstructuras = await otrosMateriales.obtenerCostoDeEstructuras(cantidadEstructuras);
        /* if(bMonitoreo == "true" || bMonitoreo == true){
            costoMonitoreo = ;
        } */

        objCotiIndividual.panel = {
            idPanel: idPanel,
            nombre: panel[0].vNombreMaterialFot,
            marca: panel[0].vMarca,
            potencia: panel[0].fPotencia,
            origen: panel[0].vOrigen,
            garantia: panel[0].vGarantia,
            potenciaReal: _potenciaReal,
            noModulos: cantidadPaneles,
            precioPorPanel: panel[0].fPrecio,
            costoDeEstructuras: _costoEstructuras,
            costoTotal: costoTotalPaneles
        };
    }
    else{
        objCotiIndividual.panel = null;
    }

    if(idInversor != "-1"){
        data = {idInversor};
        inversor = await inversores.buscar(data);
        inversor = inversor.message;

        _potenciaNominalInversor = cantidadInversores * inversor[0].fPotencia;
        precioTotalInversores = Math.round((inversor[0].fPrecio * cantidadInversores) * 100) / 100;

        if(objCotiIndividual.panel.potenciaPanel != 0){
            _potenciaPicoInversor = Math.round((_potenciaReal / cantidadInversores) * 100) / 100;
            _porcentajeSobreDimens = _potenciaPicoInversor /  inversor[0].fPotencia;

            objCotiIndividual.inversor.potenciaPico = _potenciaPicoInversor || 0;
            objCotiIndividual.inversor.porcentajeSobreDimens = _porcentajeSobreDimens || 0;
        }

        objCotiIndividual.inversor.fPotencia = inversor[0].fPotencia || 0;
        objCotiIndividual.inversor.potenciaNominal = _potenciaNominalInversor || 0;
        objCotiIndividual.inversor.fPrecio = precioInversor || 0;
        objCotiIndividual.inversor.iPMAX = allInversores[i].iPMAX || 0;
        objCotiIndividual.inversor.numeroDeInversores = cantidadInversores || 0;
        objCotiIndividual.inversor.precioTotal = precioTotalInversores || 0;

        if(objCotiIndividual.panel.potenciaPanel == 0 && objCotiIndividual.inversor.potenciaInversor != 0){
            var _cotizacionUnicamenteInversor = [];

            _cotizacionUnicamenteInversor.push(objCotiIndividual);
            //console.log(_cotizacionUnicamenteInversor);
            return _cotizacionUnicamenteInversor;
        }
    }
    else{
        objCotiIndividual.inversor = null;
    }

    cotizacionInd.push(objCotiIndividual);
    
    objeto = {
        arrayBTI: cotizacionInd,
        origen: origen,
        destino: destino,
        bInstalacion: data.bInstalacion
    };

    // cotiIndv = await viaticos.mainViaticos(objeto);
    cotiIndv = await viaticos.calcularViaticosBTI(objeto);

    return cotiIndv;
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);
    return result;
}