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
	let inversoresResult = {};
	let arrayInversor = [];
	let noPaneles = 0, numeroDeInversores = 0; //No. paneles a instalar
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

		let potenciaReal_= parseFloat(data.potenciaReal);
		potenciaReal_ = potenciaReal_ * 1000; ///Watss 
	
		for(let i = 0; i < allInversores.length; i++)
		{
			noPaneles = parseFloat(data.noModulos); //Numero de paneles de la propuesta
	
			//DEFINICION DE CANTIDAD DE INVERSORES / MICROS
			if(allInversores[i].vTipoInversor === 'Microinversor'){ //Calculo de MicroInversores
				numeroDeInversores =  Math.floor(noPaneles / allInversores[i].iPanelSoportados);
			}
			else if(allInversores[i].vTipoInversor === 'Combinacion'){ ///Calculo de Combinacion de micro-inversores
				//Se valida el noPaneles, que sea >=5, para que pudiera aplicar para al menos 1 combinacion (6 paneles en total)
				if(noPaneles >= 5){
					let Micros = {}, MicroUno = {}, MicroDos = {};
					let costoTotalEquipos = 0;

					//Obtener el nombre de equipo 1 y equipo2
					Micros = await getEquiposCombinacionMicros(allInversores[i].vNombreMaterialFot);
					MicroUno = Micros.primerEquipo;
					MicroDos = Micros.segundoEquipo;

					//Se agregan la cantidad de equipos requeridos a -MicroUno- && -MicroDos-
					Object.assign(MicroUno,{
						numeroDeInversores: parseInt(noPaneles / MicroUno.iPanelSoportados)
					});

					//Se descuentan los paneles calculados anteriores de la cantidad original de [Paneles]
					noPaneles = noPaneles - (MicroUno.numeroDeInversores * MicroUno.iPanelSoportados);

					//Se valida que haya paneles suficientes para poder hacer el calculo con el siguiente Micro
					if(noPaneles >= 1){
						let cantidadMicros = 0;

						cantidadMicros = noPaneles / MicroDos.iPanelSoportados;
						cantidadMicros = cantidadMicros < 1 && cantidadMicros > 0 ? Math.ceil(cantidadMicros) : Math.round(cantidadMicros);

						Object.assign(MicroDos,{
							numeroDeInversores: cantidadMicros
						});
					}

					costoTotalEquipos = (MicroUno.numeroDeInversores * MicroUno.fPrecio) + (MicroDos.numeroDeInversores * MicroDos.fPrecio);

					//
					inversoresResult = {
						id: allInversores[i].idInversor,
						fPotencia: (MicroUno.fPotencia + MicroDos.fPotencia),
						vMarca: MicroUno.vMarca,
						vNombreMaterialFot: allInversores[i].vNombreMaterialFot,
						costoTotal: costoTotalEquipos,
						numeroDeInversores: { MicroUno, MicroDos },
						vGarantia: MicroUno.vGarantia,
						vOrigen: allInversores[i].vOrigen,
						combinacion: true
					}
				}
				//
				arrayInversor.push(inversoresResult);
			}
			else{//Calculo de inversores /* Centrales */
				//Redimensionamento_Inversor [25%]
				let redimensionamientoAbajo = allInversores[i].fPotencia - ((25 / 100) * allInversores[i].fPotencia); ///PMIN
				let redimenSionamientoArriba = allInversores[i].fPotencia + ((25 / 100) * allInversores[i].fPotencia); ///PMAX

				if(potenciaReal_ >= redimensionamientoAbajo && potenciaReal_ <= redimenSionamientoArriba){
					numeroDeInversores = Math.ceil(potenciaReal_ / redimenSionamientoArriba);
				}
			}
	
			//CALCULO DE COSTO_TOTAL DE INVERSORES
			if(numeroDeInversores >= 1 && allInversores[i].vTipoInversor != 'Combinacion'){
				//Calculo de precioTotal -Normal-
				precioTotal = Math.round((allInversores[i].fPrecio * numeroDeInversores)*100)/100; //Precio total de los inversores_totales
				
				inversoresResult = {
					id: allInversores[i].idInversor,
					fPotencia: allInversores[i].fPotencia,
					fPrecio: allInversores[i].fPrecio,
					vMarca: allInversores[i].vMarca,
					vNombreMaterialFot: allInversores[i].vNombreMaterialFot,
					costoTotal: precioTotal,
					numeroDeInversores: numeroDeInversores,
					imgRuta: allInversores[i].imgRuta,
					vGarantia: allInversores[i].vGarantia,
					vOrigen: allInversores[i].vOrigen,
					combinacion: false
				}
			
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
	let totalDeCaracteres = 0, indice = 0;

	//Devuelve el total de caracteres de toda la cadena
	totalDeCaracteres = vNombreMaterialFotovoltaico.length;

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