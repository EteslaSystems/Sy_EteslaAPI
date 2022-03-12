/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD(datas) {
	let { vTipoInversor, vNombreMaterialFot, vInversor1, vInversor2, vMarca, fPotencia, siPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN } = datas;

	if(vTipoInversor === 'Combinacion'){
		vNombreMaterialFot = vInversor1 + '+' + vInversor2;
	}

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, siPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
	const { idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, siPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, imgRuta } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, siPanelSoportados, fPrecio, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, vTipoInversor, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
		mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, vNombreMaterialFot, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
async function getInversores_cotizacion(data){
	let _InversoresResult = [];

	try{
		let { potenciaReal, numeroPaneles } = data;
		potenciaReal = potenciaReal != null ? potenciaReal * 1000 : potenciaReal;

		let allInversores = await consultaBD();
		allInversores = allInversores.message;

		for(let Inversor of allInversores)
		{
			let Result = {};

			///Combinaciones de -MicroInversores-
			if(Inversor.vTipoInversor === "Combinacion"){
				/* Obtener el -Equipo1- & -Equipo2- (por separado) */
				let Micros = await getEquiposCombinacionMicros(Inversor.vNombreMaterialFot);
				
				/*#region MicroInversor1*/
				let MicroUno = Micros.primerEquipo;
				Result = calcularEquipos({
					Inversor: MicroUno,
					noPaneles: numeroPaneles,
					potenciaReal: null
				});
				
				Object.assign(MicroUno,{
					numeroDeInversores: Result.numeroEquipos,
					costoTotal: Result.precioTotal
				});
				/*#endregion */

				//Descontar *No. Paneles*
				numeroPaneles = numeroPaneles - (Result.numeroEquipos * (MicroUno.siNumeroCanales * MicroUno.siPanelSoportados));

				/*#region MicroInversor2*/
				let MicroDos = Micros.segundoEquipo;
				Result = calcularEquipos({
					Inversor: MicroDos,
					noPaneles: numeroPaneles,
					potenciaReal: null
				});
				Object.assign(MicroDos,{
					numeroDeInversores: Result.numeroEquipos,
					costoTotal: Result.precioTotal
				});
				/*#endregion */

				//Modificar [fPotencia] del objeto [Inversor => CombinacionMicros]
				Inversor.fPotencia = MicroUno.fPotencia + MicroDos.fPotencia;

				//Objeto [Inversor] a * pushear *
				Object.assign(Inversor,{
					costoTotal: MicroUno.costoTotal + MicroDos.costoTotal,
					numeroDeInversores: { MicroUno, MicroDos },
					combinacion: true
				});
			}
			else{ /* [Inversor] && [MicroInversor] */
				Result = calcularEquipos({ Inversor, noPaneles: numeroPaneles, potenciaReal });

				if(Result != null){
					//Objeto [Inversor] a * pushear *
					Object.assign(Inversor,{
						numeroDeInversores: Result.numeroEquipos,
						costoTotal: Result.precioTotal,
						combinacion: false
					});
				}
			}

			//
			if(Result != null){
				//Push[]
				_InversoresResult.push(Inversor);
			}
		}

		return _InversoresResult;
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

//@static
function calcularEquipos(data){
	let numeroEquipos = 0;
	let precioTotal = 0;

	try{
		let { Inversor, noPaneles, potenciaReal } = data;

		let cantidadPaneles = noPaneles;

		if(Inversor.vTipoInversor === 'Inversor'){ /*[InversorCentral]*/
			numeroEquipos = Math.round(potenciaReal / Inversor.fPotencia);
			let potenciaNominal = numeroEquipos * Inversor.fPotencia;
			potenciaNominalRedimenArriba = potenciaNominal * 1.25;
			potenciaNominalRedimenAbajo = potenciaNominal - ((25/100) * potenciaNominal);

			///
			if(potenciaNominal === potenciaReal || (potenciaNominalRedimenAbajo <= potenciaReal && potenciaNominalRedimenArriba  >= potenciaReal)){
				numeroEquipos = numeroEquipos;
			}
			else if((potenciaNominalRedimenAbajo <= potenciaReal && potenciaNominalRedimenArriba  >= potenciaReal) && potenciaNominal <= (potenciaReal + 1000/*Watts*/)){
				numeroEquipos = numeroEquipos;
			}
			else{
				numeroEquipos = 0;
			}
		}
		else{ /*[MicroInversor]*/
			let totalMicros = 0;
			let totalPanelesSoportados = Inversor.siNumeroCanales * Inversor.siPanelSoportados;

			///
			if(noPaneles >= totalPanelesSoportados){
				numeroEquipos = Math.round(noPaneles / totalPanelesSoportados);
				noPaneles -= (totalPanelesSoportados * numeroEquipos);
				totalMicros += numeroEquipos;
			}

			///
			if(noPaneles >= Inversor.siPanelSoportados){
				numeroEquipos = Math.round(noPaneles / Inversor.siPanelSoportados);
				noPaneles -= (Inversor.siPanelSoportados * numeroEquipos);
				totalMicros += numeroEquipos;
			}

			///
			numeroEquipos = totalMicros;
		}

		//Calcular costo totales de los equipos
		if(numeroEquipos > 0){
			precioTotal = numeroEquipos * Inversor.fPrecio;

			/*[??]*/
			if(Inversor.vTipoInversor === 'MicroInversor'){
				switch(Inversor.vMarca)
				{
					case 'Enphase':
						precioTotal = (numeroEquipos * Inversor.fPrecio) + 232.3 + ((cantidadPaneles/4)*33);
					break;
					case 'Solaredge':
						precioTotal = (numeroEquipos * Inversor.fPrecio) + (cantidadPaneles*54.83);
					break;
					case 'APSystem':
						if(Inversor.vNombreMaterialFot.match(/YC600/g) != null){
							precioTotal = (((numeroEquipos - 1) * 300) + 170.9) + (cantidadPaneles * 13.775) + 144.9;
							precioTotal = Math.round(precioTotal * 100) / 100;
						}
						else{
							precioTotal = (numeroEquipos * 300) + (cantidadPaneles * 13.775) + 144.9;
						}
					break;
					default:
						precioTotal;
					break;
				}
			}

			/*[ Result ]*/
			return { numeroEquipos, precioTotal };
		}

		return null;
	}
	catch(error){
		console.log(error);
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