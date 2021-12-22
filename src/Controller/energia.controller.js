const TarifaController = require('../Controller/tarifa.controller');
const IrradiacionController = require('../Controller/irradiacion.controller');

class EnergiaController{
    //Instancia(s)
    tarifaController = new TarifaController();
    irradiacionController = new IrradiacionController();

    //@main()
    async getPotenciaNecesaria(data){
        try{
            let tipoCotizacion = data.tipoCotizacion;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'EnergiaController.getPotenciaNecesaria(): ' +error });
			throw 'EnergiaController.getPotenciaNecesaria(): '+error; 
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
}

module.exports = EnergiaController;