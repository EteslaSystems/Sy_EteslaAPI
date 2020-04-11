/*
- @description: 		Archivo correspondiente a las funciones del calculo de viaticos
- @author: 				LH420 & Jesús Daniel Carrera Falcón
- @date: 				09/04/2020
*/
const request = require('request');
const process = require('process'); 
const fs = require('fs');
const mysqlConnection = require('../../config/database');

var distanciaEnKm = 0;
var comida = 180; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario
var hospedaje = 150; //Preguntar a gerencia, si este dato va a ser ingresado por el usuario

async function main_calcularViaticos(_arrayCotizacion, _oficina, _direccionCliente){
    distanciaEnKm = await obtenerDistanciaEnKm(_oficina, _direccionCliente);
    //distanciaEnKm = distanciaEnKm.message;
    distanciaEnKm = 93; //Descomentar la linea de arriba y eliminar esta, para que la funcionalidad sea dinamica
    calcularNoDeCuadrillas(_arrayCotizacion, distanciaEnKm);
}

function calcularNoDeCuadrillas(_arrayCotizacion, _distanciaEnKm){
    var getFileRootOfConfiguration = process.cwd()+'/config/admin_confgs/opcViaticos.json';
    var _cotizacion = [];

    fs.readFile(getFileRootOfConfiguration, 'utf-8', (err, _$configCuadrilla) => {
        if(!err){
            _$configCuadrilla = JSON.parse(_$configCuadrilla);

            for(var x = 0; x < _arrayCotizacion.length; x++)
            {
                /*#region iteracionArray*/
                __no = _arrayCotizacion[x].no;
                __nombrePanel = _arrayCotizacion[x].panel.nombrePanel;
                __marcaPanel = _arrayCotizacion[x].panel.marcaPanel;
                __potenciaPanel = _arrayCotizacion[x].panel.potenciaPanel;
                __cantidadPaneles = _arrayCotizacion[x].panel.cantidadPaneles; //numeroDeModulos
                __potenciaReal =  _arrayCotizacion[x].panel.potenciaReal;

                __nombreInversor =  _arrayCotizacion[x].inversor.nombreInversor;
                __marcaInversor = _arrayCotizacion[x].inversor.marcaInversor;
                __potenciaInversor = _arrayCotizacion[x].inversor.potenciaInversor;
                __precioInversor = _arrayCotizacion[x].inversor.precioInversor;
                __potenciaMaximaInversor = _arrayCotizacion[x].inversor.potenciaMaximaInversor;
                __numeroDeInversores = _arrayCotizacion[x].inversor.numeroDeInversores;
                __potenciaPicoInversor = _arrayCotizacion[x].inversor.potenciaPicoInversor;
                __porcentajeSobreDimens = _arrayCotizacion[x].inversor.porcentajeSobreDimens;
                /*#endregion*/
                numeroPanelesAInstalar = _arrayCotizacion[x].panel.cantidadPaneles;
                _numeroCuadrillas = getNumberOfCrews(numeroPanelesAInstalar);
                numeroDePersonasRequeridas = _numeroCuadrillas * _$configCuadrilla.cuadrilla.numeroDePersonas;
                numeroDias = getDays(numeroPanelesAInstalar);
                numeroDiasReales = getRealDays(numeroPanelesAInstalar);
                pagoPasaje = getBusPayment(_distanciaEnKm);
                pagoPasajeTotal = pagoPasaje * numeroDePersonasRequeridas;
                pagoPasajeTotal = Math.ceil(pagoPasajeTotal);
                pagoComidaTotal = comida * numeroDePersonasRequeridas * numeroDiasReales;
                pagoHospedajeTotal = hospedaje * numeroDePersonasRequeridas * numeroDiasReales;

                cotizacion = {
                    no: _arrayCotizacion[x].no,
                    paneles: {
                        nombrePanel: __nombrePanel,
                        marcaPanel: __marcaPanel,
                        potenciaPanel: __potenciaPanel,
                        cantidadPaneles: __cantidadPaneles, //numeroDeModulos
                        potenciaReal: __potenciaReal
                    },
                    inversores: {
                        nombreInversor:  __nombreInversor,
                        marcaInversor: __marcaInversor,
                        potenciaInversor: __potenciaInversor,
                        precioInversor: __precioInversor,
                        potenciaMaximaInversor:  __potenciaMaximaInversor,
                        numeroDeInversores: __numeroDeInversores,
                        potenciaPicoInversor: __potenciaPicoInversor,
                        porcentajeSobreDimens: __porcentajeSobreDimens
                    },
                    viaticos: {
                        noCuadrillas: _numeroCuadrillas,
                        noPersonasRequeridas: numeroDePersonasRequeridas,
                        noDias: numeroDias,
                        noDiasReales: numeroDiasReales,
                        pagoPasaje: pagoPasaje,
                        pagoTotalPasaje: pagoPasajeTotal,
                        pagoTotalComida: pagoComidaTotal,
                        pagoTotalHospedaje: pagoHospedajeTotal
                    }
                }

                _cotizacion.push(cotizacion);
            }
            console.log('calcularNoDeCuadrillas(_arrayCotizacion, _distanciaEnKm) says: ');
            console.log(_cotizacion);
        }
        else{
            console.log(err);
        }
    });
}

function getNumberOfCrews(_numeroPanelesAInstalar){
    numberOfCrews = _numeroPanelesAInstalar >= 0 || _numeroPanelesAInstalar <= 99 ? 1 : -1;
    numberOfCrews = _numeroPanelesAInstalar >= 100 || _numeroPanelesAInstalar <= 299 ? 2 : -1;
    numberOfCrews = _numeroPanelesAInstalar >= 300 || _numeroPanelesAInstalar <= 499 ? 3 : -1;
    numberOfCrews = _numeroPanelesAInstalar >= 500 || _numeroPanelesAInstalar <= 799 ? 5 : -1;
    numberOfCrews = _numeroPanelesAInstalar >=800 || _numeroPanelesAInstalar <= 1199 ? 7 : -1;
    numberOfCrews = _numeroPanelesAInstalar >= 1200 /*|| _numeroPanelesAInstalar >= 2000*/ ? 11 : -1;
    return numberOfCrews;
}

function getDays(_numeroPanelesAInstalar){
    numberOfDays = _numeroPanelesAInstalar >= 0 || _numeroPanelesAInstalar <= 99 ? 20 : -1;
    numberOfDays = _numeroPanelesAInstalar >= 100 || _numeroPanelesAInstalar <= 299 ? 30 : -1;
    numberOfDays = _numeroPanelesAInstalar >= 300 || _numeroPanelesAInstalar <= 499 ? 33 : -1;
    numberOfDays = _numeroPanelesAInstalar >= 500 || _numeroPanelesAInstalar <= 799 ? 32 : -1;
    numberOfDays = _numeroPanelesAInstalar >=800 || _numeroPanelesAInstalar <= 1199 ? 30 : -1;
    numberOfDays = _numeroPanelesAInstalar >= 1200 /*|| _numeroPanelesAInstalar >= 2000*/ ? 36 : -1;
    return numberOfDays;
}

function getRealDays(_numeroPanelesAInstalar){
    numberOfRealDays = _numeroPanelesAInstalar >= 0 || _numeroPanelesAInstalar <= 99 ? 244 : -1;
    numberOfRealDays = _numeroPanelesAInstalar >= 100 || _numeroPanelesAInstalar <= 299 ? 122 : -1;
    numberOfRealDays = _numeroPanelesAInstalar >= 300 || _numeroPanelesAInstalar <= 499 ? 82 : -1;
    numberOfRealDays = _numeroPanelesAInstalar >= 500 || _numeroPanelesAInstalar <= 799 ? 49 : -1;
    numberOfRealDays = _numeroPanelesAInstalar >=800 || _numeroPanelesAInstalar <= 1199 ? 31 : -1;
    numberOfRealDays = _numeroPanelesAInstalar >= 1200 /*|| _numeroPanelesAInstalar >= 2000*/ ? 23 : -1;
    return numberOfRealDays;
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

module.exports.main = function(arrayCotizacion, oficina, direccionCliente){
    main_calcularViaticos(arrayCotizacion, oficina, direccionCliente);
}


/* #region Opciones Viaticos Propuesta */
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
