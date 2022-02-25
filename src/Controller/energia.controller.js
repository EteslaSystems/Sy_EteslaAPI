const TarifaController = require('../Controller/tarifa.controller');
const IrradiacionController = require('../Controller/irradiacion.controller');
const Log = require('../../config/logConfig');

//@main() - "First Step" -> *PotenciaNecesaria*
module.exports.getPotenciaNecesaria = function (data){
    try{
        let PromedioConsumos = getPromedioConsumos(data.tipoCotizacion, data._consumos);
        let potenciaNecesaria = calcularPotenciaRequerida({ 
            origen: data.origen, 
            porcentajePropuesta: data.porcentajePropuesta,
            tarifa: data.tarifa,
            PromedioConsumos
        });

        let Result = {
            Consumo: PromedioConsumos,
            potenciaNecesaria: potenciaNecesaria
        };
        
        return Result;
    }
    catch(error){
        throw 'EnergiaController.getPotenciaNecesaria(): '+error; 
    }
}

//@main() - "Second Step" -> *Consumo(c/paneles && s/paneles), Generacion, Ahorro*
module.exports.getEnergia = async function(data){
    let GeneracionEnPesos = {};

    try{
        let { Consumos, tarifa, origen, potenciaReal } = data;

        let GeneracionEnergia = getGeneracion({ origen, potenciaReal });
        let ImpactoAmbiental = getImpactoAmbiental(GeneracionEnergia._generacionMensual);
        
        let NuevosConsumos = getNuevosConsumos({ 
            _consumosMensuales: Consumos.ConsumoMensual._consumosMensuales, 
            _generacion: GeneracionEnergia._generacionMensual 
        });
        
        let porcentajePotencia = Math.round((GeneracionEnergia.promeDGeneracionMensual / Consumos.promedios.mensual) * 100);
        
        let old_tarifa = dac(tarifa, Consumos.promedios.mensual);
        let ViejoConsumoEnPesos = await consumoEnPesos({ /*Consumo en Pesos*/
            tarifa: old_tarifa,
            consumoPromedioMensual: Consumos.promedios.mensual, 
            consumoAnual: Consumos.consumoAnual, 
            cargoFijo: false
        });

        let new_tarifa = dac(tarifa, NuevosConsumos.promedioNuevosConsumosMensuales);

        //
        if(porcentajePotencia >= 100){/*Cargo Fijo*/
            let cargoFijo = await getCargoFijo(new_tarifa);
            NuevoConsumoEnPesos = await consumoEnPesos({
                tarifa: new_tarifa,
                consumoPromedioMensual: cargoFijo, 
                consumoAnual: 0, 
                cargoFijo: true
            });
        }
        else{ /*Generacion en Pesos*/
            NuevoConsumoEnPesos = await consumoEnPesos({
                tarifa: new_tarifa,
                consumoPromedioMensual: NuevosConsumos.promedioNuevosConsumosMensuales, 
                consumoAnual: NuevosConsumos.nuevoConsumoAnual, 
                cargoFijo: false
            });
        }

        let Ahorro = getAhorro({ 
            Energia: { GeneracionEnergia, Consumos },
            Economica: { ViejoConsumoEnPesos, NuevoConsumoEnPesos }
        });

        return {
            porcentajePotencia,
            Tarifas: { old_tarifa, new_tarifa },
            Energia: { Consumos, NuevosConsumos, Ahorro: Ahorro.Energia },
            Economica: { ViejoConsumoEnPesos, NuevoConsumoEnPesos, Ahorro: Ahorro.Economica },
            ImpactoAmbiental
        };
    }
    catch(error){
        await Log.generateLog({ tipo: 'Error', contenido: 'EnergiaController.getProduccion(): ' +error });
        throw 'EnergiaController.getProduccion(): '+error;
    }
}

/*#region [ Calculo de potencia requerida ]*/
//@static
function getPromedioConsumos(_consumos){
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

            return {
                promedioConsumoMensual: promConsums,
                _consumosMensuales: _consumMens
            };
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
        ConsumoMensual = consumoMensual(_consumos);
        consumoAnual = consumoAnual(consumoMensual);
        consumoDiario = consumoDiario(consumoAnual);

        return {
            promedios: {
                mensual: promConsumosBimestrales / 2,
                bimestral: promConsumosBimestrales
            },
            ConsumoMensual,
            consumoAnual,
            consumoDiario,
            _consumosBimestrales: _consumos
        };
    }
    catch(error){
        throw 'EnergiaController.getPromedioConsumos(): '+error; 
    }
}

//@static
function calcularPotenciaRequerida(data){
    let potenciaNecesaria = 0;

    try{
        let { origen, porcentajePropuesta, tarifa, PromedioConsumos } = data;

        let irradiacion = irradiacionController.obtenerIrradiacion(origen);
        let _tarifas = tarifaController.consulta();
        let Tarifa = _tarifas[tarifa];
        porcentajePropuesta = parseFloat(porcentajePropuesta) / 100 || 0;

        if(data.tipoCotizacion === "bajatension"){ /* BajaTension */
            let cuantoMenos = Tarifa.limite - (PromedioConsumos.promedios.bimestral * 0.10);

            if(cuantoMenos < Tarifa.siObjetivoDAC){
                Tarifa.siObjetivoDAC = cuantoMenos;
            }
            else if(Tarifa.siObjetivoDAC < 0 || Tarifa.siObjetivoDAC > (PromedioConsumos.promedios.bimestral)){
                Tarifa.siObjetivoDAC = 0;
            }

            let subsidioDiario = Math.round(((Tarifa.siObjetivoDAC * 6) / 365) * 100) / 100;
            let consumoDiario = PromedioConsumos.consumoDiario;
            
            let porcentajeEficiencia  = origen == "Veracruz" ? 73 : 82;
            porcentajeEficiencia  = porcentajePerdida / 100;

            if(porcentajePropuesta == 0){
                potenciaNecesaria = Math.round(((((consumoDiario - subsidioDiario) / irradiacion) / porcentajeEficiencia) * 1000) * 100) / 100;
            }
            else{
                potenciaNecesaria = Math.round(((((consumoDiario - porcentajePropuesta) / irradiacion) / porcentajeEficiencia) * 1000) * 100) / 100;
            }
        }
        else{ /* MediaTension */

        }

        return potenciaNecesaria;
    }
    catch(error){
        throw 'EnergiaController.getPotenciaNecesaria(): '+error;   
    }
}
/*#endregion */

/*#region [ POWER ]*/
/*#region Energetico*/
function getGeneracion(data){
    try{
        let { origen, potenciaReal } = data;

        let getGeneracionMensual = (potenciaInstalada, irradiacion, eficiencia) => {
            _generation = []; //Generacion Mensual
    
            /*
            [Formula]
            ->Generacion = potenciaInstalada/potenciaReal[kw] * irradiacionPromedio[mes] * % Perdidas * no. dias[mes];
            */
    
            generacion = Math.round((potenciaInstalada * irradiacion * eficiencia * 30.4) * 100) / 100;
    
            for(let i=0; i<12; i++){
                _generation[i] = generacion;
            }
            return _generation;
        };
    
        let promeDGeneracionMensual = (_generacn) => {
            promDGeneracion = 0;
    
            for(let i=0; i<_generacn.length; i++)
            {
                promDGeneracion += _generacn[i];
            }
    
            return Math.round((promDGeneracion / _generacn.length) * 100) / 100;
        }
    
        let _generacionBimestral = (_generacionMes) => {
            generacionBimestre = 0;
            _generacionBimestrl = [];
    
            for(let i=0; i<_generacionMes.length; i++)
            {
                generacionBimestre += _generacionMes[i];
    
                if((i + 1) % 2 === 0){
                    _generacionBimestrl.push(generacionBimestre);
                    generacionBimestre = 0;
                }
            }
            return _generacionBimestrl;
        };
    
        let promeDGeneracionBimestral = (_genBimestral) => {
            promedioGB = 0;
    
            for(let i=0; i<_genBimestral.length; i++)
            {
                promedioGB += _genBimestral[i];
            }
            
            return Math.round((promedioGB / _genBimestral.length) * 100) / 100;
        };
    
        let generacionAnual = (_generacn) => {
            generationAnual = 0;
            for(let i=0; i<_generacn.length; i++)
            {
                generationAnual += _generacn[i];
            }
    
            return Math.round(generationAnual * 100) / 100;
        };
    
        let irradiacion = origen != "Veracruz" ? 5.42 : 4.6;
        let eficiencia = origen != "Veracruz" ? 0.73 : 0.83;
    
        ///Coleccion de generacion *POR MES* (Mensual)
        let _generacionMensual = getGeneracionMensual(potenciaReal, irradiacion, eficiencia);
    
        ///
        promeDGeneracionMensual = promeDGeneracionMensual(_generacion);
        _generacionBimestral = _generacionBimestral(_generacion);
        promeDGeneracionBimestral = promeDGeneracionBimestral(_generacionBimestral);
        generacionAnual = generacionAnual(_generacion);
    
        return { 
            /* Todo esta en [Kw] */
            _generacionMensual,
            _generacionBimestral,
            promeDGeneracionBimestral,
            promeDGeneracionMensual,
            generacionAnual
        };
    }
    catch(error){
        throw error;
    }
}

function getImpactoAmbiental(generacionAnualKw){
    /* 
        ->1 kw = 19 arboles [ANUALES]
        ->1 kw = 800 kg Co2 [ANUALES]
    */

    try{
        let numeroArboles = Math.round((generacionAnualKw * 19) * 100) / 100;
        let co2NogeneradoKg = Math.round((generacionAnualKw * 800) * 100) / 100;
        
        return { numeroArboles, co2NogeneradoKg };
    }
    catch(error){
        throw error;
    }
}

function getNuevosConsumos(data){
    try{    
        let { _consumosMensuales, _generacion } = data;

        let _consumosNuevosMensuales = (_consumos, _generacion) => {
            let consumosMensuales = [];

            _consumos.forEach((consumo,i) => {
                consumosMensuales[i] = Math.round((consumo - _generacion[i]) * 100) / 100;
            });

            return consumosMensuales;
        };

        let _consumosNuevosBimestrales = (_consumosNuevosMensuales) => {
            let nuevoConsumoBimestral = 0;
            let _newConsumsBimestrales = [];

            for(let i=0; i<6; i++)
            {
                if(i != 0 && i % 2 == 1){
                    nuevoConsumoBimestral = _consumosNuevosMensuales[i+1] + _consumosNuevosMensuales[i+2];
                }
                else{
                    nuevoConsumoBimestral = _consumosNuevosMensuales[i] + _consumosNuevosMensuales[i+1];
                }

                _newConsumsBimestrales[i] = Math.round(nuevoConsumoBimestral * 100) / 100;
            }

            return _newConsumsBimestrales;
        };

        let promedioNuevosConsumosMensuales = (_nuevosConsumosMensuales) => {
            let promedioConsumoMes = 0;

            _nuevosConsumosMensuales.forEach(consumoMensual => promedioConsumoMes += consumoMensual);

            return Math.round((promedioConsumoMes / _nuevosConsumosMensuales.length) * 100) / 100;
        };

        let promedioNuevoConsumoBimestral = (consumosMensuales) => {
            bimestre = 0;
            _bimestres = [];
            sumBimestres = 0;

            for(let x=0; x<12; x++)
            {
                bimestre += consumosMensuales[x];
                if(x != 0 && x % 2 == 1){
                    _bimestres.push(bimestre);
                    bimestre = 0;
                }
            }

            _bimestres.forEach(function(bimestre){
                sumBimestres += bimestre;
            });

            return Math.round((sumBimestres / _bimestres.length) * 100) / 100;
        };

        let nuevoConsumoAnual = (consumosMens) => {
            let nwConsumosMnsuales = 0;

            consumosMens.forEach(nwConsumoMensual => {
                nwConsumosMnsuales += nwConsumoMensual
            });
            
            return nwConsumosMnsuales; //Retorna - KW
        };

        ///
        _consumosNuevosMensuales = _consumosNuevosMensuales(_consumosMensuales, _generacion); /*[kwh, kwp]*/
        _consumosNuevosBimestrales = _consumosNuevosBimestrales(_consumosNuevosMensuales);
        promedioNuevosConsumosMensuales = promedioNuevosConsumosMensuales(_consumosNuevosMensuales);
        nuevoConsumoAnual = nuevoConsumoAnual(_consumosNuevosMensuales);
        promedioNuevoConsumoBimestral = promedioNuevoConsumoBimestral(_consumosNuevosMensuales);

        return {
            _consumosNuevosMensuales,
            _consumosNuevosBimestrales,
            nuevoConsumoAnual,
            promedioNuevosConsumosMensuales,
            promedioNuevoConsumoBimestral
        };
    }
    catch(error){
        throw error;
    }
}

function dac(tarifa, consumoPromedioMes){
    //consumoPromedio = PROMEDIO DE CONSUMOS *MENSUALES*
    switch(tarifa)
    {
        case '1':
            tarifa = consumoPromedioMes >= 250 ? 'DAC' : tarifa;
        break;
        case '1a':
            tarifa = consumoPromedioMes >= 300 ? 'DAC' : tarifa;
        break;
        case '1b':
            tarifa = consumoPromedioMes >= 400 ? 'DAC' : tarifa;
        break;
        case '1c':
            tarifa = consumoPromedioMes >= 850 ? 'DAC' : tarifa;
        break;
        case '1d':
            tarifa = consumoPromedioMes >= 1000 ? 'DAC' : tarifa;
        break;
        case '1e':
            tarifa = consumoPromedioMes >= 2000 ? 'DAC' : tarifa;
        break;
        case '1f':
            tarifa = consumoPromedioMes >= 2500 ? 'DAC' : tarifa;
        break;
        default:
            tarifa = tarifa;
        break;
    }

    return tarifa;
}
/*#endregion */
/*#region Economico*/
async function consumoEnPesos(data){ ///consumoPromedio = promedioConsumosMensuales
    let _demanda = null;
    let _noVerano = [], _verano = [];
    let promeDioPagoMensualIva = 0, promeDioPagoBimestralIva = 0;

    try{
        let { tarifa, consumoPromedioMensual, consumoAnual, cargoFijo } = data;

        let _pagosMensuales = (consumoProm, _demanda) => {//[Retorna: Object] *consumoProm: promedio de consumos -MENSUALES- *_demanda: 'Viene la tarifa, escalones y precios $$mxn'
            let costoKwhPesos = 0, costo = 0;
            let _pagosAnio = [];

            if(_demanda != null){
                //Se arregla el array de 'tarifas' para poder ordenar el rango de la tarifa, mas bajo (nivel/escalon #1)
                if(_demanda.length > 1){
                    let banderaNivelCero = false;

                    /* Acomodar el -siNivel- 0, hacia el final */
                    //Validar si la [_demanda] cuenta con un -siNivel- igual a 0
                    _demanda.filter(Tarifa => { banderaNivelCero = Tarifa.siNivel === 0 ? true : banderaNivelCero });

                    //
                    _demanda.sort((Tarifa1, Tarifa2) => { return Tarifa1.siNivel - Tarifa2.siNivel });

                    //Ordenar -siNivel- para que, el nivel 0, quede como ultimo
                    if(banderaNivelCero === true){
                        let ObjTemporal = _demanda[0];
                        
                        //Se borra el primer indice /*Que contiene la Tarifa con -siNivel- [0]*/
                        _demanda.shift();

                        //Se manda hacia el ultimo espacio la Tarifa con -siNivel- [0]
                        _demanda.push(ObjTemporal);
                    }
                }

                ///Se obtiene el costo en pesos mxn equivalente a 1 mes
                _demanda.forEach(Demanda => {
                    if(consumoProm > 0){
                        if(consumoProm > Demanda.iRango){
                            if(Demanda.iRango === 0){
                                //Excedentes [section]
                                costoKwhPesos = consumoProm * Demanda.fPrecio;
                                //
                                consumoProm = 0;
                            }
                            else{
                                costoKwhPesos = Demanda.iRango * Demanda.fPrecio;
                            }
                        }
                        else{
                            costoKwhPesos = consumoProm * Demanda.fPrecio;
                        }

                        //Descontar los Kwh ya contabilizados
                        consumoProm = consumoProm - Demanda.iRango;

                        //Sumar los Kwh que van contabilizados
                        costo += costoKwhPesos;
                        costo = Math.round(costo * 100) / 100;
                    }
                });
            }
            else{ /* Solo se cobra [CargoFijo] */
                costo = consumoProm;
            }

            ///Se agrega el costo kwh de 1 mes a un array(12)
            for(let x=0; x<12; x++)
            {
                _pagosAnio[x] = costo;
            }

            return {
                costoTotalMensual: costo,
                _pagosMensualesAnual: _pagosAnio
            };
        };

        let _pagosBimestrales = (_pagosMensuales) => { //$$ - Bimestrales
            let _pagosBim = [];
            let bimestre = 0, promBimst = 0;
    
            //Sacando bimestres
            for(let i=0; i<6; i++)
            {
                if(i != 0 && i % 2 == 1){
                    bimestre = _pagosMensuales[i+1] + _pagosMensuales[i+2];
                }
                else{
                    bimestre = _pagosMensuales[i] + _pagosMensuales[i+1];
                }
    
                _pagosBim[i] = bimestre;
            }
            
            //Promedio Bimestral
            _pagosBim.forEach(bimst => promBimst += bimst);
            promBimst = Math.round((promBimst / _pagosBim.length) * 100) / 100;

            return {
                _bimestres: _pagosBim,
                pagsPromBimestrales: promBimst
            };
        };
    
        let pagoAnual = (_pagosMensuales) => { 
            let pagoAnl = 0;

            _pagosMensuales.forEach(pagoMensual => pagoAnl += pagoMensual);
            pagoAnl = Math.round(pagoAnl * 100) / 100;

            return pagoAnl;
        };

        let _pagosMensualesIva = (_pagoMes) => {
            let promPagsCIva = 0;
            let _pIva = [];

            for(let i=0; i<_pagoMes.length; i++)
            {
                _pIva[i] = Math.floor(_pagoMes[i] * 0.10 + _pagoMes[i] * 1.16);
            }

            //Promedio de pagos con IVA
            _pIva.forEach(pagoCIva => promPagsCIva += pagoCIva);
            promPagsCIva = Math.round(promPagsCIva / _pIva.length);

            let objResult = {
                _pagosConIva: _pIva,
                promedioPagosConIva: promPagsCIva
            };

            return objResult;
        };

        let _pagosBimestralesConIva = (_pagsBims) => {
            let _pagosBimestralesConIva = [];
            let promedioPagosBimestralesConIva = 0;

            ///Pago bimestrales c/IVA
            for(let PagoBimestral of _pagsBims){
                _pagosBimestralesConIva.push(Math.floor(PagoBimestral * 0.10 + PagoBimestral * 1.16));
            }

            ///Promedio de pagos bimestrales c/IVA
            _pagosBimestralesConIva.forEach(pBimestralConIva => promedioPagosBimestralesConIva += pBimestralConIva);
            promedioPagosBimestralesConIva = Math.round(promedioPagosBimestralesConIva / _pagosBimestralesConIva.length);

            return {
                _pagosBimestralesConIva,
                promedioPagosBimestralesConIva
            };
        };

        ///
        if(cargoFijo != true){
            let _tarifas = await tarifas.obtenerTodasLasTarifas();
            _tarifas = _tarifas.message;

            if(dacOnoDac != 'DAC'){ // <> DAC
                _noVerano = _tarifas.filter(Tarifa => { return Tarifa.vNombreTarifa.includes(tarifa); });
                _noVerano = _noVerano.filter(Tarifa => { return noVerano = Tarifa.siVerano === 0 }); //Se obtienen [] las -NO VERANO- acorde a la tarifa de la propuesta (1, 1c, 1a, etc...)
                
                _verano = _tarifas.filter(Tarifa => { return Tarifa.vNombreTarifa.includes(tarifa); });
                _verano = _verano.filter(Tarifa => { return verano = Tarifa.siVerano === 1 }); 
            }
        
            //DAC
            let demanda_consulta = _tarifas.filter(Tarifa => { return Tarifa.vNombreTarifa.includes(tarifa); });
            demanda_consulta = demanda_consulta.filter(Tarifa => { return Tarifa.siVerano === 0 && Tarifa.siNivel === 0 ? Tarifa : null; });

            //Validacion tarifa
            if(_noVerano.length > 0){
                _demanda = _noVerano;
            }
            else if(_verano.length > 0){
                _demanda = _verano;
            }
            else if(demanda_consulta.length > 0){ //DAC
                _demanda = demanda_consulta;
            }
        }
        
        //Pagos Mensuales
        _pagosMensuales = _pagosMensuales(consumoPromedioMensual, _demanda);
        _pagosMensualesIva = _pagosMensualesIva(_pagosMensuales._pagosMensualesAnual);
        promeDioPagoMensualIva = _pagosMensualesIva.forEach(pagoMesIva => promeDioPagoMensualIva += pagoMesIva);
        promeDioPagoMensualIva = promeDioPagoMensualIva / _pagosMensualesIva.length;
    
        //Pagos Bimestrales
        _pagosBimestrales = _pagosBimestrales(_pagosMensuales._pagosMensualesAnual);
        _pagosBimestralesConIva = _pagosBimestralesConIva(_pagosBimestrales._bimestres); //Pagos bimestrales con IVA - MXN
        promeDioPagoBimestralIva = _pagosBimestralesConIva.forEach(pagoBimesIva => _pagosBimestralesConIva += pagoBimesIva);
        promeDioPagoBimestralIva = promeDioPagoBimestralIva / _pagosBimestralesConIva.length;

        //PagoAnual
        pagoAnual = pagoAnual(_pagosMensuales._pagosMensualesAnual); 
        let pagoAnualConIva  = Math.round((pagoAnual * 1.16) * 100) / 100;

        //Proyeccion a 10 anios
        let _proyeccion10anios = proyeccion10anios(consumoAnual, pagoAnualConIva); //Proyeccion en *KW* a 10 años

        return { 
            _pagosMensuales, 
            _pagosMensualesIva, 
            _pagosBimestrales, 
            _pagosBimestralesConIva,
            _proyeccion10anios,
            promeDioPagoMensualIva,
            promeDioPagoBimestralIva,
            pagoAnual, 
            pagoAnualConIva,
        };
    }
    catch(error){
        throw error;
    }
}

async function getCargoFijo(tarifa){ //Return: (number)
    try{
        let _CargoFijo = await ConfigController.getArrayOfConfigFile();
        _CargoFijo = _CargoFijo.energia.costos.cargoFijo;

        //Validar si es un [Object]
        if(typeof tarifa != 'object'){
            //Iterar coleccion hasta encontrar el [Object] del CargoFijo de la tarifa
            for(let CargoFijo of _CargoFijo)
            {
                //Filtrar
                for(let Tarifa of CargoFijo.tarifa)
                {
                    if(Tarifa === tarifa){
                        return await getCargoFijo(CargoFijo);
                    }
                }
            }
        }

        return tarifa.costo; //$$ - MXN
    }
    catch(error){
        throw error;
    }
}

function proyeccion10anios(kwhAnuales, costoAnualMXN){
    let _proyeccionEnEnergia = []; //kW 
    let _proyeccionEnDinero = []; //pesosMXN

    try{
        for(let i=0; i<=10; i++)
        {
            if(i > 0)
            {
                kwhAnuales = Math.round((kwhAnuales * 1.10) * 100)/100; //Kw - Incremento de 10%
                costoAnualMXN = Math.round((costoAnualMXN * 1.10) * 100)/100; //$$mxn - Incremento de 10%
                _proyeccionEnEnergia[i] = kwhAnuales;
                _proyeccionEnDinero[i] = costoAnualMXN;
            }
            else{
                _proyeccionEnEnergia[i] = kwhAnuales; //Kw - Sin incremento
                _proyeccionEnDinero[i] = costoAnualMXN; //$$mxn - Sin incremento
            }
        }

        return {
            _proyeccionEnEnergia: _proyeccionEnEnergia,
            _proyeccionEnDinero: _proyeccionEnDinero
        };
    }
    catch(error){
        throw error;
    }
}

function getAhorro(data){ //Return [Object] : *Todos los precios que se calculan y sus resultados. Son SIN IVA*
    try{
        let { Energia, Economica } = data;

        /*Energia*/
        let ahorroMensual = Math.round((Energia.Consumos.promedios.mensual - Energia.GeneracionEnergia.promedioDeGeneracion) * 100) / 100;
        let ahorroBimestral = Math.round((Energia.Consumos.promedios.bimestral - Energia.GeneracionEnergia.promeDGeneracionBimestral) * 100) / 100;
        let ahorroAnual = Math.round((Energia.Consumos.consumoAnual - Energia.GeneracionEnergia.generacionAnual) * 100) / 100;

        Energia = { ahorroMensual, ahorroBimestral, ahorroAnual };

        /*Monetaria*/
        ahorroMensual = Math.round((Economica.ViejoConsumoEnPesos.promeDioPagoMensualIva - Economica.NuevoConsumoEnPesos.promeDioPagoMensualIva) * 100) / 100;
        ahorroBimestral = Math.round((Economica.ViejoConsumoEnPesos.promeDioPagoBimestralIva - Economica.NuevoConsumoEnPesos.promeDioPagoBimestralIva) * 100) / 100;
        ahorroAnual = Math.round((Economica.ViejoConsumoEnPesos.pagoAnualConIva - Economica.NuevoConsumoEnPesos.pagoAnualConIva) * 100) / 100;

        Economica = { ahorroMensual, ahorroBimestral, ahorroAnual };

        return { Energia, Economica };
    }
    catch(error){
        throw error;
    }
}
/*#endregion */
/*#endregion */