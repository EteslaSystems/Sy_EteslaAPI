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

//1er paso (main).
async function obtenerEnergiaPaneles_Requeridos(data){ //BT = Baja_Tension
    let consumos = data.consumos;
    let tarifa = data.tarifa;
    let _arrayResult = [];

    let promedioDeConsumos = promedio_consumos(consumos);
    let objPropuestaPaneles = { consumos: { promedioDeConsumos } }; // Se guarda la informacion referente a los consumos, para una futura implementacion [Hoja: POWER]
    let potenciaRequerida = await calcular_potenciaRequerida(promedioDeConsumos, tarifa, data);
    limiteProduc = potenciaRequerida.limite;
    potenciaRequerida = potenciaRequerida.potenciaNecesaria;

    objPropuestaPaneles = {
        consumo: {
            _promCons: promedioDeConsumos,
            potenciaNecesaria: potenciaRequerida
        }
    };

    _arrayResult.push(objPropuestaPaneles);

    let _noPaneles = await panel.numeroDePaneles(potenciaRequerida);

    for(let x=0; x<_noPaneles.length; x++)
    {
        _noPaneles[x].costoTotal = Math.round(((_noPaneles[x].fPrecio * _noPaneles[x].fPotencia) * _noPaneles[x].noModulos) * 100) / 100;

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
        for(let i=0; i<consumos.length; i++)
        {
            promConsumosBim += parseFloat(consumos[i]);
        }
        promConsumosBim = Math.round((promConsumosBim / consumos.length) * 100)/100;
        return promConsumosBim;
    };
    let consumoMensual = (consumos) => {
        /* Retorna un promedio de consumo mensual y un array con los consumos mensuales */
        _consumMens = [];
        promConsums = 0;

        for(let i=0; i<consumos.length; i++)
        {
            consumMens = parseFloat(consumos[i] / 2); //Bimestre / 2  
            
            for(let x=0; x<2; x++)
            {
                _consumMens.push(consumMens);
            }
        }
        
        _consumMens.forEach(function(consumoMensual){
            promConsums += consumoMensual;
        });
        
        promConsums = Math.round((promConsums/_consumMens.length)*100)/100;

        return {
            promedioConsumoMensual: promConsums,
            _consumosMensuales: _consumMens
        };
    };
    let consumoAnual = (consMesual) => {
        _consumosMensual = consMesual._consumosMensuales;
        consAnual = 0;

        for(let i=0; i<_consumosMensual.length; i++)
        {
            consAnual += parseFloat(_consumosMensual[i]);
        }
        
        return consAnual;  
    };
    let consumoDiario = (cnsAnual) => {
        return  Math.round((cnsAnual / 365) * 100) / 100;
    };

    promConsumosBimestrales = promConsumosBimestrales(consumos);
    promedioConsumosMensuales = promConsumosBimestrales / 2;
    consumoMensual = consumoMensual(consumos);
    consumoAnual = consumoAnual(consumoMensual);
    consumoDiario = consumoDiario(consumoAnual);

    return {
        promedioConsumosMensuales: promedioConsumosMensuales,
        promConsumosBimestrales: promConsumosBimestrales,
        consumoMensual: consumoMensual,
        consumoAnual: consumoAnual,
        consumoDiario: consumoDiario,
        _consumosBimestrales: consumos
    };
}

async function calcular_potenciaRequerida(objPromedioDeConsumos, tarifa, data){
    let limite = 0, objetivoDAC = 0, potenciaNecesaria = 0;
    
    try{
        let origen = data.origen;
        let irradiacion = await irradiacionBT.irradiacion_BT(origen);
        let porcentajePropuesta = parseFloat(data.porcentajePropuesta) / 100 || 0;

        switch(tarifa)
        {
            //Los datos estan definidos en *BIMESTRAL* (limite, objetivoDAC, etc) [kw]
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
        consumoDiario = Math.round(objPromedioDeConsumos.consumoDiario);
        /*-------*/
        cuanto_menos = limite - (promedioConsumsMensuales * 2 * 0.10);
        
        if(cuanto_menos < objetivoDAC){
            objetivoDAC = cuanto_menos;
        }

        if(objetivoDAC < 0 || objetivoDAC > (promedioConsumsMensuales * 2)){
            objetivoDAC = 0;
        }

        let subsidio_diario = (objetivoDAC * 6) / 365;

        let porcentajeEficiencia = origen == "Veracruz" ? 73 : 82;
        porcentajeEficiencia = porcentajeEficiencia / 100;

        if(porcentajePropuesta == 0){
            potenciaNecesaria = Math.round(((((consumoDiario - subsidio_diario) / irradiacion) / porcentajeEficiencia) * 1000) * 100) / 100;
        }
        else{
            potenciaNecesaria = Math.round(((((consumoDiario * porcentajePropuesta) / irradiacion) / porcentajeEficiencia) * 1000) * 100) / 100; 
        }

        return {
            potenciaNecesaria: potenciaNecesaria, //Watts
            limite: limite
        };
    }
    catch(error){
        console.log(error);
        throw error;
    }
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
