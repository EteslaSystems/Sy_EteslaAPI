/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD(datas) {
	let { vTipoInversor, vNombreMaterialFot, vInversor1, vInversor2, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta } = datas;

	if(vTipoInversor === 'Combinacion'){
		vNombreMaterialFot = vInversor1 + '+' + vInversor2;
	}

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta], (error, rows) => {
				if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

function eliminarBD(datas) {
	const { idInversor } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

function editarBD(datas) {
	const { idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

function consultaBD() {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

function buscarBD(datas) {
	const { idInversor } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

function buscarTipoInversor(datas){
	const { vTipoInversor } = datas;

	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, vTipoInversor, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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

function buscarInversorPorNombre(datas){
	const { vNombreMaterialFot } = datas;

	return new Promise ((resolve, reject) => {
		mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, vNombreMaterialFot, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				reject(response);
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
/*#region LH420*/
/*
- @description: 		Funciones para la cotizacion de media tension
- @author: 				LH420
- @date: 				07/04/2020
*/

/*#region SI_SIRVE*/
async function getInversores_cotizacion(_data){
	let inversoresResult = null;
	let arrayInversor = [];
	let precioTotal = 0;
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
	
		let allInversores = await consultaBD();
		allInversores = allInversores.message;

		let potenciaReal_ = data.potenciaReal * 1000; ///Watss

		for(let Inversor of allInversores)
		{
			let noPaneles = parseInt(data.noModulos); //Numero de paneles de la propuesta
			let numeroDeInversores = 0;
			let potenciaNominal = 0;
	
			//DEFINICION DE CANTIDAD DE INVERSORES / MICROS
			if(Inversor.vTipoInversor === 'MicroInversor'){ //Calculo de MicroInversores
				numeroDeInversores =  Math.round(noPaneles / Inversor.iPanelSoportados);
			}
			else if(Inversor.vTipoInversor === 'Combinacion'){ ///Calculo de Combinacion de micro-inversores
				//Se valida el noPaneles, que sea >=5, para que pudiera aplicar para al menos 1 combinacion (6 paneles en total)
				if(noPaneles >= 5){
					let costoTotalEquipos = 0;

					//Obtener el nombre de equipo 1 y equipo2
					let Micros = await getEquiposCombinacionMicros(Inversor.vNombreMaterialFot);
					let MicroUno = Micros.primerEquipo;
					let MicroDos = Micros.segundoEquipo;

					numeroDeInversores = Math.floor(noPaneles / MicroUno.iPanelSoportados);

					//Se agregan la cantidad de equipos requeridos a -MicroUno- && -MicroDos-
					Object.assign(MicroUno,{
						numeroDeInversores: numeroDeInversores
					});

					//Se descuentan los paneles calculados anteriores de la cantidad original de [Paneles]
					noPaneles = Math.round(noPaneles - (MicroUno.numeroDeInversores * MicroUno.iPanelSoportados));

					//Se valida que haya paneles suficientes para poder hacer el calculo con el siguiente Micro
					if(noPaneles >= 1){
						numeroDeInversores = Math.ceil(noPaneles / MicroDos.iPanelSoportados);

						Object.assign(MicroDos,{
							numeroDeInversores: numeroDeInversores
						});
					}
					else{
						continue;
					}

					//
					costoTotalEquipos = (MicroUno.numeroDeInversores * MicroUno.fPrecio) + (MicroDos.numeroDeInversores * MicroDos.fPrecio);

					//
					inversoresResult = {
						id: Inversor.idInversor,
						fPotencia: (MicroUno.fPotencia + MicroDos.fPotencia),
						vMarca: MicroUno.vMarca,
						vNombreMaterialFot: Inversor.vNombreMaterialFot,
						costoTotal: costoTotalEquipos,
						numeroDeInversores: { MicroUno, MicroDos },
						vGarantia: MicroUno.vGarantia,
						vOrigen: Inversor.vOrigen,
						combinacion: true
					}
					//
					arrayInversor.push(inversoresResult);
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
				precioTotal = Math.round((Inversor.fPrecio * numeroDeInversores)*100)/100; //Precio total de los inversores_totales
				
				inversoresResult = {
					id: Inversor.idInversor,
					fPotencia: parseFloat(Inversor.fPotencia),
					potenciaNominal: potenciaNominal,
					fPrecio: Inversor.fPrecio,
					vMarca: Inversor.vMarca,
					vNombreMaterialFot: Inversor.vNombreMaterialFot,
					costoTotal: precioTotal,
					numeroDeInversores: numeroDeInversores,
					imgRuta: Inversor.imgRuta,
					vGarantia: Inversor.vGarantia,
					vOrigen: Inversor.vOrigen,
					combinacion: false
				}
				///
				arrayInversor.push(inversoresResult);
			}
		}

		return arrayInversor;
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
	const result = await insertarBD(datas);
	return result;
}

module.exports.eliminar = async function (datas) {
	const result = await eliminarBD(datas);
	return result;
}

module.exports.buscar = async function (idInversor) {
	const result = await buscarBD(idInversor);
	return result;
}

module.exports.editar = async function (datas) {
	const result = await editarBD(datas);
	return result;
}

module.exports.consultar = async function () {
	const result = await consultaBD();
	return result;
}

module.exports.consultarTipoEquipos = async function(vTipoInversor){
	const result = await buscarTipoInversor(vTipoInversor);
	return result;
}

module.exports.consultarEquipoPorNombre = async function(vNombreMaterialFot){
	const result = await buscarInversorPorNombre(vNombreMaterialFot);
	return result;
}