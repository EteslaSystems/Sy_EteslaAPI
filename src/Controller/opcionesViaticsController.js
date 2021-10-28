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
const estructura = require('../Controller/estructuraController');

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
    let objROI = null, objPower = null, objCotizacionBTI = {};
    let idUsuario = data.idUsuario;
    let idCliente = data.idCliente;
    let origen = data.origen;
    let destino = data.destino;
    let _consums = data.consumos || null;
    let _agregados = data._agregados || null;
    let tipoCotizacion = data.tipoCotizacion || null;
    let tarifa = data.tarifa || null;
    let porcentajeDescuento = (data.descuento / 100) || 0;
    let descuento = 0;
    let aumento = (data.aumento / 100) || 0;
    let cantidadEstructuras = 0;
    let costoTotalEstructuras = 0, costoTotalPaneles = 0, costoTotalInversores = 0, costoTotalAgregados = 0;
    let precio_watt = 0;
    let uCliente = null, uVendedor = null;

    try{
        // let _opciones = await consultaOpcionesVPropuestaBD();
        let _configFile = await configFile.getArrayOfConfigFile();
        let distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
        distanciaEnKm = distanciaEnKm.message;
        let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
        precioDolar = precioDolar.precioDolar;
        let noDias = 0;
        let _manoDeObra = [];
    
        let validarJSON = (objJSON) => { //Valida y procesa de String a Object
            if(typeof objJSON === 'string'){
                objJSON = JSON.parse(objJSON);
                return objJSON;
            }
            return false;
        };
    
        //Propuesta - Caducidad
        let infoPropuesta = await configFile.getConfiguracionPropuesta();

        if(tipoCotizacion != 'CombinacionCotizacion'){
            //Datos cliente
            uCliente = await cliente.consultarId({ idPersona: idCliente });
            uCliente = uCliente.message; 
            uCliente = uCliente[0];

            //Datos vendedor
            uVendedor = await vendedor.consultarId({ idPersona: idUsuario });
            uVendedor = uVendedor.message;
            uVendedor = uVendedor[0];
        }

        //Estructuras
        let _estructuras = await estructura.leer();
        _estructuras = _estructuras.message;

        //Agregados
        costoTotalAgregados = _agregados != null ? getCostoTotalAgregados(_agregados) : 0; ///CostoTotalAgregados - MXN;
        costoTotalAgregados = costoTotalAgregados / precioDolar; ///CostoTotalAgregados - USD (para poderlo sumar a los totales)

        /* Se filtra la marca/modelo de estructura segun sea el caso */
        if(data.hasOwnProperty('estructura')){ //Estructura seleccionada
            //Filtrar estructura
            _estructuras = _estructuras.filter(estructura => { return estructura.vMarca.includes(data.estructura) });
            _estructuras = _estructuras[0]; //Formating Wto Object
        }
        else{ //*Default 'Everest'*
            if(tipoCotizacion === 'individual'){
                if(data.arrayBTI[0].estructura === null){
                    _estructuras = null;
                }
                else{
                    _estructuras = _estructuras.filter(estructura => { return estructura.vMarca.includes(data.arrayBTI[0].estructura.vMarca) });
                    _estructuras = _estructuras[0]; //Formating to Object
                }
            }
            else{
                _estructuras = _estructuras.filter(estructura => { return estructura.vMarca.includes('Everest') });
                _estructuras = _estructuras[0]; //Formating to Object
            }
        }

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
        
        for(let x=0; x<_arrayCotizacion.length; x++)
        {
            if(_arrayCotizacion[x].panel != null){
                noDias = getDaysBTI(_arrayCotizacion[x].panel.noModulos);
            }
            else{ ///Cuando solo se cotiza el inversor (Sin paneles)
                noDias = 1;
            }
            
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

            //Cotizacion Individual
            if(tipoCotizacion === 'individual'){
                if(data.data.cotizacionIndividual.complementos.viaticos.viaticos == '1'){ //Con viaticos
                    hospedaje = data.data.cotizacionIndividual.complementos.viaticos.hospedaje === '1' ? hospedaje : 0;
                    comida = data.data.cotizacionIndividual.complementos.viaticos.comida === '1' ? comida : 0;
                    pasaje = data.data.cotizacionIndividual.complementos.viaticos.pasaje === '1' ? pasaje : 0;
                }
                else{ //Sin viaticos
                    hospedaje = 0;
                    comida = 0;
                    pasaje = 0;
                }
            }
            
            /* Se calcula el -costoTotalEstructuras- que tomara en la cotizacion */
            if(tipoCotizacion === 'bajaTension' || tipoCotizacion === 'mediaTension' || tipoCotizacion === 'CombinacionCotizacion'){ //BajaTension
                costoTotalPaneles = _arrayCotizacion[x].panel.costoTotal;
                costoTotalInversores = typeof _arrayCotizacion[x].inversor.precioTotal === 'string' ? parseFloat(_arrayCotizacion[x].inversor.precioTotal) : _arrayCotizacion[x].inversor.precioTotal;
                costoTotalEstructuras = _arrayCotizacion[x].panel.noModulos * _estructuras.fPrecio;
                cantidadEstructuras = _arrayCotizacion[x].panel.noModulos;
            }
            else if(tipoCotizacion === 'individual'){ //Individual
                costoTotalPaneles = _arrayCotizacion[x].panel === null ? 0 : _arrayCotizacion[x].panel.costoTotal;
                costoTotalInversores = _arrayCotizacion[x].inversor === null ? 0 : _arrayCotizacion[x].inversor.precioTotal;

                if(_arrayCotizacion[x].estructura != null){
                    costoTotalEstructuras = _arrayCotizacion[x].estructura.costoTotal;
                    cantidadEstructuras = _arrayCotizacion[x].estructura.cantidad;
                }
            }
            /*#endregion*/
    
            let viaticos = Math.round((hospedaje + comida + pasaje) * (1 + viaticos_otros) * 100) / 100;
            let costoTotalPanInvEstr = Math.round((costoTotalPaneles + costoTotalInversores + costoTotalEstructuras) * 100) / 100;
            
            if(_arrayCotizacion[x].panel != null){ ///Cotizacion c/Paneles
                _manoDeObra = await getPrecioDeManoDeObraBTI(_arrayCotizacion[x].panel.noModulos, (costoTotalPanInvEstr + viaticos));
            }
            else{ ///Cotizacion s/Paneles - Solo inversor [Individual]
                _manoDeObra = await getPrecioDeManoDeObraBTI(0, (costoTotalPanInvEstr + viaticos));
            }

            let totalFletes = Math.floor(costoTotalPanInvEstr * parseFloat(_configFile.costos.porcentaje_fletes)); //USD

            if(tipoCotizacion === 'individual'){
                if(data.data.cotizacionIndividual.complementos.manoObra === '0'){
                    _manoDeObra[0] = 0; //Mano de Obra 
                }
                
                if(data.data.cotizacionIndividual.complementos.otros === '0'){
                    _manoDeObra[1] = 0; //Otros
                }

                if(data.data.cotizacionIndividual.complementos.fletes === '0'){
                    totalFletes = 0; //Fletes
                }
            }
            
            let subtotOtrFletManObrTPIE = Math.round(((_manoDeObra[1] + totalFletes + _manoDeObra[0] + costoTotalPanInvEstr + viaticos + costoTotalAgregados)) * 100) / 100;
            let margen = Math.round(((subtotOtrFletManObrTPIE / 0.7) - subtotOtrFletManObrTPIE) * 100) / 100;
            let costoTotalProyecto = Math.round((subtotOtrFletManObrTPIE + margen)*100)/100;
           
            if(aumento > 0){
                precio = Math.round((costoTotalProyecto * (1 + aumento)) * 100) / 100; //USD //Sin IVA
            }
            else{
                /// Descuento
                if(parseInt(data.descuento) > 0){ ///[Return: $$USD]
                    let descuentPorcentaje = parseInt(data.descuento);
                    descuento = Math.round(((descuentPorcentaje * costoTotalProyecto) / 100) * 100) / 100;//USD
                }

                //USD - Sin IVA
                precio = Math.round(costoTotalProyecto * (1 - porcentajeDescuento) * 100)/100; 
            }
    
            let precioUSDConIVA = Math.round((precio * 1.16)); //USD //Con IVA
            let precioMXNSinIVA = Math.round(precio * precioDolar); //MXN SIN IVA
            let precioMXNConIVA = Math.round(precioUSDConIVA * precioDolar); //MXN + IVA
    
            if(_arrayCotizacion[x].panel != null){ ///Validar que se esten cotizando [PANELES]
                /*????*/ precio_watt = Math.round(((precio / (_arrayCotizacion[x].panel.noModulos * _arrayCotizacion[x].panel.potencia))) * 100) / 100;
            }
    
            if(_consums != null){
                //P O W E R
                let dataPwr = { consumos: _consums, origen: origen, potenciaReal: _arrayCotizacion[x].panel.potenciaReal, tarifa: tarifa };
                objPower = await power.obtenerPowerBTI(dataPwr) || null;
                objROI = await roi.obtenerROI(objPower, _consums, precioMXNSinIVA);
    
                //Se guarda el resultado de -consumos- para mandarlo en la respuesta de la funcion
                _consums =  _consums._promCons.promConsumosBimestrales;///Promedio de consumos
            }
    
            //F I N A N C I A M I E N T O
            let ddata = { costoTotal: precioMXNSinIVA };
            let objFinan = await financiamiento.financiamiento(ddata);
    
            /*#region Foromating . . .*/
            let paneles = _arrayCotizacion[x].panel != null ? _arrayCotizacion[x].panel : null;
            let inversores = _arrayCotizacion[x].inversor != null ? _arrayCotizacion[x].inversor : null;
            /*#endregion*/
    
            //Se llena el objetoRespuesta
            objCotizacionBTI = {
                vendedor: uVendedor,
                cliente: uCliente,
                paneles: paneles,
                inversores: inversores,
                estructura: { _estructuras: _estructuras, costoTotal: costoTotalEstructuras, cantidad: cantidadEstructuras },
                agregados: { _agregados: _agregados, costoTotal: costoTotalAgregados },
                viaticos_costos: {
                    noDias: noDias,
                    distanciaEnKm: distanciaEnKm,
                    hospedaje: hospedaje,
                    comida: comida,
                    pasaje: pasaje
                },
                totales: {
                    totalViaticosMT: viaticos,
                    manoDeObra: _manoDeObra[0],
                    otrosTotal: _manoDeObra[1],
                    fletes: totalFletes,
                    totalPanelesInversoresEstructuras: costoTotalPanInvEstr,
                    margen: margen,
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
                descuento: { porcentaje: data.descuento, descuento: descuento },
                aumento: data.aumento,
                tipoDeCambio: precioDolar,
                promedioConsumosBimestrales: _consums,
                tipoCotizacion: tipoCotizacion,
                expiracion: { 
                    cantidad: infoPropuesta.configuracion.expiracion.numero,
                    unidadMedida: infoPropuesta.configuracion.expiracion.unidadMedida
                }
            };
    
            _result[0] = objCotizacionBTI;
        }
    
        return _result;
    }
    catch(error){
        console.log(error);
    }
}

function getDaysBTI(noPanelesAInstalar){
    let dias = Math.ceil((noPanelesAInstalar / noPersonasRequeridas) / personas_panel);
    return dias;
}

async function getPrecioDeManoDeObraBTI(cantidadPaneles, totalPIEV){//La funcion retorna el costo de la ManoObra, etc. en dolares [USD]
    /*
        ->[dictionaryMOCost && OtrosCost] => {El *numero de la izquierda* es la cantidad de paneles y el *numero de la derecha* el costo en MXN}
        ->totalPIEV = [PIEV] Paneles Inversores Estructuras Viaticos
    */

    let dictionaryMOCost = {1:2000,2:2200,3:2392,4:2583,5:2775,6:2967,7:3158,8:3350,9:3400,10:3450,11:3500,12:3550,13:3600,14:3650,15:3675,16:3700,17:3715,18:3729,19:3746,20:3764,21:3882,22:4000,23:4222,24:4444,25:4667,26:4889,27:5111,28:5333,29:5556,30:5778,31:6000,32:6222,33:6444,34:6667,35:6889,36:7111,37:7333,38:7556,39:7778,40:8000,41:8200,42:8400,43:8600,44:8800,45:9000};
    let dictionaryOtrosCost = {1:4100,2:4200,3:4300,4:4400,5:4500,6:4600,7:4700,8:4800,9:4900,10:5000,11:5350,12:5700,13:6200,14:6700,15:7200,16:7700,17:8000,18:8100,19:8200,20:8300,21:8400,22:8500,23:8600,24:8700,25:8800,26:8900,27:9000,28:9100,29:9200,30:9300,31:9400,32:9500,33:9600,34:9700,35:9800,36:9900,37:10000,38:10100,39:10200,40:10300,41:10400,42:10500,43:10600,44:10700,45:10800};
    let mo_unitario = 12;
    let otros_porcentaje = 0.035;

    try{
        let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
        precioDolar = precioDolar.precioDolar;
    
        if(dictionaryMOCost.hasOwnProperty(cantidadPaneles) == true){ //Se busca coincidencia en los diccionarios (Sobre la cantidad de paneles a instalar)
            costoMO = Math.round((dictionaryMOCost[cantidadPaneles] / precioDolar) * 100) / 100;
            costoOtros = Math.round((dictionaryOtrosCost[cantidadPaneles] / precioDolar) * 100) / 100;  
        }
        else{ //Si no se encuentra coincidencia en el bloque anterior, se calcula de manera manual
            costoMO = Math.round(((cantidadPaneles * mo_unitario) / precioDolar) * 100) / 100;
            costoOtros = Math.round((((totalPIEV + costoMO) * otros_porcentaje) / precioDolar) * 100) / 100;
        }
    
        costosManoObraYOtros = [costoMO, costoOtros];
    }
    catch(error){
        console.log('Error ManoObra cost: '+error);
    }
    
    return costosManoObraYOtros;
}

module.exports.calcularViaticosBTI = async function (data){
    const result = await calcularViaticosBTI(data);
    return result;
}
/*#endregion*/

/*#region Viaticos MediaTension*/
async function main_calcularViaticos(data){
    let _resultado = [], objViaticosCalculados = {};
    let pagoPasaje = 0, pagoPasajeTotal = 0, pagoComidaTotal = 0, pagoHospedajeTotal = 0;

    try{
        let origen = data.origen;
        let destino = data.destino;
        let idCliente = data.idCliente;
        let descuento = (parseFloat(data.descuento) / 100) || 0;
        let propuesta = data.propuesta; //Obj
        let panel = JSON.parse(propuesta.panel); //Obj
        let inversor = propuesta.inversor; //Obj
        let _agregados = data._agregados || null;
        let tarifa = data.tarifa;

        //Distancia KM
        let distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
        distanciaEnKm = distanciaEnKm.message;

        //Datos Cliente
        let uCliente = await cliente.consultarId({ idPersona: idCliente});
        uCliente = uCliente.message;
        uCliente = uCliente[0];

        //Estructuras
        let _estructuras = await estructura.leer();
        _estructuras = _estructuras.message;

        //AGREGADOS
        costoTotalAgregados = _agregados != null ? getCostoTotalAgregados(_agregados) : 0; ///CostoTotalAgregados - MXN
        costoTotalAgregados = costoTotalAgregados / precioDolar; ///CostoTotalAgregados - USD (para poderlo sumar a los totales)

        //
        let confFile = await configFile.getArrayOfConfigFile();
        let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
        precioDolar = precioDolar.precioDolar;

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

        //Estructura seleccionada por el usuario
        if(data.propuesta.hasOwnProperty('estructura')){ 
            //Filtrar estructura
            _estructuras = _estructuras.filter(estructura => { return estructura.vMarca.includes(data.propuesta.estructura) });
            _estructuras = _estructuras[0]; //Formating Wto Object
        }
        else{ //Estructura *Default por el sistema* => 'Everest'
            _estructuras = _estructuras.filter(estructura => { return estructura.vMarca.includes("Everest") });
            _estructuras = _estructuras[0]; //Formating to Object
        }

        let costoTotalEstructuras = _estructuras.fPrecio * panel.noModulos;
        let totalViaticos = pagoPasajeTotal + pagoComidaTotal + pagoHospedajeTotal;
        let costoTotalPanInvEstr = Math.round((panel.costoTotal + parseFloat(inversor.precioTotal) + costoTotalEstructuras) * 100) /100;
        let costoTotalFletes = Math.floor(costoTotalPanInvEstr * confFile.costos.porcentaje_fletes);
        let costoManoDeObra = getPrecioDeManoDeObraMT(panel.noModulos, costoTotalPanInvEstr, precioDolar);
        let subtotOtrFletManObrTPIE = Math.round((costoManoDeObra[1] + costoTotalFletes + costoManoDeObra[0] + costoTotalPanInvEstr + costoTotalAgregados) * 100) / 100; //TPIE = Total Paneles Inversores Estructuras
        let margen = Math.round(((subtotOtrFletManObrTPIE / (1 - confFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE) * 100)/100;
        let totalDeTodo = Math.round((subtotOtrFletManObrTPIE + margen + totalViaticos) * 100)/100;
        let precio = Math.round(totalDeTodo * (1 - descuento)); //USD
        let precioMasIVA = Math.round(precio * confFile.costos.precio_mas_iva); //USD + IVA
        let precioMXN = Math.round(precio * precioDolar); //MXN
        let precioMasIVAMXN = Math.round(precioMasIVA * precioDolar); //MXN + IVA

        let precio_watt = Math.round((totalDeTodo / (panel.noModulos * panel.potencia)) * 100)/100;

        /* POWER - ROI - FINANCIAMIENTO */
        let objPower = await power.obtenerPowerMT(data); //Return an Object
        let objROI = await roi.obtenerROI(objPower, propuesta.periodos.consumo, precioMXN);

        let xObjC = { costoTotal: precioMXN }; /////Data
        let objFinanciamiento = await financiamiento.financiamiento(xObjC);

        objViaticosCalculados = {
            cliente: uCliente,
            paneles: panel,
            inversores: inversor,
            agregados: { _agregados: _agregados, costoTotal: costoTotalAgregados },
            viaticos_costos: {
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
                manoDeObra: costoManoDeObra[0] || null,
                otrosTotal: costoManoDeObra[1] || null,
                costoTotalFletes: costoTotalFletes,
                totalPanelesInversoresEstructuras: costoTotalPanInvEstr,
                subTotalOtrosFleteManoDeObraTPIE: subtotOtrFletManObrTPIE,
                margen: margen,
                precio: precio,
                precioMasIVA: precioMasIVA,
                precioMXNSinIVA: precioMXN,
                precioMXNConIVA: precioMasIVAMXN,
                precio_watt: precio_watt
            },
            estructura: { estructura: _estructuras, costoTotal: costoTotalEstructuras },
            tarifa: tarifa,
            power: objPower,
            roi: objROI, 
            financiamiento: objFinanciamiento,
            descuento: descuento,
            tipoDeCambio: precioDolar,
            tipoCotizacion: data.tipoCotizacion
        };
        
        _resultado[0] = objViaticosCalculados;

        return _resultado;
    }
    catch(error){
        console.log(error);
        throw error;
    }
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
    let laborPrice = 0, otros = 0;

    if(cantidadPaneles >= 1 && cantidadPaneles < 8){
        laborPrice = 2000;
        otros = 4100;

        if(cantidadPaneles === 1){
            arrayLaborOtrosPrice[0] = Math.round((laborPrice / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros / precioDelDolar) * 100) / 100;
            
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
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
        }
    }

    if(cantidadPaneles >= 8 && cantidadPaneles < 14){
        laborPrice = 3350;
        otros = 4800;

        if(cantidadPaneles === 8){
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
            
        }else{
            for(var i=9; i == cantidadPaneles; i++){
                laborPrice = laborPrice + 50;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
        }
    }

    if(cantidadPaneles >= 14 && cantidadPaneles < 22){
        laborPrice = 3650;
        otros = 6700;

        if(cantidadPaneles === 14){
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
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
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
        }
    }

    if(cantidadPaneles >= 22 && cantidadPaneles < 40){
        laborPrice = 4000;
        otros = 8500;
        
        if(cantidadPaneles === 22){
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
            
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
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
        }
    }

    if(cantidadPaneles >= 40 && cantidadPaneles < 46){
        laborPrice = 8000;
        otros = 10300;

        if(cantidadPaneles === 40){
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
            
        }else{
            for(var i=41; i <= cantidadPaneles; i++)
            {
                laborPrice = laborPrice + 200;
                otros = otros + 100;
            }
            arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
            arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
        }
    }

    if(cantidadPaneles >= 46){
        laborPrice = Math.floor((cantidadPaneles * 200) / precioDelDolar);
        otros = Math.ceil(((costoTotalPanInvEstr + laborPrice) * 0.036 * precioDelDolar) / precioDelDolar);
        arrayLaborOtrosPrice[0] = Math.round((laborPrice  / precioDelDolar) * 100) / 100;
        arrayLaborOtrosPrice[1] = Math.round((otros  / precioDelDolar) * 100) / 100;
    }

    return arrayLaborOtrosPrice;
}
/*#endregion*/

module.exports.mainViaticosMT = async function(data){
    const result = await main_calcularViaticos(data);
    return result;
}
/*#endregion*/
function getCostoTotalAgregados(__agregados){
    let total = 0, subtotal = 0;

    for(let agregado of __agregados)
    {
        subtotal = parseFloat(agregado.cantidadAgregado * agregado.precioAgregado);    
        total += subtotal;
    }
    
    return total;
}

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
    let apikey = 'AIzaSyD0cJDO0IwwolWkvCCnzVFTmbsvQjsdOyo';
    let distanciaEnKm = 0;

    try{
        origen = origen.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        origen = origen.replace(/\s/g,"+");
        destino = destino.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        destino = destino.replace(/\s/g,"+");
    
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
    catch(error){
        console.log(error);
        throw error;
    }
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
        mysqlConnection.query('CALL SP_Opciones_Viatics(?, ?, ?, ?, ?)', [3, null, null, null, null], (error, rows) => {
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
