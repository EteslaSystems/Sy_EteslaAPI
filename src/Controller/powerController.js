const tarifas = require('../Controller/tarifaController');

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
        let bkwh = parseFloat(_periodos[i].BkWh) || 0;
        let ikwh = parseFloat(_periodos[i].IkWh) || 0;
        let pkwh = parseFloat(_periodos[i].PkWh) || 0;
        let bkw = parseFloat(_periodos[i].Bkw) || 0;
        let ikw = parseFloat(_periodos[i].Ikw) || 0;
        let pkw = parseFloat(_periodos[i].Pkw) || 0;
        let dias = arrayMeses_[i].dias;

        if(tipoCotizacion === "GDMTH"){
            C = Math.round(Math.min(pkw, ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)), ((bkwh + ikwh + pkwh)/(24 * dias * 0.52))));
        }
        else{
            C = Math.round(((bkwh + ikwh + pkwh)/(24 * dias * 0.52)) * 100)/100;
        }
    
        D = Math.round((Math.min(Math.max(bkw, ikw, pkw),((bkwh + ikwh + pkwh)/(24 * dias * 0.52)))) * 100)/100;
    
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
        let generacionMes = Math.round((generacionAnual / 12) * 100) / 100;

        for(let x=0; x<12; x++)
        {
            _generMens[x] = generacionMes;
        }
        return _generMens;
    };
    
    let _generacionBimestral = (genercMensual) => {
        let bimestre = 0;
        let genrBimestral = [];

        for(e=0; e<6; e++)
		{
			if(e != 0 && e % 2 == 1){
				bimestre = genercMensual[e+1] + genercMensual[e+2];
			}
			else{
				bimestre = genercMensual[e] + genercMensual[e+1];
			}

			genrBimestral[e] = bimestre;
		}

        return genrBimestral;
    };

    let promedioGeneracionMensual = (_generacionMensual) => {
        let promedio = 0;

        _generacionMensual.forEach((mesGeneracion, index)=>{
            promedio += mesGeneracion;
        });

        return promedio = Math.round(( promedio/_generacionMensual.length) * 100) / 100;
    };

    let promedioGeneracionBimestral = (_generacBimestrl) => {
        let promedio = 0;

        _generacBimestrl.forEach((bimestreGeneracion, index)=>{
            promedio += bimestreGeneracion;
        });

        return promedio = Math.round(( promedio/_generacBimestrl.length) * 100) / 100;
    };

    for(let i=0; i<_produccionIntermedia.length; i++)
    {
        produccionAnualKwh += _produccionIntermedia[i];
    }

    _generacionMensual = _generacionMensual(produccionAnualKwh);
    _generacionBimestral = _generacionBimestral(_generacionMensual);
    promedioGeneracionMensual = promedioGeneracionMensual(_generacionMensual);
    promedioGeneracionBimestral = promedioGeneracionBimestral(_generacionBimestral);
    /*-----------*/
    produccionAnualMwh = produccionAnualKwh / 1000;
    
    let objProduccionAnual = {
        _generacionMensual: _generacionMensual,
        promedioGeneracionMensual: promedioGeneracionMensual,
        promedioGeneracionBimestral: promedioGeneracionBimestral,
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
        let bkwh = parseFloat(_periodos[i].BkWh) || 0;
        let ikwh = parseFloat(_periodos[i].IkWh) || 0;
        let pkwh = parseFloat(_periodos[i].PkWh) || 0;
        let bkw = parseFloat(_periodos[i].Bkw) || 0;
        let ikw = parseFloat(_periodos[i].Ikw) || 0;
        let pkw = parseFloat(_periodos[i].Pkw) || 0;
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
        let bkwh = parseFloat(_periodos[i].BkWh) || 0;
        let ikwh = parseFloat(_periodos[i].IkWh) || 0;
        let pkwh = parseFloat(_periodos[i].PkWh) || 0;
        let bmxn = parseFloat(_periodos[i].B_mxnkWh) || 0;
        let imxn = parseFloat(_periodos[i].I_mxnkWh) || 0;
        let pmxn = parseFloat(_periodos[i].P_mxnkWh) || 0;
        let cmxn = parseFloat(_periodos[i].C_mxnkW) || 0;
        let dmxn = parseFloat(_periodos[i].D_mxnkW) || 0;

        let ckw = arrayCD[i].C;
        let dkw = arrayCD[i].D;

        let newB = __newBIP[i].newB;
        let newI = __newBIP[i].newI;
        let newP = __newBIP[i].newP;

        let bmxn_kwh = Math.round((bmxn / bkwh) * 100) / 100;
        bmxn_kwh = isNaN(bmxn_kwh) == true ? 0 : bmxn_kwh;
        let imxn_kwh = Math.round((imxn / ikwh) * 100) / 100;
        imxn_kwh = isNaN(imxn_kwh) == true ? 0 : imxn_kwh;
        let pmxn_kwh = Math.round((pmxn / pkwh) * 100) / 100;
        pmxn_kwh = isNaN(pmxn_kwh) == true ? 0 : pmxn_kwh;
        let cmxn_kw = Math.round((cmxn / ckw) * 100) / 100;
        cmxn_kw = isNaN(cmxn_kw) == true ? 0 : cmxn_kw;
        let dmxn_kw = Math.round((dmxn / dkw) * 100) / 100;
        dmxn_kw = isNaN(dmxn_kw) == true ? 0 : dmxn_kw;

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
        let bkwh = parseFloat(_periodos[i].BkWh) || 0; //kw
        let ikwh = parseFloat(_periodos[i].IkWh) || 0; //kw
        let pkwh = parseFloat(_periodos[i].PkWh) || 0; //kw
        let pagoTransmi = parseFloat(_periodos[i].pagoTransmision) || 0; //$$

        let bmxn_kwh = _bipMXNkWh[i].bmxn_kwh; //kw
        let imxn_kwh = _bipMXNkWh[i].imxn_kwh; //kw
        let pmxn_kwh = _bipMXNkWh[i].pmxn_kwh; //kw
        let cmxn_kw = _bipMXNkWh[i].cmxn_kw; //kw
        let dmxn_kw = _bipMXNkWh[i].dmxn_kw; //kw

        let ckw = __arrayCD[i].C; //kw
        let dkw = __arrayCD[i].D; //kw

        if(data.tarifa === "GDMTH"){
            energia = Math.round((bkwh * bmxn_kwh + ikwh * imxn_kwh + pkwh * pmxn_kwh) * 100) / 100;
        }
        else{
            energia = Math.round((bkwh * bmxn_kwh + ikwh * imxn_kwh + pkwh) * 100) / 100
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

    let ArrayTotalesAhorro = getConsumosGeneracionMXN(__pagTotls); //Return an Object
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

function getConsumosGeneracionMXN(_pagosTotales){
    let objRespuesta = {};
    let ahorroCifraAnual = 0;
    let ahorroPorcentaje = 0;

    try{
        ///Consumo 
        let ConsumoMXN = (_pTotales) => { ///MXN
            let consumoAnualMXN = 0;
            let _bimestresMXN = [], bimestreMXN = 0, promedioBimes = 0;
            let promPagosConsumoMes = 0;
            let objResult = {};
    
            ///Consumo anual
            _pTotales.forEach(pago => { return consumoAnualMXN += pago.sinSolar.total });
    
            ///Convert to _pagosConsumoBimestrales (array de pagos de consumoBimestrales)
            for(let index=0; index<6; index++)
            {
                if(index != 0 && index % 2 == 1){
                    bimestreMXN = _pTotales[index + 1].sinSolar.total + _pTotales[index + 2].sinSolar.total;
                }
                else{
                    bimestreMXN = _pTotales[index].sinSolar.total + _pTotales[index+1].sinSolar.total;
                }
    
                _bimestresMXN[index] = bimestreMXN;
            }
    
            ///Promedio de pagosConsumosBimestrales
            _bimestresMXN.forEach(consumoBimestreMXN => { return promedioBimes += consumoBimestreMXN });
            promedioBimes = Math.round((promedioBimes / _bimestresMXN.length) * 100)/100;
    
            ///Promedio de pagosConsumosMensuales
            _pTotales.forEach(pagoConsumoMes => { return promPagosConsumoMes += pagoConsumoMes.sinSolar.total });
            promPagosConsumoMes = Math.round((promPagosConsumoMes / _pTotales.length) * 100)/100;

            objResult = {
                promPagosConsumsMes: promPagosConsumoMes,
                _pagosConsumoBimest: _bimestresMXN,
                pagoPromedioBimest: promedioBimes,
                consumoAnualMXN: consumoAnualMXN
            };

            return objResult;
        };
        ConsumoMXN = ConsumoMXN(_pagosTotales);
    
        ///Generacion
        let GeneracionMXN = (_pagsTotales) => {
            let consumoAnualMXN = 0;
            let _bimestresMXN = [], bimestreMXN = 0, promedioBimes = 0;
            let promPagosConsumoMes = 0;
            let objResult = {};
    
            ///Consumo anual
            _pagsTotales.forEach(pago => { return consumoAnualMXN += pago.conSolar.total });
            consumoAnualMXN = Math.round(consumoAnualMXN * 100)/100;
    
            ///Convert to _pagosConsumoBimestrales (array de pagos de consumoBimestrales)
            for(let index=0; index<6; index++)
            {
                if(index != 0 && index % 2 == 1){
                    bimestreMXN = _pagsTotales[index + 1].conSolar.total + _pagsTotales[index + 2].conSolar.total;
                }
                else{
                    bimestreMXN = _pagsTotales[index].conSolar.total + _pagsTotales[index + 1].conSolar.total;
                }
    
                _bimestresMXN[index] = bimestreMXN;
            }
    
            ///Promedio de pagosConsumosBimestrales
            _bimestresMXN.forEach(consumoBimestreMXN => { return promedioBimes += consumoBimestreMXN });
            promedioBimes = Math.round((promedioBimes / _bimestresMXN.length) * 100)/100;
    
            ///Promedio de pagosConsumosMensuales
            _pagsTotales.forEach(pagoConsumoMes => { return promPagosConsumoMes += pagoConsumoMes.conSolar.total });
            promPagosConsumoMes = Math.round((promPagosConsumoMes / _pagsTotales.length) * 100)/100;

            objResult = {
                promPagosConsumsMes: promPagosConsumoMes,
                _pagosConsumoBimest: _bimestresMXN,
                pagoPromedioBimest: promedioBimes,
                consumoAnualMXN: consumoAnualMXN
            };

            return objResult;
        };
        GeneracionMXN = GeneracionMXN(_pagosTotales);

        ///Ahorro
        let AhorroAnual = (_pTotales) => { ///MXN
            let totalAnualSinSolar = 0, totalAnualConSolar = 0;

            for(let i=0; i<_pTotales.length; i++)
            {
                totalAnualSinSolar += _pTotales[i].sinSolar.total;
                totalAnualConSolar += _pTotales[i].conSolar.total;
            }
        
            totalAnualSinSolar = Math.round(totalAnualSinSolar * 100)/100;
            totalAnualConSolar = Math.round(totalAnualConSolar * 100)/100;
    
            return objRespuesta = { totalAnualSinSolar, totalAnualConSolar };
        };
        AhorroAnual = AhorroAnual(_pagosTotales);

        ahorroCifraAnual = AhorroAnual.totalAnualConSolar > 0 ? Math.round((AhorroAnual.totalAnualSinSolar - AhorroAnual.totalAnualConSolar) * 100) / 100 : parseFloat(AhorroAnual.totalAnualSinSolar - 12000);
        ahorroPorcentaje = Math.round((ahorroCifraAnual / AhorroAnual.totalAnualSinSolar) * 100) / 100;
        ahorroPorcentaje = ahorroPorcentaje * 100;
    
        objRespuesta = {
            ConsumoMXN: ConsumoMXN,
            GeneracionMXN: GeneracionMXN,
            AhorroAnual: AhorroAnual,
            totalAnualSinSolar: AhorroAnual.totalAnualSinSolar,
            totalAnualConSolar: AhorroAnual.totalAnualConSolar,
            ahorroCifraAnual: ahorroCifraAnual,
            ahorroPorcentaje: ahorroPorcentaje
        };

        return objRespuesta;
    }
    catch(error){
        console.log(error);
    }
}
/*#endregion*/

//BTI - BajaTension_Individual
/*#region Power_BTI*/
async function getPowerBTI(data){
    let objResult = { _consumos: null, nuevosConsumos: '', porcentajePotencia:'', generacion:'', old_dac_o_nodac: '', new_dac_o_nodac: '', objConsumoEnPesos: {}, objGeneracionEnpesos: {}, objImpactoAmbiental: null };
    let _consumos = data.consumos || null;
    let tarifa = data.tarifa || null;
    let origen = data.origen;
    let potenciaReal = data.potenciaReal; 
    let promedioConsumosMensuales = _consumos._promCons.promedioConsumosMensuales;
    let dac_o_nodac = '';

    let _generacion = getGeneration(origen, potenciaReal); //Generacion en KWp

    objResult.objImpactoAmbiental = getArbolesPlantados(_generacion.generacionAnual);

    if(_consumos != null){
        let _consumosMensuales = _consumos._promCons.consumoMensual;
        let objNuevosConsumos = getNewConsumption(_consumosMensuales, _generacion);
        porcentajePotencia = Math.floor((_generacion.promedioDeGeneracion / promedioConsumosMensuales) * 100);
        
        objResult._consumos = _consumos;

        //Se sabe si es DAC o NO
        if(tarifa != null){
            dac_o_nodac = dac(tarifa, promedioConsumosMensuales); //Valuacion [Consumo_energia]
            objResult.old_dac_o_nodac = dac_o_nodac;
 
            //Consumo en pesos
            objResult.objConsumoEnPesos = await consumoEnPesos(dac_o_nodac, data.consumos);
        }

        objResult.nuevosConsumos = objNuevosConsumos;

        if(objNuevosConsumos != null){ //Generacion en pesos MXN
            dac_o_nodac = await dac(tarifa, objNuevosConsumos.promedioNuevosConsumosMensuales); //Valuacion [Generacion_energia]
            objResult.new_dac_o_nodac = dac_o_nodac;

            objResult.objGeneracionEnpesos = await consumoEnPesos(dac_o_nodac, objNuevosConsumos);
        }

        objResult.porcentajePotencia = porcentajePotencia;
    }

    objResult.generacion = _generacion;
    
    return objResult;
}

async function consumoEnPesos(dacOnoDac, dataConsumo){ ///consumoPromedio = promedioConsumosMensuales    
    let consumoPromedioMens = 0, consumoAnual = 0; //Wtts
    let __demanda = [];
    let _noVerano = [], _verano = [];

    try{
        let _pagosMensuales = (consumoProm, _demanda) => {//[Retorna: Object] *consumoProm: promedio de consumos -MENSUALES- *_demanda: 'Viene la tarifa, escalones y precios $$mxn'
            let kwhACotizar = 0, costoKwhPesos = 0, costo = 0;
            let _pagosAnio = [];

            //Se arregla el array de 'tarifas' para poder ordenar el rango de la tarifa, mas bajo (nivel/escalon #1)
            if(_demanda.length > 1){
                _demanda.sort((Tarifa1, Tarifa2) => { return Tarifa1.siNivel - Tarifa2.siNivel });
            }

            ///Se obtiene el costo en pesos mxn equivalente a 1 mes
            _demanda.forEach(Demanda => {
                if(consumoProm > 0){
                    kwhACotizar = consumoProm - Demanda.iRango;
                    costoKwhPesos = kwhACotizar * Demanda.fPrecio;
                    
                    //Costo total del kwh de 1 mes
                    costo += costoKwhPesos;
                    costo = Math.round(costo); //Redondeamos

                    //Restar los kwh cotizados a 'consumoProm'
                    consumoProm -= kwhACotizar;
                }
            });

            ///Se agrega el costo kwh de 1 mes a un array(12)
            for(let x=0; x<12; x++)
            {
                _pagosAnio[x] = costo;
            }

            let result = {
                costoTotalMensual: costo,
                _pagosMensualesAnual: _pagosAnio
            };

            return result;
        };

        let _pagosBimestrales = (_pagosMensuales) => { //$$ - Bimestrales
            let _pagosBim = [];
            let bimestre = 0, promBimst = 0;
    
            //Sacando bimestres
            for(let i=0; i<6; i++)
            {
                if(i != 0 && i % 2 == 1){
                    bimestre = _pagosMensuales[i+1] + _pagosMensuales[i+2];
                }
                else{
                    bimestre = _pagosMensuales[i] + _pagosMensuales[i+1];
                }
    
                _pagosBim[i] = bimestre;
            }
            
            //Promedio Bimestral
            _pagosBim.forEach(bimst => promBimst += bimst);
            promBimst = Math.round(promBimst / _pagosBim.length);

            let objResult = {
                _bimestres: _pagosBim,
                pagsPromBimestrales: promBimst
            };
            
            return objResult;
        };
    
        let pagoAnual = (_pagosMensuales) => { 
            let pagoAnl = 0;

            _pagosMensuales.forEach(pagoMensual => pagoAnl += pagoMensual);
            pagoAnl = Math.round(pagoAnl);

            return pagoAnl;
        };

        let _pagosIva = (_pagoMes) => {
            let promPagsCIva = 0;
            let _pIva = [];

            for(let i=0; i<_pagoMes.length; i++)
            {
                _pIva[i] = Math.floor(_pagoMes[i] * 0.10 + _pagoMes[i] * 1.16);
            }

            //Promedio de pagos con IVA
            _pIva.forEach(pagoCIva => promPagsCIva += pagoCIva);
            promPagsCIva = Math.round(promPagsCIva / _pIva.length);

            let objResult = {
                _pagosConIva: _pIva,
                promedioPagosConIva: promPagsCIva
            };

            return objResult;
        };

        let _pagosBimestralesCIva = (_pagsBims) => {
            let _pBimestrales = [];
            let promPgsBimestralesCIva = 0;

            for(let i=0; i<_pagsBims.length; i++)
            {
                _pBimestrales[i] = Math.floor(_pagsBims[i] * 0.10 + _pagsBims[i] * 1.16);
            }

            _pBimestrales.forEach(pBimestralConIva => promPgsBimestralesCIva += pBimestralConIva);
            promPgsBimestralesCIva = Math.round(promPgsBimestralesCIva / _pBimestrales.length);

            let objResult = {
                _pagosBimestralesConIva: _pBimestrales,
                promPagosBimestralesConIva: promPgsBimestralesCIva
            };

            return objResult;
        };

        if(dataConsumo.hasOwnProperty('_promCons')){ ///Consumos
            consumoPromedioMens = parseFloat(dataConsumo._promCons.consumoMensual.promedioConsumoMensual);
            consumoAnual = parseFloat(dataConsumo._promCons.consumoAnual);
        }
        else{ ///Generacion
            consumoPromedioMens = parseFloat(dataConsumo.promedioNuevosConsumosMensuales);
            consumoAnual = parseFloat(dataConsumo.nuevoConsumoAnual);
        }

        let _tarifas = await tarifas.obtenerTodasLasTarifas();
        _tarifas = _tarifas.message;

        if(dacOnoDac != 'DAC'){ // <> DAC
            _noVerano = _tarifas.filter(tarifa => { return tarifa.vNombreTarifa.includes(dacOnoDac); });
            _noVerano = _noVerano.filter(tarifa => { return noVerano = tarifa.siVerano === 0 }); //Se obtienen [] las -NO VERANO- acorde a la tarifa de la propuesta (1, 1c, 1a, etc...)
            
            _verano = _tarifas.filter(tarifa => { return tarifa.vNombreTarifa.includes(dacOnoDac); });
            _verano = _verano.filter(tarifa => { return verano = tarifa.siVerano === 1 }); 
        }
    
        //DAC
        let demanda_consulta = _tarifas.filter(tarifa => { return tarifa.vNombreTarifa.includes(dacOnoDac); });
        demanda_consulta = demanda_consulta.filter(tarifa => { return tarifa = tarifa.siVerano === 0 && tarifa.siNivel === 0 ? tarifa : null; });

        //Validacion tarifa
        if(_noVerano.length > 0){
            __demanda = _noVerano;
        }
        else if(_verano.length > 0){
            __demanda = _verano;
        }
        else if(demanda_consulta.length > 0){ //DAC
            __demanda = demanda_consulta;
        }
        
        //Pagos_mensuales && Promedio Pagos_mensuales
        _pagosMensuales = _pagosMensuales(consumoPromedioMens, __demanda);
    
        //Pagos_bimestrales && Promedio Pagos_bimestrales
        _pagosBimestrales = _pagosBimestrales(_pagosMensuales._pagosMensualesAnual);

        //PagoAnual
        pagoAnual = pagoAnual(_pagosMensuales._pagosMensualesAnual);  
    
        //Pagos con IVA *Mensual && Bimestral* (_array && promedio)
        _pagosIva = _pagosIva(_pagosMensuales._pagosMensualesAnual);
        _pagosBimestralesCIva = _pagosBimestralesCIva(_pagosBimestrales._bimestres); //Pagos bimestrales con IVA - MXN

        let pagoAnualIva = Math.floor(pagoAnual * 1.16);

        //Proyeccion a 10 anios
        let _proyeccion10anios = proyeccion10anios(consumoAnual, pagoAnualIva); //Proyeccion en *KW* a 10 años
    
        let objResp = {
            _pagosMensuales: _pagosMensuales._pagosMensualesAnual,
            _pagosBimestrales: _pagosBimestrales._bimestres,
            pagoAnual: pagoAnual,
            _pagosMensualesCIva: _pagosIva._pagosConIva,
            _pagosBimestralesCIva: _pagosBimestralesCIva._pagosBimestralesConIva,
            pagoPromedioMensual: _pagosMensuales.costoTotalMensual,
            pagoPromedioBimestral: _pagosBimestrales.pagsPromBimestrales,
            pagoPromedioBimestralConIva: _pagosBimestralesCIva.promPagosBimestralesConIva,
            pagoAnualIva: pagoAnualIva,
            _proyeccion10anios: _proyeccion10anios
        };

        return objResp;
    }
    catch(error){
        console.log(error);
    }
}

function getArbolesPlantados(generacionAnualKw){
    /* 
    1 khw = 0.012 arboles
    1 khw = 0.458 kg CO2
    */ 
    let numeroArboles = 0, co2NogeneradoKg = 0;
    let objResult = {};

    try{
        numeroArboles = Math.round(generacionAnualKw / 0.012);
        co2NogeneradoKg = Math.round(generacionAnualKw / 0.458);
        
        objResult = {
            numeroArboles: numeroArboles,
            co2NogeneradoKg: co2NogeneradoKg
        };

        return objResult;
    }
    catch(error){
        console.log(error);
    }
}

function proyeccion10anios(kwhAnuales, costoAnualMXN){
    let _proyeccionEnEnergia = []; //kW 
    let _proyeccionEnDinero = []; //pesosMXN

    try{
        for(let i=0; i<=10; i++)
        {
            if(i > 0)
            {
                kwhAnuales = Math.round((kwhAnuales * 1.10) * 100)/100; //Kw - Incremento de 10%
                costoAnualMXN = Math.round((costoAnualMXN * 1.10) * 100)/100; //$$mxn - Incremento de 10%
                _proyeccionEnEnergia[i] = kwhAnuales;
                _proyeccionEnDinero[i] = costoAnualMXN;
            }
            else{
                _proyeccionEnEnergia[i] = kwhAnuales; //Kw - Sin incremento
                _proyeccionEnDinero[i] = costoAnualMXN; //$$mxn - Sin incremento
            }
        }

        let objResult = {
            _proyeccionEnEnergia: _proyeccionEnEnergia,
            _proyeccionEnDinero: _proyeccionEnDinero
        };

        return objResult;
    }
    catch(error){
        console.log(error);
    }
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

function getNewConsumption(__consumos, __generacion){
    __generacion = __generacion._generacion; //kwp
    __consumos = __consumos._consumosMensuales; //kwh

    let _consumosNuevosMensuales = (consumos) => {
        consumosMensuales = [];
        for(let x=0; x<consumos.length; x++)
        {
            ///Consumos nuevos Mensuales - Kw
            consumosMensuales[x] = Math.floor(__consumos[x] - __generacion[x]);
        }
        return consumosMensuales;
    };

    let promedioNuevosConsumosMensuales = (_nuevosConsumosMensuales) => {
        let promConsMes = 0;

        _nuevosConsumosMensuales.forEach(consumoMensual => promConsMes += consumoMensual);

        return promConsMes = promConsMes / _nuevosConsumosMensuales.length;
    };

    let promedioConsumoBimestral = (consumosMensuales) => {
        bimestre = 0;
        _bimestres = [];
        sumBimestres = 0;

        for(let x=0; x<12; x++)
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

    let nuevoConsumoAnual = (consumosMens) => {
        nwConsumosMnsuales = 0;

        consumosMens.forEach(function(nwConsumoMensual){
            nwConsumosMnsuales += nwConsumoMensual
        });
        
        return nwConsumosMnsuales; //Retorna - KW
    };

    _consumosNuevosMensuales = _consumosNuevosMensuales(__consumos);
    promedioNuevosConsumosMensuales = promedioNuevosConsumosMensuales(_consumosNuevosMensuales);
    nuevoConsumoAnual = nuevoConsumoAnual(_consumosNuevosMensuales);
    promedioConsumoBimestral = promedioConsumoBimestral(_consumosNuevosMensuales);

    objResult = {
        ////Todo es retornado en Kw
        _consumosNuevosMensuales: _consumosNuevosMensuales,
        nuevoConsumoAnual: nuevoConsumoAnual,
        promedioNuevosConsumosMensuales: promedioNuevosConsumosMensuales,
        promedioNuevoConsumoBimestral: promedioConsumoBimestral
    };

    return objResult; 
}

function dac(tarifa, consumoPromedio){
    //consumoPromedio = PROMEDIO DE CONSUMOS *MENSUALES*
    switch(tarifa)
    {
        case '1':
            tarifa = consumoPromedio >= 250 ? 'DAC' : tarifa;
        break;
        case '1a':
            tarifa = consumoPromedio >= 300 ? 'DAC' : tarifa;
        break;
        case '1b':
            tarifa = consumoPromedio >= 400 ? 'DAC' : tarifa;
        break;
        case '1c':
            tarifa = consumoPromedio >= 850 ? 'DAC' : tarifa;
        break;
        case '1d':
            tarifa = consumoPromedio >= 1000 ? 'DAC' : tarifa;
        break;
        case '1e':
            tarifa = consumoPromedio >= 2000 ? 'DAC' : tarifa;
        break;
        case '1f':
            tarifa = consumoPromedio >= 2500 ? 'DAC' : tarifa;
        break;
        default:
            tarifa = tarifa;
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