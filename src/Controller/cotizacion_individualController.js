/*
- @description: 		Cotizacion del proyecto fotovoltaico 
- @author: 				LH420
- @date: 				20/03/2020
*/
const paneles = require('../Controller/panelesController');
const inversores = require('../Controller/inversorController');
const viaticos = require('../Controller/opcionesViaticsController');
const otrosMateriales = require('./otrosMaterialesController');

var cotizacionInd = [];

async function cotizacionIndividual(data){
    let objCotiIndividual = { panel: {}, 
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
    let idPanel = data.idPanel;
    let idInversor = data.idInversor;
    let cantidadPaneles = parseInt(data.cantidadPaneles) || 0;
    let cantidadInversores = parseInt(data.cantidadInversores) || 0;

    let cantidadEstructuras = parseInt(data.cantidadEstructuras);
    // let bMonitoreo = data.monitoreo; //PENDIENTE

    let origen = data.origen;
    let destino = data.destino;
    let _costoEstructuras = 0;
    let _potenciaReal = 0;
    

    if(idPanel != "-1"){
        const datas = { idPanel: idPanel};
        let panel = await paneles.buscar(datas);
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
        let inversor = await inversores.buscar(data);
        inversor = inversor.message;

        _potenciaNominalInversor = cantidadInversores * inversor[0].fPotencia; //Watts
        precioTotalInversores = Math.round((inversor[0].fPrecio * cantidadInversores) * 100) / 100;

        if(objCotiIndividual.panel != null){
            _potenciaPicoInversor = Math.round((_potenciaReal / cantidadInversores) * 100) / 100;
            _porcentajeSobreDimens = _potenciaPicoInversor /  inversor[0].fPotencia;

            objCotiIndividual.inversor.potenciaPico = _potenciaPicoInversor || 0;
            objCotiIndividual.inversor.porcentajeSobreDimens = _porcentajeSobreDimens || 0;
        }
        
        objCotiIndividual.inversor.fISC = inversor[0].fISC;
		objCotiIndividual.inversor.fPotencia = inversor[0].fPotencia;
		objCotiIndividual.inversor.fPrecio = inversor[0].fPrecio;
		objCotiIndividual.inversor.iPMAX = inversor[0].iPMAX;
		objCotiIndividual.inversor.iPMIN = inversor[0].iPMIN;
		objCotiIndividual.inversor.iVMAX = inversor[0].iVMAX;
		objCotiIndividual.inversor.iVMIN = inversor[0].iVMIN;
		objCotiIndividual.inversor.vGarantia = inversor[0].vGarantia;
		objCotiIndividual.inversor.vMarca = inversor[0].vMarca;
		objCotiIndividual.inversor.vNombreMaterialFot = inversor[0].vNombreMaterialFot;
		objCotiIndividual.inversor.vOrigen = inversor[0].vOrigen;
		objCotiIndividual.inversor.vTipoMoneda = inversor[0].vTipoMoneda;
		objCotiIndividual.inversor.precioTotal = precioTotalInversores;
		objCotiIndividual.inversor.numeroDeInversores = cantidadInversores;
		objCotiIndividual.inversor.potenciaNominal = _potenciaNominalInversor;

        if(objCotiIndividual.panel.potenciaPanel == 0 && objCotiIndividual.inversor.potenciaInversor != 0){
            let _cotizacionUnicamenteInversor = [];

            _cotizacionUnicamenteInversor.push(objCotiIndividual);
            //console.log(_cotizacionUnicamenteInversor);
            return _cotizacionUnicamenteInversor;
        }
    }
    else{
        objCotiIndividual.inversor = null;
    }

    cotizacionInd[0] = objCotiIndividual;
    
    objeto = {
        idCliente: data.idCliente,
        arrayBTI: cotizacionInd,
        origen: origen,
        destino: destino,
        bInstalacion: data.bInstalacion,
        tipoCotizacion: data.tipoCotizacion
    };

    cotiIndv = await viaticos.calcularViaticosBTI(objeto);

    return cotiIndv;
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);
    return result;
}