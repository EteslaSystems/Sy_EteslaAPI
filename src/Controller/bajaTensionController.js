/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Baja Tension
- @author: 				LH420
- @date: 				24/07/2020
*/
const irradiacionBT = require('../Controller/irradiacionController'); //BT = BajaTension
const inversor = require('../Controller/inversorController');
const panel = require('../Controller/panelesController');
const viaticosBT = require('../Controller/opcionesViaticsController');

var eficiencia = 0.82;
var limite = 0;
var objetivoDAC = 0;
var limitepotenciaRequerida = 0;

var potenciaRequerida = 0;

//1er paso.
async function obtenerEnergiaPaneles_Requeridos(data){ //BT = Baja_Tensino
    var irradiacion = await irradiacionBT.irradiacion_BT(origen);
    var consumos = /*data.consumos*/'';
    var tarifa = /*data.tarifa*/'';

    __promedioConsumos = await promedio_consumos(consumos);
    _potenciaRequerida = await calcular_potenciaRequerida(__promedioConsumos, tarifa, origen);
    var limiteProduccion = _potenciaRequerida.limite[0].objCalcularPot.limite;

    _arrayNoDePaneles = await panel.paneles.numeroDePaneles(__promedioConsumos[0], irradiacion, eficiencia, limiteProduccion);
    
    for(var x=0; x<_arrayNoDePaneles.length; x++)
    {
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

//2ndo paso.
async function obtenerInversores_Requeridos(data){
    const result = await inversor.obtenerInversores_cotizacion(data);
    return result;
}

//3er. paso (last)
async function obtenerViaticos_Totales(data){
    const result = await viaticosBT.calcularViaticosBTI(data);
    return result;
}


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

async function calcular_potenciaRequerida(__promedioConsumos, tarifa, origen){ //2 /*OBSERVAR*/
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

    cuanto_menos = limite - (consumo_mensual * 2 * 0.10);
    objetivoDAC = cuanto_menos < objetivoDAC ? cuanto_menos : -1;
    objetivoDAC = objetivoDAC < 0 || objetivoDAC > (consumo_mensual * 2) ? 0 : -1; //????

    var subsidio_diario = (objetivoDAC * 6)/365;

    if(origen === 'Veracruz'){
        if(porcentaje === 0){
            /*?potenciaRequerida?*/ potenciaRequerida = ((__promedioConsumos[0] - subsidio_diario / irradiacion) / 0.82) * 1000;
        }
        else{
            /*?potenciaRequerida?*/ potenciaRequerida = (((__promedioConsumos[0] * porcentaje) / irradiacion) / 0.82) * 1000;
        }
    }
    else{
        if(/*?porcentaje?*/ porcentaje === 0){
            /*?potenciaRequerida?*/ potenciaRequerida = ((__promedioConsumos[0] - subsidio_diario / irradiacion) / 0.73) * 1000;
        }
        else{
            /*?potenciaRequerida?*/ potenciaRequerida = (((__promedioConsumos[0] * porcentaje) / irradiacion) / 0.73) * 1000;
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

module.exports.firstStepBT = async function(data){
    const result = await obtenerEnergiaPaneles_Requeridos(data);
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

async function generacion(origen){
    var generacion = [];

    for(var x=0; x<=12; x++)
    {
        if(origen == 'CDMX' || origen == 'Puebla'){
            generacion[x] = Math.floor(5.42 * (/*?potenciaRequerida?*/ potenciaRequerida/1000) * 0.73 * 30.4);
        }
        else{
            generacion[x] = Math.floor(4.6 * (/*?potenciaRequerida?*/ potenciaRequerida/1000) * 0.83 * 30.4);
        }
    }

    return generacion;
}

async function nuevos_consumos(consumos){
    var consumos_nuevos = [];
    var _generacion = await generacion(origen);

    for(var x=0; x<consumos.length; x++)
    {
        consumos_nuevos[x] = Math.floor(consumos[x] - _generacion[x]);
    }

    return consumos_nuevos;
}