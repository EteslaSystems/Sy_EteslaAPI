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

var eficiencia = 0.82;
var limite = 0;
var objetivoDAC = 0;

var potenciaRequerida = 0;

//1er paso.
async function obtenerEnergiaPaneles_Requeridos(data){ //BT = Baja_Tension
    var origen = data.origen;
    var irradiacion = await irradiacionBT.irradiacion_BT(origen);
    var consumos = data.consumos;
    var tarifa = data.tarifa;
    var arrayResult = [];
    var objPropuestaPaneles = {};

    __promedioConsumos = await promedio_consumos(consumos);
    _potenciaRequerida = await calcular_potenciaRequerida(__promedioConsumos, tarifa, data);
    var limiteProduccion = _potenciaRequerida[0].limite;

    var consumoAnual = (consums) => {
        consumo_anual=0;

        if(consums.length < 12){
            for(var x=0; x<12; x++)
            {
                consumo_anual += parseFloat(consums[0].consumos);
            }

            consumo_anual = Math.round(consumo_anual * 100) / 100;

            return consumo_anual;
        }
    };

    var promedioConsumoTotalkWh = (consumoAnual) => {
        promedio_consumoTotalkWh = parseFloat(consumoAnual / 12);
        promedio_consumoTotalkWh = Math.round(promedio_consumoTotalkWh * 100) / 100;
        return promedio_consumoTotalkWh;
    };

    nConsumoAnual = consumoAnual(consumos);
    nPromedioConsumoTotalKwH = promedioConsumoTotalkWh(nConsumoAnual);

    objPropuestaPaneles = {
        consumo: {
            consumoAnual: nConsumoAnual,
            promedioConsumo: nPromedioConsumoTotalKwH,
            potenciaNecesaria: _potenciaRequerida[0].potenciaRequerida
        }
    };

    arrayResult.push(objPropuestaPaneles);

    _arrayNoDePaneles = await panel.numeroDePaneles(__promedioConsumos[0], irradiacion, eficiencia, limiteProduccion);
    
    for(var x=0; x<_arrayNoDePaneles.length; x++)
    {
        idPanel = _arrayNoDePaneles[x].idPanel;
        nombrePanel = _arrayNoDePaneles[x].nombre;
        marcaPanel = _arrayNoDePaneles[x].marca;
        potenciaPanel = parseFloat(_arrayNoDePaneles[x].potencia);
        potenciaRealPanel = parseFloat(_arrayNoDePaneles[x].potenciaReal);
        noModulosP = parseFloat(_arrayNoDePaneles[x].noModulos);
        precioPanel = parseFloat(_arrayNoDePaneles[x].precioPorPanel);
        costoEstructuras = parseFloat(_arrayNoDePaneles[x].costoDeEstructuras);
        costoPorWatt = precioPanel;
        costoTotalPaneles = parseFloat((precioPanel * potenciaPanel) * noModulosP);

        objPropuestaPaneles = { 
            panel: {
                idPanel: idPanel,
                nombre: nombrePanel,
                marca: marcaPanel,
                potencia: potenciaPanel,
                potenciaReal: potenciaRealPanel,
                noModulos: noModulosP,
                costoDeEstructuras: costoEstructuras,
                costoPorWatt: costoPorWatt,
                costoTotalPaneles: costoTotalPaneles
            }
        };
        
        arrayResult.push(objPropuestaPaneles);
    }

    return arrayResult;
}

//2do. paso 
async function promedio_consumos(consumos){ 
    var m = consumos.length === 12 ? 2 : 1;
    var _promedioConsumos = [];
    var sumaConsumos = 0;

    for(var i=0; i<consumos.length; i++)
    {
        sumaConsumos = parseFloat(consumos[i].consumos);
    }
    
    consumoDiario = parseFloat(((sumaConsumos / consumos.length) * 6 * m) / 365);
    consumoMensual = parseFloat((consumoDiario * 365) / 12);

    _promedioConsumos.push(consumoDiario, consumoMensual);

    return _promedioConsumos;
}

async function calcular_potenciaRequerida(__promedioConsumos, tarifa, data){ //2 /*OBSERVAR*/
    var origen = data.origen;
    var irradiacion = await irradiacionBT.irradiacion_BT(origen);
    var porcentaje = parseFloat(data.porcentaje) / 100 || 0;
    var objCalcularPot = {};
    var _calcularPot = [];

    switch(tarifa)
    {
        case '1':
            limite = 500;
            objetivoDAC = 250;
            limitepotenciaRequerida = 50500;
        break;
        case '1a':
            limite = 600;
            objetivoDAC = 350;
            limitepotenciaRequerida = 50500;
        break;
        case '1b':
            limite = 800;
            objetivoDAC = 450;
            limitepotencia = 50500;
        break;
        case '1c':
            limite = 1700;
            objetivoDAC = 850;
            limitepotencia = 50500;
        break;
        case '1d':
            limite = 2000;
            objetivoDAC = 1000;
            limitepotencia = 50500;
        break;
        case '1e':
            limite = 4000;
            objetivoDAC = 1800;
            limitepotencia = 50500;
        break;
        case '1f':
            limite = 5000;
            objetivoDAC = 5000;
            limitepotencia = 50500;
        break;
        case '2':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 30000;
        break;
        case 'IC':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 30000;
        break;
        case '3':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 30000;
        break;
        case 'OM':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 500000;
        break;
        case 'HM':
            limite = 0;
            objetivoDAC = 0;
            limitepotencia = 500000;
        break;
        default:
            0;
        break;
    }
    
    cuanto_menos = Math.abs(limite - (__promedioConsumos[1] * 2 * 0.10));

    if(cuanto_menos < objetivoDAC){
        objetivoDAC = cuanto_menos;
    }
    else if(objetivoDAC < 0 || objetivoDAC > (__promedioConsumos[1] * 2)){
        objetivoDAC = 0;
    }

    var subsidio_diario = (objetivoDAC * 6)/365;

    if(origen === 'Veracruz'){
        if(porcentaje === 0){
            /*?potenciaRequerida?*/ potenciaRequerida = ((__promedioConsumos[0] - subsidio_diario / irradiacion) / 0.82/*Eficienia*/) * 1000;
        }
        else{
            /*?potenciaRequerida?*/ potenciaRequerida = (((__promedioConsumos[0] * porcentaje) / irradiacion) / 0.82)/*Eficienia*/ * 1000;
        }
    }
    else{
        if(/*?porcentaje?*/ porcentaje === 0){
            /*?potenciaRequerida?*/ potenciaRequerida = ((__promedioConsumos[0] - subsidio_diario / irradiacion) / 0.73/*Eficienia*/) * 1000;
        }
        else{
            /*?potenciaRequerida?*/ potenciaRequerida = (((__promedioConsumos[0] * porcentaje) / irradiacion) / 0.73/*Eficienia*/) * 1000;
        }
    }

    objCalcularPot = {
        limite: parseInt(limite/2),
        objetivoDAC: objetivoDAC,
        potenciaRequerida: potenciaRequerida
    };

    _calcularPot.push(objCalcularPot);

    return _calcularPot;
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







function calcular_strings(){
    var inversor_ = 'x';
    var panel_ = 'x';

    var max_strings = Math.floor(inversor.vmax / panel.voc);
    var min_strings = Math.ceil(inversor.vmin / panel.vmp);

    calcular_paneles(max_strings, min_strings);
}