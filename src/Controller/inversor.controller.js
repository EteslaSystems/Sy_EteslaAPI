const Inversor = require('../Entities/Inversor');

/*#region SI_SIRVE*/
async function getInversores_cotizacion(_data){
	let _arrayInversor = [];
	let data = _data;

	try{
		if(data.objPanelSelect.hasOwnProperty("potenciaNecesaria")){
			if(data.objPanelSelect.potenciaNecesaria.hasOwnProperty("potenciaNecesaria")){
				data = data.objPanelSelect;
	
				///potenciaNecesaria
				potenciaNecesaria = data.potenciaNecesaria.potenciaNecesaria; //watts
				///panel seleccionado
				data = data.panel;
			}
			else{ 
				potenciaNecesaria = JSON.parse(data.objPanelSelect.potenciaNecesaria);
				potenciaNecesaria = potenciaNecesaria.consumo.potenciaNecesaria;
				data = data.objPanelSelect.panel.panel;
			}
		}
		else{ ///MediaTension
			///panel seleccionado
			if(data.objPanelSelect.panel){
				data = data.objPanelSelect.panel
			}
			//BT
			data = data.objPanelSelect;
		}
	
		let allInversores = await Inversor.consultaBD();
		allInversores = allInversores.message;

		let potenciaReal_ = data.potenciaReal * 1000; ///Watss

		for(let Inversor of allInversores)
		{
			let noPaneles = parseInt(data.noModulos); //Numero de paneles de la propuesta
			let numeroDeInversores = 0;
			let potenciaNominal = 0;
			let costoTotal = 0;
	
			//DEFINICION DE CANTIDAD DE INVERSORES / MICROS
			if(Inversor.vTipoInversor === 'MicroInversor'){ //Calculo de MicroInversores
				numeroDeInversores =  Math.round(noPaneles / Inversor.iPanelSoportados);
			}
			else if(Inversor.vTipoInversor === 'Combinacion'){ ///Calculo de Combinacion de micro-inversores
				//Se valida el noPaneles, que sea >=5, para que pudiera aplicar para al menos 1 combinacion (6 paneles en total)
				if(noPaneles >= 5){
					//Obtener el nombre de equipo 1 y equipo2
					let Micros = await getEquiposCombinacionMicros(Inversor.vNombreMaterialFot);
					let MicroUno = Micros.primerEquipo;
					let MicroDos = Micros.segundoEquipo;

					//Se agregan la cantidad de equipos requeridos a -MicroUno- && -MicroDos-
					Object.assign(MicroUno,{
						numeroDeInversores: Math.round(noPaneles / MicroUno.iPanelSoportados)
					});

					//Se descuentan los paneles calculados anteriores de la cantidad original de [Paneles]
					noPaneles = Math.round(noPaneles - (MicroUno.numeroDeInversores * MicroUno.iPanelSoportados));


					//Se valida que haya paneles suficientes para poder hacer el calculo con el siguiente Micro
					if(noPaneles >= 1){
						let cantidadMicros = 0;

						cantidadMicros = Math.round(noPaneles / MicroDos.iPanelSoportados);

						Object.assign(MicroDos,{
							numeroDeInversores: cantidadMicros
						});
					}
					else{
						continue;
					}

					costoTotal = (MicroUno.numeroDeInversores * MicroUno.fPrecio) + (MicroDos.numeroDeInversores * MicroDos.fPrecio);

					//
					Object.assign(Inversor, {
						fPotencia: (MicroUno.fPotencia + MicroDos.fPotencia),
						costoTotal: costoTotal,
						numeroDeInversores: { MicroUno, MicroDos },
						combinacion: true
					});

					//
					_arrayInversor.push(Inversor);
				}
			}
			else{//Calculo de inversores /* Centrales */
				///
				numeroDeInversores = Math.round(potenciaReal_ / Inversor.fPotencia);
				potenciaNominal = numeroDeInversores * Inversor.fPotencia;

				///
				if(potenciaNominal === potenciaReal_){
					numeroDeInversores = numeroDeInversores;
				}
				else if(potenciaNominal > potenciaReal_ && potenciaNominal <= (potenciaReal_ + 1000/*watts*/) ){//Si la *potenciaNominal* es menor a *potenciaReal* se redimenciona
					if(potenciaNominal > potenciaReal_ && potenciaNominal <= Inversor.iPMAX){
						numeroDeInversores = numeroDeInversores;
					}
					else{
						numeroDeInversores = 0;
					}
				}
				else if(potenciaNominal > (potenciaReal_ + 1000/*watts*/)){
					numeroDeInversores = 0;
				}
			}
	
			//CALCULO DE COSTO_TOTAL DE INVERSORES
			if(numeroDeInversores >= 1 && Inversor.vTipoInversor != 'Combinacion'){
				//Calculo de precioTotal -Normal-
				costoTotal = Math.round((Inversor.fPrecio * numeroDeInversores)*100)/100; //Precio total de los inversores_totales
				
				//
				Object.assign(Inversor, {
					potenciaNominal: potenciaNominal,
					costoTotal: costoTotal,
					numeroDeInversores: numeroDeInversores,
					combinacion: false
				});
				
				///
				_arrayInversor.push(inversoresResult);
			}
		}

		return _arrayInversor;
	}
	catch(error){
		console.log(error);
	}
}

async function getEquiposCombinacionMicros(vNombreMaterialFotovoltaico){ ///Return: [Object]
	/* [Descripcion]
		Se extraen los equipos -MicroInversores(2)- de la combinacion para ser consultados.
		Devuelve un objeto con los microInversores y su data de los equipos.
	*/
	let NombresEquipos = { primerEquipo: null, segundoEquipo: null };
	let indice = 0;

	try{
		//Devuelve el total de caracteres de toda la cadena
		let totalDeCaracteres = vNombreMaterialFotovoltaico.length;

		//Equipo1
		indice = vNombreMaterialFotovoltaico.indexOf("+");
		NombresEquipos.primerEquipo = vNombreMaterialFotovoltaico.substring(0, indice);
		NombresEquipos.primerEquipo = await buscarInversorPorNombre({ vNombreMaterialFot: NombresEquipos.primerEquipo });
		NombresEquipos.primerEquipo = NombresEquipos.primerEquipo.message[0]; //Formating
			
		//Equipo2
		indice = NombresEquipos.primerEquipo.vNombreMaterialFot.length + 1;
		NombresEquipos.segundoEquipo = vNombreMaterialFotovoltaico.substring(indice,totalDeCaracteres);
		NombresEquipos.segundoEquipo = await buscarInversorPorNombre({ vNombreMaterialFot: NombresEquipos.segundoEquipo });
		NombresEquipos.segundoEquipo = NombresEquipos.segundoEquipo.message[0]; //Formating

		return NombresEquipos;
	}
	catch(error){
		throw error;
	}
}
/*#endregion*/

module.exports.obtenerInversores_cotizacion = async function(data){
	const result = await getInversores_cotizacion(data);
	return result;
}

module.exports.insertar = async function (datas) {
	const result = await Inversor.insertarBD(datas);
	return result;
}

module.exports.eliminar = async function (datas) {
	const result = await Inversor.eliminarBD(datas);
	return result;
}

module.exports.buscar = async function (idInversor) {
	const result = await Inversor.buscarBD(idInversor);
	return result;
}

module.exports.editar = async function (datas) {
	const result = await Inversor.editarBD(datas);
	return result;
}

module.exports.consultar = async function () {
	const result = await Inversor.consultaBD();
	return result;
}

module.exports.consultarTipoEquipos = async function(vTipoInversor){
	const result = await Inversor.buscarTipoInversor(vTipoInversor);
	return result;
}

module.exports.consultarEquipoPorNombre = async function(vNombreMaterialFot){
	const result = await Inversor.buscarInversorPorNombre(vNombreMaterialFot);
	return result;
}