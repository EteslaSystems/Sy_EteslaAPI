/*
- @description: 		Archivo correspondiente a las funciones del calculo de viaticos
- @author: 				LH420
- @date: 				09/04/2020
*/
require('dotenv').config();
const mysqlConnection = require('../../config/database');
const configFile = require('../Controller/configFileController');
const dolar = require('../Controller/dolar_tipoCambio');
const financiamiento = require('../Controller/financiamientoProjController');
const power = require('../Controller/powerController');
const roi = require('../Controller/ROIController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');
const estructura = require('../Controller/estructuraController');
const Notificacion = require('../Controller/notificationController');

const Fetch = require("node-fetch");

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
    let Descuento = { porcentaje: 0, descuento: 0, precioSinDescuento: 0 };
    let Aumento = { porcentaje: 0, aumento: 0, precioSinAumento: 0 };
    let cantidadEstructuras = 0;
    let costoTotalEstructuras = 0, costoTotalPaneles = 0, costoTotalInversores = 0, costoTotalAgregados = 0;
    let precio_watt = 0;
    let uCliente = null, uVendedor = null;
    let comida = 0, hospedaje = 0;

    try{
        let idUsuario = data.idUsuario;
        let idCliente = data.idCliente;
        let origen = data.origen;
        let destino = data.destino; 
        let _consums = data.consumos || null;
        let _agregados = data._agregados || null;
        let tipoCotizacion = data.tipoCotizacion || null;
        let tarifa = data.tarifa || null;
        let _configFile = await configFile.getArrayOfConfigFile();
        let distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
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
    
        //Array - Viaticos
        let _Viaticos = await consultaOpcionesVPropuestaBD();
        _Viaticos = _Viaticos.message;

        //Propuesta - Caducidad
        let infoPropuesta = _configFile.propuesta_cotizacion;

        //Datos cliente
        uCliente = await cliente.consultarId({ idPersona: idCliente });
        uCliente = uCliente.message; 
        uCliente = uCliente[0];

        //Datos vendedor
        uVendedor = await vendedor.consultarId({ idPersona: idUsuario });
        uVendedor = uVendedor.message;
        uVendedor = uVendedor[0];

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
                let marcaEstructura = typeof data.arrayBTI[0].estructura != 'undefined' || data.arrayBTI[0].estructura != null ? data.arrayBTI[0].estructura.vMarca : 'Everest';

                _estructuras = _estructuras.filter(estructura => { return estructura.vMarca.includes(marcaEstructura) });
                _estructuras = _estructuras[0]; //Formating to Object
            }
        }

        //Consumos
        if(_consums != null && tipoCotizacion != "Combinacion"){
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
                hospedaje = data.data.cotizacionIndividual.complementos.viaticos.hospedaje === '1' ? hospedaje : 0;
                comida = data.data.cotizacionIndividual.complementos.viaticos.comida === '1' ? comida : 0;
                pasaje = data.data.cotizacionIndividual.complementos.viaticos.pasaje === '1' ? pasaje : 0;
            }
            
            /* Se calcula el -costoTotalEstructuras- que tomara en la cotizacion */
            if(tipoCotizacion === 'bajaTension' || tipoCotizacion === 'mediaTension' || tipoCotizacion === 'Combinacion'){ //BajaTension
                costoTotalPaneles = _arrayCotizacion[x].panel.costoTotal;
                costoTotalInversores = typeof _arrayCotizacion[x].inversor.costoTotal === 'string' ? parseFloat(_arrayCotizacion[x].inversor.costoTotal) : _arrayCotizacion[x].inversor.costoTotal;
                costoTotalEstructuras = _arrayCotizacion[x].panel.noModulos * _estructuras.fPrecio;
                cantidadEstructuras = _arrayCotizacion[x].panel.noModulos;
            }
            else if(tipoCotizacion === 'individual'){ //Individual
                costoTotalPaneles = _arrayCotizacion[x].panel === null ? 0 : _arrayCotizacion[x].panel.costoTotal;
                costoTotalInversores = _arrayCotizacion[x].inversor === null ? 0 : _arrayCotizacion[x].inversor.costoTotal;

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
            let margen = ((subtotOtrFletManObrTPIE / 0.7) - subtotOtrFletManObrTPIE);
            let costoTotalProyecto = Math.round(subtotOtrFletManObrTPIE + margen); //USD - s/IVA
           
            /// %
            let inflacionPropuesta = _configFile.propuesta_cotizacion.inflacion;

            //Inflacion
            if(inflacionPropuesta > 0){
                costoTotalProyecto = Math.round(costoTotalProyecto * ((inflacionPropuesta / 100) + 1));
            }

            ///Aumento - [Ajuste de propuesta]
            if(parseInt(data.aumento) > 0){
                let aumentoPorcentaje = parseInt(data.aumento);
                let aumento = (aumentoPorcentaje * costoTotalProyecto) / 100;
                aumento = Math.round((aumento) * 100) / 100;

                ///
                Aumento.porcentaje = aumentoPorcentaje;
                Aumento.aumento = aumento;
                Aumento.precioSinAumento = costoTotalProyecto;

                //Aplicar aumento
                costoTotalProyecto = Math.round(costoTotalProyecto + aumento);
            }

            /// Descuento - [Ajuste de propuesta]
            if(parseInt(data.descuento) > 0){ ///[Return: $$USD]
                let descuentoPorcentaje = parseInt(data.descuento);
                let descuentoEquivalente =  costoTotalProyecto * (descuentoPorcentaje / 100);

                //Guardar costoTotal antes del [Descuento]
                Descuento.precioSinDescuento = costoTotalProyecto;
                Descuento.porcentaje = descuentoPorcentaje;
                Descuento.descuento = descuentoEquivalente;

                //Aplicar descuento
                costoTotalProyecto = Math.round(costoTotalProyecto - descuentoEquivalente); //USD
            }

            let precioUSDConIVA = Math.round((costoTotalProyecto * 1.16)); //USD //Con IVA
            let precioMXNSinIVA = Math.round(costoTotalProyecto * precioDolar); //MXN SIN IVA
            let precioMXNConIVA = Math.round(precioUSDConIVA * precioDolar); //MXN + IVA
    
            if(_arrayCotizacion[x].panel != null){ ///Validar que se esten cotizando [PANELES]
                /*????*/ precio_watt = Math.round(((costoTotalProyecto / (_arrayCotizacion[x].panel.noModulos * _arrayCotizacion[x].panel.fPotencia))) * 100) / 100;
            }
    
            if(_consums != null){
                //P O W E R
                objPower = await power.obtenerPowerBTI({ 
                    consumos: _consums, 
                    origen: origen, 
                    potenciaReal: _arrayCotizacion[x].panel.potenciaReal, 
                    tarifa: tarifa 
                }) || null;
                objROI = await roi.obtenerROI({objPower, consumoAnualKwh: parseFloat(_consums._promCons.consumoAnualKw), precioMXNSinIVA});
    
                //Se guarda el resultado de -consumos- para mandarlo en la respuesta de la funcion
                _consums =  _consums._promCons.promConsumosBimestrales;///Promedio de consumos
            }
    
            //F I N A N C I A M I E N T O
            let ddata = { costoTotal: precioMXNConIVA };
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
                    subtotalSinMarge: subtotOtrFletManObrTPIE,
                    margen: margen,
                    precio: costoTotalProyecto, //USD sin IVA
                    precioMasIVA: precioUSDConIVA, //USD con IVA
                    precioMXNSinIVA: precioMXNSinIVA, //MXN sin IVA
                    precioMXNConIVA: precioMXNConIVA, //MXN con IVA
                    precio_watt: precio_watt
                },
                inflacionPropuesta: inflacionPropuesta,
                tarifa: tarifa,
                power: objPower,
                roi: objROI, 
                financiamiento: objFinan,
                descuento: Descuento,
                aumento: data.aumento,
                tipoDeCambio: precioDolar,
                promedioConsumosBimestrales: _consums,
                tipoCotizacion: tipoCotizacion,
                expiracion: { 
                    cantidad: infoPropuesta.expiracion.numero,
                    unidadMedida: infoPropuesta.expiracion.unidadMedida
                }
            };       

            //Notificar
            //await Notificacion.notificar(objCotizacionBTI);

            //Limpiar de propiedades inecesarias (Solo para propuestas[Combinaciones])
            if(tipoCotizacion === 'Combinacion'){
                objCotizacionBTI.vendedor = null;
                objCotizacionBTI.cliente = null;
            }

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

    let dictionaryMOCost = {1:2000,2:2950.0,3:3141.7,4:3333.3,5:3525.0,6:3716.7,7:3908.3,8:4100.0,9:4150.0,10:4372.5,11:4600.0,12:4832.5,13:5070.0,14:5385.5,15:5417.3,16:5449.0,17:5468.1,18:5485.3,19:5508.0,20:5736.8,21:5916.4,22:6096.0,23:6434.7,24:6773.3,25:7112.0,26:7450.7,27:7789.3,28:8128.0,29:8333.3,30:8666.7,31:9000.0,32:9333.3,33:9589.3,34:9920.0,35:10168.0,36:10496.0,37:10736.0,38:11061.3,39:11386.7,40:11712.0,};
    let dictionaryOtrosCost = {1:5277.28,2:5290.26,3:7194.91,4:7399.55,5:7569.20,6:8573.25,7:8777.89,8:8982.54,9:11930.52,10:12725.40,11:12965.88,12:13211.36,13:13461.84,14:13790.32,15:13835.05,16:13879.78,17:14471.21,18:14939.43,19:14975.08,20:15010.74,21:17408.40,22:17571.06,23:17866.26,24:18161.46,25:18456.67,26:19311.27,27:19606.47,28:20660.67,29:20844.76,30:21135.52,31:24261.28,32:24552.04,33:24778.35,34:25066.89,35:25845.93,36:26132.25,37:28630.23,38:29222.52,39:29506.61,40:29790.70,41:30043.68,42:30286.66,43:30529.64,44:30772.62,45:31015.60};
    let mo_unitario = 12; //USD
    let otros_porcentaje = 0.035; //USD

    try{
        let precioDolar = JSON.parse(await dolar.obtenerPrecioDolar());
        precioDolar = precioDolar.precioDolar;
        //let precioDolar = 17;
    
        if(dictionaryMOCost.hasOwnProperty(cantidadPaneles) == true){ //Se busca coincidencia en los diccionarios (Sobre la cantidad de paneles a instalar)
            costoMO = Math.round((dictionaryMOCost[cantidadPaneles] / precioDolar) * 100) / 100;
            costoOtros = Math.round((dictionaryOtrosCost[cantidadPaneles] / precioDolar) * 100) / 100;  
        }
        else{ //Si no se encuentra coincidencia en el bloque anterior, se calcula de manera manual
            costoMO = Math.round(((cantidadPaneles * mo_unitario)) * 100) / 100;
            costoOtros = Math.round((((totalPIEV + costoMO) * otros_porcentaje)) * 100) / 100;
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
    let costoTotalAgregados = 0;

    try{
        let origen = data.origen;
        let destino = data.destino;
        let idUsuario = data.idUsuario;
        let idCliente = data.idCliente;
        let descuento = (parseFloat(data.descuento) / 100) || 0;
        let propuesta = data.arrayBTI[0]; //Obj
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

        //Datos vendedor
        let uVendedor = await vendedor.consultarId({ idPersona: idUsuario });
        uVendedor = uVendedor.message;
        uVendedor = uVendedor[0];

        //Estructuras
        let _estructuras = await estructura.leer();
        _estructuras = _estructuras.message;

        //AGREGADOS
        if(_agregados != null){
            costoTotalAgregados = getCostoTotalAgregados(_agregados); ///CostoTotalAgregados - MXN
            costoTotalAgregados = costoTotalAgregados / precioDolar; ///CostoTotalAgregados - USD (para poderlo sumar a los totales)
        } 

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
        if(propuesta.hasOwnProperty('estructura')){ 
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
        let costoTotalPanInvEstr = Math.round((panel.costoTotal + parseFloat(inversor.costoTotal) + costoTotalEstructuras) * 100) /100;
        let costoTotalFletes = Math.floor(costoTotalPanInvEstr * confFile.costos.porcentaje_fletes);
        let _costoManoDeObra = getPrecioDeManoDeObraMT(panel.noModulos, costoTotalPanInvEstr, precioDolar);
        let subtotOtrFletManObrTPIE = Math.round((_costoManoDeObra[1] + costoTotalFletes + _costoManoDeObra[0] + costoTotalPanInvEstr + costoTotalAgregados) * 100) / 100; //TPIE = Total Paneles Inversores Estructuras
        let margen = Math.round(((subtotOtrFletManObrTPIE / (1 - confFile.costos.porcentaje_margen)) - subtotOtrFletManObrTPIE) * 100)/100;
        let totalDeTodo = Math.round((subtotOtrFletManObrTPIE + margen + totalViaticos) * 100)/100;
        let precio = Math.round(totalDeTodo * (1 - descuento)); //USD
        let precioMasIVA = Math.round(precio * confFile.costos.precio_mas_iva); //USD + IVA
        let precioMXN = Math.round(precio * precioDolar); //MXN
        let precioMasIVAMXN = Math.round(precioMasIVA * precioDolar); //MXN + IVA

        let precio_watt = Math.round((totalDeTodo / (panel.noModulos * panel.potenciaReal)) * 100)/100;

        /* POWER - ROI - FINANCIAMIENTO */
        let objPower = await power.obtenerPowerMT(data); //Return an Object
        let objROI = await roi.obtenerROI({ objPower, consumoAnualKwh: parseFloat(data.consumos.consumo._promCons.consumoAnual), precioMXN });

        let objFinanciamiento = await financiamiento.financiamiento({ costoTotal: precioMasIVAMXN });

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
                manoDeObra: _costoManoDeObra[0] || null,
                otrosTotal: _costoManoDeObra[1] || null,
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
        subtotal = parseFloat(agregado.cantidadAgregado * agregado.precioUnitarioMXN);    
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

/*#region API-GoogleMaps 
26/07/2022 *Revisar API KEY
*/
async function obtenerDistanciaEnKm(origen, destino){
    let distanciaEnKm = 0;

    try{
        origen = origen.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        origen = origen.replace(/\s/g,"+");
        destino = destino.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        destino = destino.replace(/\s/g,"+");

        const route = "https://maps.googleapis.com/maps/api/distancematrix/json?key="+process.env.APIKEY_GOOGLEMAPS+"&origins="+origen+"&destinations="+destino;
        let response = await Fetch(route);
        response = await response.json();

        //Formatear la response, para obtener los km
        distanciaEnKm = Number(response.rows[0].elements[0].distance.value);
        distanciaEnKm = Math.round(distanciaEnKm / 1000); //Se pasa a km

        return distanciaEnKm;
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
        // mysqlConnection.query('CALL SP_Opciones_Viatics(?, ?, ?, ?, ?)', [3, null, null, null, null], (error, rows) => {
        //     if (error) {
        //         const response = {
        //             status: false,
        //             message: error
        //         }
        //         resolve (response);
        //     } else {
        //         const response = {
        //             status: true,
        //             message: rows[0]
        //         }
        //         resolve(response);
        //     }
        // });

        mysqlConnection.query('SELECT * FROM opciones_viatics', (error, rows) => {
            if (error) {
                const response = {
                    status: false,
                    message: error
                }
                resolve (response);
            } else {
                const response = {
                    status: true,
                    message: rows
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
