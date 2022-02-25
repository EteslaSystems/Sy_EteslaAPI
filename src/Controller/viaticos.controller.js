const Viatico = require('../Entities/Viaticos');
const DolarController = require('../Controller/dolar.controller');
const Log = require('../../config/logConfig');

const ClienteController = require('../Controller/cliente.controller');
const UsuarioController = require('../Controller/usuario.controller');
const AgregadosController = require('../Controller/agregado.controller');
const EstructuraController = require('../Controller/estructura.controller');
const ConfigController = require('../Controller/configFile.controller');

/*#region Cotizacion*/
//@main() - [ 'bajaTension', 'mediaTension', 'individual' ] 
module.exports.calcularViaticos = async function(data){ 
    let Agregados = null;
    let Estructuras = null;

    try{
        let { origen, destino, tipoCotizacion } = data;

        let precioDolar = JSON.parse(await DolarController.obtenerPrecioDolar());
        let distanciaEnKm = await obtenerDistanciaEnKm(origen, destino);
        distanciaEnKm = distanciaEnKm.message;

        /* [ Agregados ] */
        if(_agregados != null){
            //Se obtiene el costo total de los agregados
            Agregados = await AgregadosController.obtenerCostoTotalAgregados(_agregados, precioDolar);
        }

        if(data.estructura){
            if(tipoCotizacion === 'individual'){
                //Cotizacion -individual- la cantidad de Estructuras varia y no tiene relacion con los modulos a instalar
                Estructuras = await EstructuraController.obtenerEstructurasCotizacion({ marca: data.estructura.vMarca, cantidad: data.estructura.cantidad });
            }

            //Cotizacion -baja- && -media- la cantidad de Estructuras va en relacion a los paneles a instalar
            Estructuras = await EstructuraController.obtenerEstructurasCotizacion({ marca: data.estructura.vMarca, cantidad: data.panel.noModulos });
        }

        let Viaticos = await obtenerViaticos({
            Equipos: { panel: data.panel, inversor: data.inversor, estructura: data.estructura },
            distanciaEnKm: distanciaEnKm,
            precioDolar: precioDolar,
            ComplementosConfig: data
        });

        return { Viaticos, Agregados };
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.calcularViaticos(): ' +error });
        throw 'Error Viaticos.calcularViaticos(): '+error;
    }
}

/*#region @static*/
/*#region*/
//@main_static
async function obtenerViaticos(data){
    try{
        let { Equipos, distanciaEnKm, precioDolar, ComplementosConfig  } = data;

        ComplementosConfig = ComplementosConfig.complementos ? ComplementosConfig.complementos : null;

        let ConfigViaticos = await ConfigController.getArrayOfConfigFile();
        let Viaticos = await Viatico.consultaBD();

        //[ Dias(naturales) de instalacion ]
        let noDias = obtenerDiasNaturales({ 
            noPanelesInstalar: Equipos.panel.noModulos,
            noPersonasRequeridas: Viaticos.PERSONAS_REQUERIDAS,
            personasPorPanel: Viaticos.PERSONAS_PANEL
        });
        
        //[ Fletes ]
        let totalFletes = obtenerFletes({ 
            Config: ConfigViaticos,
            costoTotalPanel: data.panel.costoTotal,
            costoTotalInversor: data.inversor.costoTotal,
            costoTotalEstructura: data.estructura.costoTotal
        });
        
        //[{ hospedaje, pasaje, comida, gasolina }]
        let ViaticosForaneos = obtenerViaticosForaneos({ 
            noDias: noDias, 
            Config: ConfigViaticos, 
            Viaticos: Viaticos, 
            distanciaEnKm: distanciaEnKm
        });
        
        //[ Mano de obra && Otros ]
        let OtrosManoO = obtenerMOyOtros({ 
            Config: ConfigViaticos,
            cantidadPaneles: Equipos.panel.noModulos,
            subtotalPIEV: (Equipos.panel.costoTotal + Equipos.inversor.costoTotal + Equipos.estructura.costoTotal + ViaticosForaneos.costoTotal),
            precioDolar: precioDolar
        });

        return {
            noDias: noDias,
            totalFletes: totalFletes,
            manoObra: OtrosManoO.costoMO,
            otros: OtrosManoO.costoOtros,
            ViaticosForaneos: ViaticosForaneos
        };
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'ViaticosController.obtenerViaticos(): ' +error });
        throw 'Error ViaticosController.obtenerViaticos(): '+error;
    }
}

//@static
function obtenerViaticosForaneos(data){
    let hospedaje = 0, comida = 0, pasaje = 0, gasolina = 0;
    
    try{
        let { noDias, Config, Viaticos, distanciaEnKm  } = data;

        //
        Config = Config.cotizacion_config;

        //Variables de configuracion (validaciones)
        let km_cobro_gasolina = Config.viaticos.km_cobro_gasol;

        //Conceptos [Viaticos]
        let hospedaje_dia = Viaticos.HOSPEDAJE;
        let noPersonasRequeridas = Viaticos.PERSONAS_REQUERIDAS;
        let comida_dia = Viaticos.COMIDA;
        let km_hospedaje = Viaticos.KM_HOSPEDAJE;
        let km_pasaje = Viaticos.KM_PASAJE;
        let costo_km_gasolina = Viaticos.COSTO_KM_GASOLINA;

        //[ Gasolina ]
        if(distanciaEnKm >= km_cobro_gasolina){
            gasolina = distanciaEnKm * costo_km_gasolina;
        }

        //[ Cotizacion_Foranea = { hospedaje, comida, pasaje } ]
        if(distanciaEnKm >= km_hospedaje || distanciaEnKm >= km_pasaje && noDias > 7){
            hospedaje = noDias * hospedaje_dia * noPersonasRequeridas;
            comida = noDias * comida_dia * noPersonasRequeridas;
            pasaje = gasolina * noPersonasRequeridas * 2;
        }
        else if(distanciaEnKm >= km_pasaje && noDias < 7){
            pasaje = distanciaEnKm * costo_km_gasolina * noPersonasRequeridas * 2 * noDias;
        }

        costoTotal = distanciaEnKm < km_hospedaje ? gasolina : Math.round( hospedaje + comida + pasaje );
        costoTotal = Math.round(costoTotal * (1 + Viaticos.VIATICOS_OTROS));

        return { costoTotal, viaticos_foraneos: { gasolina, hospedaje, comida, pasaje } }
    }
    catch(error){
        throw error;
    }
}

//@static
function obtenerDiasNaturales(data){
    try{
        let { noPanelesInstalar, noPersonasRequeridas, personasPorPanel } = data;
        return Math.ceil((noPanelesInstalar / noPersonasRequeridas) / personasPorPanel);
    }
    catch(error){
        throw error;
    }
}

//@static
function obtenerFletes(data){
    try{
        let { Config, costoTotalPanel, costoTotalInversor, costoTotalEstructura } = data;

        let porcentaje_flete = parseFloat(Config.cotizacion_config.porcentajes.porcentaje_fletes);
        let subtotalPIE = costoTotalPanel + costoTotalInversor + costoTotalEstructura; //PIE => [ Panel, Inversor, Estructura ]

        return Math.floor(subtotalPIE * porcentaje_flete);
    }
    catch(error){
        throw error;
    }
}
/*#endregion*/

//@static
function obtenerMOyOtros(data){ /* Nota: Debe de retornar los costos en [USD] */
    try{
        let { Config, cantidadPaneles, subtotalPIEV, precioDolar } = data; /* PIEV => Panel, Inversor, Estructura, Viaticos */
    
        //
        let costoMO = 0, costoOtros = 0;
        let mo_unitario = 12; //USD
        let otros_porcentaje = 0.035;

        //Costos en MXN de -Mano de Obra- & -Otros-
        let ManoObraDictionary = Config.cotizacion_config.mano_obra;
        let OtrosDictionary = Config.cotizacion_config.otros;

        if(ManoObraDictionary.hasOwnProperty(cantidadPaneles) == true){ //Se busca coincidencia en los diccionarios (Sobre la cantidad de paneles a instalar)
            costoMO = Math.round((ManoObraDictionary[cantidadPaneles] / precioDolar) * 100) / 100;
            costoOtros = Math.round((OtrosDictionary[cantidadPaneles] / precioDolar) * 100) / 100;  
        }
        else{ //Si no se encuentra coincidencia en el bloque anterior, se calcula de manera manual
            costoMO = Math.round(((cantidadPaneles * mo_unitario)) * 100) / 100;
            costoOtros = Math.round((((subtotalPIEV + costoMO) * otros_porcentaje)) * 100) / 100;
        }

        return { costoMO, costoOtros }
    }
    catch(error){
        throw error;
    }
}

//@static
async function obtenerDistanciaEnKm(origen, destino){
    const apiKey = 'AIzaSyD0cJDO0IwwolWkvCCnzVFTmbsvQjsdOyo';
    let distanciaEnKm = 0;

    try{
        origen = origen.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        origen = origen.replace(/\s/g,"+");
        destino = destino.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        destino = destino.replace(/\s/g,"+");
    
        return new Promise((resolve, reject) => {
            request.get("https://maps.googleapis.com/maps/api/distancematrix/json?key="+apiKey+"&origins="+origen+"&destinations="+destino, (error, response, body) => {
                if(!error){
                    body = JSON.parse(body);
                    body = body.rows[0].elements;
    
                    for(let i=0; i<body.length; i++){
                        distanciaEnKm = body[i].distance.value;
                    }
    
                    distanciaEnKm = Math.ceil(distanciaEnKm / 1000);

                    resolve({ status: true, message: distanciaEnKm });
                }
                else{
                    reject({
                        status: false,
                        message: 'Hubo un error al intentar calcular la distancia, revisa tu destino (direccion_cliente): '+error
                    });
                }
            });   
        });
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerDistanciaEnKm(): ' +error });
        throw 'Error Viaticos.obtenerDistanciaEnKm(): '+error;
    }
}
/*#endregion */
/*#endregion */

/*#region @exports - [CRUD] */
module.exports.eliminar = async function(datas){
    const result = await Viatico.eliminarBD(datas);
    return result;
}

module.exports.editar = async function(datas){
    const result = await Viatico.editarBD(datas);
    return result;
}

module.exports.consulta = async function(){
    const result = await Viatico.consultaBD;
    return result;
}
/*#endregion */