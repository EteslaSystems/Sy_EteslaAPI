const tarifa = require('../Controller/tarifaController');

function getIrradiacionDiasDeMesesDelAnio(){
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
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();

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
    
    arrayResult = getProduccionIntermedia(data, arrayCD);

    console.log('respuesta: ');
    console.log(arrayResult);

    return arrayResult;
}
/*#endregion*/

/*#region Produccion Solar*/
function getProduccionBase(){
    var produccionBase = 0;
    return produccionBase;
}

function getProduccionPunta(){
    var produccionPunta = 0;
    return produccionPunta;
}

//2do. paso (2.1) /*Start [este deberia de ser el primer paso]*/
async function getProduccionIntermedia(data, arrayCD){ //La data debera traer como dato extra "potenciaReal" y "porcentajeDePerdida"
    var produccionIntermedia = 0;
    var __produccionIntermedia = [];
    potenciaReal = data.potenciaReal;
    porcentajePerdida = parseFloat((data.porcentajePerdida)/100);
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();

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

    arrayPagosTotales = getBIP_DespuesDeSolar(data, arrayCD, __produccionIntermedia);
    arrayProduccionAnual = getProduccionAnual_KwhMwh(__produccionIntermedia);

    objResponse = {
        arrayPagosTotales: arrayPagosTotales,
        arrayProduccionAnual: arrayProduccionAnual
    };

    arrayResponse.push(objResponse);

    return arrayResponse;
}

function getProduccionAnual_KwhMwh(_produccionIntermedia){
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
function getBIP_DespuesDeSolar(data, _arrayCD, _produccionIntermedia){
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();
    var produccionBase = getProduccionBase();
    var produccionPunta = getProduccionPunta();
    var _newBIP = [];
    var newBIP = {newB: 0, newI: 0, newP: 0, newC: 0, newD: 0};
    
    var result = {};
    var arrayResult = [];

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

    arrayPagosTotales = getBIPMXN_kWh(data, _arrayCD, _newBIP);
    return arrayPagosTotales;
}
/*#endregion*/

/*#region Tarifas_CFE*/
//3er. Paso
function getBIPMXN_kWh(data, arrayCD, newBIP){
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
function getPagosTotales(data, bipMXN_kWh, arrayCD, newBIP){
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
        var bkwh = parseFloat(data.arrayPeriodosGDMTH[i].bkwh);
        var ikwh = parseFloat(data.arrayPeriodosGDMTH[i].ikwh);
        var pkwh = parseFloat(data.arrayPeriodosGDMTH[i].pkwh);

        var pagoTransmi = parseFloat(data.arrayPeriodosGDMTH[i].pagoTransmi);
        var bmxn_kwh = bipMXN_kWh[i].bmxn_kwh;
        var imxn_kwh = bipMXN_kWh[i].imxn_kwh;
        var pmxn_kwh = bipMXN_kWh[i].pmxn_kwh;
        var cmxn_kw = bipMXN_kWh[i].cmxn_kw;
        var dmxn_kw = bipMXN_kWh[i].dmxn_kw;

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

        var bmxn_kwh = parseFloat(bipMXN_kWh[j].bmxn_kwh);
        var imxn_kwh = parseFloat(bipMXN_kWh[j].imxn_kwh);
        var pmxn_kwh = parseFloat(bipMXN_kWh[j].pmxn_kwh);
        var cmxn_kw = parseFloat(bipMXN_kWh[j].cmxn_kw);
        var dmxn_kw = parseFloat(bipMXN_kWh[j].dmxn_kw);

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

    arrayTotalesAhorro = getTotales_Ahorro(__pagTotls);
    radiacion = getRadiacion(); 

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
function getRadiacion(){
    var _arrayMeses = getIrradiacionDiasDeMesesDelAnio();
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



function getTotales_Ahorro(pagosTotales){
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

//BAJA TENSION
/*#region Power_BajaTenison*/
async function Xx_consumoPesos(data){ /*Modificar el nombre*/ //TESTEAR -NO_SE HA TESTEADO-
    const tarifas = await tarifa.obtenerTodasLasTarifas();
    var tarifaSelected = data.tarifa;
    var consumoPromedio = data.consumoPromedio; //????
    var meses = [];
    var pagos = [];

    var no_verano = tarifas.filter(tarifas.vNombre === tarifaSelected && tarifas.siVerano === 0 && tarifas.siNivel != 0);
    var verano = tarifas.filter(tarifas.vNombre === tarifaSelected && tarifas.siVerano === 1 && tarifas.siNivel != 0);
    var demanda = tarifas.filter(tarifas.vNombre === tarifaSelected && tarifas.siVerano === 0 && tarifas.siNivel === 0);

    costo_demanda = demanda.length != 0 ? demanda.precio : 0;
    meses = verano.length != 0 ? meses[0,1,2,9,10,11] : meses[0,1,2,3,4,5,6,7,8,9,10,11];
    factor = verano.length != 0 ? 0.824 : 1;

    for(var i=0; i<12; i++)
    {
        pagos[i] = 0;
        var rango_alto = 0;
        var rango_bajo = 0;

        if(meses.indexOf(i)){
            while(no_verano.length === ux)
            {
                rango_bajo = rango_alto;
                rango_alto = rango_alto + no_verano.iRango;

                if((consumoPromedio * factor) > rango_bajo){
                    if((consumoPromedio * factor) > rango_alto && no_verano.iRango != 0){
                        pagos[i] = pagos[i] + no_verano.iRango * no_verano.fPrecio;
                    }
                    else{
                        pagos[i] = pagos[i] + ((consumoPromedio * factor - rango_bajo) * no_verano.fPrecio);
                    }
                }

                ux++;
            }
        }
        else{
            while(verano.length === ux)
            {
                rango_bajo = rango_alto;
                rango_alto = rango_alto + verano.iRango;

                if((consumoPromedio * 1.172) > rango_bajo){
                    if((consumoPromedio * 1.172) > rango_alto && verano.iRango != 0){
                        pagos[i] = pagos[i] + verano.iRango * verano.fPrecio;
                    }
                    else{
                        pagos[i] = pagos[i] + ((consumoPromedio * 1.172) - rango_bajo) * verano.fPrecio;
                    }
                }
            }
        }
    }

}
/*#endregion*/