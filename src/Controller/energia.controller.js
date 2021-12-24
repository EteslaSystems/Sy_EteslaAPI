const TarifaController = require('../Controller/tarifa.controller');
const IrradiacionController = require('../Controller/irradiacion.controller');
const Log = require('../../config/logConfig');

class EnergiaController{
    //Instancia(s)
    tarifaController = new TarifaController();
    irradiacionController = new IrradiacionController();

    //@main()
    async getPotenciaNecesaria(data){
        try{
            let PromedioConsumos = getPromedioConsumos(data.tipoCotizacion, data._consumos);
            let potenciaNecesaria = getPotenciaNecesaria({ 
                origen: data.origen, 
                porcentajePropuesta: data.porcentajePropuesta,
                tarifa: data.tarifa,
                PromedioConsumos: PromedioConsumos
            });

            let Result = {
                Consumo: PromedioConsumos,
                potenciaNecesaria: potenciaNecesaria
            };
            
            return Result;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'EnergiaController.getPotenciaNecesaria(): ' +error });
			throw 'EnergiaController.getPotenciaNecesaria(): '+error; 
        }
    }

    //@main()
    async getProduccion(data){
        try{

        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'EnergiaController.getProduccion(): ' +error });
			throw 'EnergiaController.getProduccion(): '+error;
        }
    }

    //@static
    async getPromedioConsumos(_consumos){
        try{
            //Retorna todo en kwh
            let promConsumosBimestrales = (consumos) => {
                promConsumosBim = 0;
                for(let i=0; i<consumos.length; i++)
                {
                    promConsumosBim += parseFloat(consumos[i]);
                }
                promConsumosBim = Math.round((promConsumosBim / consumos.length) * 100)/100;
                return promConsumosBim;
            };
            let consumoMensual = (consumos) => {
                /* Retorna un promedio de consumo mensual y un array con los consumos mensuales */
                _consumMens = [];
                promConsums = 0;

                for(let i=0; i<consumos.length; i++)
                {
                    consumMens = parseFloat(consumos[i] / 2); //Bimestre / 2  
                    
                    for(let x=0; x<2; x++)
                    {
                        _consumMens.push(consumMens);
                    }
                }
                
                _consumMens.forEach(function(consumoMensual){
                    promConsums += consumoMensual;
                });
                
                promConsums = Math.round((promConsums/_consumMens.length)*100)/100;

                objResult = {
                    promedioConsumoMensual: promConsums,
                    _consumosMensuales: _consumMens
                };

                return objResult;
            };
            let consumoAnual = (consMesual) => {
                _consumosMensual = consMesual._consumosMensuales;
                consAnual = 0;

                for(let i=0; i<_consumosMensual.length; i++)
                {
                    consAnual += parseFloat(_consumosMensual[i]);
                }
                
                return consAnual;  
            };
            let consumoDiario = (cnsAnual) => {
                consDiario = Math.round((cnsAnual / 365) * 100) / 100;
                return consDiario;
            };

            promConsumosBimestrales = promConsumosBimestrales(_consumos);
            consumoMensual = consumoMensual(_consumos);
            consumoAnual = consumoAnual(consumoMensual);
            consumoDiario = consumoDiario(consumoAnual);

            let objResp = {
                promedios: {
                    mensual: promConsumosBimestrales / 2,
                    bimestral: promConsumosBimestrales
                },
                consumoMensual: consumoMensual,
                consumoAnual: consumoAnual,
                consumoDiario: consumoDiario,
                _consumosBimestrales: _consumos
            };

            return objResp;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'EnergiaController.getPromedioConsumos(): ' +error });
			throw 'EnergiaController.getPromedioConsumos(): '+error; 
        }
    }

    //@static
    async getPotenciaNecesaria(data){
        let potenciaNecesaria = 0;

        try{
            // let _consumos = data.consumos;
            let irradiacion = irradiacionController.obtenerIrradiacion(data.origen);
            let porcentajePropuesta = parseFloat(data.porcentajePropuesta) / 100 || 0;
            let _tarifas = tarifaController.consulta();
            let Tarifa = _tarifas[data.tarifa];

            if(data.tipoCotizacion === "bajatension"){ /* BajaTension */
                let cuantoMenos = Math.abs(Tarifa.limite - (data.PromedioConsumos.promedios.bimestral * 0.10));

                if(cuantoMenos < Tarifa.siObjetivoDAC){
                    Tarifa.siObjetivoDAC = cuantoMenos;
                }
                else if(Tarifa.siObjetivoDAC < 0 || Tarifa.siObjetivoDAC > (data.PromedioConsumos.promedios.bimestral)){
                    Tarifa.siObjetivoDAC = 0;
                }

                let subsidioDiario = Math.round(((Tarifa.siObjetivoDAC * 6) / 365) * 100) / 100;
                let consumoDiario = data.PromedioConsumos.consumoDiario;
                
                let porcentajePerdida = origen == "Veracruz" ? 82 : 73;
                porcentajePerdida = porcentajePerdida / 100;

                if(porcentajePropuesta == 0){
                    potenciaNecesaria = (Math.round((((consumoDiario - subsidioDiario) / irradiacion) / porcentajePerdida) * 100) / 100) * 1000; 
                }
                else{
                    potenciaNecesaria = (Math.round((((consumoDiario * porcentajePropuesta) / irradiacion) / porcentajePerdida) * 100) / 100) * 1000;
                }
            }
            else{ /* MediaTension */

            }

            return potenciaNecesaria;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'EnergiaController.getPotenciaNecesaria(): ' +error });
			throw 'EnergiaController.getPotenciaNecesaria(): '+error;   
        }
    }
}

module.exports = EnergiaController;