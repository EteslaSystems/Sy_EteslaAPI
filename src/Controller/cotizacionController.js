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

var arrayComparativo = [];

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
    var _inversores = [];
    var __combinacionOptima = [];
    var __combinacionMediana = [];
    var __combinacionEconomica = [];
    var newData = {};

    if(tipoCotizacion == 'bajaTension'){
        _paneles = await bajaTension.firstStepBT(data);
        newData = {_paneles: _paneles};

        await getCombinacionEconomica(newData);
    }
    else{

    }
}

async function getCombinacionEconomica(data){
    var __paneles = data._paneles || null;
    var _combinacionEconomica = [];
    var objCombinacionPaneles = {};
    var objCombinacionInversores = {};
    var oldPanelPrice = 0;
    var newPanelPrice = 0;
    var oldInversorPrice = 0;
    var newInversorPrice = 0;

    if(__paneles.length > 0){
        for(var i=1; i<__paneles.length; i++)
        {
            newPanelPrice = parseFloat(__paneles[i].panel.costoTotalPaneles);
            
            if(i === 1){
                oldPanelPrice = parseFloat(__paneles[i].panel.costoTotalPaneles);
            }
            else if(oldPanelPrice >= newPanelPrice){
                oldPanelPrice = 0;
                oldPanelPrice += newPanelPrice;
                
                objCombinacionPaneles = {
                    id_panel: __paneles[i].panel.idPanel,
                    nombre_panel: __paneles[i].panel.nombre,
                    marca_panel: __paneles[i].panel.marca,
                    costoTotal_paneles:  __paneles[i].panel.costoTotalPaneles,
                    potenciaReal: __paneles[i].panel.potenciaReal
                };
            }
        }



        console.log('objCombinacionPaneles says:');
        console.log(objCombinacionPaneles);
    }

    var __inversores = await bajaTension.obtenerInversores_Requeridos(objCombinacionPaneles);
    __inversores = __inversores.message;

    if(__inversores.length > 0){
        for(var j=0; j<__inversores.length; j++)
        {
            newInversorPrice = parseFloat(__inversores.precioTotalInversores);

            if(oldInversorPrice < newInversorPrice){
                objCombinacionInversores = {
                    idInversor: idInversor.__inversores[j],
				    nombreInversor: nombreInversor.__inversores[j],
                    marcaInversor: marcaInversor.__inversores[j],
                    precioTotalInversores: precioTotalInversores.__inversores[j]
                };
            }
        }
        console.log('objCombinacionInversores says:');
        console.log(objCombinacionInversores);
    }
    
    ///Procurar completar el objeto aca de tal manera que se vaya desplegada la parte del objeto Panel/Inversor
    ///y sea menos engorroso el calcular viaticos
}

async function getCombinacionOptima(data){
    var __paneles = data._paneles || null;
    var __inversores = data._inversores || null;
    var _combinacionOptima = [];
    var objCombinacionOptima = {};

    if(__paneles != null){

    }
    else if(__inversores != null){

    }
    else{
        return -1;
    }
}

async function getCombinacionMediana(data){
    var __paneles = data._paneles || null;
    var __inversores = data._inversores || null;
    var _combinacionMediana = [];
    var objCombinacionMediana = {};

    if(__paneles != null){
        
    }
    else if(__inversores != null){

    }
    else{
        return -1;
    }
}
/*#endregion*/