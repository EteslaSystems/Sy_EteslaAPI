/*
- @description: 		Archivo correspondiente a las funciones del calculo de viaticos
- @author: 				LH420
- @date: 				09/04/2020
*/
const request = require('request');
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');
const dolar = require('../Controller/dolar_tipoCambio');
const financiamiento = require('../Controller/financiamientoProjController');
const power = require('../Controller/powerController');
const roi = require('../Controller/ROIController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');

var comida = 180; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
var hospedaje = 150; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
/*#region Viaticos BajaTension && Individual*/ //BTI = BajaTension - Individual
const noPersonasRequeridas = 3; //Esta es el numero de personas requeridas para instalar 1 panel //Cotizador - viejo (??)
const km_hospedaje = 130;
const personas_panel = 2.5; //Cotizador - viejo (??)
const hospedaje_dia = 9.5; //Cotizador - viejo (??)
const km_pasaje = 40; //Cotizador - viejo (??)
const km = 0.094; //Cotizador - viejo (??)
const comida_dia = 9.5; //Cotizador - viejo (??)
const viaticos_otros = 0.05; //Cotizador - viejo (??)

async function calcularViaticosBTI(data){
    let _result = [];
    let objROI=null;
    let objPower=null;
    let objCotizacionBTI = {};
    let idUsuario = data.idUsuario;
    let idCliente = data.idCliente;
    let origen = data.origen;
    let destino = data.destino;
    let bInstalacion = data.bInstalacion || null;
    let _consums = data.consumos || null;
    let tipoCotizacion = data.tipoCotizacion || null;
    let tarifa = data.tarifa || null;
    let descuento = (parseInt(data.descuento) / 100) || 0;
    let aumento = (parseInt(data.aumento) / 100 + 1) || 0;

    try{
        let _configFile = await configFile.getArrayOfConfigFile();
        let distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
        distanciaEnKm = distanciaEnKm.message;
        let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
        precioDolar = precioDolar.precioDolar;
    
        let validarJSON = (objJSON) => { //Valida y procesa de String a Object
            if(typeof objJSON === 'string'){
                objJSON = JSON.parse(objJSON);
                return objJSON;
            }
            return false;
        };
    
        //Datos cliente
        let uCliente = await cliente.consultarId({ idPersona: idCliente });
        uCliente = uCliente.message; 
        uCliente = uCliente[0];
    
        //Datos vendedor
        let uVendedor = await vendedor.consultarId({ idPersona: idUsuario });
        uVendedor = uVendedor.message;
        uVendedor = uVendedor[0];

        if(_consums != null){
            //Consumos
            _consums = validarJSON(_consums) == false ? _consums : validarJSON(_consums);
    
            //Se adjuntan los consumos al _arrayBTI
            data.arrayBTI[0]._arrayConsumos = _consums;
        }
    
        //ArrayBTI - Equipos seleccionados/Combinaciones
        if(data.arrayBTI[0].combinacion){
            //Combinaciones
            _arrayCotizacion = data.arrayBTI;
        }
        else{
            //Equipos seleccionados
            if(data.arrayBTI[0].inversor != null){
                formated = data.arrayBTI[0].inversor; //Formated to get _Inversor
                data.arrayBTI[0].inversor = validarJSON(data.arrayBTI[0].inversor) === false ? data.arrayBTI[0].inversor : validarJSON(data.arrayBTI[0].inversor);
            }
    
            if(data.arrayBTI[0].panel != null){
                formated = data.arrayBTI[0].panel; //Formated to get _Panel
                data.arrayBTI[0].panel = validarJSON(data.arrayBTI[0].panel) === false ? data.arrayBTI[0].panel : validarJSON(data.arrayBTI[0].panel);
            }
    
            _arrayCotizacion = data.arrayBTI;
        }
        
        for(var x=0; x<_arrayCotizacion.length; x++)
        {
            let noDias = await getDaysBTI(_arrayCotizacion[x].panel.noModulos);
    
            if(distanciaEnKm >= km_hospedaje){
                hospedaje = noDias * hospedaje_dia * noPersonasRequeridas;
                comida = noDias * comida_dia * noPersonasRequeridas;
                pasaje = Math.round((distanciaEnKm * km * noPersonasRequeridas * 2) * 100) / 100;
            }
            else if(distanciaEnKm >= km_pasaje && noDias < 7){
                pasaje = distanciaEnKm * km * noPersonasRequeridas * 2 * noDias;
            }
            else if(distanciaEnKm >= km_pasaje && noDias > 7){
                hospedaje = noDias * hospedaje_dia * noPersonasRequeridas;
                comida = noDias * comida_dia * noPersonasRequeridas;
                pasaje = distanciaEnKm * km * noPersonasRequeridas * 2;
            }
            else{
                hospedaje = 0;
                comida = 0;
                pasaje = 0;
            }
    
            /*#region Formating... Costo totales -Paneles, -Inversor & -Estructuras*/
            costoTotalPaneles = _arrayCotizacion[x].panel.costoTotal;
            costoTotalInversores = _arrayCotizacion[x].inversor != null ? parseFloat(_arrayCotizacion[x].inversor.precioTotal) : 0;
            costoTotalEstructuras = _arrayCotizacion[x].panel.costoDeEstructuras;
            /*#endregion*/
    
            viaticos = Math.round((hospedaje + comida + pasaje) * (1 + viaticos_otros) * 100) / 100;
            costoTotalPanInvEstr = Math.round((costoTotalPaneles + costoTotalInversores + costoTotalEstructuras) * 100) / 100;
            manoDeObra = await getPrecioDeManoDeObraBTI(_arrayCotizacion[x].panel.noModulos, costoTotalPanInvEstr);
    
            if(bInstalacion === null || bInstalacion === 'false' || bInstalacion === '0'){
                manoDeObra[0] = 0; //Mano de Obra
                manoDeObra[1] = 0; //Costo de Otros
            }
    
            totalFletes = Math.floor(costoTotalPanInvEstr * parseFloat(_configFile.costos.porcentaje_fletes));
            subtotOtrFletManObrTPIE = Math.round(((manoDeObra[1] + totalFletes + manoDeObra[0] + costoTotalPanInvEstr + viaticos)) * 100) / 100;
            margen = Math.round(((subtotOtrFletManObrTPIE / 0.7) - subtotOtrFletManObrTPIE) * 100) / 100;
            costoTotalProyecto = Math.round((subtotOtrFletManObrTPIE + margen + viaticos)*100)/100;
           
            if(aumento > 0){
                precio = Math.round((costoTotalProyecto * aumento) * 100) / 100; //USD //Sin IVA
            }
            else{
                precio = Math.round(costoTotalProyecto * (1 - descuento) * 100)/100; //USD //Sin IVA
            }
    
            precioUSDConIVA = Math.round((precio * 1.16) * 100) / 100; //USD //Con IVA
            precioMXNSinIVA = Math.round((precio * precioDolar) * 100) / 100; //MXN SIN IVA
            precioMXNConIVA = Math.round((precioUSDConIVA * precioDolar) * 100)/100; //MXN + IVA
    
            /*????*/precio_watt = Math.round(((precio / (_arrayCotizacion[x].panel.noModulos * _arrayCotizacion[x].panel.potencia))) * 100) / 100;
    
            if(_consums != null){
                //P O W E R
                let dataPwr = { consumos: _consums, origen: origen, potenciaReal: _arrayCotizacion[x].panel.potenciaReal, tarifa: tarifa };
                objPower = await power.obtenerPowerBTI(dataPwr) || null;
                objROI = await roi.obtenerROI(objPower, _consums, precioMXNConIVA);
    
                //Se guarda el resultado de -consumos- para mandarlo en la respuesta de la funcion
                _consums =  _consums._promCons.promConsumosBimestrales;///Promedio de consumos
            }
    
            //F I N A N C I A M I E N T O
            let ddata = { costoTotal: precioMXNConIVA };
            objFinan = await financiamiento.financiamiento(ddata);
    
            /*#region Foromating . . .*/
            paneles = _arrayCotizacion[x].panel != null ? _arrayCotizacion[x].panel : null;
            inversores = _arrayCotizacion[x].inversor != null ? _arrayCotizacion[x].inversor : null;
            /*#endregion*/
    
            //Se llena el objetoRespuesta
            objCotizacionBTI = {
                vendedor: uVendedor,
                cliente: uCliente,
                paneles: paneles,
                inversores: inversores,
                viaticos_costos: {
                    noDias: noDias,
                    distanciaEnKm: distanciaEnKm,
                    hospedaje: hospedaje,
                    comida: comida,
                    pasaje: pasaje
                },
                totales: {
                    totalViaticosMT: viaticos,
                    manoDeObra: manoDeObra[0],
                    otrosTotal: manoDeObra[1],
                    totalFletes: totalFletes,
                    totalPanelesInversoresEstructuras: costoTotalPanInvEstr,
                    margen: margen,
                    totalDeTodo: costoTotalProyecto,
                    precio: precio, //USD sin IVA
                    precioMasIVA: precioUSDConIVA, //USD con IVA
                    precioMXNSinIVA: precioMXNSinIVA, //MXN sin IVA
                    precioMXNConIVA: precioMXNConIVA, //MXN con IVA
                    precio_watt: precio_watt
                },
                tarifa: tarifa,
                power: objPower,
                roi: objROI, 
                financiamiento: objFinan,
                descuento: data.descuento,
                tipoDeCambio: precioDolar,
                promedioConsumosBimestrales: _consums,
                tipoCotizacion: tipoCotizacion
            };
    
            _result[0] = objCotizacionBTI;
        }
    
        return _result;
    }
    catch(error){
        console.log(error);
    }
}

async function getDaysBTI(noPanelesAInstalar){
    dias = Math.ceil((noPanelesAInstalar / noPersonasRequeridas) / personas_panel);
    return dias;
}

async function getPrecioDeManoDeObraBTI(cantidadPaneles, totalPIE){//La funcion retorna el costo de la ManoObra, etc. en dolares
    //[dictionaryMOCost && OtrosCost] => {El *numero de la izquierda* es la cantidad de paneles y el *numero de la derecha* el costo en MXN}
    
    let dictionaryMOCost = {1:2000,2:2200,3:2392,4:2583,5:2775,6:2967,7:3158,8:3350,9:3400,10:3450,11:3500,12:3550,13:3600,14:3650,15:3675,16:3700,17:3715,18:3729,19:3746,20:3764,21:3882,22:4000,23:4222,24:4444,25:4667,26:4889,27:5111,28:5333,29:5556,30:5778,31:6000,32:6222,33:6444,34:6667,35:6889,36:7111,37:7333,38:7556,39:7778,40:8000,41:8200,42:8400,43:8600,44:8800,45:9000,46:9200,47:9400,48:9600,49:9800,50:10000,51:10200,52:10400,53:10600,54:10800,55:11000,56:11200,57:11400,58:11600,59:11800,60:12000,61:12200,62:12400,63:12600,64:12800,65:13000,66:13200,67:13400,68:13600,69:13800,70:14000,71:14200,72:14400,73:14600,74:14800,75:15000,76:15200,77:15400,78:15600,79:15800,80:16000,81:16200,82:16400,83:16600,84:16800,85:17000,86:17200,87:17400,88:17600,89:17800,90:18000,91:18200,92:18400,93:18600,94:18800,95:19000,96:19200,97:19400,98:19600,99:19800,100:20000};
    let dictionaryOtrosCost = {1:4100,2:4200,3:4300,4:4400,5:4500,6:4600,7:4700,8:4800,9:4900,10:5000,11:5350,12:5700,13:6200,14:6700,15:7200,16:7700,17:8000,18:8100,19:8200,20:8300,21:8400,22:8500,23:8600,24:8700,25:8800,26:8900,27:9000,28:9100,29:9200,30:9300,31:9400,32:9500,33:9600,34:9700,35:9800,36:9900,37:10000,38:10100,39:10200,40:10300,41:10400,42:10500,43:10600,44:10700,45:10800};
    let mo_unitario = 12;
    let otros_porcentaje = 0.035;

    try{
        let completeDictionaryMoCost = (objDictionaryMO) => {
            //Esta funcion amplia el rango de valores (cantidad_paneles <=> costoMXN) hasta iteracion:1300
            let costoMXN = 20000;
    
            for(let i=101; i<=1300; i++)
            {
                costoMXN += 200;
    
                objDictionaryMO[i] = costoMXN;
            }
    
            return objDictionaryMO;
        };

        let completeDictionaryOtrosCost = (objDictionaryOtros) => {
            //Esta funcion amplia el rango de valores (cantidad_paneles <=> costoMXN) hasta iteracion:1300
            let costoMXN = 10800;

            for(let x=46; x<=1300; x++)
            {
                costoMXN += 100;

                objDictionaryOtros[x] = costoMXN;
            }

            return objDictionaryOtros;
        };
    
        dictionaryMOCost = completeDictionaryMoCost(dictionaryMOCost);
        dictionaryOtrosCost = completeDictionaryOtrosCost(dictionaryOtrosCost);
    
        let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
        precioDolar = precioDolar.precioDolar;
    
        if(dictionaryMOCost.hasOwnProperty(cantidadPaneles) == true){
            costoMO = Math.round((dictionaryMOCost[cantidadPaneles] / precioDolar) * 100) / 100;
            costoOtros = Math.round((dictionaryOtrosCost[cantidadPaneles] / precioDolar) * 100) / 100;  
        }
        else{
            costoMO = cantidadPaneles * mo_unitario;
            costoOtros = totalPIE * otros_porcentaje; //PIVEM = Paneles Inversores Viaticos Estructuras ManoDeObra
        }
    
        costosManoObraYOtros = [costoMO, costoOtros];

        return costosManoObraYOtros;
    }
    catch(error){
        console.log('Error ManoObra cost: '+error);
    }
}

module.exports.calcularViaticosBTI = async function (data){
    const result = await calcularViaticosBTI(data);
    return result;
}
/*#endregion*/

/*#region Viaticos MediaTension*/
async function main_calcularViaticos(data){
    let _resultado = [];
    let origen = data.origen;
    let destino = data.destino;
    let idCliente = data.idCliente;
    let descuento = (parseFloat(data.descuento) / 100) || 0;
    let distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
    distanciaEnKm = distanciaEnKm.message;
    let propuesta = data.propuesta; //Obj
    let panel = JSON.parse(propuesta.panel); //Obj
    let inversor = propuesta.inversor; //Obj
    let _agregados = data._agregados || null;
    let tarifa = data.tarifa;
    let pagoPasaje = 0;
    let pagoPasajeTotal = 0;
    let pagoComidaTotal = 0;
    let pagoHospedajeTotal = 0;

    //Datos Cliente
    let uCliente = await cliente.consultarId({ idPersona: idCliente});
    uCliente = uCliente.message;
    uCliente = uCliente[0];

    let confFile = await configFile.getArrayOfConfigFile();
    let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
    precioDolar = precioDolar.precioDolar;

    ///#Calcular totales de agregados
    let costoTotalAgregados = (_agregads) => {
        let total = 0;

        for(let agregado of _agregads)
        {
            subtotal = parseFloat(agregado.cantidadAgregado * agregado.precioAgregado);    
            total += subtotal;
        }
        
        return total;
    };

    costoTotalAgregados = _agregados != null ? costoTotalAgregados(_agregados) : 0; ///CostoTotalAgregados - MXN
    costoTotalAgregados = costoTotalAgregados / precioDolar; ///CostoTotalAgregados - USD (para poderlo sumar a los totales)

    ////#Procedimiento - Calculo_viaticos
    //Se obtiene numero de cuadrillas
    let numeroCuadrillas = getNumberOfCrews(panel.noModulos);
    let numeroDias = getDays(panel.noModulos, numeroCuadrillas);
    let numeroDiasReales = getRealDays(panel.noModulos, numeroDias);
    let numeroPersonasRequeridas = numeroCuadrillas * parseInt(confFile.cuadrilla.numeroDePersonas);

    if(distanciaEnKm > 30){ ///Si la distanciaEnKm supera los 30Km, se cobran viaticos...
        pagoPasaje = Math.round((getBusPayment(distanciaEnKm)/precioDolar) * 100)/100;
        pagoPasajeTotal = Math.ceil(pagoPasaje * numeroPersonasRequeridas);
        pagoComidaTotal = Math.round((((comida * numeroPersonasRequeridas) * numeroDiasReales) / precioDolar) * 100)/100;
        pagoHospedajeTotal = Math.round(((hospedaje * numeroPersonasRequeridas) * numeroDiasReales / precioDolar) * 100)/100;
    }

    let totalViaticos = pagoPasajeTotal + pagoComidaTotal + pagoHospedajeTotal;
    let costoTotalPanInvEstr = Math.round((panel.costoTotal + parseFloat(inversor.precioTotal) + panel.costoDeEstructuras) * 100) /100;
    let costoTotalFletes = Math.floor(costoTotalPanInvEstr * confFile.costos.porcentaje_fletes);
    let costoManoDeObra = getPrecioDeManoDeObraMT(panel.noModulos, costoTotalPanInvEstr, precioDolar);
    let subtotOtrFletManObrTPIE = Math.round((costoManoDeObra[1] + costoTotalFletes + costoManoDeObra[0] + costoTotalPanInvEstr) * 100) / 100; //TPIE = Total Paneles Inversores Estructuras
    let margen = Math.round(((subtotOtrFletManObrTPIE / (1 - confFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE) * 100)/100;
    let totalDeTodo = Math.round((subtotOtrFletManObrTPIE + margen + totalViaticos + costoTotalAgregados) * 100)/100;
    let precio = Math.round((totalDeTodo * (1 - descuento)) * 100)/100;
    let precioMasIVA = Math.round((precio * confFile.costos.precio_mas_iva) * 100)/100;
    let precioMXN = Math.round((precio + precioDolar) * 100)/100;
    let precioMasIVAMXN = Math.round((precioMasIVA * precioDolar)*100)/100;

    let precio_watt = Math.round((totalDeTodo / (panel.noModulos * panel.potencia)) * 100)/100;

    /*#region POWER - ROI - FINANCIAMIENTO*/
    let objPower = await power.obtenerPowerMT(data); //Return an Object
    let objROI = await roi.obtenerROI(objPower, propuesta.periodos.consumo, precioMasIVAMXN);

    let xObjC = { costoTotal: precioMasIVAMXN }; /////Data
    let objFinanciamiento = await financiamiento.financiamiento(xObjC);
    /*#endregion POWER - ROI - FINANCIAMIENTO*/

    let objViaticosCalculados = {
        cliente: uCliente,
        paneles: panel,
        inversores: inversor,
        viaticos_costos: {
            _agregados: data._agregados,
            noCuadrillas: numeroCuadrillas,
            noPersonasRequeridas: numeroPersonasRequeridas,
            noDias: numeroDias,
            noDiasReales: numeroDiasReales,
            pagoPasaje: pagoPasaje,
            pagoTotalPasaje: pagoPasajeTotal,
            pagoTotalComida: pagoComidaTotal,
            pagoTotalHospedaje: pagoHospedajeTotal
        },
        totales: {
            manoDeObra: costoManoDeObra[0] || -1,
            otrosTotal: costoManoDeObra[1] || -1,
            costoTotalFletes: costoTotalFletes,
            totalPanelesInversoresEstructuras: costoTotalPanInvEstr,
            subTotalOtrosFleteManoDeObraTPIE: subtotOtrFletManObrTPIE,
            margen: margen,
            totalDeTodo: totalDeTodo,
            precio: precio,
            precioMasIVA: precioMasIVA,
            precioMXNSinIVA: precioMXN,
            precioMXNConIVA: precioMasIVAMXN,
            precio_watt: precio_watt
        },
        tarifa: tarifa,
        power: objPower,
        roi: objROI, 
        financiamiento: objFinanciamiento,
        descuento: descuento,
        tipoDeCambio: precioDolar,
        tipoCotizacion: data.tipoCotizacion,
        agregados: { _agregados: _agregados, costoTotal: costoTotalAgregados }
    };
    
    _resultado[0] = objViaticosCalculados;

    return _resultado;
}

/*#region Cuadrilla - Mano de obra*/


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

function getPrecioDeManoDeObraMT(cantidadPaneles, costoTotalPanInvEstr, precioDelDolar){
    let arrayLaborOtrosPrice = [];
    let laborPrice = 0;
    let otros = 0;

    if(cantidadPaneles >= 1 && cantidadPaneles < 8){
        laborPrice = 2000;
        otros = 4100;

        if(cantidadPaneles === 1){
            arrayLaborOtrosPrice[0] = laborPrice / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros / precioDelDolar;
            
        }else{
            for(var i=2; i <= cantidadPaneles; i++){
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
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;

            
        }
    }

    if(cantidadPaneles >= 8 && cantidadPaneles < 14){
        laborPrice = 3350;
        otros = 4800;

        if(cantidadPaneles === 8){
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;
            
        }else{
            for(var i=9; i == cantidadPaneles; i++){
                laborPrice = laborPrice + 50;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;
            
            
        }
    }

    if(cantidadPaneles >= 14 && cantidadPaneles < 22){
        laborPrice = 3650;
        otros = 6700;

        if(cantidadPaneles === 14){
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;
            
        }else{
            for(var i=15; i<=cantidadPaneles; i++){
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
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;

            
        }
    }

    if(cantidadPaneles >= 22 && cantidadPaneles < 40){
        laborPrice = 4000;
        otros = 8500;
        
        if(cantidadPaneles === 22){
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;
            
        }else{
            for(var i=23; i <= cantidadPaneles; i++){
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
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;

            
        }
    }

    if(cantidadPaneles >= 40 && cantidadPaneles < 46){
        laborPrice = 8000;
        otros = 10300;

        if(cantidadPaneles === 40){
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;
            
        }else{
            for(var i=41; i <= cantidadPaneles; i++)
            {
                laborPrice = laborPrice + 200;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
            arrayLaborOtrosPrice[1] = otros  / precioDelDolar;

            
        }
    }

    if(cantidadPaneles >= 46){
        laborPrice = Math.floor((cantidadPaneles * 200)/17);
        otros = Math.ceil(((costoTotalPanInvEstr + laborPrice) * 0.036*17)/17);
        arrayLaborOtrosPrice[0] = laborPrice  / precioDelDolar;
        arrayLaborOtrosPrice[1] = otros  / precioDelDolar;
    }

    return arrayLaborOtrosPrice;
}
/*#endregion*/

module.exports.mainViaticosMT = async function(data){
    const result = await main_calcularViaticos(data);
    return result;
}
/*#endregion*/

function getDays(_numeroPanelesAInstalar, noCuadrillas){
    let dias = 0;

    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        dias = (_numeroPanelesAInstalar / 40) / noCuadrillas * 8;
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        dias = (_numeroPanelesAInstalar / 40) / noCuadrillas * 8;
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        dias = (_numeroPanelesAInstalar / 40) / noCuadrillas * 8;
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        dias = (_numeroPanelesAInstalar / 40) / noCuadrillas * 8;
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        dias = (_numeroPanelesAInstalar / 40) / noCuadrillas * 8;
    }
    else if(_numeroPanelesAInstalar >= 1200){
        dias = (_numeroPanelesAInstalar / 40) / noCuadrillas * 8;
    }
    else{
        dias = -1;
    }

    dias = Math.round(dias * 100)/100;
    return dias;
}

function getRealDays(_numeroPanelesAInstalar, _numeroDias){
    if(_numeroPanelesAInstalar >= 0 && _numeroPanelesAInstalar <= 99){
        // return 244;
        return diasReales = Math.ceil(_numeroPanelesAInstalar / 100 * _numeroDias);
    }
    else if(_numeroPanelesAInstalar >= 100 && _numeroPanelesAInstalar <= 299){
        // return 122;
        return diasReales = Math.ceil(_numeroPanelesAInstalar / 300 * _numeroDias);
    }
    else if(_numeroPanelesAInstalar >= 300 && _numeroPanelesAInstalar <= 499){
        // return 82;
        return diasReales = Math.ceil(_numeroPanelesAInstalar / 500 * _numeroDias);
    }
    else if(_numeroPanelesAInstalar >= 500 && _numeroPanelesAInstalar <= 799){
        // return 49;
        return diasReales = Math.ceil(_numeroPanelesAInstalar / 800 * _numeroDias);
    }
    else if(_numeroPanelesAInstalar >=800 && _numeroPanelesAInstalar <= 1199){
        // return 31;
        return diasReales = Math.ceil(_numeroPanelesAInstalar / 1200 * _numeroDias);
    }
    else if(_numeroPanelesAInstalar >= 1200){
        // return 23;
        return diasReales = Math.ceil(_numeroPanelesAInstalar / 2000 * _numeroDias);
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
        request.get("https://maps.googleapis.com/maps/api/distancematrix/json?key="+apikey+"&origins="+origen+"&destinations="+destino, (error, response, body) => {
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
                    message: 'Hubo un error al intentar calcular la distancia, revisa tu destino (direccion_cliente): '+error
                };
                reject(response);
            }
        });   
    });
}

/* #region Opciones Viaticos Propuesta [CRUD]*/
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
