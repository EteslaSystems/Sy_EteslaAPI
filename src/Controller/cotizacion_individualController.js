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

var objCotiIndividual = {};
var arrayCotizacionInd = [];

async function cotizacionIndividual(data){
    var idPanel = data.idPanel;
    var idInversor = data.idInversor;
    var cantidadPaneles = data.cantidadPaneles;
    var cantidadInversores = data.cantidadInversores;
    var origen_oficina = data.origen;
    var destino_direccionClient = data.destino;

    panel = await paneles.buscar(idPanel);
    panel = panel.message;
    inversor = await inversores.buscar(idInversor);
    inversor = inversor.message;

    /*#region precios_totales_etc*/
    precioPanel = parseFloat(panel[0].fPrecio);
    precioInversor = parseFloat(inversor[0].fPrecio);
    precioTotalPaneles = precioPanel * cantidadPaneles;
    precioTotalInversores = precioInversor * cantidadInversores;
    /*#endregion*/
    /*#region Parametros para llenado de objCotiIndividual*/
    _potenciaPanel = panel[0].fPotencia;
    _potenciaReal = (panel[0].fPotencia * cantidadPaneles)/1000;
    _costoEstructuras = otrosMateriales.obtenerCostoDeEstructuras(cantidadPaneles);

    _potenciaInversor = inversor[0].fPotencia;
    _potenciaNominalInversor = cantidadInversores * _potenciaInversor;
    _potenciaMaximaInversor = _potenciaInversor * 1.25;
    _potenciaPicoInversor = _potenciaReal / cantidadInversores;
    _porcentajeSobreDimens = _potenciaPicoInversor / _potenciaInversor;
   /*#endregion*/

    objCotiIndividual = {
        panel: {
            potenciaPanel: _potenciaPanel,
            cantidadPaneles: cantidadPaneles,
            potenciaReal: _potenciaReal,
            precioPorWatt: precioPanel,
            costoDeEstructuras: _costoEstructuras
        },
        inversor: {
            potenciaInversor: _potenciaInversor,
            potenciaNominalInversor: _potenciaNominalInversor,
            precioInversor: precioInversor,
            potenciaMaximaInversor: _potenciaMaximaInversor,
            numeroDeInversores: cantidadInversores,
            potenciaPicoInversor: _potenciaPicoInversor,
            porcentajeSobreDimens: _porcentajeSobreDimens
        }
    };

    arrayCotizacionInd.push(objCotiIndividual);

    cotiIndv = await viaticos.mainViaticos(arrayCotizacionInd, origen_oficina, destino_direccionClient);

    return cotiIndv;
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);

    return result;
}