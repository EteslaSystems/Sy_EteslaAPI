const tarifas = require('../Controller/tarifaController');
const ConfigController = require('../Controller/configFileController');

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

async function getCargoFijo(tarifa){ //Return: (number)
    let cargoFijo = 0; //Costo -cargoFijo-
    
    try{
        let _CargoFijo = await ConfigController.getArrayOfConfigFile();
        _CargoFijo = Config.energia.costos.cargoFijo;

        //
        for(let CargoFijo in _CargoFijo)
        {
            cargoFijo = CargoFijo.tarifa[tarifa];

            //Validar si se encontro el -cargoFijo- dentro de la coleccion anterior
            if(cargoFijo != null){
                return cargoFijo = CargoFijo.costo;
            }
        }
    }
    catch(error){
        console.log(error);
    }
}

//MEDIA TENSION
/*#region Datos_Consumo*/
///Main Power_MT
function getPowerMT(data){
    try{
        let _CD = getCapacidadyDistribucion({ tarifa: data.tarifa, _periodos: data.consumos.periodos });
        let _prodIntermedia = getProduccionIntermedia({ Panel: JSON.parse(data.arrayBTI[0].panel), origen: data.origen });
        let _nuevosConsumos = getNuevosConsumos({ _periodos: data.consumos.periodos, _produccionIntermedia: _prodIntermedia }); //Energia - kW
        let _consumosEconomicos = getConsumoEnpesos({ _periodos: data.consumos.periodos, _CD, _nuevosConsumos }); //$$ - SinPaneles

        /*------------*/
        let GeneracionEnergetica = getGeneracionEnergetica(_prodIntermedia); //Return Object
        /*[Pagos -Con & Sin- Paneles]*/
        let _PagosTotales = getPagosTotales({ _periodos: data.consumos.periodos, _consumosEconomicos, _CD, _nuevosConsumos, tarifa: data.tarifa }); //Return Object 
        
        //
        let consumoAnualKwh = parseFloat(data.consumos.consumo._promCons.consumoAnual); //Kw
        let porcentajePropuesta = Math.floor((GeneracionEnergetica.produccionAnualKwh / consumoAnualKwh) * 100);

        return { 
            Generacion: GeneracionEnergetica, 
            _PagosTotales: _PagosTotales, 
            porcentajePotencia: porcentajePropuesta 
        };
    }
    catch(error){
        console.log(error);
        throw error;
    }
}   

//1er. Paso:
function getCapacidadyDistribucion(data){
    let _result = [];
    let bkw=0, bkwh=0, pkw=0, pkwh=0; /* [GDMTH] */
    let ikw=0, ikwh=0;
    let C=0, D=0;

    try{
        let { tarifa, _periodos } = data;
        let _meses = getIrradiacionDiasDeMesesDelAnio();

        _periodos.forEach((Periodo, i) => {
            if(tarifa === 'GDMTH'){
                bkw = Number(Periodo.Bkw);
                bkwh = Number(Periodo.BkWh);
                pkw = Number(Periodo.Pkw);
                pkwh = Number(Periodo.PkWh);
            }

            //
            ikw = Number(Periodo.Ikw) || 0;
            ikwh = Number(Periodo.IkWh) || 0;

            //
            if(tarifa === 'GDMTH'){
                C = Math.round(Math.min(pkw, ((bkwh + ikwh + pkwh) / (24 * _meses[i].dias * 0.52)), ((bkwh + ikwh + pkwh) / (24 * _meses[i].dias * 0.52))));
            }
            else{
                C = Math.round(((bkwh + ikwh + pkwh) / (24 * _meses[i].dias * 0.52)) * 100) / 100;
            }

            //
            D = Math.round(Math.min(Math.max(bkw, ikw, pkw),((bkwh + ikwh + pkwh) / (24 * _meses[i].dias * 0.52))));

            _result[i] = { C, D };
        });

        return _result;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}
/*#endregion*/

/*#region Produccion Solar*/

//2do. paso
function getProduccionIntermedia(data){ //La data debera traer como dato extra "potenciaReal" y "porcentajeDePerdida"
    let _prodIntermedia = [];

    try{
        let { Panel, origen } = data;
        let porcentajePerdida = origen == "Veracruz" ? 0.82 : 0.73;
        let _Meses = getIrradiacionDiasDeMesesDelAnio();

        for(let Mes of _Meses)
        {
            let produccionIntermedia = Math.round(Panel.potenciaReal * Mes.irradiacion * Mes.dias * (1 - porcentajePerdida));
            _prodIntermedia.push(produccionIntermedia);
        }

        return _prodIntermedia;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

function getGeneracionEnergetica(_produccionIntermedia){ //Generacion
    let produccionAnualKwh = 0;
    let produccionAnualMwh = 0;

    try{
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
    
        for(let produccionIntermedia of _produccionIntermedia)
        {
            produccionAnualKwh += produccionIntermedia;
        }
    
        _generacionMensual = _generacionMensual(produccionAnualKwh);
        _generacionBimestral = _generacionBimestral(_generacionMensual);
        promedioGeneracionMensual = promedioGeneracionMensual(_generacionMensual);
        promedioGeneracionBimestral = promedioGeneracionBimestral(_generacionBimestral);
        produccionAnualMwh = produccionAnualKwh / 1000;
        
        return { _generacionMensual, _generacionBimestral, promedioGeneracionMensual, promedioGeneracionBimestral, produccionAnualKwh, produccionAnualMwh };
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

/*#endregion*/

/*#region Consumos Despues de Solar*/
//2do. paso (2.2)
function getNuevosConsumos(data){
    const produccionBase=0, produccionPunta=0;
    let _result=[];

    try{
        let { _periodos, _produccionIntermedia } = data;
        let _Meses = getIrradiacionDiasDeMesesDelAnio();
        
        ///
        _periodos.forEach((Periodo, i) => {
            let bkwh = Number(Periodo.BkWh) || 0;
            let ikwh = Number(Periodo.IkWh) || 0;
            let pkwh = Number(Periodo.PkWh) || 0;
            let bkw = Number(Periodo.Bkw) || 0;
            let ikw = Number(Periodo.Ikw) || 0;
            let pkw = Number(Periodo.Pkw) || 0;

            let newB = Math.round((bkwh - produccionBase) * 100) / 100;
            let newI = Math.round((ikwh - _produccionIntermedia[i]) * 100) / 100;
            let newP = Math.round((pkwh - produccionPunta) * 100) / 100;
            let newC = Math.round((Math.min(pkw, (newB + newI + newP) / (24 * _Meses[i].dias * 0.57))) * 100) / 100;
            let newD = Math.round((Math.min(Math.max(bkw, ikw, pkw), (newB + newI + newP) / (24 * _Meses[i].dias * 0.57))) * 100) / 100;

            ///
            _result.push({ newB, newI, newP, newC, newD })
        });

        return _result;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}
/*#endregion*/

/*#region Tarifas_CFE*/
//3er. Paso
function getConsumoEnpesos(data){
    let _consumosEnPesos = [];

    try{
        let { _periodos, _CD, _nuevosConsumos } = data;

        _periodos.forEach((Periodo, i) => {
            //Periodos
            let bkwh = Number(Periodo.BkWh) || 0;
            let ikwh = Number(Periodo.IkWh) || 0;
            let pkwh = Number(Periodo.PkWh) || 0;
            let bmxn = Number(Periodo.B_mxnkWh) || 0;
            let imxn = Number(Periodo.I_mxnkWh) || 0;
            let pmxn = Number(Periodo.P_mxnkWh) || 0;
            let cmxn = Number(Periodo.C_mxnkW) || 0;
            let dmxn = Number(Periodo.D_mxnkW) || 0;

            //Capacidad y Distribucion
            let ckw = _CD[i].C;
            let dkw = _CD[i].D;

            //Nuevos Consumos
            let newB = _nuevosConsumos[i].newB;
            let newI = _nuevosConsumos[i].newI;
            let newP = _nuevosConsumos[i].newP;

            //ConsumoEconomico
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

            let energiaFaltante = Math.round(newB + newI + newP);

            _consumosEnPesos.push({ bmxn_kwh, imxn_kwh, pmxn_kwh, cmxn_kw, dmxn_kw, energiaFaltante });
        });

        return _consumosEnPesos;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}
/*#endregion*/

/*#region Pagos_totales*/
//4to. paso
function getPagosTotales(data){
    let energia=0, capacidad=0, distribucion=0, iva=0, total=0;
    let _pagoSinPaneles = [], _pagosConPaneles = [];

    try{
        let { _periodos, _consumosEconomicos, _CD, _nuevosConsumos, tarifa } = data;

        let sumaTotalPagosTransmision = (_periodos) => {
            let totalPagos=0;
            _periodos.forEach(Periodo => Math.round(totalPagos += Number(Periodo.pagoTransmision)));
            return totalPagos;
        };
        let sumaTotalEnergiaSinPaneles = (_pagoSinPaneles) => {
            let totalEnergia = 0;
            _pagoSinPaneles.forEach(PagoSinPaneles => Math.round(totalEnergia +=  PagoSinPaneles.energia));
            return totalEnergia;
        };

        /*#region SIN_PANELES*/
        _periodos.forEach((Periodo, i) => {
            //Periodos
            let bkwh = Number(Periodo.BkWh) || 0; //kw
            let ikwh = Number(Periodo.IkWh) || 0; //kw
            let pkwh = Number(Periodo.PkWh) || 0; //kw
            let pagoTransmision = Number(Periodo.pagoTransmision) || 0; //$$

            let ckw = _CD[i].C; //kw
            let dkw = _CD[i].D; //kw

            //
            let bmxn_kwh = _consumosEconomicos[i].bmxn_kwh; //$$ - kw
            let imxn_kwh = _consumosEconomicos[i].imxn_kwh; //$$ - kw
            let pmxn_kwh = _consumosEconomicos[i].pmxn_kwh; //$$ - kw
            let cmxn_kw = _consumosEconomicos[i].cmxn_kw; //$$ - kw
            let dmxn_kw = _consumosEconomicos[i].dmxn_kw; //$$ - kw

            //
            if(tarifa === "GDMTH"){
                energia = Math.round((bkwh * bmxn_kwh + ikwh * imxn_kwh + pkwh * pmxn_kwh) * 100) / 100;
            }
            else{
                energia = Math.round((bkwh * bmxn_kwh + ikwh * imxn_kwh + pkwh) * 100) / 100
            }

            capacidad = Math.round((dkw * dmxn_kw) * 100) / 100;
            distribucion = Math.round((ckw * cmxn_kw) * 100) / 100;
            iva = Math.round((((pagoTransmision + energia + capacidad + distribucion) + 500) * 0.16) * 100) / 100;
            total = Math.round((pagoTransmision + energia + capacidad + distribucion + iva) * 100) /100;

            _pagoSinPaneles[i] = { energia, capacidad, distribucion, iva, total };
        });
        /*#endregion*/
        
        /*#region CON_PANELES*/
        sumaTotalPagosTransmision = sumaTotalPagosTransmision(_periodos);
        sumaTotalEnergiaSinPaneles = sumaTotalEnergiaSinPaneles(_pagoSinPaneles);

        //
        _nuevosConsumos.forEach((NuevoConsumo, i) => {
            let transmision = Math.round((sumaTotalPagosTransmision / sumaTotalEnergiaSinPaneles) * 100) / 100;
            energia = Math.round(NuevoConsumo.newB * _consumosEconomicos[i].bmxn_kwh + NuevoConsumo.newI + _consumosEconomicos[i].imxn_kwh + NuevoConsumo.newP * _consumosEconomicos[i].pmxn_kwh);
            capacidad = Math.round(NuevoConsumo.newC * _consumosEconomicos[i].cmxn_kw);
            distribucion = Math.round(NuevoConsumo.newD * _consumosEconomicos[i].dmxn_kw);
            iva = Math.round(transmision + capacidad + distribucion + energia);
            total = Math.round(transmision + energia + capacidad + distribucion + iva);

            //
            _pagosConPaneles[i] = { transmision, energia, capacidad, distribucion, iva, total };
        });
        /*#endregion*/

        return { _pagoSinPaneles, _pagosConPaneles };
    }
    catch(error){
        console.log(error);
        throw error;
    }
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
    let objResult = { _consumos: null, nuevosConsumos: '', porcentajePotencia:'', generacion:'', old_dac_o_nodac: '', new_dac_o_nodac: '', objConsumoEnPesos: null, objGeneracionEnpesos: null, objImpactoAmbiental: null, Ahorro: null };
    
    try{
        let _consumos = data.consumos || null;
        let tarifa = data.tarifa || null;
        let origen = data.origen;
        let potenciaReal = data.potenciaReal; 
        let promedioConsumosMensuales = _consumos._promCons.promedioConsumosMensuales;
        
        let _generacion = getGeneration(origen, potenciaReal); //Generacion en KWp
    
        objResult.objImpactoAmbiental = getArbolesPlantados(_generacion.generacionAnual);

        if(_consumos != null){
            let _consumosMensuales = _consumos._promCons.consumoMensual;
            let objNuevosConsumos = getNewConsumption(_consumosMensuales, _generacion);
            objResult.porcentajePotencia = Math.round((_generacion.promedioDeGeneracion / promedioConsumosMensuales) * 100);
            
            objResult._consumos = _consumos;
    
            //Es DAC o NO
            if(tarifa != null){
                objResult.old_dac_o_nodac = dac(tarifa, promedioConsumosMensuales); //Valuacion [Consumo_energia]
     
                //Consumo en pesos
                objResult.objConsumoEnPesos = await consumoEnPesos(objResult.old_dac_o_nodac, data.consumos);
            }
    
            objResult.nuevosConsumos = objNuevosConsumos;
    
            //Nuevos consumos
            if(objNuevosConsumos != null){ //Generacion en pesos MXN
                objResult.new_dac_o_nodac = await dac(tarifa, objNuevosConsumos.promedioNuevosConsumosMensuales); //Valuacion [Generacion_energia]
    
                //Generacion en pesos
                objResult.objGeneracionEnpesos = await consumoEnPesos(objResult.new_dac_o_nodac, objNuevosConsumos);
            }
    
            ///Ahorro [kw/bim]
            let ahorro = getAhorro(_generacion, _consumos);
            objResult.Ahorro = ahorro;
    
            objResult.generacion = _generacion;
        
            return objResult;
        }
    }
    catch(error){
        console.log(error);
    }
}

async function consumoEnPesos(dacOnoDac, dataConsumo){ ///consumoPromedio = promedioConsumosMensuales    
    let consumoPromedioMens = 0, consumoAnual = 0; //Wtts
    let __demanda = [];
    let _noVerano = [], _verano = [];

    try{
        let _pagosMensuales = (consumoProm, _demanda) => {//[Retorna: Object] *consumoProm: promedio de consumos -MENSUALES- *_demanda: 'Viene la tarifa, escalones y precios $$mxn'
            let costoKwhPesos = 0, costo = 0;
            let _pagosAnio = [];

            //Se arregla el array de 'tarifas' para poder ordenar el rango de la tarifa, mas bajo (nivel/escalon #1)
            if(_demanda.length > 1){
                _demanda.sort((Tarifa1, Tarifa2) => { return Tarifa1.siNivel - Tarifa2.siNivel });
            }

            ///Se obtiene el costo en pesos mxn equivalente a 1 mes
            _demanda.forEach((Demanda, i) => {
                if(consumoProm > 0){
                    if(consumoProm > Demanda.iRango){
                        if(Demanda.iRango === 0){
                            //Excedentes [section]
                            costoKwhPesos = consumoProm * Demanda.fPrecio;
                            //
                            consumoProm = 0;
                        }
                        else{
                            costoKwhPesos = Demanda.iRango * Demanda.fPrecio;
                        }
                    }
                    else{
                        costoKwhPesos = consumoProm * Demanda.fPrecio;
                    }

                    //Descontar los Kwh ya contabilizados
                    consumoProm = consumoProm - Demanda.iRango;

                    //Sumar los Kwh que van contabilizados
                    costo += costoKwhPesos;
                    costo = Math.round(costo);
                }
            });

            ///Se agrega el costo kwh de 1 mes a un array(12)
            for(let x=0; x<12; x++)
            {
                _pagosAnio[x] = costo;
            }

            return {
                costoTotalMensual: costo,
                _pagosMensualesAnual: _pagosAnio
            };
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

            return {
                _bimestres: _pagosBim,
                pagsPromBimestrales: promBimst
            };
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

        ///
        let _tarifas = await tarifas.obtenerTodasLasTarifas();
        _tarifas = _tarifas.message;

        if(dataConsumo.hasOwnProperty('_promCons')){ ///Consumos
            consumoPromedioMens = parseFloat(dataConsumo._promCons.consumoMensual.promedioConsumoMensual);
            consumoAnual = parseFloat(dataConsumo._promCons.consumoAnual);
        }
        else{ ///Generacion
            consumoPromedioMens = parseFloat(dataConsumo.promedioNuevosConsumosMensuales);
            consumoAnual = parseFloat(dataConsumo.nuevoConsumoAnual);
        }

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

        let pagoAnualIva  = Math.floor(pagoAnual * 1.16);

        //Proyeccion a 10 anios
        let _proyeccion10anios = proyeccion10anios(consumoAnual, pagoAnualIva); //Proyeccion en *KW* a 10 años

        return {
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
    }
    catch(error){
        throw error;
    }
}

function getArbolesPlantados(generacionAnualKw){
    /* 
        ->1 kw = 19 arboles [ANUALES]
        ->1 kw = 800 kg Co2 [ANUALES]
    */

    try{
        let numeroArboles = Math.round((generacionAnualKw * 19) * 100) / 100;
        let co2NogeneradoKg = Math.round((generacionAnualKw * 800) * 100) / 100;
        
        return { numeroArboles, co2NogeneradoKg };
    }
    catch(error){
        throw error;
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
    ///Functions
    let getGeneracionMensual = (potenciaInstalada, irradiacion, eficiencia) => {
        _generation = []; //Generacion Mensual

        /*
        [Formula]
        ->Generacion = potenciaInstalada/potenciaReal[kw] * irradiacionPromedio[mes] * % Perdidas * no. dias[mes];
        */

        generacion = Math.round((potenciaInstalada * irradiacion * eficiencia * 30.4) * 100) / 100;

        for(let i=0; i<12; i++){
            _generation[i] = generacion;
        }
        return _generation;
    };

    let promeDGeneracionMensual = (_generacn) => {
        promDGeneracion = 0;

        for(let i=0; i<_generacn.length; i++)
        {
            promDGeneracion += _generacn[i];
        }

        return promDGeneracion = Math.round((promDGeneracion / _generacn.length) * 100) / 100;
    }

    let _generacionBimestral = (_generacionMes) => {
        generacionBimestre = 0;
        _generacionBimestrl = [];

        for(let i=0; i<_generacionMes.length; i++)
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

        for(let i=0; i<_genBimestral.length; i++)
        {
            promedioGB += _genBimestral[i];
        }
        
        promedioGB = Math.round(promedioGB / _genBimestral.length);
        return promedioGB;
    };

    let generacionAnual = (_generacn) => {
        generationAnual = 0;
        for(let i=0; i<_generacn.length; i++)
        {
            generationAnual += _generacn[i];
        }

        generationAnual = Math.round(generationAnual * 100) / 100;
        return generationAnual;
    };

    let irradiacion = origen != "Veracruz" ? 5.42 : 4.6;
    let eficiencia = origen != "Veracruz" ? 0.73 : 0.83;

    ///Coleccion de generacion *POR MES* (Mensual)
    let _generacion = getGeneracionMensual(potenciaReal, irradiacion, eficiencia);

    ///
    promeDGeneracionMensual = promeDGeneracionMensual(_generacion);
    _generacionBimestral = _generacionBimestral(_generacion);
    promeDGeneracionBimestral = promeDGeneracionBimestral(_generacionBimestral);
    generacionAnual = generacionAnual(_generacion);

    return { 
        /* Todo esta en [Kw] */
        _generacion: _generacion,
        _generacionBimestral: _generacionBimestral,
        promeDGeneracionBimestral: promeDGeneracionBimestral,
        promedioDeGeneracion: promeDGeneracionMensual,
        generacionAnual: generacionAnual
    };
}

function getNewConsumption(__consumos, __generacion){
    try{
        let _consumosNuevosMensuales = (consumos) => {
            consumosMensuales = [];
            for(let x=0; x<consumos.length; x++)
            {
                ///Consumos nuevos Mensuales - Kw
                consumosMensuales[x] = Math.round(__consumos[x] - __generacion[x]);
            }
            return consumosMensuales;
        };

        let _consumosNuevosBimestrales = (_consumosNuevosMensuales) => {
            let nuevoConsumoBimestral = 0;
            let _newConsumsBimestrales = [];

            for(let i=0; i<6; i++)
            {
                if(i != 0 && i % 2 == 1){
                    nuevoConsumoBimestral = _consumosNuevosMensuales[i+1] + _consumosNuevosMensuales[i+2];
                }
                else{
                    nuevoConsumoBimestral = _consumosNuevosMensuales[i] + _consumosNuevosMensuales[i+1];
                }

                _newConsumsBimestrales[i] = nuevoConsumoBimestral;
            }

            return _newConsumsBimestrales;
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

        ///
        __generacion = __generacion._generacion; //kwp
        __consumos = __consumos._consumosMensuales; //kwh

        ///
        _consumosNuevosMensuales = _consumosNuevosMensuales(__consumos);
        _consumosNuevosBimestrales = _consumosNuevosBimestrales(_consumosNuevosMensuales);
        promedioNuevosConsumosMensuales = promedioNuevosConsumosMensuales(_consumosNuevosMensuales);
        nuevoConsumoAnual = nuevoConsumoAnual(_consumosNuevosMensuales);
        promedioConsumoBimestral = promedioConsumoBimestral(_consumosNuevosMensuales);

        let objResult = {
            ////Todo es retornado en Kw
            _consumosNuevosMensuales: _consumosNuevosMensuales,
            _consumosNuevosBimestrales: _consumosNuevosBimestrales,
            nuevoConsumoAnual: nuevoConsumoAnual,
            promedioNuevosConsumosMensuales: promedioNuevosConsumosMensuales,
            promedioNuevoConsumoBimestral: promedioConsumoBimestral
        };

        return objResult;
    }
    catch(error){
        console.log('Error getNewConsumption():\n'+error);
    }
}

function getAhorro(objNueConsumos, objAntConsumos){ //Return [Object] : *Todos los precios que se calculan y sus resultados. Son SIN IVA*
    let Ahorro = { ahorroMensual: null, ahorroBimestral: null, ahorroAnual: null };

    let promedConsumMes = objAntConsumos._promCons.promedioConsumosMensuales;
    let promedConsumBim = objAntConsumos._promCons.promConsumosBimestrales;
    let consumoAnual = objAntConsumos._promCons.consumoAnual;
    let promedNuevoConsumMes = objNueConsumos.promedioDeGeneracion;
    let promedNuevoConsumBim = objNueConsumos.promeDGeneracionBimestral;
    let nuevoConsumoAnual = objNueConsumos.generacionAnual;

    Ahorro.ahorroMensual = Math.round((promedConsumMes - promedNuevoConsumMes) * 100) / 100;
    Ahorro.ahorroBimestral = Math.round((promedConsumBim - promedNuevoConsumBim) * 100) / 100;
    Ahorro.ahorroAnual = Math.round((consumoAnual - nuevoConsumoAnual) * 100) / 100;

    return Ahorro;
}

function dac(tarifa, consumoPromedioMes){
    //consumoPromedio = PROMEDIO DE CONSUMOS *MENSUALES*
    switch(tarifa)
    {
        case '1':
            tarifa = consumoPromedioMes >= 250 ? 'DAC' : tarifa;
        break;
        case '1a':
            tarifa = consumoPromedioMes >= 300 ? 'DAC' : tarifa;
        break;
        case '1b':
            tarifa = consumoPromedioMes >= 400 ? 'DAC' : tarifa;
        break;
        case '1c':
            tarifa = consumoPromedioMes >= 850 ? 'DAC' : tarifa;
        break;
        case '1d':
            tarifa = consumoPromedioMes >= 1000 ? 'DAC' : tarifa;
        break;
        case '1e':
            tarifa = consumoPromedioMes >= 2000 ? 'DAC' : tarifa;
        break;
        case '1f':
            tarifa = consumoPromedioMes >= 2500 ? 'DAC' : tarifa;
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