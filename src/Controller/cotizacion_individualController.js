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

var arrayPeriodosGDMTH = [];
var objCotiIndividual = {
    panel: {
        potenciaPanel: 0,
        cantidadPaneles: 0,
        potenciaReal: 0,
        precioPorWatt: 0,
        costoDeEstructuras: 0,
        costoTotalPaneles: 0
    },
    inversor: {
        potenciaInversor: 0,
        potenciaNominalInversor: 0,
        precioInversor: 0,
        potenciaMaximaInversor: 0,
        numeroDeInversores: 0,
        potenciaPicoInversor: 0,
        porcentajeSobreDimens: 0,
        costoTotalInversores: 0
    },
};

async function cotizacionIndividual(data){
    var idPanel = data.idPanel;
    var idInversor = data.idInversor;
    var cantidadPaneles = data.cantidadPaneles || 0;
    var cantidadInversores = data.cantidadInversores || 0;
    var bEstructuras = data.bEstructuras;
    var origen = data.origen;
    var destino = data.destino;
    var _costoEstructuras = 0;
    var _potenciaReal = 0;

    

    if(idPanel != "-1"){
        const datas = { idPanel: idPanel};
        panel = await paneles.buscar(datas);
        panel = panel.message;

        _potenciaPanel = panel[0].fPotencia;
        precioPanel = panel[0].fPrecio;
        _potenciaReal = (_potenciaPanel * cantidadPaneles)/1000;

        precioPorWatt = parseFloat(panel[0].fPrecio);
		costoTotalPaneles = Math.round(parseFloat((precioPanel * _potenciaPanel) * cantidadPaneles));

        if(bEstructuras == "true" || bEstructuras == true){
            _costoEstructuras = await otrosMateriales.obtenerCostoDeEstructuras(cantidadPaneles);
        }

        objCotiIndividual.panel.potenciaPanel = _potenciaPanel || 0;
        objCotiIndividual.panel.cantidadPaneles = cantidadPaneles || 0;
        objCotiIndividual.panel.potenciaReal = _potenciaReal || 0;
        objCotiIndividual.panel.costoDeEstructuras = _costoEstructuras  || 0;
        objCotiIndividual.panel.precioPorWatt = precioPorWatt || 0;
        objCotiIndividual.panel.costoTotalPaneles = costoTotalPaneles || 0;
    }

    if(idInversor != "-1"){
        inversor = await inversores.buscar(idInversor);
        inversor = inversor.message;

        _potenciaInversor = inversor[0].fPotencia;
        _potenciaNominalInversor = cantidadInversores * _potenciaInversor;
        _potenciaMaximaInversor = _potenciaInversor * 1.25;
        precioInversor = parseFloat(inversor[0].fPrecio);
        precioTotalInversores = precioInversor * cantidadInversores;

        if(objCotiIndividual.panel.potenciaPanel != 0){
            _potenciaPicoInversor = _potenciaReal / cantidadInversores;
            _porcentajeSobreDimens = _potenciaPicoInversor / _potenciaInversor;

            objCotiIndividual.inversor.potenciaPicoInversor = _potenciaPicoInversor;
            objCotiIndividual.inversor.porcentajeSobreDimens = _porcentajeSobreDimens || 0;
        }

        objCotiIndividual.inversor.potenciaInversor = _potenciaInversor || 0;
        objCotiIndividual.inversor.potenciaNominalInversor = _potenciaNominalInversor || 0;
        objCotiIndividual.inversor.precioInversor = precioInversor || 0;
        objCotiIndividual.inversor.potenciaMaximaInversor = _potenciaMaximaInversor || 0;
        objCotiIndividual.inversor.numeroDeInversores = cantidadInversores || 0;
        objCotiIndividual.inversor.costoTotalInversores = precioTotalInversores || 0;

        if(objCotiIndividual.panel.potenciaPanel == 0 && objCotiIndividual.inversor.potenciaInversor != 0){
            var _cotizacionUnicamenteInversor = [];

            _cotizacionUnicamenteInversor.push(objCotiIndividual);
            //console.log(_cotizacionUnicamenteInversor);
            return _cotizacionUnicamenteInversor;
        }
    }

    arrayPeriodosGDMTH.push(objCotiIndividual);
    
    objeto = {
        arrayPeriodosGDMTH: arrayPeriodosGDMTH,
        origen: origen,
        destino: destino
    };

    cotiIndv = await viaticos.mainViaticos(objeto);

    return cotiIndv;
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);
    return result;
}