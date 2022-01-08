const Viatico = require('../Entities/Viaticos');
const DolarController = require('../Controller/dolar.controller');
const Log = require('../../config/logConfig');
const Config = require('../Controller/configFileController');

const ClienteController = require('../Controller/cliente.controller');
const UsuarioController = require('../Controller/usuario.controller');
const AgregadosController = require('../Controller/agregado.controller');
const EstructuraController = require('../Controller/estructura.controller');

/*#region Cotizacion*/
//@main() - [ 'bajaTension', 'mediaTension', 'individual' ] 
module.exports.calcularViaticos = async function(data){ 
    let Descuento = { porcentaje: 0, descuento: 0, precioSinDescuento: 0 };
    let Aumento = { porcentaje: 0, aumento: 0, precioSinAumento: 0 };
    let Agregados = {};
    let Estructuras = {};
    let cantidadEstructuras = 0;
    let costoTotalEstructuras = 0, costoTotalPaneles = 0, costoTotalInversores = 0;
    let precio_watt = 0;
    let Cliente = null, Vendedor = null;

    try{
        let idUsuario = data.idUsuario;
        let idCliente = data.idCliente;
        let origen = data.origen;
        let destino = data.destino; 
        let tipoCotizacion = data.tipoCotizacion;
        let _consumos = data.consumos || null;
        let _agregados = data._agregados || null;
        let tarifa = data.tarifa || null;

        let precioDolar = JSON.parse(await DolarController.obtenerPrecioDolar());

        //Se obtiene la data del -Cliente- && -Vendedor(Usuario)-
        if(tipoCotizacion != "CombinacionCotizacion"){
            /* [ C L I E N T E ] */
            Cliente = await ClienteController.consultaId({ idPersona: idCliente });
            Cliente = Cliente.message; 
            Cliente = Cliente[0];
            /* [ V E N D E D O R ] */
            Vendedor = await UsuarioController.consultarId({ idPersona: idUsuario });
            Vendedor = Vendedor.message;
            Vendedor = Vendedor[0];
        }

        /* [ Agregados ] */
        if(_agregados != null){
            //Se obtiene el costo total de los agregados
            Agregados = await AgregadosController.obtenerCostoTotalAgregados(_agregados, precioDolar);
        }

        if(data.estructura){
            //Coleccion de estructuras
            Estructuras = await EstructuraController.consultar();
            Estructuras = Estructuras.filter(Estructura => { Estructura.vMarca === data.estructura.vMarca });

            if(tipoCotizacion === "individual"){
                costoTotalEstructuras = data.estructura.cantidad * Estructuras.fPrecio;
            }

            costoTotalEstructuras = data.paneles.cantidad * Estructuras.fPrecio;
        }
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.calcularViaticos(): ' +error });
        throw 'Error Viaticos.calcularViaticos(): '+error;
    }
}

/*#region @static*/
//@static
async function obtenerDiasObra(numeroPanelesInstalar, numeroCuadrillas){
    let dias = 0;

    try{
        if(numeroPanelesInstalar >= 0 && numeroPanelesInstalar <= 99){
            dias = (numeroPanelesInstalar / 40) / numeroCuadrillas * 8;
        }
        else if(numeroPanelesInstalar >= 100 && numeroPanelesInstalar <= 299){
            dias = (numeroPanelesInstalar / 40) / numeroCuadrillas * 8;
        }
        else if(numeroPanelesInstalar >= 300 && numeroPanelesInstalar <= 499){
            dias = (numeroPanelesInstalar / 40) / numeroCuadrillas * 8;
        }
        else if(numeroPanelesInstalar >= 500 && numeroPanelesInstalar <= 799){
            dias = (numeroPanelesInstalar / 40) / numeroCuadrillas * 8;
        }
        else if(numeroPanelesInstalar >=800 && numeroPanelesInstalar <= 1199){
            dias = (numeroPanelesInstalar / 40) / numeroCuadrillas * 8;
        }
        else if(numeroPanelesInstalar >= 1200){
            dias = (numeroPanelesInstalar / 40) / numeroCuadrillas * 8;
        }
        else{
            dias = -1;
        }

        return dias = Math.round(dias * 100)/100;
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerDiasObra(): ' +error });
        throw 'Error Viaticos.obtenerDiasObra(): '+error;
    }
}

//@static
async function obtenerDiasObraReales(numeroPanelesInstalar, numeroDias){
    let diasReales = 0;

    try{
        if(numeroPanelesInstalar >= 0 && numeroPanelesInstalar <= 99){
            // return 244;
            diasReales = Math.ceil(numeroPanelesInstalar / 100 * numeroDias);
        }
        else if(numeroPanelesInstalar >= 100 && numeroPanelesInstalar <= 299){
            // return 122;
            diasReales = Math.ceil(numeroPanelesInstalar / 300 * numeroDias);
        }
        else if(numeroPanelesInstalar >= 300 && numeroPanelesInstalar <= 499){
            // return 82;
            diasReales = Math.ceil(numeroPanelesInstalar / 500 * numeroDias);
        }
        else if(numeroPanelesInstalar >= 500 && numeroPanelesInstalar <= 799){
            // return 49;
            diasReales = Math.ceil(numeroPanelesInstalar / 800 * numeroDias);
        }
        else if(numeroPanelesInstalar >=800 && numeroPanelesInstalar <= 1199){
            // return 31;
            diasReales = Math.ceil(numeroPanelesInstalar / 1200 * numeroDias);
        }
        else if(numeroPanelesInstalar >= 1200){
            // return 23;
            diasReales = Math.ceil(numeroPanelesInstalar / 2000 * numeroDias);
        }

        return diasReales;
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerDiasObraReales(): ' +error });
        throw 'Error Viaticos.obtenerDiasObraReales(): '+error;
    }
    
}

//@static
async function obtenerPagoBus(distanciaKm){
    try{
        if(distanciaKm < 600){
            distanciaKm = parseFloat(distanciaKm * 1.2);
        }
        else{
            distanciaKm = parseFloat(distanciaKm * 2.1); 
        }
        
        return distanciaKm = distanciaKm * 2;
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerPagoBus(): ' +error });
        throw 'Error Viaticos.obtenerPagoBus(): '+error;
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