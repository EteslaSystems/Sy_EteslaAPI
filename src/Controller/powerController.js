const tarifa = require('../Controller/tarifaController');

async function getIrradiacionDiasDeMesesDelAnio(){
    var objMeses = {};

    objMeses = {
        enero: {dias: 31, irradiacion: 3.65},
        febrero: {dias: 28, irradiacion: 4.23},
        marzo: {dias: 31, irradiacion: 4.86},
        abril: {dias: 30, irradiacion: 5.35},
        mayo: {dias: 31, irradiacion: 5.46},
        junio: {dias: 30, irradiacion: 5.07},
        julio: {dias: 31, irradiacion: 5.27},
        agosto: {dias: 31, irradiacion: 5.05},
        septiembre: {dias: 30, irradiacion: 4.46},
        octubre: {dias: 31, irradiacion: 4.29},
        noviembre: {dias: 30, irradiacion: 3.95},
        diciembre: {dias: 31, irradiacion: 3.55}
    }

    /*
    NOTA: La propiedad de 'irradiacion' del objeto 'objMeses' debe de ser dinamica y esta tiene que ser obtenida por datos de la API de la NASA
    */
    objMeses = Object.values(objMeses);

    return objMeses;
}

//MEDIA TENSION
/*#region Datos_Consumo*/
module.exports.getCD_DatosConsumo_ = async function(data){
    const res = await getCD_DatosConsumo(data);
    return res;
}

//1er. Paso:
async function getCD_DatosConsumo(data){
    var objCD = { C:0, D:0 };
    var C = 0;
    var D = 0;
    var tipoCotizacion = data.tipoCotizacion;
    arrayMeses_ = await getIrradiacionDiasDeMesesDelAnio();

    var arrayCD = [];

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        var bkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkwh) || 0;
        var ikwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikwh) || 0;
        var pkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkwh) || 0;
        var bkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkw) || 0;
        var ikw = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikw) || 0;
        var pkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkw) || 0;
        var dias = arrayMeses_[i].dias;
        
        if(tipoCotizacion === "GDMTH"){
            C = Math.round(Math.min(pkw, ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)), ((bkwh + ikwh + pkwh)/(24 * dias * 0.52))));
        }
        else{
            C = (bkwh + ikwh + pkwh)/(24 * dias * 0.52);
        }

        D = Math.round(Math.min(Math.max(bkw, ikw, pkw),((bkwh + ikwh + pkwh)/(24 * dias * 0.52))));

        //console.log('C: '+C+'\nD: '+D);
        //console.log('-----------------------------');

        objCD = {
            C: C,
            D: D
        }

        arrayCD.push(objCD);
    }
    
    arrayResult = await getProduccionIntermedia(data, arrayCD);

    console.log('respuesta: ');
    console.log(arrayResult);

    return arrayResult;
}
/*#endregion*/

/*#region Produccion Solar*/
async function getProduccionBase(){
    var produccionBase = 0;
    return produccionBase;
}

async function getProduccionPunta(){
    var produccionPunta = 0;
    return produccionPunta;
}

//2do. paso (2.1) /*Start [este deberia de ser el primer paso]*/
async function getProduccionIntermedia(data, arrayCD){ //La data debera traer como dato extra "potenciaReal" y "porcentajeDePerdida"
    var produccionIntermedia = 0;
    var __produccionIntermedia = [];
    var potenciaReal = parseFloat(data.potenciaReal);
    porcentajePerdida = parseFloat((data.porcentajePerdida)/100);
    arrayMeses_ = await getIrradiacionDiasDeMesesDelAnio();

    var objResponse = {};
    var arrayResponse = [];

    for(var i=0; i<arrayMeses_.length; i++)
    {
        diasMes = arrayMeses_[i].dias;
        irradicionMes = arrayMeses_[i].irradiacion;

        produccionIntermedia = Math.round(potenciaReal * irradicionMes * diasMes * (1 - porcentajePerdida));
        __produccionIntermedia.push(produccionIntermedia);
    }
    //console.log('getProduccionIntermedia() says: ');
    //console.log(__produccionIntermedia);

    arrayPagosTotales = await getBIP_DespuesDeSolar(data, arrayCD, __produccionIntermedia);
    arrayProduccionAnual = await getProduccionAnual_KwhMwh(__produccionIntermedia);

    objResponse = {
        arrayPagosTotales: arrayPagosTotales,
        arrayProduccionAnual: arrayProduccionAnual
    };

    arrayResponse.push(objResponse);

    return arrayResponse;
}

async function getProduccionAnual_KwhMwh(_produccionIntermedia){
    var produccionAnualKwh = 0;
    var produccionAnualMwh = 0;
    var objProduccionAnual = {};
    var __produccionAnual = [];
    
    for(var i=0; i<_produccionIntermedia.length; i++)
    {
        produccionAnualKwh += parseFloat(_produccionIntermedia[i]);
    }
    
    produccionAnualMwh = Math.round(parseFloat(produccionAnualKwh) / 1000);
    
    //console.log('Produccion Anual Kwh: '+produccionAnualKwh+'\nProduccion Anual Mwh: '+produccionAnualMwh);
    
    objProduccionAnual = {
        produccionAnualKwh: produccionAnualKwh,
        produccionAnualMwh: produccionAnualMwh
    };
    
    __produccionAnual.push(objProduccionAnual);
    
    return __produccionAnual;
}

/*#endregion*/

/*#region Consumos Despues de Solar*/
//2do. paso (2.2)
async function getBIP_DespuesDeSolar(data, _arrayCD, _produccionIntermedia){
    arrayMeses_ = await getIrradiacionDiasDeMesesDelAnio();
    var produccionBase = await getProduccionBase();
    var produccionPunta = await getProduccionPunta();
    var _newBIP = [];
    var newBIP = {newB: 0, newI: 0, newP: 0, newC: 0, newD: 0};

    var bkwh = 0;
    var ikwh = 0;
    var pkwh = 0;
    var bkw = 0;
    var ikw = 0;
    var pkw = 0;

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    { 
        bkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkwh) || 0;
        ikwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikwh) || 0;
        pkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkwh) || 0;
        bkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkw) || 0;
        ikw = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikw) || 0;
        pkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkw) || 0;
        
        var produccionIntermedia = parseFloat(_produccionIntermedia[i]);
        diasMes = arrayMeses_[i].dias;

        newB = Math.round((bkwh - produccionBase) * 100) / 100;
        newI = Math.round((ikwh - produccionIntermedia) * 100) / 100;
        newP = Math.round((pkwh - produccionPunta) * 100) / 100;
        newC = Math.round((Math.min(pkw, (newB + newI + newP) / (24 * diasMes * 0.57))) * 100) / 100;
        newD = Math.round((Math.min(Math.max(bkw, ikw, pkw), (newB + newI + newP) / (24 * diasMes * 0.57))) * 100) / 100;
        
        newBIP = {
            newB: newB,
            newI: newI,
            newP: newP,
            newC: newC,
            newD: newD
        }

        _newBIP.push(newBIP);
    }

    // console.log('getBIP_DespuesDeSolar says:\n');
    // console.log(_newBIP);

    arrayPagosTotales = await getBIPMXN_kWh(data, _arrayCD, _newBIP);
    return arrayPagosTotales;
}
/*#endregion*/

/*#region Tarifas_CFE*/
//3er. Paso
async function getBIPMXN_kWh(data, arrayCD, newBIP){
    var objBIPMXN_kwh = {};
    var _bipMXN_kWh = [];

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        var bkwh = parseFloat(data.arrayPeriodosGDMTH[i].bkwh) || 0;
        var ikwh = parseFloat(data.arrayPeriodosGDMTH[i].ikwh) || 0;
        var pkwh = parseFloat(data.arrayPeriodosGDMTH[i].pkwh) || 0;
        var bmxn = parseFloat(data.arrayPeriodosGDMTH[i].bmxn) || 0;
        var imxn = parseFloat(data.arrayPeriodosGDMTH[i].imxn) || 0;
        var pmxn = parseFloat(data.arrayPeriodosGDMTH[i].pmxn) || 0;
        var cmxn = parseFloat(data.arrayPeriodosGDMTH[i].cmxn) || 0;
        var dmxn = parseFloat(data.arrayPeriodosGDMTH[i].dmxn) || 0;

        var ckw = arrayCD[i].C;
        var dkw = arrayCD[i].D;

        var newB = newBIP[i].newB;
        var newI = newBIP[i].newI;
        var newP = newBIP[i].newP;

        bmxn_kwh = Math.round((bmxn / bkwh) * 100) / 100;
        imxn_kwh = Math.round((imxn / ikwh) * 100) / 100;
        pmxn_kwh = Math.round((pmxn / pkwh) * 100) / 100;
        cmxn_kw = Math.round((cmxn / ckw) * 100) / 100;
        dmxn_kw = Math.round((dmxn / dkw) * 100) / 100;

        energiaFaltante = newB + newI + newP;

        objBIPMXN_kwh = {
            bmxn_kwh: bmxn_kwh,
            imxn_kwh: imxn_kwh,
            pmxn_kwh: pmxn_kwh,
            cmxn_kw: cmxn_kw,
            dmxn_kw: dmxn_kw,
            energiaFaltante: energiaFaltante
        }

        _bipMXN_kWh.push(objBIPMXN_kwh);
    }
    // console.log('getBIPMXN_kWh:\n');
    // console.log(_bipMXN_kWh);

    arrayPagosTotales = getPagosTotales(data, _bipMXN_kWh, arrayCD, newBIP);

    return arrayPagosTotales;
}
/*#endregion*/

/*#region Pagos_totales*/
//4to. paso
async function getPagosTotales(data, bipMXN_kWh, arrayCD, newBIP){
    var sumaTodosLosEnergiaSinSolar = 0;
    var sumaTodosLosPagoTransmi = 0;
    var objPagosTotales = {};
    var _pagosTotales = [];
    var __pagTotls = [];
    
    var result = {};
    var arrayResult = [];

    /*#region SIN_SOLAR*/
    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        var bkwh = parseFloat(data.arrayPeriodosGDMTH[i].bkwh) || 0;
        var ikwh = parseFloat(data.arrayPeriodosGDMTH[i].ikwh) || 0;
        var pkwh = parseFloat(data.arrayPeriodosGDMTH[i].pkwh) || 0;

        var pagoTransmi = parseFloat(data.arrayPeriodosGDMTH[i].pagoTransmi);
        var bmxn_kwh = bipMXN_kWh[i].bmxn_kwh || 0;
        var imxn_kwh = bipMXN_kWh[i].imxn_kwh || 0;
        var pmxn_kwh = bipMXN_kWh[i].pmxn_kwh || 0;
        var cmxn_kw = bipMXN_kWh[i].cmxn_kw || 0;
        var dmxn_kw = bipMXN_kWh[i].dmxn_kw || 0;

        var ckw = arrayCD[i].C;
        var dkw = arrayCD[i].D;

        if(data.tipoCotizacion === "GDMTH"){
            energia = Math.round((bkwh * bmxn_kwh + ikwh *imxn_kwh + pkwh * pmxn_kwh) * 100) / 100;
        }
        else{
            energia = Math.round((bkwh * bmxn_kwh + ikwh *imxn_kwh + pkwh) * 100) / 100
        }

        
        capacidad = Math.round((dkw * dmxn_kw) * 100) / 100;
        distribucion = Math.round((ckw * cmxn_kw) * 100) / 100;
        iva = Math.round((((pagoTransmi + energia + capacidad + distribucion) + 500) * 0.16) * 100) / 100;
        total = Math.round((pagoTransmi + energia + capacidad + distribucion + iva) * 100) /100;

        objPagosTotales = {
            sinSolar: {
                energia: energia,
                capacidad: capacidad,
                distribucion: distribucion,
                iva: iva,
                total: total
            }
        };

        _pagosTotales.push(objPagosTotales);
    }
    /*#endregion*/
    /*#region CON_SOLAR*/
    for(var n=0; n<_pagosTotales.length; n++)
    {
        sumaTodosLosEnergiaSinSolar += parseFloat(_pagosTotales[n].sinSolar.energia);
    }

    for(var x=0; x<data.arrayPeriodosGDMTH.length; x++)
    {
        sumaTodosLosPagoTransmi += parseFloat(data.arrayPeriodosGDMTH[x].pagoTransmi);
    }

    for(var j=0; j<data.arrayPeriodosGDMTH.length; j++)
    {
        var newB = parseFloat(newBIP[j].newB);
        var newI = parseFloat(newBIP[j].newI);
        var newP = parseFloat(newBIP[j].newP);
        var newC = parseFloat(newBIP[j].newC);
        var newD = parseFloat(newBIP[j].newD);

        var bmxn_kwh = parseFloat(bipMXN_kWh[j].bmxn_kwh) || 0;
        var imxn_kwh = parseFloat(bipMXN_kWh[j].imxn_kwh) || 0;
        var pmxn_kwh = parseFloat(bipMXN_kWh[j].pmxn_kwh) || 0;
        var cmxn_kw = parseFloat(bipMXN_kWh[j].cmxn_kw) || 0;
        var dmxn_kw = parseFloat(bipMXN_kWh[j].dmxn_kw) || 0;

        /*---------------ENERGIA_SIN_SOLAR---------------*/
        energia_sinSolar = _pagosTotales[j].sinSolar.energia;
        capacidad_sinSolar = _pagosTotales[j].sinSolar.capacidad;
        distribucion_sinSolar = _pagosTotales[j].sinSolar.distribucion;
        iva_sinSolar = _pagosTotales[j].sinSolar.iva;
        total_sinSolar = _pagosTotales[j].sinSolar.total;
        /*---------------ENERGIA_CON_SOLAR---------------*/
        energia = Math.round((newB * bmxn_kwh + newI * imxn_kwh + newP * pmxn_kwh) * 100) / 100;
        transmision = Math.round(((sumaTodosLosPagoTransmi / sumaTodosLosEnergiaSinSolar) * energia) * 100) / 100;
        capacidad = Math.round((newC * cmxn_kw) * 100) / 100;
        distribucion = Math.round((newD * dmxn_kw) * 100) / 100;
        iva = Math.round((transmision + capacidad + distribucion + energia) * 100) / 100;
        total = Math.round((transmision + energia + capacidad + distribucion + iva) * 100) / 100;

        objPagosTotales = {
            sinSolar: {
                energia: energia_sinSolar,
                capacidad: capacidad_sinSolar,
                distribucion: distribucion_sinSolar,
                iva: iva_sinSolar,
                total: total_sinSolar
            },
            conSolar: {
                energia: energia,
                transmision: transmision,
                capacidad: capacidad,
                distribucion: distribucion,
                iva: iva,
                total: total
            }
        };

        __pagTotls.push(objPagosTotales);
    }
    /*#endregion*/

    arrayTotalesAhorro = await getTotales_Ahorro(__pagTotls);
    radiacion = await getRadiacion(); 

    result = {
        arrayPagosTotales: __pagTotls,
        arrayTotalesAhorro: arrayTotalesAhorro,
        radiacion: radiacion
    }

    arrayResult.push(result);
    
    return arrayResult;
}
/*#endregion*/

/*#region Celdas_Arriba(Radiacion, Produccion_Anual(kWh), Produccion_Anual(mWh), Total, Total, Ahorro, Porcentaje)*/
async function getRadiacion(){
    var _arrayMeses = await getIrradiacionDiasDeMesesDelAnio();
    var promedioIrradiaciones = 0;
    var sumaDiasDelMes = 0;

    for(var i=0; i<_arrayMeses.length; i++)
    {
        promedioIrradiaciones += parseFloat(_arrayMeses[i].irradiacion);
        sumaDiasDelMes += parseFloat(_arrayMeses[i].dias);
        promedioIrradiaciones = i+1 == _arrayMeses.length ? Math.round((promedioIrradiaciones / _arrayMeses.length) * 100) / 100 : promedioIrradiaciones;
    }
    
    radiacion = Math.ceil(promedioIrradiaciones * sumaDiasDelMes);
    return radiacion;
}

async function getTotales_Ahorro(pagosTotales){
    var pagosTotales_Ahorro = {};
    var __pagosTotalesAhorro = [];
    var totalSinSolar = 0;
    var totalConSolar = 0;
    var ahorroCifra = 0;
    var ahorroPorcentaje = 0;

    for(var i=0; i<pagosTotales.length; i++)
    {
        totalSinSolar += parseFloat(pagosTotales[i].sinSolar.total);
        totalConSolar += parseFloat(pagosTotales[i].conSolar.total);
    }

    ahorroCifra = totalConSolar > 0 ? Math.round((totalSinSolar - totalConSolar) * 100) / 100 : parseFloat(totalSinSolar - 12000);
    ahorroPorcentaje = Math.round((ahorroCifra / totalSinSolar) * 100) / 100;
    ahorroPorcentaje = ahorroPorcentaje * 100;

    pagosTotales_Ahorro = {
        totalSinSolar: totalSinSolar,
        totalConSolar: totalConSolar,
        ahorroCifra: ahorroCifra,
        ahorroPorcentaje: ahorroPorcentaje
    };

    __pagosTotalesAhorro.push(pagosTotales_Ahorro);

    return __pagosTotalesAhorro;
}
/*#endregion*/

//BTI - BajaTension_Individual
/*#region Power_BTI*/
async function getPowerBTI(data){
    var objResult = { nuevosConsumos: '', porcentajePotencia:'', generacion:'' };
    var _consumos = data.consumos || null;
    var tarifa = data.tarifa || null;
    var origen = data.origen;
    var potenciaReal = data.potenciaReal; 
    var consumoPromedio = (consumos) => {
        var promedioConsumo = 0;
        
        for(var i=0; i<consumos.length; i++)
        {
            promedioConsumo += parseFloat(consumos[i]);    
        }
        promedioConsumo = promedioConsumo / consumos.length;
        return promedioConsumo;
    };

    var _consumosMensuales = (_consums) => {
        consMens = 0;
        _consMens = [];

        for(var i=0; i<_consums.length; i++)
        {
            consMens = parseFloat(_consums[i] / 2);
            for(var x=0; x<2; x++){
                _consMens.push(consMens);
            }
        }

        var promedioDeConsumosMensuales = (arrayConsumosMns) => {
            promedioCnsmsMens = 0;
            for(var x=0; x<arrayConsumosMns.length; x++)
            {
                promedioCnsmsMens += parseFloat(arrayConsumosMns[x]);
            }
            return promedioCnsmsMens = promedioCnsmsMens / arrayConsumosMns.length;
        };

        promedioDeConsumosMensuales = promedioDeConsumosMensuales(_consMens);

        objectResp = {
            _consumosMensuales: _consMens,
            promedioDeConsumosMensuales: promedioDeConsumosMensuales
        };
        
        return objectResp;
    }

    _consumosMensuales = _consumosMensuales(_consumos);

    var _generacion = await getGeneration(origen, potenciaReal); //GeneracionMensual

    if(_consumos != null){
        var _nuevosConsumos = await getNewConsumption(_consumosMensuales, _generacion);
        consumoPromedio = consumoPromedio(_consumos);
        porcentajePotencia = Math.floor((_generacion.promedioDeGeneracion / _consumosMensuales.promedioDeConsumosMensuales) * 100);
        
        if(tarifa != null){
            dac_o_nodac = await dac(tarifa, consumoPromedio);
            //objConsumosPesos = await consumo_pesos(dac_o_nodac, consumoPromedio);
        }
        
        objResult.nuevosConsumos = _nuevosConsumos;
        objResult.porcentajePotencia = porcentajePotencia;
    }

    objResult.generacion = _generacion;
    
    return objResult;
}

async function getGeneration(origen, potenciaReal){
    var _generation = [];

    for(var i=0; i<12; i++)
    {
        if(origen.toString() === "Veracruz"){
            gener = Math.round((Math.floor(/*irradiacion->*/4.6 * potenciaReal) * 0.83 * 30.4) * 100) / 100;
            _generation.push(gener);
        }
        else{
            gener = Math.round((Math.floor(/*irradiacion->*/5.42 * potenciaReal) * 0.73 * 30.4) * 100) / 100;
            _generation.push(gener);
        }
    }

    var promedioDeGeneracion = (_generacn) => {
        promDGeneracion = 0;

        for(var i=0; i<_generacn.length; i++)
        {
            promDGeneracion += _generacn[i];
        }

        return promDGeneracion = (promDGeneracion / _generacn.length) * 1000; //kwh
    }

    promeDGeneracion = promedioDeGeneracion(_generation);

    objrespuesta = {
        _generacion: _generation,
        promedioDeGeneracion: promeDGeneracion
    };

    return objrespuesta;
}

async function getNewConsumption(__consumos, __generacion){
    var _consumosNuevos = [];
    __generacion = __generacion._generacion;
    __consumos = __consumos._consumosMensuales;

    for(var x=0; x<__consumos.length; x++)
    {
        _consumosNuevos[x] = Math.floor(__consumos[x] - __generacion[x]);
    }

    return _consumosNuevos;
}

async function dac(tarifa, consumoPromedio){
    consmProm = consumoPromedio/2; //Promedio de consumos (*MENSUAL*)
    switch(tarifa)
    {
        case '1':
            tarifa = consmProm >= 200 ? 'DAC' : tarifa;
        break;
        case '1a':
            tarifa = consmProm >= 250 ? 'DAC' : tarifa;
        break;
        case '1b':
            tarifa = consmProm >= 300 ? 'DAC' : tarifa;
        break;
        case '1c':
            tarifa = consmProm >= 800 ? 'DAC' : tarifa;
        break;
        case '1d':
            tarifa = consmProm >= 900 ? 'DAC' : tarifa;
        break;
        case '1e':
            tarifa = consmProm >= 1100 ? 'DAC' : tarifa;
        break;
        case '1f':
            tarifa = consmProm >= 1250 ? 'DAC' : tarifa;
        break;
        default:
            tarifa = -1;
        break;
    }

    return tarifa;
}

async function consumo_pesos(dac_o_nodac, consumo_promedio){
    var dac_o_nodac = dac_o_nodac; //Tarifa
    var meses = [];
    var pagos = [];
    var _bimestral = [];
    var factor = 0;
    var no_verano = (__tarifas) => {
        noverano = [];

        for(var x=0; x<__tarifas.length; x++)
        {
            if(__tarifas[x].vNombreTarifa == dac_o_nodac && __tarifas[x].siVerano == 0 && __tarifas[x].siNivel != 0){
                noverano.push(__tarifas[x]);
            }
        }
        return noverano;
    };
    var verano = (__tarifas) => {
        _verano = [];

        for(var x=0; x<__tarifas.length; x++)
        {
            if(__tarifas[x].vNombreTarifa == dac_o_nodac && __tarifas[x].siVerano == 1 && __tarifas[x].siNivel != 0){
                _verano.push(__tarifas[x]);
            }
        }
        return _verano;
    };
    var demanda = (__tarifas) => {
        _demanda = [];

        for(var x=0; x<__tarifas.length; x++)
        {
            if(__tarifas[x].vNombreTarifa == dac_o_nodac && __tarifas[x].siVerano == 0 && __tarifas[x].siNivel == 0){
                _demanda.push(__tarifas[x]);
            }
        }
        return _demanda;
    };

    var _tarifas = await tarifa.obtenerTodasLasTarifas();
    _tarifas = _tarifas.message;

    _no_verano = no_verano(_tarifas);
    _verano = verano(_tarifas);
    _demanda = demanda(_tarifas);

    costoDemanda = demanda.length > 0 ? demanda.fPrecio : 0;

    if(verano.length > 0){
        meses = [0,1,2,9,10,11];
        factor = 0.824;
    }
    else{
        meses = [0,1,2,3,4,5,6,7,8,9,10,11];
        factor = 1;
    }

    for(var h=0; h<12; h++)
    {
        var rango_alto = 0;
        var rango_bajo = 0;
        var escalon;

        pagos[h] = 0;  //???? -Posibilidad de eliminar esta porqueria

        if(meses.includes(h) == true){
            while(escalon = noverano[0])
            {
                rango_bajo = rango_alto;
                rango_alto += escalon.iRango;

                if((consumo_promedio * factor) > rango_bajo){
                    pagos[h] = pagos[h] + escalon.iRango * escalon.fPrecio;
                }
                else{
                    pagos[h] = pagos[h] + ((consumo_promedio * factor) - rango_bajo) * escalon.fPrecio;
                }
            }
        }
        else{
            while(escalon = verano[0])
            {
                rango_bajo = rango_alto;
                rango_alto += escalon.iRango;

                if((consumo_promedio * 1.172) > rango_bajo){
                    if((consumo_promedio * 1.172) > rango_alto && escalon.iRango != 0){
                        pagos[h] = pagos[h] + escalon.iRango * escalon.fPrecio;
                    }   
                    else{
                        pagos[h] = pagos[h] + ((consumo_promedio * 1.172) - rango_bajo) * escalon.fPrecio;
                    }
                }   
            }
        }
    }

    var pago_demanda;

    if(Array.isArray(demanda) == true){
        for(var z=0; z<demanda.length; z++)
        {
            pago_demanda = Math.floor(parseFloat(demanda[z] * costoDemanda));
        }
    }
    else{
        demanda = 1;
        pago_demanda = Math.floor(demanda * costoDemanda);
    }

    var _pagos = []; //??new??

    if(Array.isArray(pago_demanda) == true){
        for(var k=0; k<pago_demanda.length; k++)
        {
            pagosCalculo = Math.floor(pago_demanda[k] + pagos[k]);
            _pagos.push(pagosCalculo);
        }
    }

    _bimestral[0] = parseFloat(pagos[0] + pagos[1]);
    _bimestral[1] = parseFloat(pagos[2] + pagos[3]);
    _bimestral[2] = parseFloat(pagos[4] + pagos[5]);
    _bimestral[3] = parseFloat(pagos[6] + pagos[7]);
    _bimestral[4] = parseFloat(pagos[8] + pagos[9]);
    _bimestral[5] = parseFloat(pagos[10] + pagos[11]);


    var newPagoPromedio = (_pagos) => {
        newPago_promedio = 0;

        for(var zx=0; zx<_pagos.length; zx++)
        {
            newPagoPromedio += parseFloat(_pagos[zx]);
        }
        newPagoPromedio = Math.round((newPagoPromedio / _pagos.length) * 100) / 100;
        return newPagoPromedio;
    };
    var _pagosIVA = (_pagos) => {
        pagos_iva = [];

        for(var il=0; il<_pagos.length; il++)
        {
            pagos_iva[il] = Math.floor(parseFloat(_pagos[il]) * 0.10 + parseFloat(_pagos[il]) * 1.16);
        }

        return pagos_iva;
    };
    var _bimestralIVA = (_bimestral) => {
        bimestral_iva;

        for(var xx=0; xx<_bimestral.length; xx++)
        {
            bimestral_iva = Math.floor(parseFloat(_bimestral[xx]) * 0.10 + parseFloat(_bimestral[xx]) * 1.16);    
        }
        return bimestral_iva;
    };
    
    anteriorPagoPromedio = consumo_promedio * 1.16;
    newPagoPromedio = newPagoPromedio(_pagos);
    _pagosIVA = _pagosIVA(_pagos);
    _bimestralIVA = _bimestralIVA(_bimestral);

    objRespuesta = {
        tarifa: dac_o_nodac,
        nuevosPagos: _pagos,
        nuevosPagosIVA: _pagosIVA,
        anteriorPagoPromedio: consumo_promedio,
        anteriorPagoPromedioIVA: anteriorPagoPromedio,
        nuevoPagoPromedio: newPagoPromedio,
        bimestral: _bimestral,
        bimestralIVA: _bimestralIVA
    };

    return objRespuesta;
}

module.exports.obtenerPowerBTI = async function(data){
    const result = await getPowerBTI(data);
    return result;
};
/*#endregion*/