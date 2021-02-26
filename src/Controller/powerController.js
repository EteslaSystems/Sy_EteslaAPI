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
///Main Power_MT
function getPowerMT(data){
    let __CD = getCD(data);
    let __produccionIntermedia = getProduccionIntermedia(data);
    let _newBIP = getBIP_DespuesDeSolar(data, __produccionIntermedia);
    let _bipMXN_kWh = getBIPMXN_kWh(data, __CD, _newBIP);

    /*------------*/
    let ProduccionAnual_KwhMwh = getProduccionAnual_KwhMwh(__produccionIntermedia); //Return Object
    let PagosTotales = getPagosTotales(data, _bipMXN_kWh, __CD, _newBIP); //Return Object 
    let consumoAnualKwh = parseFloat(data.propuesta.periodos.consumo._promCons.consumoAnual);
    let porcentajePropuesta = Math.floor((ProduccionAnual_KwhMwh.produccionAnualKwh / consumoAnualKwh) * 100);

    let objRespuesta = { generacion: ProduccionAnual_KwhMwh, pagosTotales: PagosTotales, porcentajePotencia: porcentajePropuesta };

    return objRespuesta;
}   

//1er. Paso:
function getCD(data){
    let objCD = {};
    let C = 0;
    let D = 0;
    let arrayCD = [];
    let tipoCotizacion = data.tarifa;
    let arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();
    let _periodos = data.propuesta.periodos;
    _periodos = _periodos.periodos.arrayPeriodos;

    for(let i=0; i<_periodos.length; i++)
    {
        let bkwh = parseFloat(_periodos[i].BkWh);
        let ikwh = parseFloat(_periodos[i].IkWh);
        let pkwh = parseFloat(_periodos[i].PkWh);
        let bkw = parseFloat(_periodos[i].Bkw);
        let ikw = parseFloat(_periodos[i].Ikw);
        let pkw = parseFloat(_periodos[i].Pkw);
        let dias = arrayMeses_[i].dias;

        if(tipoCotizacion === "GDMTH"){
            C = Math.round(Math.min(pkw, ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)), ((bkwh + ikwh + pkwh)/(24 * dias * 0.52))));
        }
        else{
            C = (bkwh + ikwh + pkwh)/(24 * dias * 0.52);
        }
    
        D = Math.round(Math.min(Math.max(bkw, ikw, pkw),((bkwh + ikwh + pkwh)/(24 * dias * 0.52))));
    
        objCD = {
            C: C,
            D: D
        }
    
        arrayCD.push(objCD);
    }
    
    return arrayCD;
}
/*#endregion*/

/*#region Produccion Solar*/
function getProduccionBase(){
    let produccionBase = 0;
    return produccionBase;
}

function getProduccionPunta(){
    let produccionPunta = 0;
    return produccionPunta;
}

//2do. paso
function getProduccionIntermedia(data){ //La data debera traer como dato extra "potenciaReal" y "porcentajeDePerdida"
    let produccionIntermedia = 0;
    let __produccionIntermedia = [];
    let potenciaReal = JSON.parse(data.propuesta.panel);
    potenciaReal = potenciaReal.potenciaReal; ///kwp

    let porcentajePerdida = data.origen == "Veracruz" ? 0.82 : 0.73;
    let _meses = getIrradiacionDiasDeMesesDelAnio();

    for(let i=0; i<_meses.length; i++)
    {
        let diasMes = _meses[i].dias;
        let irradicionMes = _meses[i].irradiacion;

        produccionIntermedia = Math.round(potenciaReal * irradicionMes * diasMes * (1 - porcentajePerdida));
        __produccionIntermedia[i] = produccionIntermedia;
    }

    return __produccionIntermedia;
}

function getProduccionAnual_KwhMwh(_produccionIntermedia){ //Generacion
    let produccionAnualKwh = 0;
    let produccionAnualMwh = 0;

    let _generacionMensual = (generacionAnual) => {
        let _generMens = [];
        let generacionMes = generacionAnual / 12;

        for(let x=0; x<12; x++)
        {
            _generMens[x] = generacionMes;
        }
        return _generMens;
    };
    
    let promedioGeneracionMensual = (_generacionMensual) => {
        let promedio = 0;

        _generacionMensual.forEach((mesGeneracion, index)=>{
            promedio += mesGeneracion;
        });

        return promedio = promedio/_generacionMensual.length;
    };

    for(let i=0; i<_produccionIntermedia.length; i++)
    {
        produccionAnualKwh += _produccionIntermedia[i];
    }

    _generacionMensual = _generacionMensual(produccionAnualKwh);
    promedioGeneracionMensual = promedioGeneracionMensual(_generacionMensual);
    /*-----------*/
    produccionAnualMwh = Math.round(produccionAnualKwh / 1000);
    
    let objProduccionAnual = {
        _generacionMensual: _generacionMensual,
        promedioGeneracionMensual: promedioGeneracionMensual,
        produccionAnualKwh: produccionAnualKwh,
        generacionAnualMwh: produccionAnualMwh
    };
    
    return objProduccionAnual;
}

/*#endregion*/

/*#region Consumos Despues de Solar*/
//2do. paso (2.2)
function getBIP_DespuesDeSolar(data, _produccionIntermedia){
    let newBIP = {};
    let _newBIP = [];
    let _meses = getIrradiacionDiasDeMesesDelAnio();
    let produccionBase = getProduccionBase();
    let produccionPunta = getProduccionPunta();
    let _periodos = data.propuesta.periodos;
    _periodos = _periodos.periodos.arrayPeriodos;

    for(let i=0; i<_periodos.length; i++)
    {   
        let bkwh = parseFloat(_periodos[i].BkWh);
        let ikwh = parseFloat(_periodos[i].IkWh);
        let pkwh = parseFloat(_periodos[i].PkWh);
        let bkw = parseFloat(_periodos[i].Bkw);
        let ikw = parseFloat(_periodos[i].Ikw);
        let pkw = parseFloat(_periodos[i].Pkw);
        let diasMes = _meses[i].dias;
        
        let produccionIntermedia = _produccionIntermedia[i];

        let newB = Math.round((bkwh - produccionBase) * 100) / 100;
        let newI = Math.round((ikwh - produccionIntermedia) * 100) / 100;
        let newP = Math.round((pkwh - produccionPunta) * 100) / 100;
        let newC = Math.round((Math.min(pkw, (newB + newI + newP) / (24 * diasMes * 0.57))) * 100) / 100;
        let newD = Math.round((Math.min(Math.max(bkw, ikw, pkw), (newB + newI + newP) / (24 * diasMes * 0.57))) * 100) / 100;
        
        newBIP = {
            newB: newB,
            newI: newI,
            newP: newP,
            newC: newC,
            newD: newD
        }

        _newBIP[i] = newBIP;
    }

    return _newBIP;
}
/*#endregion*/

/*#region Tarifas_CFE*/
//3er. Paso
function getBIPMXN_kWh(data, arrayCD, __newBIP){
    let objBIPMXN_kwh = {};
    let _bipMXN_kWh = [];
    let _periodos = data.propuesta.periodos;
    _periodos = _periodos.periodos.arrayPeriodos;

    for(let i=0; i<_periodos.length; i++)
    {
        let bkwh = parseFloat(_periodos[i].BkWh);
        let ikwh = parseFloat(_periodos[i].IkWh);
        let pkwh = parseFloat(_periodos[i].PkWh);
        let bmxn = parseFloat(_periodos[i].B_mxnkWh);
        let imxn = parseFloat(_periodos[i].I_mxnkWh);
        let pmxn = parseFloat(_periodos[i].P_mxnkWh);
        let cmxn = parseFloat(_periodos[i].C_mxnkW);
        let dmxn = parseFloat(_periodos[i].D_mxnkW);

        let ckw = arrayCD[i].C;
        let dkw = arrayCD[i].D;

        let newB = __newBIP[i].newB;
        let newI = __newBIP[i].newI;
        let newP = __newBIP[i].newP;

        let bmxn_kwh = Math.round((bmxn / bkwh) * 100) / 100;
        let imxn_kwh = Math.round((imxn / ikwh) * 100) / 100;
        let pmxn_kwh = Math.round((pmxn / pkwh) * 100) / 100;
        let cmxn_kw = Math.round((cmxn / ckw) * 100) / 100;
        let dmxn_kw = Math.round((dmxn / dkw) * 100) / 100;

        let energiaFaltante = newB + newI + newP;

        objBIPMXN_kwh = {
            bmxn_kwh: bmxn_kwh,
            imxn_kwh: imxn_kwh,
            pmxn_kwh: pmxn_kwh,
            cmxn_kw: cmxn_kw,
            dmxn_kw: dmxn_kw,
            energiaFaltante: energiaFaltante
        }

        _bipMXN_kWh[i] = objBIPMXN_kwh;
    }

    return _bipMXN_kWh;
}
/*#endregion*/

/*#region Pagos_totales*/
//4to. paso
function getPagosTotales(data, _bipMXNkWh, __arrayCD, __newBIP){
    let energia = 0;
    let transmision = 0;
    let capacidad = 0;
    let distribucion = 0;
    let iva = 0;
    let total = 0;
    let sumaTodosLosEnergiaSinSolar = 0;
    let sumaTodosLosPagoTransmi = 0;
    let objPagosTotales = {};
    let _pagosTotales = [];
    let __pagTotls = [];
    let _periodos = data.propuesta.periodos;
    _periodos = _periodos.periodos.arrayPeriodos;
    

    /*#region SIN_SOLAR*/
    for(let i=0; i<_periodos.length; i++)
    {
        let bkwh = parseFloat(_periodos[i].BkWh);
        let ikwh = parseFloat(_periodos[i].IkWh);
        let pkwh = parseFloat(_periodos[i].PkWh);
        let pagoTransmi = parseFloat(_periodos[i].pagoTransmision);

        let bmxn_kwh = _bipMXNkWh[i].bmxn_kwh;
        let imxn_kwh = _bipMXNkWh[i].imxn_kwh;
        let pmxn_kwh = _bipMXNkWh[i].pmxn_kwh;
        let cmxn_kw = _bipMXNkWh[i].cmxn_kw;
        let dmxn_kw = _bipMXNkWh[i].dmxn_kw;

        let ckw = __arrayCD[i].C;
        let dkw = __arrayCD[i].D;

        if(data.tarifa === "GDMTH"){
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

        _pagosTotales[i] = objPagosTotales;
    }
    /*#endregion*/

    /*#region CON_SOLAR*/
    for(let n=0; n<_pagosTotales.length; n++)
    {
        sumaTodosLosEnergiaSinSolar += _pagosTotales[n].sinSolar.energia;
        sumaTodosLosEnergiaSinSolar = Math.round(sumaTodosLosEnergiaSinSolar * 100)/100;
    }

    for(let x=0; x<_periodos.length; x++)
    {
        sumaTodosLosPagoTransmi += parseFloat(_periodos[x].pagoTransmision);
        sumaTodosLosPagoTransmi = Math.round(sumaTodosLosPagoTransmi * 100)/100;
    }

    for(let j=0; j<_periodos.length; j++)
    {
        let newB = __newBIP[j].newB;
        let newI = __newBIP[j].newI;
        let newP = __newBIP[j].newP;
        let newC = __newBIP[j].newC;
        let newD = __newBIP[j].newD;

        let bmxn_kwh = _bipMXNkWh[j].bmxn_kwh;
        let imxn_kwh = _bipMXNkWh[j].imxn_kwh;
        let pmxn_kwh = _bipMXNkWh[j].pmxn_kwh;
        let cmxn_kw = _bipMXNkWh[j].cmxn_kw;
        let dmxn_kw = _bipMXNkWh[j].dmxn_kw;

        /*---------------ENERGIA_CON_SOLAR---------------*/
        energia = Math.round((newB * bmxn_kwh + newI * imxn_kwh + newP * pmxn_kwh) * 100) / 100;
        transmision = Math.round(((sumaTodosLosPagoTransmi / sumaTodosLosEnergiaSinSolar) * energia) * 100) / 100;
        capacidad = Math.round((newC * cmxn_kw) * 100) / 100;
        distribucion = Math.round((newD * dmxn_kw) * 100) / 100;
        iva = Math.round((transmision + capacidad + distribucion + energia) * 100) / 100;
        total = Math.round((transmision + energia + capacidad + distribucion + iva) * 100) / 100;

        objPagosTotales = {
            sinSolar: {
                energia: _pagosTotales[j].sinSolar.energia,
                capacidad: _pagosTotales[j].sinSolar.capacidad,
                distribucion: _pagosTotales[j].sinSolar.distribucion,
                iva: _pagosTotales[j].sinSolar.iva,
                total: _pagosTotales[j].sinSolar.total
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

        __pagTotls[j] = objPagosTotales;
    }
    /*#endregion*/

    let ArrayTotalesAhorro = getTotales_Ahorro(__pagTotls); //Return an Object
    let radiacion = getRadiacion(); 

    let result = {
        arrayPagosTotales: __pagTotls,
        arrayTotalesAhorro: ArrayTotalesAhorro,
        radiacion: radiacion
    }
    
    return result;
}
/*#endregion*/

/*#region Celdas_Arriba(Radiacion, Produccion_Anual(kWh), Produccion_Anual(mWh), Total, Total, Ahorro, Porcentaje)*/
function getRadiacion(){
    let _arrayMeses = getIrradiacionDiasDeMesesDelAnio();
    let promedioIrradiaciones = 0;
    let sumaDiasDelMes = 0;

    for(var i=0; i<_arrayMeses.length; i++)
    {
        promedioIrradiaciones += parseFloat(_arrayMeses[i].irradiacion);
        sumaDiasDelMes += parseFloat(_arrayMeses[i].dias);
        promedioIrradiaciones = i+1 == _arrayMeses.length ? Math.round((promedioIrradiaciones / _arrayMeses.length) * 100) / 100 : promedioIrradiaciones;
    }
    
    radiacion = Math.ceil(promedioIrradiaciones * sumaDiasDelMes);
    return radiacion;
}

function getTotales_Ahorro(_pagosTotales){
    let pagosTotales_Ahorro = {};
    let totalSinSolar = 0;
    let totalConSolar = 0;
    let ahorroCifra = 0;
    let ahorroPorcentaje = 0;

    for(var i=0; i<_pagosTotales.length; i++)
    {
        totalSinSolar += _pagosTotales[i].sinSolar.total;
        totalConSolar += _pagosTotales[i].conSolar.total;
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

    return pagosTotales_Ahorro;
}
/*#endregion*/

//BTI - BajaTension_Individual
/*#region Power_BTI*/
async function getPowerBTI(data){
    let objResult = { nuevosConsumos: '', porcentajePotencia:'', generacion:'', dac_o_nodac: '' };
    let _consumos = data.consumos || null;
    let tarifa = data.tarifa || null;
    let origen = data.origen;
    let potenciaReal = data.potenciaReal; 
    let promedioConsumosMensuales = _consumos._promCons.promedioConsumosMensuales;

    let _generacion = getGeneration(origen, potenciaReal); //Generacion en KWp

    if(_consumos != null){
        _consumosMensuales = _consumos._promCons.consumoMensual;
        let objNuevosConsumos = await getNewConsumption(_consumosMensuales, _generacion);
        porcentajePotencia = Math.floor((_generacion.promedioDeGeneracion / promedioConsumosMensuales) * 100);
        
        if(tarifa != null){
            dac_o_nodac = await dac(tarifa, promedioConsumosMensuales);
            objResult.dac_o_nodac = dac_o_nodac;
        }
        
        objResult.nuevosConsumos = objNuevosConsumos;
        objResult.porcentajePotencia = porcentajePotencia;
    }

    objResult.generacion = _generacion;
    
    return objResult;
}

function getGeneration(origen, potenciaReal){
    //Generacion Mensual
    let _generation = [];

    for(let i=0; i<12; i++)
    {
        if(origen.toString() === "Veracruz"){
            gener = Math.round((Math.floor(/*irradiacion->*/4.6 * potenciaReal) * 0.83 * 30.4) * 100) / 100;
            _generation.push(gener);
        }
        else{
            gener = Math.round((Math.floor(/*irradiacion->*/5.42 * potenciaReal) * 0.73 * 30.4) * 100) / 100;
            _generation.push(gener);
        }
        //kwp
    }

    let promeDGeneracionMensual = (_generacn) => {
        promDGeneracion = 0;

        for(var i=0; i<_generacn.length; i++)
        {
            promDGeneracion += _generacn[i];
        }

        promDGeneracion = Math.round((promDGeneracion / _generacn.length) * 100) / 100; 
        return promDGeneracion;
    }

    let _generacionBimestral = (_generacionMes) => {
        generacionBimestre = 0;
        _generacionBimestrl = [];

        for(var i=0; i<_generacionMes.length; i++)
        {
            generacionBimestre += _generacionMes[i];

            if((i + 1) % 2 === 0){
                _generacionBimestrl.push(generacionBimestre);
                generacionBimestre = 0;
            }
        }
        return _generacionBimestrl;
    };

    let promeDGeneracionBimestral = (_genBimestral) => {
        promedioGB = 0;

        for(var i=0; i<_genBimestral.length; i++)
        {
            promedioGB += _genBimestral[i];
        }
        
        promedioGB = promedioGB / _genBimestral.length;
        return promedioGB;
    };

    let generacionAnual = (_generacn) => {
        generationAnual = 0;
        for(var i=0; i<_generacn.length; i++)
        {
            generationAnual += _generacn[i];
        }

        generationAnual = Math.round(generationAnual * 100) / 100;
        return generationAnual;
    };

    promeDGeneracionMensual = promeDGeneracionMensual(_generation);
    _generacionBimestral = _generacionBimestral(_generation);
    promeDGeneracionBimestral = promeDGeneracionBimestral(_generacionBimestral);
    generacionAnual = generacionAnual(_generation);

    objrespuesta = {
        _generacion: _generation, //kwp - Mensual
        _generacionBimestral: _generacionBimestral,
        promeDGeneracionBimestral: promeDGeneracionBimestral,
        promedioDeGeneracion: promeDGeneracionMensual, //kwp - promedioGeneracionMensual
        generacionAnual: generacionAnual //kwp
    };

    return objrespuesta;
}

async function getNewConsumption(__consumos, __generacion){
    __generacion = __generacion._generacion; //kwp
    __consumos = __consumos._consumosMensuales; //kwh

    var _consumosNuevosMensuales = (consumos) => {
        consumosMensuales = [];
        for(var x=0; x<consumos.length; x++)
        {
            ///Consumos nuevos Mensuales - Kw
            consumosMensuales[x] = Math.floor(__consumos[x] - __generacion[x]);
        }
        return consumosMensuales;
    };

    var promedioConsumoBimestral = (consumosMensuales) => {
        bimestre = 0;
        _bimestres = [];
        sumBimestres = 0;

        for(var x=0; x<12; x++)
        {
            bimestre += consumosMensuales[x];
            if(x != 0 && x % 2 == 1){
                _bimestres.push(bimestre);
                bimestre = 0;
            }
        }

        _bimestres.forEach(function(bimestre){
            sumBimestres += bimestre;
        });

        promedioConsumBimest = Math.round((sumBimestres / _bimestres.length) * 100) / 100;

        return promedioConsumBimest;
    };

    var nuevoConsumoAnual = (consumosMens) => {
        nwConsumosMnsuales = 0;

        consumosMens.forEach(function(nwConsumoMensual){
            nwConsumosMnsuales += nwConsumoMensual
        });
        
        return nwConsumosMnsuales; //Retorna - KW
    };
    _consumosNuevosMensuales = _consumosNuevosMensuales(__consumos);
    nuevoConsumoAnual = nuevoConsumoAnual(_consumosNuevosMensuales);
    promedioConsumoBimestral = promedioConsumoBimestral(_consumosNuevosMensuales);

    objResult = {
        ////Todo es retornado en Kw
        _consuosNuevosMensuales: _consumosNuevosMensuales,
        nuevoConsumoAnual: nuevoConsumoAnual,
        promedioConsumoBimestral: promedioConsumoBimestral
    };

    return objResult; 
}

async function dac(tarifa, consumoPromedio){
    //consumoPromedio = PROMEDIO DE CONSUMOS MENSUALES
    switch(tarifa)
    {
        case '1':
            tarifa = consumoPromedio >= 200 ? 'DAC' : tarifa;
        break;
        case '1a':
            tarifa = consumoPromedio >= 250 ? 'DAC' : tarifa;
        break;
        case '1b':
            tarifa = consumoPromedio >= 300 ? 'DAC' : tarifa;
        break;
        case '1c':
            tarifa = consumoPromedio >= 800 ? 'DAC' : tarifa;
        break;
        case '1d':
            tarifa = consumoPromedio >= 900 ? 'DAC' : tarifa;
        break;
        case '1e':
            tarifa = consumoPromedio >= 1100 ? 'DAC' : tarifa;
        break;
        case '1f':
            tarifa = consumoPromedio >= 1250 ? 'DAC' : tarifa;
        break;
        default:
            tarifa = -1;
        break;
    }

    return tarifa;
}
/*#endregion*/

module.exports.obtenerPowerBTI = async function(data){
    const result = await getPowerBTI(data);
    return result;
};

module.exports.obtenerPowerMT = async function(data){
    const result = await getPowerMT(data);
    return result;
}