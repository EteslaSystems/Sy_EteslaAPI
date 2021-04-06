/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Baja Tension
- @author: 				LH420
- @date: 				24/07/2020
*/
const irradiacionBT = require('../Controller/irradiacionController'); //BT = BajaTension
const inversor = require('../Controller/inversorController');
const panel = require('../Controller/panelesController');
const viaticosBT = require('../Controller/opcionesViaticsController');
const power = require('../Controller/powerController');

var limite = 0;
var objetivoDAC = 0;
var potenciaRequerida = 0;
var objPropuestaPaneles = {};

//1er paso (main).
async function obtenerEnergiaPaneles_Requeridos(data){ //BT = Baja_Tension
    let consumos = data.consumos;
    let tarifa = data.tarifa;
    let _arrayResult = [];

    promedioDeConsumos = promedio_consumos(consumos);
    objPropuestaPaneles = { consumos: { promedioDeConsumos } }; // Se guarda la informacion referente a los consumos, para una futura implementacion [Hoja: POWER]
    potenciaRequerida = await calcular_potenciaRequerida(promedioDeConsumos, tarifa, data);
    limiteProduc = potenciaRequerida.limite;
    potenciaRequerida = potenciaRequerida.potenciaNecesaria;

    objPropuestaPaneles = {
        consumo: {
            _promCons: promedioDeConsumos,
            potenciaNecesaria: potenciaRequerida
        }
    };

    _arrayResult.push(objPropuestaPaneles);

    _noPaneles = await panel.numeroDePaneles(potenciaRequerida);

    for(var x=0; x<_noPaneles.length; x++)
    {
        costoTotalPaneles = Math.round(((parseFloat(_noPaneles[x].precioPorPanel * _noPaneles[x].potencia)) * _noPaneles[x].noModulos) * 100) / 100;
        _noPaneles[x].costoTotal = costoTotalPaneles;

        objPropuestaPaneles = {
            panel: _noPaneles[x]
        };

        _arrayResult.push(objPropuestaPaneles);
    }

    return _arrayResult;
}

function promedio_consumos(consumos){
    //Retorna todo en kwh
    let promConsumosBimestrales = (consumos) => {
        promConsumosBim = 0;
        for(var i=0; i<consumos.length; i++)
        {
            promConsumosBim += parseFloat(consumos[i]);
        }
        promConsumosBim = promConsumosBim / consumos.length;
        return promConsumosBim;
    };
    let consumoMensual = (consumos) => {
        /* Retorna un promedio de consumo mensual y un array con los consumos mensuales */
        _consumMens = [];
        promConsums = 0;

        for(var i=0; i<consumos.length; i++)
        {
            consumMens = parseFloat(consumos[i] / 2); //Bimestre / 2  
            
            for(var x=0; x<2; x++)
            {
                _consumMens.push(consumMens);
            }
        }
        
        _consumMens.forEach(function(consumoMensual){
            promConsums += consumoMensual;
        });
        
        promConsums = promConsums/_consumMens.length;

        objResult = {
            promedioConsumoMensual: promConsums,
            _consumosMensuales: _consumMens
        };

        return objResult;
    };
    let consumoAnual = (consMesual) => {
        _consumosMensual = consMesual._consumosMensuales;
        consAnual = 0;

        for(var i=0; i<_consumosMensual.length; i++)
        {
            consAnual += parseFloat(_consumosMensual[i]);
        }
        
        return consAnual;  
    };
    let consumoDiario = (cnsAnual) => {
        consDiario = Math.round((cnsAnual / 365) * 100) / 100;
        return consDiario;
    };

    promConsumosBimestrales = promConsumosBimestrales(consumos);
    promedioConsumosMensuales = promConsumosBimestrales / 2;
    consumoMensual = consumoMensual(consumos);
    consumoAnual = consumoAnual(consumoMensual);
    consumoDiario = consumoDiario(consumoAnual);

    objResp = {
        promedioConsumosMensuales: promedioConsumosMensuales,
        promConsumosBimestrales: promConsumosBimestrales,
        consumoMensual: consumoMensual,
        consumoAnual: consumoAnual,
        consumoDiario: consumoDiario
    };

    return objResp;
}

async function calcular_potenciaRequerida(objPromedioDeConsumos, tarifa, data){ 
    let origen = data.origen;
    let irradiacion = await irradiacionBT.irradiacion_BT(origen);
    let porcentajePropuesta = parseFloat(data.porcentajePropuesta) / 100 || 0;
    let objCalcularPot = {};

    switch(tarifa)
    {
        //Los datos estan definidos en "bimestral" (limite, objetivoDAC, etc)
        case '1':
            limite = 500;
            objetivoDAC = 200;
            limitepotenciaRequerida = 50500;
            tarifaIndustrial = false;
        break;
        case '1a':
            limite = 600;
            objetivoDAC = 250;
            limitepotenciaRequerida = 50500;
            tarifaIndustrial = false;
        break;
        case '1b':
            limite = 800;
            objetivoDAC = 300;
            limitepotencia = 50500;
            tarifaIndustrial = false;
        break;
        case '1c':
            limite = 1700;
            objetivoDAC = 800;
            limitepotencia = 50500;
            tarifaIndustrial = false;
        break;
        case '1d':
            limite = 2000;
            objetivoDAC = 900;
            limitepotencia = 50500;
            tarifaIndustrial = false;
        break;
        case '1e':
            limite = 2500;
            objetivoDAC = 1100;
            limitepotencia = 50500;
            tarifaIndustrial = false;
        break;
        case '1f':
            limite = 3000;
            objetivoDAC = 1250;
            limitepotencia = 50500;
            tarifaIndustrial = false;
        break;
        case '2':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 30000;
            tarifaIndustrial = true;
        break;
        case 'IC':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 30000;
            tarifaIndustrial = true;
        break;
        case '3':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 30000;
            tarifaIndustrial = true;
        break;
        case 'OM':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 500000;
            tarifaIndustrial = true;
        break;
        case 'HM':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 500000;
            tarifaIndustrial = true;
        break;
        default:
            0;
        break;
    }
    
    promedioConsumsMensuales = objPromedioDeConsumos.promedioConsumosMensuales;
    consumoDiario = objPromedioDeConsumos.consumoDiario;
    /*-------*/
    cuanto_menos = limite - (promedioConsumsMensuales * 2 * 0.10);
    objetiveDac = cuanto_menos < objetivoDAC ? cuanto_menos : 0;
    objetiveDac = objetivoDAC > objPromedioDeConsumos.promConsumosBimestrales ? 0 : objetiveDac;

    subsidio_diario = tarifaIndustrial == true ? 0 : Math.round(((objetiveDac * 6) / 365) * 100)/100;

    let porcentajePerdida = origen == "Veracruz" ? 82 : 73;
    porcentajePerdida = await calcularPorcentajePerdida(porcentajePerdida);

    if(tarifaIndustrial === false && porcentajePropuesta === 0 || porcentajePropuesta > 0){
        ///Propuesta NUEVA
        if(porcentajePropuesta === 0){ 
            ///Se obtiene un [porcentaje random de =20 a 50=] 
            porcentajePropuesta = Math.floor(Math.random() * (50 - 20) + 20) / 100;
        }

        potenciaNecesaria = Math.round((((consumoDiario * porcentajePropuesta) / irradiacion) / porcentajePerdida) * 100) / 100 ; 
    }
    else{/*PDBT*/
        ///Propuesta al 100%
        potenciaNecesaria = Math.round((((consumoDiario - subsidio_diario) / irradiacion) / porcentajePerdida) * 100) / 100;
    }

    if(tarifaIndustrial != true){
        potenciaNecesaria = potenciaNecesaria >= limite ? limite - 1 : potenciaNecesaria;
    }

    potenciaNecesaria = potenciaNecesaria * 1000; 

    objCalcularPot = {
        potenciaNecesaria: potenciaNecesaria, //Watts
        limite: limite
    };

    return objCalcularPot;
}

async function calcularPorcentajePerdida(porcentajePerdida){
    var porcentajePerdida = porcentajePerdida / 100;
	return porcentajePerdida;
}

//1er. paso
module.exports.firstStepBT = async function(data){
    const result = await obtenerEnergiaPaneles_Requeridos(data);
    return result;
}

//1.5 paso [POWER]
module.exports.getPowerBTI = async function(data){
    const result = await power.obtenerPowerBTI(data);
    return result;
}

//2do. paso
module.exports.obtenerInversores_Requeridos = async function(data){
    const result = await inversor.obtenerInversores_cotizacion(data);
    return result;
}

//3er. paso (the last)
module.exports.obtenerViaticos_Totales = async function(data){
    const result = await viaticosBT.calcularViaticosBTI(data);
    return result;
}
/*----------------------------------LO DE ABAJO NO SE A PROGRAMADO BIEN---------------------------------------------------*/
