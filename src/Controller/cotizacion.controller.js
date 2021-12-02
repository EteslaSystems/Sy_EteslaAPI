/*
- @description: 		Combinaciones (Busqueda inteligente)
- @author: 				LH420
- @date: 				20/03/2020
*/
const bajaTension = require('./bajaTensionController');
const mediaTension = require('./mediaTensionController');
const configFile = require('./configFileController');
const cliente = require('../Controller/clienteController');
const vendedor = require('./usuario.controller');

/*#region Busqueda_inteligente*/
async function mainBusquedaInteligente(data){
    let tipoCotizacion = data.tipoCotizacion;
    let __combinaciones = [];

    try{
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
            let MatrizEquiposSeleccionados = await configFile.getArrayOfConfigFile();
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

        __combinaciones[0] = objCombinaciones;

        return __combinaciones;
    }
    catch(error){
        console.log(error);
    }
}

/*#region Combinaciones*/
async function getCombinacionEconomica(_paneles, matrizEquipos){
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
        console.log(error);
    }
}

async function getCombinacionPremium(_paneles, matrizEquipos){//MayorProduccion
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
        console.log(error);
    }
}

async function getCombinacionMediana(_paneles, matrizEquipos){//Mediana
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
        throw error;
    }
}

async function calcularViaticosComb(_Combinaciones, data){
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
    let _combinacion = [];
    let index = 0;

    try{
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
        console.log(error);
    }
}

function filtrarEquiposSelectos(MatEquipoSelect, _equipos, combinacionName, recursive){ ///Return: [Array]
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
        console.log(error);
    }
}
/*#endregion*/
/*#endregion*/

module.exports.mainBusqInteligente = async function(data){
    const result = await mainBusquedaInteligente(data);
    return result;
}