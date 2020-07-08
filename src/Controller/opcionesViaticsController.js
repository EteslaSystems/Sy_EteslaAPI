/*
- @description: 		Archivo correspondiente a las funciones del calculo de viaticos
- @author: 				LH420
- @date: 				09/04/2020
*/
const request = require('request');
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');
const dolar = require('../Controller/dolar_tipoCambio');

var distanciaEnKm = 0;
var comida = 180; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
var hospedaje = 150; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
var descuento = 0; //Este valor tiene que ser dinamico y pasado por parametro a la funcion 'main_calcularViaticos'
var precioDolar = 0;

async function main_calcularViaticos(data){
    var _arrayCotizacion = data.arrayPeriodosGDMTH;
    var origen = data.origen;
    var destino = data.destino;
    distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
    distanciaEnKm = distanciaEnKm.message;
    // distanciaEnKm = 93; //Descomentar la linea de arriba y eliminar esta, para que la funcionalidad sea dinamica
    
    precioDolar = parseFloat(dolar.obtenerPrecioDolar());

    // if(Array.isArray(_arrayCotizacion) != true){
    //     _arrayCotizacion = Object.values(_arrayCotizacion);
    // }

    console.log('Distancia en km, de la cotizacion: '+distanciaEnKm);

    _arrayCotizacion = await calcularNoDeCuadrillas(_arrayCotizacion, distanciaEnKm);
    
    return _arrayCotizacion;
}

/*#region Cuadrilla - Mano de obra*/
async function calcularNoDeCuadrillas(_arrayCotizacion, _distanciaEnKm){
    var _cotizacion = [];
    var _configFile = await configFile.getArrayOfConfigFile();
    var distanciaEnKm = parseFloat(_distanciaEnKm);

    if(distanciaEnKm > 30)
    {
        for(var x = 0; x < _arrayCotizacion.length; x++)
        {
            /*#region iteracionArray_panel*/
            __no = _arrayCotizacion[x].no || 0;
            __nombrePanel = _arrayCotizacion[x].panel.nombrePanel || null;
            __marcaPanel = _arrayCotizacion[x].panel.marcaPanel || null;
            __potenciaPanel = _arrayCotizacion[x].panel.potenciaPanel || 0;
            __cantidadPaneles = _arrayCotizacion[x].panel.cantidadPaneles || 0; //numeroDeModulos
            __potenciaReal =  _arrayCotizacion[x].panel.potenciaReal || 0;
            __costoDeEstructuras = parseFloat(_arrayCotizacion[x].panel.costoDeEstructuras) || 0;
            __precioPorWattPanel = _arrayCotizacion[x].panel.precioPorWatt || 0;
            // __precioPorModulo = Math.round((__potenciaPanel * __precioPorWattPanel) * 100) / 100 || 0;
            // __precioPorModulo = parseFloat(_arrayCotizacion[x].panel.precioPorWatt);
            costoTotalPaneles = parseFloat(_arrayCotizacion[x].panel.costoTotalPaneles);
            /*#endregion*/

            /*#region iteracionArray_inversor*/
            __nombreInversor =  _arrayCotizacion[x].inversor.nombreInversor || null;
            __marcaInversor = _arrayCotizacion[x].inversor.marcaInversor || null;
            __potenciaInversor = _arrayCotizacion[x].inversor.potenciaInversor || 0;
            __potenciaNominalInversor = _arrayCotizacion[x].inversor.potenciaNominalInversor || 0;
            __precioInversor = _arrayCotizacion[x].inversor.precioInversor || 0;
            __potenciaMaximaInversor = _arrayCotizacion[x].inversor.potenciaMaximaInversor || 0;
            __numeroDeInversores = _arrayCotizacion[x].inversor.numeroDeInversores || 0;
            __potenciaPicoInversor = Math.round(parseFloat(_arrayCotizacion[x].inversor.potenciaPicoInversor)) || 0;
            __porcentajeSobreDimens = _arrayCotizacion[x].inversor.porcentajeSobreDimens || 0;
            costoTotalInversores = _arrayCotizacion[x].inversor.costoTotalInversores || 0;
            /*#endregion*/
            _numeroCuadrillas = parseInt(getNumberOfCrews(__cantidadPaneles)) || 0;
            numeroDePersonasRequeridas = _numeroCuadrillas * parseInt(_configFile.cuadrilla.numeroDePersonas) || 0;
            numeroDias = getDays(__cantidadPaneles, _numeroCuadrillas);
            numeroDiasReales = getRealDays(__cantidadPaneles, numeroDias);
            pagoPasaje = Math.round((getBusPayment(distanciaEnKm) / precioDolar) * 100) / 100; //Pasarlo a dolares
            pagoPasajeTotal = Math.ceil(pagoPasaje * numeroDePersonasRequeridas);
            // pagoPasajeTotal = Math.ceil(pagoPasajeTotal);
            pagoComidaTotal = Math.round((((comida * numeroDePersonasRequeridas * numeroDiasReales) / precioDolar) * 100) / 100);
            pagoHospedajeTotal = Math.round((((hospedaje * numeroDePersonasRequeridas * numeroDiasReales) / precioDolar) * 100) / 100);
            totalViaticosMT = pagoPasajeTotal + pagoComidaTotal + pagoHospedajeTotal; //MT = MediaTension


            costoTotalPanInvEstr = parseFloat(costoTotalPaneles + costoTotalInversores + __costoDeEstructuras);

            costoTotalFletes = Math.floor(costoTotalPanInvEstr * parseFloat(_configFile.costos.porcentaje_fletes));
            
            costoManoDeObra = getPrecioDeManoDeObra(__cantidadPaneles, costoTotalPanInvEstr);
            subtotOtrFletManObrTPIE = parseFloat(costoManoDeObra[1] + costoTotalFletes + costoManoDeObra[0] + costoTotalPanInvEstr); //TPIE = Total Paneles Inversores Estructuras
            margen = Math.round(((subtotOtrFletManObrTPIE / (1 - _configFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE) * 100) / 100;
            totalDeTodo = subtotOtrFletManObrTPIE + margen;
            precio = Math.round(totalDeTodo * (1 - descuento) * 100)/100;
            precioMasIVA = Math.round((precio * _configFile.costos.precio_mas_iva) * 100) / 100;
            precioTotalMXN = Math.round((precioMasIVA * precioDolar) * 100) / 100;

            cotizacion = {
                no: _arrayCotizacion[x].no || 0,
                paneles: {
                    nombrePanel: __nombrePanel || null,
                    marcaPanel: __marcaPanel || null,
                    potenciaPanel: __potenciaPanel || null,
                    cantidadPaneles: __cantidadPaneles || null, //numeroDeModulos
                    potenciaReal: __potenciaReal || null,
                    costoDeEstructuras:  __costoDeEstructuras || null,
                    precioPorWatt: __precioPorWattPanel || null,
                    // precioPorModulo: __precioPorModulo || null,
                    costoTotalPaneles: costoTotalPaneles || null
                },
                inversores: {
                    nombreInversor:  __nombreInversor || null,
                    marcaInversor: __marcaInversor || null,
                    potenciaInversor: __potenciaInversor || null,
                    potenciaNominalInversor: __potenciaNominalInversor || null,
                    potenciaPicoPorInversor: __potenciaPicoInversor || null,
                    precioInversor: __precioInversor || null,
                    potenciaMaximaInversor:  __potenciaMaximaInversor || null,
                    numeroDeInversores: __numeroDeInversores || null,
                    porcentajeSobreDimens: __porcentajeSobreDimens || null,
                    costoTotalInversores: costoTotalInversores || null
                },
                viaticos_costos: {
                    noCuadrillas: _numeroCuadrillas || null,
                    noPersonasRequeridas: numeroDePersonasRequeridas || null,
                    noDias: numeroDias || null,
                    noDiasReales: numeroDiasReales || null,
                    pagoPasaje: pagoPasaje || null,
                    pagoTotalPasaje: pagoPasajeTotal || null,
                    pagoTotalComida: pagoComidaTotal || null,
                    pagoTotalHospedaje: pagoHospedajeTotal || null
                },
                totales: {
                    manoDeObra: costoManoDeObra[0] || null,
                    otrosTotal: costoManoDeObra[1] || null,
                    costoTotalFletes: costoTotalFletes || null,
                    totalPanelesInversoresEstructuras: costoTotalPanInvEstr || null,
                    subTotalOtrosFleteManoDeObraTPIE: subtotOtrFletManObrTPIE || null,
                    margen: margen || null,
                    totalDeTodo: totalDeTodo || null,
                    precio: precio || null,
                    precioMasIVA: precioMasIVA || null,
                    // costForWatt: costForWatt || null,
                    totalViaticosMT: totalViaticosMT || null,
                    precioTotalMXN: precioTotalMXN || null
                }
            }

            _cotizacion.push(cotizacion);
        }
    }
    else{
        /*Si la cotizacion es menor a 30 km de distancia, no se cobran viaticos. Solo MANO DE OBRA*/
        // F A LT A   T E S T E A R
        for(var x = 0; x < _arrayCotizacion.length; x++)
        {
            /*#region Panel_info*/
            __no = _arrayCotizacion[x].no || 0;
            __nombrePanel = _arrayCotizacion[x].panel.nombrePanel || null;
            __marcaPanel = _arrayCotizacion[x].panel.marcaPanel || null;
            __potenciaPanel = _arrayCotizacion[x].panel.potenciaPanel || 0;
            __cantidadPaneles = _arrayCotizacion[x].panel.cantidadPaneles || 0; //numeroDeModulos
            __potenciaReal =  _arrayCotizacion[x].panel.potenciaReal || 0;
            __costoDeEstructuras = parseFloat(_arrayCotizacion[x].panel.costoDeEstructuras) || 0;


            __precioPorWattPanel = _arrayCotizacion[x].panel.precioPorWatt || 0;
            // __precioPorModulo = Math.round((__potenciaPanel * __precioPorWattPanel) * 100) / 100 || 0;
            // __precioPorModulo = _arrayCotizacion[x].panel.
            costoTotalPaneles = parseFloat(_arrayCotizacion[x].panel.costoTotalPaneles);
            /*#endregion*/
            /*#region Inversores_info*/
            __nombreInversor =  _arrayCotizacion[x].inversor.nombreInversor || null;
            __marcaInversor = _arrayCotizacion[x].inversor.marcaInversor || null;
            __potenciaInversor = _arrayCotizacion[x].inversor.potenciaInversor || 0;
            __potenciaNominalInversor = _arrayCotizacion[x].inversor.potenciaNominalInversor || 0;
            __precioInversor = _arrayCotizacion[x].inversor.precioInversor || 0;
            __potenciaMaximaInversor = _arrayCotizacion[x].inversor.potenciaMaximaInversor || 0;
            __numeroDeInversores = _arrayCotizacion[x].inversor.numeroDeInversores || 0;
            __potenciaPicoInversor = Math.round(parseFloat(_arrayCotizacion[x].inversor.potenciaPicoInversor)) || 0;
            __porcentajeSobreDimens = _arrayCotizacion[x].inversor.porcentajeSobreDimens || 0;
            costoTotalInversores = _arrayCotizacion[x].inversor.costoTotalInversores || 0;
            /*#endregion*/
            _numeroCuadrillas = parseInt(getNumberOfCrews(__cantidadPaneles)) || 0;
            numeroDePersonasRequeridas = _numeroCuadrillas * parseInt(_configFile.cuadrilla.numeroDePersonas) || 0;
            numeroDias = getDays(__cantidadPaneles, _numeroCuadrillas) || 0;
            numeroDiasReales = getRealDays(__cantidadPaneles, numeroDias) || 0;

            costoTotalPanInvEstr = parseFloat(costoTotalPaneles + costoTotalInversores + __costoDeEstructuras) || 0;
            costoTotalFletes = Math.floor(costoTotalPanInvEstr * parseFloat(_configFile.costos.porcentaje_fletes)) || 0;
            costoManoDeObra = getPrecioDeManoDeObra(__cantidadPaneles, costoTotalPanInvEstr) || 0;
            subtotOtrFletManObrTPIE = parseFloat(costoManoDeObra[1]+ costoTotalFletes + costoManoDeObra[0] + costoTotalPanInvEstr) || 0; //TPIE = Total Paneles Inversores Estructuras
            margen = Math.round(((subtotOtrFletManObrTPIE / (1 - _configFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE) * 100) / 100 || 0;
            totalDeTodo = subtotOtrFletManObrTPIE + margen || 0;
            precio = Math.round(totalDeTodo * (1 - descuento) * 100)/100;
            precioMasIVA = Math.round((precio * _configFile.costos.precio_mas_iva) * 100) / 100;
            precioTotalMXN = Math.round((precioMasIVA * precioDolar) * 100) / 100;

            cotizacion = {
                no: _arrayCotizacion[x].no || 0,
                paneles: {
                    nombrePanel: __nombrePanel || null,
                    marcaPanel: __marcaPanel || null,
                    potenciaPanel: __potenciaPanel || null,
                    cantidadPaneles: __cantidadPaneles || null, //numeroDeModulos
                    potenciaReal: __potenciaReal || null,
                    costoDeEstructuras:  __costoDeEstructuras || null,
                    precioPorWatt: __precioPorWattPanel || null,
                    // precioPorModulo: __precioPorModulo || null,
                    costoTotalPaneles: costoTotalPaneles || null
                },
                inversores: {
                    nombreInversor:  __nombreInversor || null,
                    marcaInversor: __marcaInversor || null,
                    potenciaInversor: __potenciaInversor || null,
                    potenciaNominalInversor: __potenciaNominalInversor || null,
                    potenciaPicoPorInversor: __potenciaPicoInversor || null,
                    precioInversor: __precioInversor || null,
                    potenciaMaximaInversor:  __potenciaMaximaInversor || null,
                    numeroDeInversores: __numeroDeInversores || null,
                    porcentajeSobreDimens: __porcentajeSobreDimens || null,
                    costoTotalInversores: costoTotalInversores || null
                },
                viaticos_costos: {
                    noCuadrillas: _numeroCuadrillas || null,
                    noPersonasRequeridas: numeroDePersonasRequeridas || null,
                    noDias: numeroDias || null,
                    noDiasReales: numeroDiasReales || null
                },
                totales: {
                    manoDeObra: costoManoDeObra[0] || null,
                    otrosTotal: costoManoDeObra[1] || null,
                    costoTotalFletes: costoTotalFletes || null,
                    totalPanelesInversoresEstructuras: costoTotalPanInvEstr || null,
                    subTotalOtrosFleteManoDeObraTPIE: subtotOtrFletManObrTPIE || null,
                    margen: margen || null,
                    totalDeTodo: totalDeTodo || null,
                    precio: precio || null,
                    precioMasIVA: precioMasIVA || null,
                    precioTotalMXN: precioTotalMXN || null
                }
            }

            _cotizacion.push(cotizacion);
        }
    }

    return _cotizacion;
}

function getNumberOfCrews(_numeroPanelesAInstalar){
    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        return 1;
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        return 2;
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        return 3;
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        return 5;
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        return 7;
    }
    else if(_numeroPanelesAInstalar >= 1200){
        return 11;
    }
    else{
        return -1;
    }
}

function getPrecioDeManoDeObra(__cantidadPaneles, _costoTotalPanInvEstr){
    var arrayLaborOtrosPrice = [];
    var laborPrice = 0;
    var otros = 0;

    precioDolar = parseFloat(dolar.obtenerPrecioDolar());

    if(__cantidadPaneles >= 1 && __cantidadPaneles < 8){
        laborPrice = 2000;
        otros = 4100;

        if(__cantidadPaneles === 1){
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros / precioDolar);
            return arrayLaborOtrosPrice;
        }else{
            for(var i=2; i <= __cantidadPaneles; i++){
                otros = otros + 100;

                if(i === 2){
                    laborPrice = laborPrice + 200;
                }
                else if(i === 4){
                    laborPrice = laborPrice + 191;
                }
                else if(i === 6){
                    laborPrice = laborPrice + 191;
                }
                else{
                    laborPrice = laborPrice + 192;
                }
            }
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 8 && __cantidadPaneles < 14){
        laborPrice = 3350;
        otros = 4800;

        if(__cantidadPaneles === 8){
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);
            return arrayLaborOtrosPrice;
        }else{
            for(var i=9; i == __cantidadPaneles; i++){
                laborPrice = laborPrice + 50;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);
            
            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 14 && __cantidadPaneles < 22){
        laborPrice = 3650;
        otros = 6700;

        if(__cantidadPaneles === 14){
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);
            return arrayLaborOtrosPrice;
        }else{
            for(var i=15; i<=__cantidadPaneles; i++){
                otros = otros + 100;

                if(i === 17){
                    laborPrice = laborPrice + 15;
                }
                else if(i === 18){
                    laborPrice = laborPrice + 14;
                }else if(i === 19){
                    laborPrice = laborPrice + 17;
                }else if(i === 20){
                    laborPrice = laborPrice + 18;
                }else if(i === 21){
                    laborPrice = laborPrice + 118;
                }else{
                    laborPrice = laborPrice + 25;
                }
            }
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 22 && __cantidadPaneles < 40){
        laborPrice = 4000;
        otros = 8500;
        
        if(__cantidadPaneles === 22){
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);
            return arrayLaborOtrosPrice;
        }else{
            for(var i=23; i <= __cantidadPaneles; i++){
                otros = otros + 100;

                if(i === 25){
                    laborPrice = laborPrice + 223;
                }
                else if(i === 29){
                    laborPrice = laborPrice + 223;
                }
                else if(i === 34){
                    laborPrice = laborPrice + 223;
                }
                else if(i === 38){
                    laborPrice = laborPrice + 223;
                }
                else{
                    laborPrice = laborPrice + 222;
                }
            }
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 40 && __cantidadPaneles < 46){
        laborPrice = 8000;
        otros = 10300;

        if(__cantidadPaneles === 40){
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);
            return arrayLaborOtrosPrice;
        }else{
            for(var i=41; i <= __cantidadPaneles; i++)
            {
                laborPrice = laborPrice + 200;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 46){
        laborPrice = Math.floor((__cantidadPaneles * 200)/17);
        otros = Math.ceil(((_costoTotalPanInvEstr + laborPrice) * 0.036*17)/17);
        arrayLaborOtrosPrice[0] = parseFloat(laborPrice  / precioDolar);
            arrayLaborOtrosPrice[1] = parseFloat(otros  / precioDolar);

        return arrayLaborOtrosPrice;
    }
}
/*#endregion*/

function getDays(_numeroPanelesAInstalar, noCuadrillas){
    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        // return 20;
        dias = _numeroPanelesAInstalar / 40 / noCuadrillas * 8;
        return dias;
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        // return 30;
        dias = _numeroPanelesAInstalar / 40 / noCuadrillas * 8;
        return dias;
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        // return 33;
        dias = _numeroPanelesAInstalar / 40 / noCuadrillas * 8;
        return dias;
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        // return 32;
        dias = _numeroPanelesAInstalar / 40 / noCuadrillas * 8;
        return dias;
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        // return 30;
        dias = _numeroPanelesAInstalar / 40 / noCuadrillas * 8;
        return dias;
    }
    else if(_numeroPanelesAInstalar >= 1200){
        // return 36;
        dias = _numeroPanelesAInstalar / 40 / noCuadrillas * 8;
        return dias;
    }
    else{
        return -1;
    }
}

function getRealDays(_numeroPanelesAInstalar, _numeroDias){
    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        // return 244;
        diasReales = Math.ceil(_numeroPanelesAInstalar / 100 * _numeroDias);
        return diasReales;
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        // return 122;
        diasReales = Math.ceil(_numeroPanelesAInstalar / 300 * _numeroDias);
        return diasReales;
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        // return 82;
        diasReales = Math.ceil(_numeroPanelesAInstalar / 500 * _numeroDias);
        return diasReales;
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        // return 49;
        diasReales = Math.ceil(_numeroPanelesAInstalar / 800 * _numeroDias);
        return diasReales;
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        // return 31;
        diasReales = Math.ceil(_numeroPanelesAInstalar / 1200 * _numeroDias);
        return diasReales;
    }
    else if(_numeroPanelesAInstalar >= 1200){
        // return 23;
        diasReales = Math.ceil(_numeroPanelesAInstalar / 2000 * _numeroDias);
        return diasReales;
    }
    else{
        return -1;
    }
}

function getBusPayment(_distanciaEnKm){
    if(_distanciaEnKm < 600){
        _distanciaEnKm = parseFloat(_distanciaEnKm * 1.2);
    }
    else{
        _distanciaEnKm = parseFloat(_distanciaEnKm * 2.1); 
    }
    
    _distanciaEnKm = parseFloat(_distanciaEnKm * 2);

    return _distanciaEnKm;
}

/*#region API-GoogleMaps*/
function obtenerDistanciaEnKm(origen, destino){
    var apikey = 'AIzaSyD0cJDO0IwwolWkvCCnzVFTmbsvQjsdOyo';
    var distanciaEnKm = 0;

    switch(origen)
    {
        case 'Veracruz':
            origen = 'Avenida Ricardo Flores Magón, Ignacio Zaragoza, Veracruz, Ver.';
        break;
        case 'CDMX':
            origen = 'Oso, Col del Valle Sur, Benito Juárez, 03100 Ciudad de México, CDMX';
        break;
        case 'Puebla':
            origen = 'Avenida 25 Oriente, Bella Vista, Puebla, Pue.';
        break;
        default: 
            -1
        break;
    }

    origen = origen.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    origen = origen.replace(/\s/g,"+");
    destino = destino.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    destino = destino.replace(/\s/g,"+");

    console.log('Origen: '+origen+' Destino: '+destino);

    return new Promise((resolve, reject) => {
        request.get("https://maps.googleapis.com/maps/api/distancematrix/json?origins="+origen+"&destinations="+destino+"&key="+apikey, (error, response, body) => {
            if(!error){
                body = JSON.parse(body);
                body = body.rows[0].elements;

                for(var i=0; i<body.length; i++){
                    distanciaEnKm = body[i].distance.value;
                }

                distanciaEnKm = Math.ceil(distanciaEnKm / 1000);

                response = {
                    status: true,
                    message: distanciaEnKm
                };
                resolve(response);
            }
            else{
                /* response = {
                    status: false,
                    message: 'Hubo un error al intentar cargar la distancia en la ubicacion proporcionada'
                };
                resolve(response); */
                console.log('Hubo un error al calcular los kilometros de los viaticos');
            }
        });   
    });
}
/*#endregion */

module.exports.mainViaticos = async function(data){
    const result = await main_calcularViaticos(data);
    return result;
}


/* #region Opciones Viaticos Propuesta */
/*
- @description: 		Sección de CRUD - OpcionesViaticos
- @author: 				Jesús Daniel Carrera Falcón
- @date: 				09/04/2020
*/
function insertarOpcionesVPropuestaBD (datas) {
    const { id_Propuesta, id_Opciones_Viatics } = datas;

    return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_OpcionesV_Propuesta(?, ?, ?, ?)', [0, null, id_Propuesta, id_Opciones_Viatics], (error, rows) => {
            if (error) {
                const response = {
                    status: false,
                    message: error
                }
                resolve (response);
            } else {
                const response = {
                    status: true,
                    message: "El registro se ha guardado con éxito."
                }
                resolve(response);
            }
        });
    });
}

function eliminarOpcionesVPropuestaBD(datas) {
    const { idOpcionesV_Propuesta } = datas;

    return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_OpcionesV_Propuesta(?, ?, ?, ?)', [1, idOpcionesV_Propuesta, null, null], (error, rows) => {
            if (error) {
                const response = {
                    status: false,
                    message: error
                }
                resolve (response);
            } else {
                const response = {
                    status: true,
                    message: "El registro se ha eliminado con éxito."
                }
                resolve(response);
            }
        });
    });
}

function editarOpcionesVPropuestaBD (datas) {
    const { idOpcionesV_Propuesta, id_Propuesta, id_Opciones_Viatics } = datas;

    return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_OpcionesV_Propuesta(?, ?, ?, ?)', [2, idOpcionesV_Propuesta, id_Propuesta, id_Opciones_Viatics], (error, rows) => {
            if (error) {
                const response = {
                    status: false,
                    message: error
                }
                resolve (response);
            } else {
                const response = {
                    status: true,
                    message: "El registro se ha editado con éxito."
                }
                resolve(response);
            }
        });
    });
}

function consultaOpcionesVPropuestaBD () {
    return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_OpcionesV_Propuesta(?, ?, ?, ?)', [3, null, null, null], (error, rows) => {
            if (error) {
                const response = {
                    status: false,
                    message: error
                }
                resolve (response);
            } else {
                const response = {
                    status: true,
                    message: rows[0]
                }
                resolve(response);
            }
        });
    });
}

function buscarOpcionesVPropuestaBD (datas) {
    const { idOpcionesV_Propuesta } = datas;

    return new Promise((resolve, reject) => {
        mysqlConnection.query('CALL SP_OpcionesV_Propuesta(?, ?, ?, ?)', [4, idOpcionesV_Propuesta, null, null], (error, rows) => {
            if (error) {
                const response = {
                    status: false,
                    message: error
                }
                resolve (response);
            } else {
                const response = {
                    status: true,
                    message: rows[0]
                }
                resolve(response);
            }
        });
    });
}

module.exports.insertarOpcionesVPropuesta = async function (datas, response) {
    const result = await insertarOpcionesVPropuestaBD(datas);

    return result;
}

module.exports.eliminarOpcionesVPropuesta = async function (datas, response) {
    const result = await eliminarOpcionesVPropuestaBD(datas);

    return result;
}

module.exports.editarOpcionesVPropuesta = async function (datas, response) {
    const result = await editarOpcionesVPropuestaBD(datas);

    return result;
}

module.exports.consultaOpcionesVPropuesta = async function (response) {
    const result = await consultaOpcionesVPropuestaBD();

    return result;
}

module.exports.buscarOpcionesVPropuesta = async function (datas, response) {
    const result = await buscarOpcionesVPropuestaBD(datas);

    return result;
}
/* #endregion */
