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

var arrayCotizacionInd = [];
var objCotiIndividual = {
    panel: {
        potenciaPanel: 0,
        cantidadPaneles: 0,
        potenciaReal: 0,
        precioPorWatt: 0,
        costoDeEstructuras: 0
    },
    inversor: {
        potenciaInversor: 0,
        potenciaNominalInversor: 0,
        precioInversor: 0,
        potenciaMaximaInversor: 0,
        numeroDeInversores: 0,
        potenciaPicoInversor: 0,
        porcentajeSobreDimens: 0
    }
};

async function cotizacionIndividual(data){
    var idPanel = data.idPanel;
    var idInversor = data.idInversor;
    var cantidadPaneles = data.cantidadPaneles || 0;
    var cantidadInversores = data.cantidadInversores || 0;
    var bEstructuras = data.bEstructuras;
    var origen_oficina = data.origen;
    var destino_direccionClient = data.destino;
    
    var _costoEstructuras = 0;
    var _potenciaReal = 0;
    
    if(idPanel != "-1"){
        panel = await paneles.buscar(idPanel);
        panel = panel.message;

        _potenciaPanel = panel[0].fPotencia;
        _potenciaReal = (_potenciaPanel * cantidadPaneles)/1000;
        precioPanel = parseFloat(panel[0].fPrecio);
        precioTotalPaneles = precioPanel * cantidadPaneles;

        if(bEstructuras == true){
            _costoEstructuras = otrosMateriales.obtenerCostoDeEstructuras(cantidadPaneles);
        }

        objCotiIndividual.panel.potenciaPanel = _potenciaPanel || 0;
        objCotiIndividual.panel.cantidadPaneles = cantidadPaneles || 0;
        objCotiIndividual.panel.potenciaReal = _potenciaReal || 0;
        objCotiIndividual.panel.precioPorWatt = precioPanel || 0;
        objCotiIndividual.panel.costoDeEstructuras = _costoEstructuras;
    }

    if(idInversor != "-1"){
        inversor = await inversores.buscar(idInversor);
        inversor = inversor.message;

        _potenciaInversor = inversor[0].fPotencia;
        _potenciaNominalInversor = cantidadInversores * _potenciaInversor;
        _potenciaMaximaInversor = _potenciaInversor * 1.25;
        _potenciaPicoInversor = _potenciaReal / cantidadInversores;
        _porcentajeSobreDimens = _potenciaPicoInversor / _potenciaInversor;
        precioInversor = parseFloat(inversor[0].fPrecio);
        precioTotalInversores = precioInversor * cantidadInversores;

        objCotiIndividual.inversor.potenciaInversor = _potenciaInversor || 0;
        objCotiIndividual.inversor.potenciaNominalInversor = _potenciaNominalInversor || 0;
        objCotiIndividual.inversor.precioInversor = precioInversor || 0;
        objCotiIndividual.inversor.potenciaMaximaInversor = _potenciaMaximaInversor || 0;
        objCotiIndividual.inversor.numeroDeInversores = cantidadInversores || 0;
        objCotiIndividual.inversor.potenciaPicoInversor = _potenciaPicoInversor;
        objCotiIndividual.inversor.porcentajeSobreDimens = _porcentajeSobreDimens || 0;

        if(_arrayCotizacion[x].hasOwnProperty('panel') != true && _arrayCotizacion[x].hasOwnProperty('inversor') != true){
            var _arraySoloInversor = [];

            _arraySoloInversor.push(objCotiIndividual);
            return _arraySoloInversor;
        }
    }

    arrayCotizacionInd.push(objCotiIndividual);

    cotiIndv = await viaticos.mainViaticos(arrayCotizacionInd, origen_oficina, destino_direccionClient);

    return cotiIndv;
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);
    return result;
}