/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Baja Tension
- @author: 				LH420
- @date: 				24/07/2020
*/
const irradiacionBT = require('../Controller/irradiacionController'); //BT = BajaTension
const inversor = require('../Controller/inversorController');
const panel = require('../Controller/panelesController');

var limite = 0;
var objetivoDAC = 0;
var limitePotencia = 0;

var potencia = 0;

async function promedio_consumos(consumos){
    var m = consumos.length === 12 ? 2 : 1;
    var _promedioConsumos = [];

    consumos.each(function(value){
        sumaConsumos += parseInt(value);
    });
    
    consumoDiario = ((sumaConsumos / consumos.length) * 6 * m) / 365;
    consumoMensual = (consumoDiario * 365) / 12;

    _promedioConsumos.push(consumoDiario, consumoMensual);

    return _promedioConsumos;
}

async function calcular_potencia(data){ /*OBSERVAR*/
    var _promedioConsumos = await promedio_consumos(consumos);
    irradiacion = await irradiacionBT.irradiacion_BT(origen);
    origen = data.origen;
    porcentaje = parseFloat(data.porcentaje) / 100;

    switch(tarifa)
    {
        case '1':
            limite = 500;
            objetivoDAC = 250;
            limitePotencia = 50500;
        break;
        case '1a':
            limite = 600;
            objetivoDAC = 350;
            limitePotencia = 50500;
        break;
        case '1b':
            limite = 800;
            objetivoDAC = 450;
            limitePotencia = 50500;
        break;
        case '1c':
            limite = 1700;
            objetivoDAC = 850;
            limitePotencia = 50500;
        break;
        case '1d':
            limite = 2000;
            objetivoDAC = 1000;
            limitePotencia = 50500;
        break;
        case '1e':
            limite = 4000;
            objetivoDAC = 1800;
            limitePotencia = 50500;
        break;
        case '1f':
            limite = 5000;
            objetivoDAC = 5000;
            limitePotencia = 50500;
        break;
        case '2':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 30000;
        break;
        case 'IC':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 30000;
        break;
        case '3':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 30000;
        break;
        case 'OM':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 500000;
        break;
        case 'HM':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 500000;
        break;
        default:
            return -1;
        break;
    }

    cuanto_menos = limite - (consumo_mensual * 2 * 0.10);
    objetivoDAC = cuanto_menos < objetivoDAC ? cuanto_menos : -1;
    objetivoDAC = objetivoDAC < 0 || objetivoDAC > (consumo_mensual * 2) ? 0 : -1; //????

    var subsidio_diario = (objetivoDAC * 6)/365;

    if(origen === 'Veracruz'){
        if(porcentaje == 1){
            /*?potencia?*/ potencia = ((_promedioConsumos[0] - subsidio_diario / irradiacion) / 0.82) * 1000;
        }
        else{
            /*?potencia?*/ potencia = (((_promedioConsumos[0] * porcentaje) / irradiacion) / 0.82) * 1000;
        }
    }
    else{
        if(/*?porcentaje?*/ porcentaje == 1){
            /*?potencia?*/ potencia = ((_promedioConsumos[0] - subsidio_diario / irradiacion) / 0.73) * 1000;
        }
        else{
            /*?potencia?*/ potencia = (((_promedioConsumos[0] * porcentaje) / irradiacion) / 0.73) * 1000;
        }
    }

    if(limitePotencia < potencia){
        var potencia_inversor = limitePotencia;
    }

    var potenciao = potencia;
}

function calcular_strings(){
    var inversor_ = 'x';
    var panel_ = 'x';

    var max_strings = Math.floor(inversor.vmax / panel.voc);
    var min_strings = Math.ceil(inversor.vmin / panel.vmp);

    calcular_paneles(max_strings, min_strings);
}

function calcular_paneles(maxStrings, minStrings){
    var inversor_ = 'x';
    var panel_ = 'x';
    var paneles = Math.round(inversor.fPotencia / panel.fPotencia);

    while(paneles * panel_.fPotencia <= inversor_.iPmax)
    {
        for(var i=maxStrings; i > minStrings; i--)
        {
            if(paneles % i == 0  || (paneles % i == 1 && inversor_.vMarca == "Schneider")){
                var paralelos = paneles / i;
                var series = paneles / paralelos;

                if(paralelos * panel_.fISC < inversor_.fISC){
                    //??
                    break;
                }
            }
        }

        paneles++;
    }

    paneles = Math.round(/*?potencia?*/ potencia / panel_.fPotencia);
    panel_potencia = paneles * panel_.fPotencia;
}

async function generacion(origen){
    var generacion = [];

    for(var x=0; x<=12; x++)
    {
        if(origen == 'CDMX' || origen == 'Puebla'){
            generacion[x] = Math.floor(5.42 * (/*?potencia?*/ potencia/1000) * 0.73 * 30.4);
        }
        else{
            generacion[x] = Math.floor(4.6 * (/*?potencia?*/ potencia/1000) * 0.83 * 30.4);
        }
    }

    return generacion;
}

function nuevos_consumos(consumos){
    var consumos_nuevos = [];
    var _generacion = await generacion(origen);

    for(var x=0; x<consumos.length; x++)
    {
        consumos_nuevos[x] = Math.floor(consumos[x] - generacion[x]);
    }

    return consumos_nuevos;
}