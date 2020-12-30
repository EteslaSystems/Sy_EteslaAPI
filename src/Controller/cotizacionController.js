/*
- @description: 		Archivo que filtra que tipo de cotizacion esta solicitando el webClient:
                            -Individual (solo por cantidad de paneles e inversores)
                            -BajaTensión
                            -Media tensión
- @author: 				LH420
- @date: 				20/03/2020
*/
const bajaTension = require('../Controller/bajaTensionController');
const mediaTension = require('../Controller/mediaTensionController');
const configFile = require('../Controller/configFileController');

var oldPanelPrice = 0;
var newPanelPrice = 0;
var oldInversorPrice = 0;
var newInversorPrice = 0;
var objCombinacion = {
    combinacion: '',
    panel:{ idPanel:0, nombrePanel:'', marcaPanel:'', potenciaPanel:'', cantidadPaneles:0, potenciaReal:0, costoDeEstructuras:0, precioPorWatt:0, costoTotalPaneles:0 }, 
    inversor:{ idInversor:0, nombreInversor:'', marcaInversor:'', potenciaInversor:0, potenciaNominalInversor:0, precioInversor:0, potenciaMaximaInversor:0, numeroDeInversores:0, potenciaPicoInversor:0, porcentajeSobreDimens:0, costoTotalInversores:0 }
};


/*#region SwitchCotizaciones*/
/*#endregion*/
/*#region Busqueda_inteligente*/
module.exports.mainBusqInteligente = async function(data){
    const result = await mainBusquedaInteligente(data);
    return result;
}

async function mainBusquedaInteligente(data){
    var tipoCotizacion = data.tipoCotizacion;
    var _paneles = [];
    var newData = {};
    var objCombinaciones = {};
    var __combinaciones = [];
    
    if(tipoCotizacion == 'bajaTension'){
        _paneles = await bajaTension.firstStepBT(data);
        _consumos = _paneles[0].consumo;
        _arrayConsumos = _paneles[0];
        newData = {_paneles: _paneles, origen: data.origen, destino: data.destino, tarifa:data.tarifa};

        __combinacionMediana = await getCombinacionMediana(newData, _consumos);
        __combinacionEconomica = await getCombinacionEconomica(newData, _consumos);
        __combinacionOptima = await getCombinacionOptima(newData, _consumos);
    }
    /* else{

    } */

    objCombinaciones = {
        _arrayConsumos: _arrayConsumos,
        combinacionMediana: __combinacionMediana,
        combinacionEconomica: __combinacionEconomica,
        combinacionOptima: __combinacionOptima
    };

    __combinaciones.push(objCombinaciones);

    return __combinaciones;
}

/*#region Combinaciones*/
async function getCombinacionEconomica(data, __consumos){
    var __paneles = data._paneles || null;
    var _combinacionEconomica = [];

    objCombinacion.combinacion = "economica";

    if(__paneles.length > 0){
        for(var i=1; i<__paneles.length; i++)
        {
            newPanelPrice = parseFloat(__paneles[i].panel.costoTotalPaneles);

            if(i == 1){
                oldPanelPrice = newPanelPrice;
            }

            if(oldPanelPrice >= newPanelPrice){
                oldPanelPrice = newPanelPrice;
                
                objCombinacion.panel.idPanel = __paneles[i].panel.idPanel;
                objCombinacion.panel.nombrePanel = __paneles[i].panel.nombre;
                objCombinacion.panel.marcaPanel = __paneles[i].panel.marca;
                objCombinacion.panel.potenciaPanel = __paneles[i].panel.potencia;
                objCombinacion.panel.cantidadPaneles = __paneles[i].panel.noModulos;
                objCombinacion.panel.potenciaReal = __paneles[i].panel.potenciaReal;
                objCombinacion.panel.costoDeEstructuras = __paneles[i].panel.costoDeEstructuras;
                objCombinacion.panel.precioPorWatt = __paneles[i].panel.costoPorWatt;
                objCombinacion.panel.costoTotalPaneles = __paneles[i].panel.costoTotalPaneles;
            }
        }
    }

    var __inversores = await bajaTension.obtenerInversores_Requeridos(objCombinacion.panel);

    if(__inversores.length > 0){
        for(var j=0; j<__inversores.length; j++)
        {
            newInversorPrice = parseFloat(__inversores[j].precioTotalInversores);

            if(j === 0){
                oldInversorPrice = newInversorPrice;
            }

            if(oldInversorPrice >= newInversorPrice){
                oldInversorPrice = newInversorPrice;

                objCombinacion.inversor.idInversor = __inversores[j].idInversor;
                objCombinacion.inversor.nombreInversor = __inversores[j].nombreInversor;
                objCombinacion.inversor.marcaInversor = __inversores[j].marcaInversor;
                objCombinacion.inversor.potenciaInversor = __inversores[j].potenciaInversor;
                objCombinacion.inversor.potenciaNominalInversor = __inversores[j].potenciaNominalInversor;
                objCombinacion.inversor.precioInversor = __inversores[j].precioInversor;
                objCombinacion.inversor.potenciaMaximaInversor = __inversores[j].potenciaMaximaInversor;
                objCombinacion.inversor.numeroDeInversores = __inversores[j].numeroDeInversores;
                objCombinacion.inversor.potenciaPicoInversor = __inversores[j].potenciaPicoInversor;
                objCombinacion.inversor.porcentajeSobreDimens = parseFloat(__inversores[j].porcentajeSobreDimens);
                objCombinacion.inversor.costoTotalInversores = __inversores[j].precioTotalInversores;
            }
        }
    }
    
    _combinacionEconomica.push(objCombinacion);
    
    newData = {
        arrayBTI: _combinacionEconomica,
        origen: data.origen,
        destino: data.destino,
        tarifa: data.tarifa,
        consumos: __consumos
    };

    ///Se calculan viaticos
    _combinacionEconomica = await bajaTension.obtenerViaticos_Totales(newData);
    _combinacionEconomica.push(objCombinacion.combinacion);

    return _combinacionEconomica;
}

async function getCombinacionMediana(data, __consumos){//Mediana
    var __paneles = data._paneles || null;
    var __inversores = data._inversores || null;
    var _panelesSelectos = [];
    var _combinacionMediana = [];

    var marcaEspecificaPanel = await configFile.getArrayOfConfigFile();
    marcaEspecificaPanel = marcaEspecificaPanel.busqueda_inteligente.combinacionMediana_marcaEspecificaPanel.toString();

    objCombinacion.combinacion = "mediana";

    var mediaCostoTotPaneles = (_panelSelected) => {
        mediaDePrecios = 0;
        
        for(var k=0; k<_panelSelected.length; k++)
        {
            mediaDePrecios += parseFloat(_panelSelected[k].costoTotalPaneles);
        }

        mediaDePrecios = Math.round((mediaDePrecios / _panelSelected.length) * 100) / 100;
        return mediaDePrecios;
    };
    var panelCombMediana = (_panelSelecto, mediaCostoTPaneles) => {
        acercamiento = 0;
        oldAcercamiento = 0;
        newAcercamiento = 0;

        for(var u=0; u<_panelSelecto.length; u++)
        {
            acercamiento = Math.abs(Math.round((mediaCostoTPaneles - _panelSelecto[u].costoTotalPaneles) * 100) / 100);

            if(u === 0){
                oldAcercamiento = acercamiento;
            }
            if(oldAcercamiento >= newAcercamiento){
                oldAcercamiento = newAcercamiento;

                objCombinacion.panel.idPanel = _panelSelecto[u].idPanel;
                objCombinacion.panel.nombrePanel = _panelSelecto[u].nombre;
                objCombinacion.panel.marcaPanel = _panelSelecto[u].marca;
                objCombinacion.panel.potenciaPanel = _panelSelecto[u].potencia;
                objCombinacion.panel.cantidadPaneles = _panelSelecto[u].noModulos;
                objCombinacion.panel.potenciaReal = _panelSelecto[u].potenciaReal;
                objCombinacion.panel.costoDeEstructuras = _panelSelecto[u].costoDeEstructuras;
                objCombinacion.panel.precioPorWatt = _panelSelecto[u].costoPorWatt;
                objCombinacion.panel.costoTotalPaneles = _panelSelecto[u].costoTotalPaneles;
            }
        }
    };

    if(__paneles.length > 0){
        //Se seleccionan paneles de la marcaEspecifica
        for(var i=1; i<__paneles.length; i++)
        {
            if(__paneles[i].panel.marca === marcaEspecificaPanel){
                _panelesSelectos.push(__paneles[i].panel);
            }
        }

        mediaCostoTotPaneles = mediaCostoTotPaneles(_panelesSelectos);
        panelCombMediana(_panelesSelectos, mediaCostoTotPaneles);
    }

    var __inversores = await bajaTension.obtenerInversores_Requeridos(objCombinacion.panel);

    var mediaCostoTotInversores = (_inversoreSelected) => {
        mediaDePrecios = 0;
        
        for(var k=0; k<_inversoreSelected.length; k++)
        {
            mediaDePrecios += parseFloat(_inversoreSelected[k].precioTotalInversores);
        }

        mediaDePrecios = Math.round((mediaDePrecios / _inversoreSelected.length) * 100) / 100;
        return mediaDePrecios;
    };
    var inversorCombMediana = (_inversSelect, mediaCostoTInv) => {
        acercamiento = 0;
        oldAcercamiento = 0;
        newAcercamiento = 0;
        objInversorComb = {};

        for(var u=0; u<_inversSelect.length; u++)
        {
            acercamiento = Math.abs(mediaCostoTInv - _inversSelect[u].precioTotalInversores);

            if(u === 0){
                oldAcercamiento = acercamiento;
            }
            if(oldAcercamiento >= newAcercamiento){
                oldAcercamiento = newAcercamiento;

                objCombinacion.inversor.idInversor = __inversores[u].idInversor;
                objCombinacion.inversor.nombreInversor = __inversores[u].nombreInversor;
                objCombinacion.inversor.marcaInversor = __inversores[u].marcaInversor;
                objCombinacion.inversor.potenciaInversor = __inversores[u].potenciaInversor;
                objCombinacion.inversor.potenciaNominalInversor = __inversores[u].potenciaNominalInversor;
                objCombinacion.inversor.precioInversor = __inversores[u].precioInversor;
                objCombinacion.inversor.potenciaMaximaInversor = __inversores[u].potenciaMaximaInversor;
                objCombinacion.inversor.numeroDeInversores = __inversores[u].numeroDeInversores;
                objCombinacion.inversor.potenciaPicoInversor = __inversores[u].potenciaPicoInversor;
                objCombinacion.inversor.porcentajeSobreDimens = parseFloat(__inversores[u].porcentajeSobreDimens);
                objCombinacion.inversor.costoTotalInversores = __inversores[u].precioTotalInversores;
            }
        }
    };

    mediaCostoTotInversores = mediaCostoTotInversores(__inversores);
    inversorCombMediana(__inversores,mediaCostoTotInversores);

    _combinacionMediana.push(objCombinacion);
    
    newData = {
        arrayBTI: _combinacionMediana,
        origen: data.origen,
        destino: data.destino,
        tarifa: data.tarifa,
        consumos: __consumos
    };

    ///Se calculan viaticos
    _combinacionMediana = await bajaTension.obtenerViaticos_Totales(newData);
    _combinacionMediana.push(objCombinacion.combinacion);

     return _combinacionMediana;
}

async function getCombinacionOptima(data, __consumos){//MayorProduccion
    var origen = data.origen || null;
    var __paneles = data._paneles || null;
    var newData = {};
    var _combinacionOptima = [];

    objCombinacion.combinacion = "optima";

    if(__paneles.length > 0){
        var oldProduccion = 0;
        var newProduccion = 0;

        for(var i=1; i<__paneles.length; i++)
        {   
            potenciaReal = parseFloat(__paneles[i].panel.potenciaReal);

            objCombinacionOptima = { consumos:__consumos, origen, potenciaReal };

            newData = await bajaTension.getPowerBTI(objCombinacionOptima);
            _generacionPower = newData.generacion;

            var totalNewGeneration = (_arr) => {
                generation = 0;

                for(var a=0; a<_arr.length; a++)
                {
                    generation += _arr[a];
                }
                return generation;
            };

            newProduccion = totalNewGeneration(_generacionPower);

            //Comparacion de mayor produccion
            if(i === 1){
                oldProduccion = newProduccion;
            }
            
            if(oldProduccion <= newProduccion){
                oldProduccion = newProduccion;

                objCombinacion.panel.idPanel = __paneles[i].panel.idPanel;
                objCombinacion.panel.nombrePanel = __paneles[i].panel.nombre;
                objCombinacion.panel.marcaPanel = __paneles[i].panel.marca;
                objCombinacion.panel.potenciaPanel = __paneles[i].panel.potencia;
                objCombinacion.panel.cantidadPaneles = __paneles[i].panel.noModulos;
                objCombinacion.panel.potenciaReal = __paneles[i].panel.potenciaReal;
                objCombinacion.panel.costoDeEstructuras = __paneles[i].panel.costoDeEstructuras;
                objCombinacion.panel.precioPorWatt = __paneles[i].panel.costoPorWatt;
                objCombinacion.panel.costoTotalPaneles = __paneles[i].panel.costoTotalPaneles;
            }
        }
    }

    var __inversores = await bajaTension.obtenerInversores_Requeridos(objCombinacion.panel);

    if(__inversores.length > 0){
        var oldSobredimension = 0;
        var newSobredimension = 0;

        for(var x=0; x<__inversores.length; x++)
        {
            newSobredimension = parseFloat(__inversores[x].porcentajeSobreDimens);
            newInversorPrice = parseFloat(__inversores[x].precioTotalInversores);

            //Filtro para seleccionar el inversor con mayor sobredimensionamiento y menor precio
            if(x == 0){
                oldSobredimension = newSobredimension;
                oldInversorPrice = newInversorPrice;
            }
            
            if(oldSobredimension <= newSobredimension /* && oldInversorPrice >= newInversorPrice */){
                oldSobredimension = newSobredimension;
                /* oldInversorPrice = newInversorPrice; */

                objCombinacion.inversor.idInversor = __inversores[x].idInversor;
                objCombinacion.inversor.nombreInversor = __inversores[x].nombreInversor;
                objCombinacion.inversor.marcaInversor = __inversores[x].marcaInversor;
                objCombinacion.inversor.potenciaInversor = __inversores[x].potenciaInversor;
                objCombinacion.inversor.potenciaNominalInversor = __inversores[x].potenciaNominalInversor;
                objCombinacion.inversor.precioInversor = __inversores[x].precioInversor;
                objCombinacion.inversor.potenciaMaximaInversor = __inversores[x].potenciaMaximaInversor;
                objCombinacion.inversor.numeroDeInversores = __inversores[x].numeroDeInversores;
                objCombinacion.inversor.potenciaPicoInversor = __inversores[x].potenciaPicoInversor;
                objCombinacion.inversor.porcentajeSobreDimens = parseFloat(__inversores[x].porcentajeSobreDimens);
                objCombinacion.inversor.costoTotalInversores = parseFloat(__inversores[x].precioTotalInversores);
            }
        }
    }

    _combinacionOptima.push(objCombinacion);
    
    newData = {
        arrayBTI: _combinacionOptima,
        origen: origen,
        destino: data.destino,
        tarifa: data.tarifa,
        consumos: __consumos
    };

    ///Se calculan viaticos
    _combinacionOptima = await bajaTension.obtenerViaticos_Totales(newData);
    _combinacionOptima.push(objCombinacion.combinacion);

    return _combinacionOptima;
}
/*#endregion*/
/*#endregion*/