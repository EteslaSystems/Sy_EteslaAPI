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
var objPropuestaPaneles = {};

//1er paso (main).
async function obtenerEnergiaPaneles_Requeridos(data){ //BT = Baja_Tension
    var origen = data.origen;
    var irradiacion = await irradiacionBT.irradiacion_BT(origen);
    var consumos = data.consumos;
    var tarifa = data.tarifa;
    var _arrayResult = [];

    promedioDeConsumos = await promedio_consumos(consumos);
    objPropuestaPaneles = { consumos: { promedioDeConsumos } }; // Se guarda la informacion referente a los consumos, para una futura implementacion [Hoja: POWER]
    nConsumoAnual = promedioDeConsumos.consumoAnual;
    promedioConsumoTotalKwh = promedioDeConsumos.promConsumosBimestrales;
    potenciaRequerida = await calcular_potenciaRequerida(nConsumoAnual, tarifa, data);
    limiteProduc = potenciaRequerida.limite;
    potenciaRequerida = potenciaRequerida.potenciaNecesaria;
    consumoDiario = Math.round((nConsumoAnual / 365) * 100) / 100;

    objPropuestaPaneles = {
        consumo: {
            consumoAnual: nConsumoAnual,
            promedioConsumo: promedioConsumoTotalKwh,
            potenciaNecesaria: potenciaRequerida
        }
    };

    _arrayResult.push(objPropuestaPaneles);

    _noPaneles = await panel.numeroDePaneles(consumoDiario, irradiacion, eficiencia, limiteProduc);

    for(var x=0; x<_noPaneles.length; x++)
    {
        idPanel = _noPaneles[x].idPanel;
        nombrePanel = _noPaneles[x].nombre;
        marcaPanel = _noPaneles[x].marca;
        potenciaPanel = parseFloat(_noPaneles[x].potencia);
        potenciaRealPanel = parseFloat(_noPaneles[x].potenciaReal);
        noModulosP = parseFloat(_noPaneles[x].noModulos);
        precioPanel = parseFloat(_noPaneles[x].precioPorPanel);
        costoEstructuras = parseFloat(_noPaneles[x].costoDeEstructuras);
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
        
        _arrayResult.push(objPropuestaPaneles);
    }

    return _arrayResult;
}

//2do. paso 
async function promedio_consumos(consumos){ 
    var promConsumosBimestrales = (consumos) => {
        promConsumosBim = 0;
        for(var i=0; i<consumos.length; i++)
        {
            promConsumosBim += parseFloat(consumos[i]);
        }
        promConsumosBim = promConsumosBim / consumos.length;
        return promConsumosBim;
    };
    var consumoMensual = (consumos) => {
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
    var consumoAnual = (consMesual) => {
        _consumosMensual = consMesual._consumosMensuales;
        consAnual = 0;

        for(var i=0; i<_consumosMensual.length; i++)
        {
            consAnual += parseFloat(_consumosMensual[i]);
        }
        
        return consAnual;  
    };
    var consumoDiario = (cnsAnual) => {
        consDiario = Math.round((cnsAnual / 365) * 100) / 100;
        return consDiario;
    };

    promConsumosBimestrales = promConsumosBimestrales(consumos);
    consumoMensual = consumoMensual(consumos);
    consumoAnual = consumoAnual(consumoMensual);
    consumoDiario = consumoDiario(consumoAnual);

    objResp = {
        promConsumosBimestrales: promConsumosBimestrales,
        consumoMensual: consumoMensual,
        consumoAnual: consumoAnual,
        consumoDiario: consumoDiario,
    };

    return objResp;
}

async function calcular_potenciaRequerida(consumoAnual, tarifa, data){ //2 /*OBSERVAR*/
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
    
    porcPerd = origen == "Veracruz" ? 82 : 73;
    porcentajePerdida = await calcularPorcentajePerdida(porcPerd);
    potenciaNecesaria = Math.round((((consumoAnual / irradiacion) / (1 - porcentajePerdida))/365) * 100) / 100;
    potenciaNecesaria = potenciaNecesaria >= limite ? limite - 1 : potenciaNecesaria;

    objCalcularPot = {
        potenciaNecesaria: potenciaNecesaria,
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







function calcular_strings(){
    var inversor_ = 'x';
    var panel_ = 'x';

    var max_strings = Math.floor(inversor.vmax / panel.voc);
    var min_strings = Math.ceil(inversor.vmin / panel.vmp);

    calcular_paneles(max_strings, min_strings);
}