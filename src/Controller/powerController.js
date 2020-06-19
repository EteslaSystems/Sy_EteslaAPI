function mainPower(_arrayCotizacion, _porcentajePerdida, data){
    getProduccionSolarIntermedia(_arrayCotizacion, _porcentajePerdida, data);
}

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

function getRadiacion(){
    var _arrayMeses = getIrradiacionDiasDeMesesDelAnio();
    var promedio = 0;
    var suma = 0;

    for(var i=0; i<_arrayMeses.length; i++){
        suma = suma + _arrayMeses[i].dias;
        promedio = promedio + _arrayMeses[i].irradiacion;
        promedio = i+1 === _arrayMeses.length ? promedio/_arrayMeses.length : promedio;
    }
    
    radiacion = Math.ceil(promedio * suma);
    return radiacion;
}

/*#region Datos_Consumo*/
module.exports.getCD_DatosConsumo = function(data){
    getCD_DatosConsumo(data);
}

function getCD_DatosConsumo(data){
    var C = 0;
    var D = 0;
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();

    for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
    {
        var bkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkwh);
        var ikwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikwh);
        var pkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkwh);
        var bkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkw);
        var ikw = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikw);
        var pkw = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkw);
        var dias = arrayMeses_[i].dias;
        
        C = Math.min(pkw, ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)), ((bkwh + ikwh + pkwh)/(24 * dias * 0.52)));
        D = Math.min(Math.max(bkw, ikw, pkw),((bkwh + ikwh + pkwh)/(24 * dias * 0.52)));

        console.log('C: '+C+'\nD: '+D);
        console.log('-----------------------------');
    }
}
/*#endregion*/

/*#region Produccion Solar*/
function getProduccionSolarIntermedia(_arrayCotizacion, _porcentajePerdida, data){
    for(var i=0; i<_arrayCotizacion.length; i++){
        tamanioSystem = _arrayCotizacion[i].paneles.potenciaReal;
        
        console.log('Tamanio del sistema: '+tamanioSystem);
        console.log('-------------------------');
        _getProduccionIntermedia(tamanioSystem, _porcentajePerdida, data);
        
    }
}

function _getProduccionIntermedia(_tamanioSystem, porcentajePerdida, data){
    var _produccionAnualKWh = 0;
    arrayMeses_ = getIrradiacionDiasDeMesesDelAnio();
    _arrayProduccionIntermedia = [];

    for(var j=0; j<arrayMeses_.length; j++){
        var _irradiacion = arrayMeses_[j].irradiacion;
        var _diasMes = arrayMeses_[j].dias;
        _produccionIntermedia = Math.ceil((_tamanioSystem * _irradiacion * _diasMes * (1 - porcentajePerdida)));
        
        //getBIP(data, _produccionIntermedia);
        _arrayProduccionIntermedia[j] = _produccionIntermedia;

        console.log('_Produccion intermedia: '+_produccionIntermedia);
        console.log('-------------------------------------------------');
    
        _arrayConsumosDespuesDeSolar = _produccionAnualKWh =+ _produccionIntermedia;

        console.log('-----------------------------------------------------------');

        if((j+1) === arrayMeses_.length){
            _produccionAnualKWh = _produccionAnualKWh - 5;
            console.log('Produccion anual kWh: '+_produccionAnualKWh);
            _produccionAnualMWh = Math.ceil(_produccionAnualKWh/1000);
            console.log('Produccion anual MWh: '+_produccionAnualMWh);
            console.log('--------------------------------------------------------------------'+'\n'+'\n');
        }
    }
    return _arrayProduccionIntermedia;
}

function getProduccionBase(){
    var produccionBase = 0;
    return produccionBase;
}

function getProduccionPunta(){
    var produccionPunta = 0;
    return produccionPunta;
}
/*#endregion*/

/*#region Consumos Despues de Solar*/
var objConsumosDespuesDeSolar = { consumosDespuesDeSolar: { B: 0, I: 0, P: 0, C: 0, D: 0 } };
var arrayConsumosDespuesDeSolar = [];

function getBIP(_data){
    for(var i=1; i<_data.length; i++){
        var _produccionBase = getProduccionBase(); 
        var _produccionPunta = getProduccionPunta();

        objConsumosDespuesDeSolar = {
            consumosDespuesDeSolar: {
                B: _data[i].bkwh - _produccionBase,
                I: _data[i].ikwh - produccionIntermedia_,
                P: _data[i].pkwh - _produccionPunta
            }
        };

        arrayConsumosDespuesDeSolar.push(objConsumosDespuesDeSolar);
    }
    getCD(arrayConsumosDespuesDeSolar, _data);
    //console.log('getBIP(_data) says: ');
    //console.log(arrayConsumosDespuesDeSolar);
    //return arrayConsumosDespuesDeSolar;
}

function getCD(arrayBIP_, data_){
    var suma = 0;
    var mult = 0;
    var _arrayIrrDiasMes = getIrradiacionDiasDeMesesDelAnio();
    arrayConsumosDespuesDeSolar = [];

    for(var x=0; x<arrayBIP_.length; x++){
        if((x+1) <= 12)
        {
            B_ = arrayBIP_[x].consumosDespuesDeSolar.B;
            I_ = arrayBIP_[x].consumosDespuesDeSolar.I;
            P_ = arrayBIP_[x].consumosDespuesDeSolar.P;

            pKw = data_[x+1].pkw;

            suma = B_ + I_ + P_;
            mult = 24 * _arrayIrrDiasMes[x].dias * 0.57;
            issue = suma / mult;
            resultC = Math.ceil(Math.min(pKw, issue));
            /*---- D ----*/
            bKw_ = data_[x+1].bkw;
            iKw_ = data_[x+1].ikw;
            pKw_ = data_[x+1].pkw;
            _Dmaximo = Math.max(bKw_, iKw_, pKw_);
            resultD = Math.ceil(Math.min(issue, _Dmaximo));
            
            objConsumosDespuesDeSolar = {
                consumosDespuesDeSolar: {
                    B: B_,
                    I: I_,
                    P: P_,
                    C: resultC,
                    D: resultD,
                }
            };

            arrayConsumosDespuesDeSolar.push(objConsumosDespuesDeSolar);
        }else{
            break;
        }
    }
    console.log('getCD(arrayBIP_, data_) says: ');
    console.log(arrayConsumosDespuesDeSolar);
}
/*#endregion*/

/*#region Pagos_totales*/
/*#endregion*/

/*#region tarifas_CFE*/
/*#endregion*/
module.exports.obtenerIrradiacionDiasMeses = function(){
    getRadiacion();
}

module.exports.mainPower = function(arrayCotizacion, porcentajePerdida, data){
    mainPower(arrayCotizacion, porcentajePerdida, data);
}

