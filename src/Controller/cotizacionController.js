/*
- @description: 		Combinaciones (Busqueda inteligente)
- @author: 				LH420
- @date: 				20/03/2020
*/
const bajaTension = require('../Controller/bajaTensionController');
const mediaTension = require('../Controller/mediaTensionController');
const configFile = require('../Controller/configFileController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');

var oldPanelPrice = 0;
var newPanelPrice = 0;
var oldInversorPrice = 0;
var newInversorPrice = 0;
var objCombinacion = {
    combinacion: null,
    panel: null, 
    inversor: null
};


/*#region SwitchCotizaciones*/
/*#endregion*/
/*#region Busqueda_inteligente*/
async function mainBusquedaInteligente(data){
    let tipoCotizacion = data.tipoCotizacion;
    let porcentajePropuesta = parseInt(data.porcentajePropuesta);
    let descuento = parseInt(data.porcentajeDescuento);
    let _paneles = [];
    let newData = {};
    let __combinaciones = [];
    let __combinacionMediana = [], __combinacionEconomica = [], __combinacionOptima = [];
    
    try{
        //Datos cliente
        let uCliente = await cliente.consultarId({ idPersona: data.idCliente });
        uCliente = uCliente.message; 
        uCliente = uCliente[0];

        //Datos vendedor
        let uVendedor = await vendedor.consultarId({ idPersona: data.idUsuario });
        uVendedor = uVendedor.message;
        uVendedor = uVendedor[0];
        
        if(tipoCotizacion == 'bajaTension'){ //BajaTension
            _paneles = await bajaTension.firstStepBT(data);
            _consumos = _paneles[0].consumo;
            _arrayConsumos = _paneles[0];
            newData = { idUsuario: data.idUsuario, idCliente: data.idCliente, _paneles: _paneles, origen: data.origen, destino: data.destino, tarifa:data.tarifa, porcentajePropuesta, descuento };
    
            __combinacionMediana = await getCombinacionMediana(newData, _consumos);
            __combinacionEconomica = await getCombinacionEconomica(newData, _consumos);
            __combinacionOptima = await getCombinacionOptima(newData, _consumos);
        }
        /* else{ //MediaTension
    
        } */
    
        let objCombinaciones = {
            cliente: uCliente,
            vendedor: uVendedor,
            _arrayConsumos: _arrayConsumos,
            combinacionMediana: __combinacionMediana,
            combinacionEconomica: __combinacionEconomica,
            combinacionOptima: __combinacionOptima,
            tipoCotizacion: data.tipoCotizacion,
            combinaciones: true
        };
    
        __combinaciones[0] = objCombinaciones;
    
        return __combinaciones;
    }
    catch(error){
        console.log(error);
    }
}

/*#region Combinaciones*/
async function getCombinacionEconomica(data, __consumos){
    let __paneles = data._paneles || null;
    let _combinacionEconomica = [];

    objCombinacion.combinacion = "economica";

    try{
        if(__paneles.length > 0){
            for(let i=1; i<__paneles.length; i++)
            {
                newPanelPrice = parseFloat(__paneles[i].panel.costoTotal);
    
                if(i == 1){
                    oldPanelPrice = newPanelPrice;
                }
    
                if(oldPanelPrice >= newPanelPrice){
                    oldPanelPrice = newPanelPrice;
                    
                    objCombinacion.panel = __paneles[i].panel;
                }
            }
        }
    
        let objRequest = { objPanelSelect: { panel: objCombinacion.panel, potenciaNecesaria: __consumos } };
    
        let __inversores = await bajaTension.obtenerInversores_Requeridos(objRequest);
    
        if(__inversores.length > 0){
            for(let j=0; j<__inversores.length; j++)
            {
                newInversorPrice = parseFloat(__inversores[j].precioTotalInversores);
    
                if(j === 0){
                    oldInversorPrice = newInversorPrice;
                }
    
                if(oldInversorPrice >= newInversorPrice){
                    oldInversorPrice = newInversorPrice;
    
                    objCombinacion.inversor = __inversores[j];
                }
            }
        }
        
        _combinacionEconomica.push(objCombinacion);
        
        let newData = {
            idUsuario: data.idUsuario,
            idCliente: data.idCliente,
            arrayBTI: _combinacionEconomica,
            origen: data.origen,
            destino: data.destino,
            tarifa: data.tarifa,
            consumos: __consumos,
            tipoCotizacion: 'CombinacionCotizacion'
        };
    
        ///Se calculan viaticos
        _combinacionEconomica = await bajaTension.obtenerViaticos_Totales(newData);
        _combinacionEconomica.push(objCombinacion.combinacion);
    
        return _combinacionEconomica;
    }
    catch(error){
        console.log(error);
    }
}

async function getCombinacionMediana(data, __consumos){//Mediana
    let __paneles = data._paneles || null;
    let __inversores = data._inversores || null;
    let _panelesSelectos = [];
    let _combinacionMediana = [];

    try{
        let mediaCostoTotPaneles = (_panelSelected) => {
            mediaDePrecios = 0;
            
            for(var k=0; k<_panelSelected.length; k++)
            {
                mediaDePrecios += parseFloat(_panelSelected[k].costoTotal);
            }

            mediaDePrecios = Math.round((mediaDePrecios / _panelSelected.length) * 100) / 100;
            return mediaDePrecios;
        };
        let panelCombMediana = (_panelSelecto, mediaCostoTPaneles) => {
            acercamiento = 0;
            oldAcercamiento = 0;
            newAcercamiento = 0;

            for(var u=0; u<_panelSelecto.length; u++)
            {
                acercamiento = Math.abs(Math.round((mediaCostoTPaneles - _panelSelecto[u].costoTotal) * 100) / 100);

                if(u === 0){
                    oldAcercamiento = acercamiento;
                }
                if(oldAcercamiento >= newAcercamiento){
                    oldAcercamiento = newAcercamiento;

                    objCombinacion.panel = _panelSelecto[u];
                }
            }
        };
        let mediaCostoTotInversores = (_inversoreSelected) => {
            mediaDePrecios = 0;
            
            for(var k=0; k<_inversoreSelected.length; k++)
            {
                mediaDePrecios += parseFloat(_inversoreSelected[k].precioTotal);
            }

            mediaDePrecios = Math.round((mediaDePrecios / _inversoreSelected.length) * 100) / 100;
            return mediaDePrecios;
        };
        let inversorCombMediana = (_inversSelect, mediaCostoTInv) => {
            acercamiento = 0;
            oldAcercamiento = 0;
            newAcercamiento = 0;
            objInversorComb = {};

            for(let u=0; u<_inversSelect.length; u++)
            {
                acercamiento = Math.abs(mediaCostoTInv - _inversSelect[u].precioTotal);

                if(u === 0){
                    oldAcercamiento = acercamiento;
                }
                if(oldAcercamiento >= newAcercamiento){
                    oldAcercamiento = newAcercamiento;

                    objCombinacion.inversor = __inversores[u];
                }
            }
        };

        let marcaEspecificaPanel = await configFile.getArrayOfConfigFile();
        marcaEspecificaPanel = marcaEspecificaPanel.busqueda_inteligente.combinacionMediana_marcaEspecificaPanel.toString();
        objCombinacion.combinacion = "mediana";

        if(__paneles.length > 0){
            //Se seleccionan paneles de la marcaEspecifica
            for(let i=1; i<__paneles.length; i++)
            {
                if(__paneles[i].panel.marca === marcaEspecificaPanel){
                    _panelesSelectos.push(__paneles[i].panel);
                }
            }

            mediaCostoTotPaneles = mediaCostoTotPaneles(_panelesSelectos);
            panelCombMediana(_panelesSelectos, mediaCostoTotPaneles); //:void
        }

        let objRequest = { objPanelSelect: { panel: objCombinacion.panel, potenciaNecesaria: __consumos } };

        __inversores = await bajaTension.obtenerInversores_Requeridos(objRequest);

        mediaCostoTotInversores = mediaCostoTotInversores(__inversores);
        inversorCombMediana(__inversores,mediaCostoTotInversores);// :void

        _combinacionMediana.push(objCombinacion);
        
        let newData = {
            arrayBTI: _combinacionMediana,
            origen: data.origen,
            destino: data.destino,
            tarifa: data.tarifa,
            descuento: data.descuento,
            consumos: __consumos,
            tipoCotizacion: 'CombinacionCotizacion'
        };

        ///Se calculan viaticos
        _combinacionMediana = await bajaTension.obtenerViaticos_Totales(newData);
        _combinacionMediana.push(objCombinacion.combinacion);

        return _combinacionMediana;
    }
    catch(error){
        console.log(error);
    }
}

async function getCombinacionOptima(data, __consumos){//MayorProduccion
    let origen = data.origen || null;
    let __paneles = data._paneles || null;
    let _combinacionOptima = [];

    objCombinacion.combinacion = "optima";

    try{
        if(__paneles.length > 0){
            let oldProduccion = 0;
            let newProduccion = 0;
    
            for(let i=1; i<__paneles.length; i++)
            {   
                potenciaReal = parseFloat(__paneles[i].panel.potenciaReal);
    
                objCombinacionOptima = { consumos:__consumos, origen, potenciaReal, tarifa: data.tarifa };
    
                let newData = await bajaTension.getPowerBTI(objCombinacionOptima);
                _generacionPower = newData.generacion;
    
                newProduccion = _generacionPower.generacionAnual;
    
                //Comparacion de mayor produccion
                if(i === 1){
                    oldProduccion = newProduccion;
                }
                
                if(oldProduccion <= newProduccion){
                    oldProduccion = newProduccion;
    
                    objCombinacion.panel = __paneles[i].panel;
                }
            }
        }
    
        let objRequest = { objPanelSelect: { panel: objCombinacion.panel, potenciaNecesaria: __consumos } };
    
        let __inversores = await bajaTension.obtenerInversores_Requeridos(objRequest);
    
        if(__inversores.length > 0){
            var oldSobredimension = 0;
            var newSobredimension = 0;
    
            for(let x=0; x<__inversores.length; x++)
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
    
                    objCombinacion.inversor = __inversores[x];
                }
            }
        }
    
        _combinacionOptima.push(objCombinacion);
        
        let newData = {
            idUsuario: data.idUsuario,
            idCliente: data.idCliente,
            arrayBTI: _combinacionOptima,
            origen: data.origen,
            destino: data.destino,
            tarifa: data.tarifa,
            consumos: __consumos,
            tipoCotizacion: 'CombinacionCotizacion'
        };
    
        ///Se calculan viaticos
        _combinacionOptima = await bajaTension.obtenerViaticos_Totales(newData);
        _combinacionOptima.push(objCombinacion.combinacion);
    
        return _combinacionOptima;
    }
    catch(error){
        console.log(error);
    }
}
/*#endregion*/
/*#endregion*/

module.exports.mainBusqInteligente = async function(data){
    const result = await mainBusquedaInteligente(data);
    return result;
}