const Viatico = require('../Entities/Viaticos');
const DolarController = require('../Controller/dolar.controller');
const Log = require('../../config/logConfig');

class ViaticosController{
    //Instancia(s)
	viatico = new Viatico();
    dolarController = DolarController();

    /*#region Cotizacion*/
    async calcularViaticos(){ /* main() */
        let Descuento = { porcentaje: 0, descuento: 0, precioSinDescuento: 0 };
        let Aumento = { porcentaje: 0, aumento: 0, precioSinAumento: 0 };
        let cantidadEstructuras = 0;
        let costoTotalEstructuras = 0, costoTotalPaneles = 0, costoTotalInversores = 0, costoTotalAgregados = 0;
        let precio_watt = 0;
        let uCliente = null, uVendedor = null;

        try{
            let idUsuario = data.idUsuario;
            let idCliente = data.idCliente;
            let origen = data.origen;
            let destino = data.destino; 
            let _consums = data.consumos || null;
            let _agregados = data._agregados || null;
            let tipoCotizacion = data.tipoCotizacion || null;
            let tarifa = data.tarifa || null;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.calcularViaticos(): ' +error });
            throw 'Error Viaticos.calcularViaticos(): '+error;
        }
    }

    async obtenerCostoTotalAgregados(_agregados){
        let total = 0, subtotal = 0;

        try{
            _agregados.filter(agregado => {
                subtotal = parseFloat(agregado.cantidadAgregado * agregado.precioAgregado);    
                total += subtotal;
            });

            return total;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerCostoTotalAgregados(): ' +error });
            throw 'Error Viaticos.obtenerCostoTotalAgregados(): '+error;
        }
    }

    async obtenerDiasObra(numeroPanelesInstalar, numeroCuadrillas){
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

    async obtenerDiasObraReales(numeroPanelesInstalar, numeroDias){
        try{
            if(numeroPanelesInstalar >= 0 && numeroPanelesInstalar <= 99){
                // return 244;
                return diasReales = Math.ceil(numeroPanelesInstalar / 100 * numeroDias);
            }
            else if(numeroPanelesInstalar >= 100 && numeroPanelesInstalar <= 299){
                // return 122;
                return diasReales = Math.ceil(numeroPanelesInstalar / 300 * numeroDias);
            }
            else if(numeroPanelesInstalar >= 300 && numeroPanelesInstalar <= 499){
                // return 82;
                return diasReales = Math.ceil(numeroPanelesInstalar / 500 * numeroDias);
            }
            else if(numeroPanelesInstalar >= 500 && numeroPanelesInstalar <= 799){
                // return 49;
                return diasReales = Math.ceil(numeroPanelesInstalar / 800 * numeroDias);
            }
            else if(numeroPanelesInstalar >=800 && numeroPanelesInstalar <= 1199){
                // return 31;
                return diasReales = Math.ceil(numeroPanelesInstalar / 1200 * numeroDias);
            }
            else if(numeroPanelesInstalar >= 1200){
                // return 23;
                return diasReales = Math.ceil(numeroPanelesInstalar / 2000 * numeroDias);
            }
            else{
                return -1;
            }
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerDiasObraReales(): ' +error });
            throw 'Error Viaticos.obtenerDiasObraReales(): '+error;
        }
        
    }

    async obtenerPagoBus(distanciaKm){
        try{
            if(distanciaKm < 600){
                distanciaKm = parseFloat(distanciaKm * 1.2);
            }
            else{
                distanciaKm = parseFloat(distanciaKm * 2.1); 
            }
            
            return distanciaKm = parseFloat(distanciaKm * 2);
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerPagoBus(): ' +error });
            throw 'Error Viaticos.obtenerPagoBus(): '+error;
        }
    }

    async obtenerDistanciaEnKm(origen, destino){
        const apiKey = 'AIzaSyD0cJDO0IwwolWkvCCnzVFTmbsvQjsdOyo';
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
            await Log.generateLog({ tipo: 'Error', contenido: 'Viaticos.obtenerDistanciaEnKm(): ' +error });
            throw 'Error Viaticos.obtenerDistanciaEnKm(): '+error;
        }
    }
    /*#endregion */

    /*#region CRUD */
    async insertar(datas){
		const result = await viatico.insertarBD(datas);
		return result;
	}

	async eliminar(datas){
		const result = await viatico.eliminarBD(datas);
		return result;
	}

	async editar(datas){
		const result = await viatico.editarBD(datas);
		return result;
	}

	async consulta(){
		const result = await viatico.consultaBD;
		return result;
	}
    /*#endregion */
};

module.exports = ViaticosController;