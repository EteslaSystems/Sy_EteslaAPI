/*
- @description: 		Archivo correspondiente a las funciones del calculo de viaticos
- @author: 				LH420 & Jesús Daniel Carrera Falcón
- @date: 				09/04/2020
*/
const request = require('request');
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');

var distanciaEnKm = 0;
var comida = 180; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
var hospedaje = 150; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
var descuento = 0.00; //Este valor tiene que ser dinamico y pasado por parametro a la funcion 'main_calcularViaticos'

async function main_calcularViaticos(_arrayCotizacion, _oficina, _direccionCliente){
    distanciaEnKm = await obtenerDistanciaEnKm(_oficina, _direccionCliente);
    distanciaEnKm = distanciaEnKm.message;
    //distanciaEnKm = 93; //Descomentar la linea de arriba y eliminar esta, para que la funcionalidad sea dinamica
    
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
            /*#region iteracionArray*/
            __no = _arrayCotizacion[x].no || 0;
            __nombrePanel = _arrayCotizacion[x].panel.nombrePanel;
            __marcaPanel = _arrayCotizacion[x].panel.marcaPanel;
            __potenciaPanel = _arrayCotizacion[x].panel.potenciaPanel;
            __cantidadPaneles = _arrayCotizacion[x].panel.cantidadPaneles; //numeroDeModulos
            __potenciaReal =  _arrayCotizacion[x].panel.potenciaReal;
            __precioPorWattPanel = _arrayCotizacion[x].panel.precioPorWatt;
            __costoDeEstructuras = _arrayCotizacion[x].panel.costoDeEstructuras;
            __precioPorModulo = Math.round((__potenciaPanel * __precioPorWattPanel) * 100) / 100;
            costoTotalPaneles = Math.floor(__cantidadPaneles * __precioPorModulo);

            __nombreInversor =  _arrayCotizacion[x].inversor.nombreInversor || null;
            __marcaInversor = _arrayCotizacion[x].inversor.marcaInversor || null;
            __potenciaInversor = _arrayCotizacion[x].inversor.potenciaInversor;
            __potenciaNominalInversor = _arrayCotizacion[x].inversor.potenciaNominalInversor;
            __precioInversor = _arrayCotizacion[x].inversor.precioInversor;
            __potenciaMaximaInversor = _arrayCotizacion[x].inversor.potenciaMaximaInversor;
            __numeroDeInversores = _arrayCotizacion[x].inversor.numeroDeInversores;
            __potenciaPicoInversor = _arrayCotizacion[x].inversor.potenciaPicoInversor;
            __porcentajeSobreDimens = _arrayCotizacion[x].inversor.porcentajeSobreDimens;
            costoTotalInversores = Math.ceil(__numeroDeInversores * __precioInversor);
            /*#endregion*/
            numeroPanelesAInstalar = _arrayCotizacion[x].panel.cantidadPaneles;
            _numeroCuadrillas = getNumberOfCrews(numeroPanelesAInstalar);
            numeroDePersonasRequeridas = _numeroCuadrillas * _configFile.cuadrilla.numeroDePersonas;
            numeroDias = getDays(numeroPanelesAInstalar);
            numeroDiasReales = getRealDays(numeroPanelesAInstalar);
            pagoPasaje = getBusPayment(distanciaEnKm);
            pagoPasajeTotal = pagoPasaje * numeroDePersonasRequeridas;
            pagoPasajeTotal = Math.ceil(pagoPasajeTotal);
            pagoComidaTotal = comida * numeroDePersonasRequeridas * numeroDiasReales;
            pagoHospedajeTotal = hospedaje * numeroDePersonasRequeridas * numeroDiasReales;
            totalViaticosMT = pagoPasajeTotal + pagoComidaTotal + pagoHospedajeTotal; //MT = MediaTension
            costoTotalPanInvEstr = costoTotalPaneles + costoTotalInversores + __costoDeEstructuras;
            costoTotalFletes = Math.floor(costoTotalPanInvEstr * _configFile.costos.porcentaje_fletes);
            costoManoDeObra = getPrecioDeManoDeObra(__cantidadPaneles, costoTotalPanInvEstr);
            subtotOtrFletManObrTPIE = costoManoDeObra[1] + costoTotalFletes + costoManoDeObra[0] + costoTotalPanInvEstr; //TPIE = Total Paneles Inversores Estructuras
            margen = (subtotOtrFletManObrTPIE/(1 - _configFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE;
            margen = Math.round(margen * 100) / 100;
            totalDeTodo = subtotOtrFletManObrTPIE + margen;
            precio = totalDeTodo * (1 - descuento);
            precio = Math.round(precio * 100) / 100;
            precioMasIVA = precio * _configFile.costos.precio_mas_iva;
            precioMasIVA = Math.round(precioMasIVA * 100) / 100;
            costForWatt = Math.round((precio / (__potenciaReal * 1000)) * 100) / 100;

            cotizacion = {
                no: _arrayCotizacion[x].no || 0,
                paneles: {
                    nombrePanel: __nombrePanel || null,
                    marcaPanel: __marcaPanel || null,
                    potenciaPanel: __potenciaPanel || null,
                    cantidadPaneles: __cantidadPaneles || null, //numeroDeModulos
                    potenciaReal: __potenciaReal || null,
                    precioPorModulo: __precioPorModulo || null,
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
                    costoDeEstructuras:  __costoDeEstructuras || null,
                    pagoPasaje: pagoPasaje || null,
                    pagoTotalPasaje: pagoPasajeTotal || null,
                    pagoTotalComida: pagoComidaTotal || null,
                    pagoTotalHospedaje: pagoHospedajeTotal || null,
                    totalViaticosMT: totalViaticosMT || null
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
                    costForWatt: costForWatt || null
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
            __nombrePanel = _arrayCotizacion[x].panel.nombrePanel  || null;
            __marcaPanel = _arrayCotizacion[x].panel.marcaPanel || null;
            __potenciaPanel = _arrayCotizacion[x].panel.potenciaPanel;
            __cantidadPaneles = _arrayCotizacion[x].panel.cantidadPaneles; //numeroDeModulos
            __potenciaReal =  _arrayCotizacion[x].panel.potenciaReal;
            __precioPorWattPanel = _arrayCotizacion[x].panel.precioPorWatt;
            __costoDeEstructuras = _arrayCotizacion[x].panel.costoDeEstructuras;
            __precioPorModulo = __potenciaPanel * __precioPorWattPanel;
            __precioPorModulo = Math.round(__precioPorModulo * 100) / 100;
            costoTotalPaneles = Math.floor(__cantidadPaneles * __precioPorModulo);
            /*#endregion*/
            /*#region Inversores_info*/
            __nombreInversor =  _arrayCotizacion[x].inversor.nombreInversor || null;
            __marcaInversor = _arrayCotizacion[x].inversor.marcaInversor || null;
            __potenciaInversor = _arrayCotizacion[x].inversor.potenciaInversor;
            __potenciaNominalInversor = _arrayCotizacion[x].inversor.potenciaNominalInversor;
            __precioInversor = _arrayCotizacion[x].inversor.precioInversor;
            __potenciaMaximaInversor = _arrayCotizacion[x].inversor.potenciaMaximaInversor;
            __numeroDeInversores = _arrayCotizacion[x].inversor.numeroDeInversores;
            __potenciaPicoInversor = _arrayCotizacion[x].inversor.potenciaPicoInversor;
            __porcentajeSobreDimens = _arrayCotizacion[x].inversor.porcentajeSobreDimens;
            costoTotalInversores = Math.ceil(__numeroDeInversores * __precioInversor);
            /*#endregion*/
            numeroPanelesAInstalar = parseFloat(_arrayCotizacion[x].panel.cantidadPaneles);
            _numeroCuadrillas = getNumberOfCrews(numeroPanelesAInstalar);
            numeroDePersonasRequeridas = _numeroCuadrillas * _configFile.cuadrilla.numeroDePersonas;
            numeroDias = getDays(numeroPanelesAInstalar);
            numeroDiasReales = getRealDays(numeroPanelesAInstalar);
            costoTotalPanInvEstr = costoTotalPaneles + costoTotalInversores + __costoDeEstructuras;
            costoTotalFletes = Math.floor(costoTotalPanInvEstr * _configFile.costos.porcentaje_fletes);
            costoManoDeObra = getPrecioDeManoDeObra(__cantidadPaneles, costoTotalPanInvEstr);
            subtotOtrFletManObrTPIE = costoManoDeObra[1] + costoTotalFletes + costoManoDeObra[0] + costoTotalPanInvEstr; //TPIE = Total Paneles Inversores Estructuras
            margen = (subtotOtrFletManObrTPIE/(1 - _configFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE;
            margen = Math.round(margen * 100) / 100;
            totalDeTodo = subtotOtrFletManObrTPIE + margen;
            precio = totalDeTodo * (1 - descuento);
            precio = Math.round(precio * 100) / 100;
            precioMasIVA = precio * _configFile.costos.precio_mas_iva;
            precioMasIVA = Math.round(precioMasIVA * 100) / 100;
            costForWatt = Math.round((precio / (__potenciaReal * 1000)) * 100) / 100;

            cotizacion = {
                no: _arrayCotizacion[x].no || 0,
                paneles: {
                    nombrePanel: __nombrePanel || null,
                    marcaPanel: __marcaPanel || null,
                    potenciaPanel: __potenciaPanel || null,
                    cantidadPaneles: __cantidadPaneles || null, //numeroDeModulos
                    potenciaReal: __potenciaReal || null,
                    precioPorModulo: __precioPorModulo || null,
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
                    costoDeEstructuras:  __costoDeEstructuras || null
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
                    costForWatt: costForWatt || null
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

    if(__cantidadPaneles >= 1 && __cantidadPaneles < 8){
        laborPrice = 2000;
        otros = 4100;

        if(__cantidadPaneles === 1){
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;
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
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 8 && __cantidadPaneles < 14){
        laborPrice = 3350;
        otros = 4800;

        if(__cantidadPaneles === 8){
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;
            return arrayLaborOtrosPrice;
        }else{
            for(var i=9; i == __cantidadPaneles; i++){
                laborPrice = laborPrice + 50;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;
            
            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 14 && __cantidadPaneles < 22){
        laborPrice = 3650;
        otros = 6700;

        if(__cantidadPaneles === 14){
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;
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
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 22 && __cantidadPaneles < 40){
        laborPrice = 4000;
        otros = 8500;
        
        if(__cantidadPaneles === 22){
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;
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
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 40 && __cantidadPaneles < 46){
        laborPrice = 8000;
        otros = 10300;

        if(__cantidadPaneles === 40){
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;
            return arrayLaborOtrosPrice;
        }else{
            for(var i=41; i <= __cantidadPaneles; i++)
            {
                laborPrice = laborPrice + 200;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = laborPrice;
            arrayLaborOtrosPrice[1] = otros;

            return arrayLaborOtrosPrice;
        }
    }

    if(__cantidadPaneles >= 46){
        laborPrice = Math.floor((__cantidadPaneles * 200)/17);
        otros = Math.ceil(((_costoTotalPanInvEstr + laborPrice) * 0.036*17)/17);
        arrayLaborOtrosPrice[0] = laborPrice;
        arrayLaborOtrosPrice[1] = otros;

        return arrayLaborOtrosPrice;
    }
}
/*#endregion*/

function getDays(_numeroPanelesAInstalar){
    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        return 20;
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        return 30;
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        return 33;
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        return 32;
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        return 30;
    }
    else if(_numeroPanelesAInstalar >= 1200){
        return 36;
    }
    else{
        return -1;
    }
}

function getRealDays(_numeroPanelesAInstalar){
    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        return 244;
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        return 122;
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        return 82;
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        return 49;
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        return 31;
    }
    else if(_numeroPanelesAInstalar >= 1200){
        return 23;
    }
    else{
        return -1;
    }
}

function getBusPayment(_distanciaEnKm){
    if(_distanciaEnKm < 600){
        _distanciaEnKm = _distanciaEnKm * 1.2;
    }
    else{
        _distanciaEnKm = _distanciaEnKm * 2.1; 
    }
    
    _distanciaEnKm = _distanciaEnKm * 2;

    return _distanciaEnKm;
}

/*#region API-GoogleMaps*/
function obtenerDistanciaEnKm(origen, destino){
    var apikey = 'AIzaSyD0cJDO0IwwolWkvCCnzVFTmbsvQjsdOyo';
    var distanciaEnKm = 0;
    origen = origen.replace(/\s/g,"+");
    destino = destino.replace(/\s/g,"+");

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
                response = {
                    status: false,
                    message: error
                };
                resolve(response);
            }
        });   
    });
}
/*#endregion */

module.exports.mainViaticos = async function(arrayCotizacion, oficina, direccionCliente){
    const result = await main_calcularViaticos(arrayCotizacion, oficina, direccionCliente);
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
