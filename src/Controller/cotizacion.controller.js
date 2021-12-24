const Cotizacion = require('../Entities/Panel');
const AgregadoController = require('../Controller/agregado.controller');
const EnergiaController = require('../Controller/energia.controller');
const PanelController = require('../Controller/panel.controller');
const ViaticosController = require('../Controller/viaticos.controller');
const Log = require('../../config/logConfig');
const ConfigFile = require('../Controller/configFile.controller');

class CotizacionController{
    //Instancia(s)
    cotizacion = new Cotizacion();
    agregadoController = new AgregadoController();
    energiaController = new EnergiaController();
    panelController = new PanelController();
    viaticosController = new ViaticosController();

    /* #region Cotizacion/Propuesta */
    //@main() - First Step - "Obtener *potenica necesaria* y *paneles*"
    async getFirstStepCotizacion(data){
        let PotenciaNecesaria = {};
        let Result = {};
        let _Paneles = [];
    
        try{
            let tipoCotizacion = data.tipoCotizacion;

            if(tipoCotizacion === "bajatension" || tipoCotizacion === "mediatension"){
                PotenciaNecesaria = await energiaController.getPotenciaNecesaria(data);
                _Paneles = await panelController.getPanelesPropuesta(PotenciaNecesaria.potenciaNecesaria);

                Result = {
                    PotenciaNecesaria: PotenciaNecesaria,
                    _Paneles: _Paneles
                };
            }
            else{ /* CotizacionIndividual */

            }

            return Result;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.getCotizacion(): ' +error });
			throw 'ErrorCotizacionController.getCotizacion(): '+error;
        }
    }

    //@main - Second Step - "Obtener *Viaticos* *PRODUCCION* *ROI* *Financiamiento*"
    async getSecondStepCotizacion(data){
        let Result = {};

        try{
            if(tipoCotizacion === "bajatension"){
                let Viaticos = await viaticosController.calcularViaticos({

                }); 

                let Produccion = await energiaController.getProduccion(data); 

                // let ROI = await roiController.getROI({
                //     Produccion: Produccion,
                //     _consumos: data._consumos,
                //     precioMXNSinIVA: Viaticos.totales.precioMXNSinIVA
                // });
                
                // let Financiamiento = await financiamientoController.getFinanciamiento({ costoTotal: Viaticos.totales.precioMXNSinIVA });

                Result = { Viaticos, Produccion };
            }

            return Result;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.getSecondStepCotizacion(): ' +error });
			throw 'ErrorCotizacionController.getSecondStepCotizacion(): '+error;
        }
    }
    /* #endregion */

    /* #region Combinaciones */
    //@main()
    /****NOTA:: RECONSTRUIR LA FUNCION DE 'busquedaInteligente(data)' */ 
    async busquedaInteligente(data){ /* [ Combinaciones ] */
        try{
            let tipoCotizacion = data.tipoCotizacion;

            //Datos cliente
            let uCliente = await cliente.consultarId({ idPersona: data.idCliente });
            uCliente = uCliente.message; 
            uCliente = uCliente[0];

            //Datos vendedor
            let uVendedor = await vendedor.consultarId({ idPersona: data.idUsuario });
            uVendedor = uVendedor.message;
            uVendedor = uVendedor[0];

            if(tipoCotizacion == 'bajaTension'){
                /*#region Formating */
                //Obtener marcas de -[EQUIPOS_SELECCIONADOS]-
                let MatrizEquiposSeleccionados = await ConfigFile.getArrayOfConfigFile();
                MatrizEquiposSeleccionados = MatrizEquiposSeleccionados.busqueda_inteligente;///Formating

                //[ Consumos && Paneles ]
                let _data = await bajaTension.firstStepBT(data);

                ///Consumos
                _consumos = _data[0].consumo;

                ///Eliminar elemento de -consumos- 
                _data.shift();

                ///Paneles
                let _paneles = _data;
                /*#endregion */

                if(!data.combinacionPremium){
                    CombinacionEconomica = await getCombinacionEconomica(_paneles, MatrizEquiposSeleccionados); //CombinacionA
                    CombinacionRecomendada = await getCombinacionMediana(_paneles, MatrizEquiposSeleccionados); //CombinacionB
        
                    ///
                    _combinaciones = [CombinacionEconomica, CombinacionRecomendada];

                    ///Preparar la data para la combinacion [Premium]
                    Object.assign(data, { combinacionPremium: true });

                    //Se modifica el -porcentajePropuesta- para que saque el 100%
                    data.porcentajePropuesta = '100';

                    return mainBusquedaInteligente(data);
                }

                ///
                CombinacionPremium = await getCombinacionPremium(_paneles, MatrizEquiposSeleccionados); //CombinacionC

                _combinaciones.push(CombinacionPremium);

                ///Se vuelve a -settear- [_consumos] en la data para enviar a -calcularViaticosComb()-
                data.consumos = _consumos;
            }
            /* else{ //MediaTension
        
            } */
        
            //Calcular viaticos
            let _Combinaciones = await calcularViaticosComb(_combinaciones,data);

            let objCombinaciones = {
                cliente: uCliente,
                vendedor: uVendedor,
                _arrayConsumos: _consumos,
                combinacionMediana: { 
                    combinacion: _Combinaciones[1][0], 
                    nombre: _Combinaciones[1][1].tipoCombinacion
                },
                combinacionEconomica: {
                    combinacion: _Combinaciones[0][0], 
                    nombre: _Combinaciones[0][1].tipoCombinacion
                },
                combinacionOptima: {
                    combinacion: _Combinaciones[2][0], 
                    nombre: _Combinaciones[2][1].tipoCombinacion
                },
                tipoCotizacion: data.tipoCotizacion,
                combinaciones: true
            };

            return __combinaciones;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.busquedaInteligente(): ' +error });
			throw 'ErrorCotizacionController.busquedaInteligente(): '+error; 
        }
    }
    
    //@static
    async getCombinacionEconomica(_paneles, matrizEquipos){
        let Panel = {};

        try{
            let getEquipoEconomico = (_equipos) => {
                costoEconomico = 0;
                EquipoEconomico = {};
    
                ///
                _equipos.filter((equipo) => {
                    if(equipo.panel){
                        equipo = equipo.panel;
                    }
    
                    if(costoEconomico === 0){
                        costoEconomico = equipo.costoTotal;
                    }
    
                    if(costoEconomico >= equipo.costoTotal){
                        costoEconomico = equipo.costoTotal;
                        EquipoEconomico = equipo;
                    }
                });
                return EquipoEconomico;
            };
    
            _paneles = filtrarEquiposSelectos(matrizEquipos, _paneles, "combinacionEconomica");
    
            Panel = getEquipoEconomico(_paneles);
    
            //Obtener lista de los inversores para ese panel
            let _inversores = await bajaTension.obtenerInversores_Requeridos({ objPanelSelect: Panel });
            _inversores = filtrarEquiposSelectos(matrizEquipos, _inversores, "combinacionEconomica");
    
            //Obtener -Inversor- mas economico
            Inversor = getEquipoEconomico(_inversores);
    
            //Retornar [Object]
            return { panel: Panel, inversor: Inversor, tipoCombinacion: 'Economica' }
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.getCombinacionEconomica(): ' +error });
			throw 'ErrorCotizacionController.getCombinacionEconomica(): '+error; 
        }
    }
    
    //@static
    async getCombinacionPremium(_paneles, matrizEquipos){//MayorProduccion
        /*Resumen: Se obtienen los equipos mas POTENTES y CAROS */
        try{
            let getEquipoPotentes = (_equipos) => { ///Return [Array de Objetos]
                /*Resumen: Se obtienen los equipos mas POTENTES */
                potenciaHigger = 0;
                _lstEquipos = [];
    
                _equipos.filter((equipo) => {
                    potencia = 0;
    
                    //Validar si el equipo es [panel] || [inversor]
                    equipo = equipo.panel ? equipo.panel : equipo;
    
                    if(equipo.potenciaReal){
                        potencia = equipo.potenciaReal;
                    }
                    else{
                        potencia = equipo.potenciaNominal;
                    }
    
                    if(potenciaHigger === 0){
                        potenciaHigger = potencia;
                    }
    
                    if(potenciaHigger <= potencia){
                        potenciaHigger = potencia;
                        _lstEquipos.push(equipo);
                    }
                });
                return _lstEquipos;
            };
    
            let getEquipoMasCaro = (_equipos) => { ///Return [Object]
                /*Resumen: Se filtra de la coleccion de equipos mas potentes, los -MAS CAROS- */
                costoCaro = 0;
                EquipoCaro = {};
    
                _equipos.filter((equipo) => {
                    //Validar si el equipo es [panel] || [inversor]
                    equipo = equipo.panel ? equipo.panel : equipo;
    
                    if(costoCaro === 0){
                        costoCaro = equipo.costoTotal;
                    }
    
                    if(costoCaro <= equipo.costoTotal){
                        costoCaro = equipo.costoTotal;
                        EquipoCaro = equipo;
                    }
                });
                return EquipoCaro;
            };
    
            ///Obtener el [PANEL] filtrado
            let _panelFiltrado = filtrarEquiposSelectos(matrizEquipos, _paneles, "combinacionPremium");
    
            //Obtener el [PANEL] mas potente
            let _lstPanelesPotentes = getEquipoPotentes(_panelFiltrado);
            //Obtener el [PANEL] mas caro
            let Panel = getEquipoMasCaro(_lstPanelesPotentes);
    
            //Obtener lista de los inversores para ese panel
            let _inversores = await bajaTension.obtenerInversores_Requeridos({ objPanelSelect: Panel });
            _inversores = filtrarEquiposSelectos(matrizEquipos, _inversores, "combinacionPremium");
    
            //Obtener el [INVERSOR] mas potente
            let _lstInversoresPotentes = getEquipoPotentes(_inversores);
            //Obtener el [INVERSOR] mas caro
            let Inversor = getEquipoMasCaro(_lstInversoresPotentes);
    
            return { panel: Panel, inversor: Inversor, tipoCombinacion: 'Premium' };
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.getCombinacionPremium(): ' +error });
			throw 'ErrorCotizacionController.getCombinacionPremium(): '+error; 
        }
    }
    
    //@static    
    async getCombinacionMediana(_paneles, matrizEquipos){//Mediana
        /* Se saca una media de los costos de -[EQUIPOS SELECCIONADOS]- y se retorna los equipos con 
        -costoTotal- que mas se acerque a la media */
        let mediaCostos = 0;
        let PanelSeleccionado = {}, InversorSeleccionado = {};
    
        try{
            let getMediaCostos = (_equipos) => { ///Return: Number (Integer || Float)
                /*Resumen: Se saca una media de todos los -costosTotales- de los equipos */
    
                mediaCostoTotal = 0;
    
                for(let Equipo of _equipos)
                {
                    ///Validar si el Equipo iterado es un [PANEL]
                    if(Equipo.panel){
                        Equipo = Equipo.panel;
                    }
    
                    ///Suma de todos los costos[unitarios]
                    mediaCostoTotal += Equipo.costoTotal;
                }
    
                ///Promedio || Media[costos]
                return mediaCostoTotal = Math.round((mediaCostoTotal / _equipos.length) * 100) / 100;
            };
            let getEquiposCercanos = (_equipos, mediaCostos) => { ///Return: [Object]
                /*Resumen: Filtrar los equipos con -costoTotal- a la media de *costosTotales* */
                EquipoFiltrado = {};
                
                //Se genera un rango con base a la -mediaCostos- (15% *abajo* && *arriba*)
                rangoMayor = Math.round((mediaCostos + ((15 / 100) * mediaCostos)) * 100) / 100;
    
                //Filtrar equipos c/la media *costosTotales*
                _equipos.filter(equipo => {
                    //Validar si el equipo es un [PANEL]
                    if(equipo.panel){
                        equipo = equipo.panel;
                    }
                    
                    //Se filtran el equipo que se iguale o acerque a la media
                    if(equipo.costoTotal === mediaCostos || equipo.costoTotal <= rangoMayor){
                        EquipoFiltrado = equipo;
                    }
                });
    
                return EquipoFiltrado;
            };
    
            //Se trata la data de [PANELES]
            let _lstPaneleSelectos = filtrarEquiposSelectos(matrizEquipos, _paneles, "combinacionMediana");
            mediaCostos = getMediaCostos(_lstPaneleSelectos);
            PanelSeleccionado = getEquiposCercanos(_lstPaneleSelectos, mediaCostos);
    
            //Se obtienen los [Inversores] que le quedan a ese [Panel_Seleccionado]
            let _inversores = await bajaTension.obtenerInversores_Requeridos({ objPanelSelect: PanelSeleccionado });
            //Se trata la data de [INVERSORES]
            let _lstInversoreSelectos = filtrarEquiposSelectos(matrizEquipos, _inversores, "combinacionMediana");
            mediaCostos = getMediaCostos(_lstInversoreSelectos);
            InversorSeleccionado = getEquiposCercanos(_lstInversoreSelectos, mediaCostos);
    
            return { panel: PanelSeleccionado, inversor: InversorSeleccionado, tipoCombinacion: 'Recomendada' };
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.getCombinacionMediana(): ' +error });
			throw 'ErrorCotizacionController.getCombinacionMediana(): '+error;
        }
    }
    
    //@static
    async calcularViaticosComb(_Combinaciones, data){
        let _combinacion = [];
        let index = 0;

        try{
            let Cotizacion = {
                idUsuario: data.idUsuario,
                idCliente: data.idCliente,
                origen: data.origen,
                destino: data.destino,
                arrayBTI: null,
                tarifa: data.tarifa,
                consumos: data.consumos,
                descuento: parseInt(data.porcentajeDescuento),
                tipoCotizacion: 'CombinacionCotizacion'
            };
        
            for(let combinacion of _Combinaciones)
            {
                //Se *settea* la combinacion hacia la data
                _combinacion[0] = combinacion;
                Cotizacion.arrayBTI = _combinacion;
    
                //Calcular viaticos
                let Propuesta = await bajaTension.obtenerViaticos_Totales(Cotizacion);
    
                ///
                Propuesta.push({ tipoCombinacion: combinacion.tipoCombinacion });
    
                ///
                _Combinaciones[index] = Propuesta;
    
                ///
                index++;
            }
    
            return _Combinaciones;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.calcularViaticosComb(): ' +error });
			throw 'ErrorCotizacionController.calcularViaticosComb(): '+error;
        }
    }

    async filtrarEquiposSelectos(MatEquipoSelect, _equipos, combinacionName, recursive){
        /* Resumen: Retorna la coleccion filtrada de equipos configurados por *admin* para la cotizacion_mediana */
        let lstEquiposFiltrados = [];
        let tipoEquipo =  "inversor";

        try{
            if(typeof recursive != 'undefined'){
                MatEquipoSelect[combinacionName][tipoEquipo] = '*'
            }
    
            ///
            MateEquipoSelect =  MatEquipoSelect[combinacionName];
    
            //Identificar si son [PANELES] || [INVERSORES]
            if(_equipos[0].panel){
                tipoEquipo = "panel";
            }
    
            if(MateEquipoSelect[tipoEquipo] != "*"){
                ///Se obtiene la lista de -Marcas-
                let _lstMarcas = MateEquipoSelect[tipoEquipo].split(",");
                _lstMarcas = _lstMarcas.filter(Boolean); //Borrar los espacios en blanco del [array]
    
                ///Iteran las marcas (1 x 1)
                for(let marca of _lstMarcas){
                    //Filtrar los equipos pertenecientes a esa marca
                    _equipos.filter(equipo => {
                        if(equipo.panel){
                            equipo = equipo.panel;
                        }
    
                        if(equipo.vMarca === marca){
                            lstEquiposFiltrados.push(equipo);
                        }
                    });
                }
    
                ///
                if(lstEquiposFiltrados.length == 0){
                    return filtrarEquiposSelectos(MatEquipoSelect, _equipos, combinacionName, 1);
                }
    
                ///Equipos filtrados por -MARCA-
                _equipos = lstEquiposFiltrados;
            }
    
            return _equipos;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.filtrarEquiposSelectos(): ' +error });
			throw 'Error CotizacionController.filtrarEquiposSelectos(): '+error;
        }
    }
    /* #endregion */

    /*#region CRUD*/
    async insertar(objPropuesta){
        try{
            let Propuesta = typeof objPropuesta.propuesta === "object" ? objPropuesta.propuesta : JSON.parse(objPropuesta.propuesta); //Formating to Array
            Propuesta = Array.isArray(Propuesta) === true ? Propuesta[0] : Propuesta; //Formating
            let dataToSave = { panel: null, inversor: null, estructura: null, cliente: null, usuario: null, tipoCotizacion: null, consumoPromedioKw: null, /*(Bimestral o anual)*/ tarifa: null,  potenciaPropuesta: null, nuevoConsumoBimestralKw: null, nuevoConsumoAnualKw: null, descuento: null, porcentajePropuesta: null, totalSinIvaMXN: null, totalConIvaMXN: null, totalSinIvaUSD: null, totalConIvaUSD: null, statusProjectFV: 0, expiracion: 0 /* Dias de expiracion */ };
    
            /* #region Formating Data to Save PROPUESTA */
            dataToSave.cliente = { 
                id: Propuesta.cliente.idCliente,
                nombre: Propuesta.cliente.vNombrePersona + ' ' + Propuesta.cliente.vPrimerApellido + ' ' + Propuesta.cliente.vSegundoApellido
            } || null;
    
            dataToSave.usuario = {
                id: Propuesta.vendedor.idUsuario,
                nombre: Propuesta.vendedor.vNombrePersona + ' ' + Propuesta.vendedor.vPrimerApellido + ' ' + Propuesta.vendedor.vSegundoApellido
            } || null;
    
            dataToSave.tipoCotizacion = Propuesta.tipoCotizacion || null;
            dataToSave.totalSinIvaMXN = Propuesta.totales.precioMXNSinIVA || null;
            dataToSave.totalConIvaMXN = Propuesta.totales.precioMXNConIVA || null;
            dataToSave.totalSinIvaUSD = Propuesta.totales.precio || null;
            dataToSave.totalConIvaUSD = Propuesta.totales.precioMasIVA || null;
    
            dataToSave.expiracion = Propuesta.expiracion || null;
    
            if(Propuesta.tipoCotizacion != "individual"){
                dataToSave.consumoPromedioKw = parseFloat(Propuesta.promedioConsumosBimestrales) || null;
                dataToSave.tarifa = { vieja: Propuesta.power.old_dac_o_nodac, nueva: Propuesta.power.new_dac_o_nodac };
                dataToSave.porcentajePropuesta = Propuesta.power.porcentajePotencia || null;
            }
    
            dataToSave.descuento = Propuesta.descuento || null;
    
            if(Propuesta.paneles){
                dataToSave.panel = {
                    modelo: Propuesta.paneles.nombre || Propuesta.paneles.vNombreMaterialFot,
                    cantidad: Propuesta.paneles.noModulos
                } || null;
    
                dataToSave.potenciaPropuesta = Propuesta.paneles.potenciaReal;
            }
            
            if(Propuesta.estructura._estructuras != null){
                dataToSave.estructura = {
                    marca: Propuesta.estructura._estructuras.vMarca,
                    cantidad: Propuesta.estructura.cantidad
                } || null;
            }
    
            if(Propuesta.inversores){
                dataToSave.inversor = {
                    modelo: Propuesta.inversores.vNombreMaterialFot,
                    cantidad: Propuesta.inversores.numeroDeInversores
                } || null;
            }
    
            if(Propuesta.power){
                if(Propuesta.tipoCotizacion === "bajaTension" || Propuesta.tipCotizacion === "bajaTension" && Propuesta.tipoCotizacion === "CombinacionCotizacion"){ //BajaTension || BajaTension c/Commbinaciones
                    dataToSave.nuevoConsumoBimestralKw = Propuesta.power.nuevosConsumos.promedioNuevoConsumoBimestral || null;
                    dataToSave.nuevoConsumoAnualKw = Propuesta.power.nuevosConsumos.nuevoConsumoAnual || null;
                }
                else{ //MediaTension
                    dataToSave.nuevoConsumoBimestralKw = Propuesta.power.generacion.promedioGeneracionBimestral || null;
                    dataToSave.nuevoConsumoAnualKw = Propuesta.power.generacion.produccionAnualKwh || null;
                }
            }
            /* #endregion */
    
            let respuesta = await cotizacion.insertarBD(dataToSave);
            
            /*#region Agregados*/
            try{
                //Se valida que la propuesta tenga -Agregados-
                if(Propuesta.agregados._agregados != null){
                    let idPropuesta = respuesta.idPropuesta;
    
                    let _agregados = Propuesta.agregados._agregados;
    
                    //Iterar _agregados
                    for(i in _agregados)
                    {
                        let data = { idPropuesta: idPropuesta, cantidad: _agregados[i].cantidadAgregado, agregado: _agregados[i].nombreAgregado, costo: parseFloat(_agregados[i].precioAgregado) };
                        respuesta = await agregadoController.insertar(data);
    
                        if(respuesta.status === false){
                            throw respuesta.message;
                        }
                    }
                }
            }
            catch(error){
                await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.insertar[ agregados ](): ' +error });
			    throw 'Error CotizacionController.insertar[ agregados ](): '+error;
            }
            /*#endregion*/
    
            return respuesta;
        }
        catch(error){
            await Log.generateLog({ tipo: 'Error', contenido: 'CotizacionController.insertar(): ' +error });
			throw 'ErrorCotizacionController.insertar(): '+error;
        }
    }

    async eliminar(data){
        const result = cotizacion.eliminarBD(data);
        return result;
    }

    async consulta(data){
        const result = cotizacion.consultaBD(data);
        return result;
    }

    async buscar(data){
        const result = cotizacion.buscarBD(data);
        return result;
    }
    /*#endregion */
}

module.exports = CotizacionController;