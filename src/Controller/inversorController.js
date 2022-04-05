/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');
const Accesorio = require('../Controller/accesorioEspecialController');
const Monitoreo = require('../Controller/monitoreoController');

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
async function getInversoresCotizacion(data){
	let _InversoresResult = [];
	let _Accesorios = {}; //Puede ser 1 objeto o 1 array de objetos

	try{
		let { potenciaReal, numeroPaneles, potenciaPanel } = data;
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
					noPaneles: Number(numeroPaneles),
					potenciaReal: null,
					potenciaPanel: Number(potenciaPanel)
				});
				
				Object.assign(MicroUno,{
					numeroDeInversores: Result.numeroEquipos,
					costoTotal: Result.precioTotal,
					potenciaNominal: Result.potenciaNominal
				});
				/*#endregion */

				//Descontar *No. Paneles*
				numeroPaneles = numeroPaneles - (Result.numeroEquipos * (MicroUno.siNumeroCanales * MicroUno.siPanelSoportados));

				/*#region MicroInversor2*/
				let MicroDos = Micros.segundoEquipo;
				Result = calcularEquipos({
					Inversor: MicroDos,
					noPaneles: Number(numeroPaneles),
					potenciaReal: null,
					potenciaPanel: Number(potenciaPanel)
				});
				Object.assign(MicroDos,{
					numeroDeInversores: Result.numeroEquipos,
					costoTotal: Result.precioTotal,
					potenciaNominal: Result.potenciaNominal
				});
				/*#endregion */

				//Modificar [fPotencia] del objeto [Inversor => CombinacionMicros]
				Inversor.fPotencia = MicroUno.fPotencia + MicroDos.fPotencia;

				//Objeto [Inversor] a * pushear *
				Object.assign(Inversor,{
					costoTotal: MicroUno.costoTotal + MicroDos.costoTotal,
					numeroDeInversores: { MicroUno, MicroDos },
					potenciaNominal: MicroUno.potenciaNominal + MicroDos.potenciaNominal,
					combinacion: true
				});
			}
			else{ /* [Inversor] && [MicroInversor] */
				//
				Result = calcularEquipos({ 
					Inversor,
					noPaneles: Number(numeroPaneles), 
					potenciaReal: Number(potenciaReal), 
					potenciaPanel: Number(potenciaPanel) 
				});

				//
				if(Result != null){
					//Objeto [Inversor] a * pushear *
					Object.assign(Inversor,{
						numeroDeInversores: Result.numeroEquipos,
						costoTotal: Result.precioTotal,
						potenciaNominal: Result.potenciaNominal,
						combinacion: false
					});

					//Validar si es un [MicroInversor] para validar si cuenta con [accesorio_especial]
					if(Inversor.vTipoInversor === "MicroInversor"){
						let costoTotalAccesorios = 0; //USD

						//Validar si el [MicroInversor] tiene [accesorio_especial]
						if(Inversor.bAccesorio == 1){
							//[Accesorio_Especial]
							_Accesorios = await Accesorio.calcular(Inversor)
							_Accesorios.filter(Accesorio => { costoTotalAccesorios += Accesorio.costoTotal });

							//Agregar propiedades extras
							Object.assign(Inversor,{ Accesorios: _Accesorios });
						}

						//Validar si el [MicroInversor] tiene [monitoreo]
						// if(Inversor.bMonitoreo == 1){
						// 	let costoMonitoreo = 0; //USD

						// 	//[Monitoreo]
						// 	costoMonitoreo = await Monitoreo.leer(Inversor.idInversor);
						// 	costoTotalMonitoreo = costoMonitoreo.fPrecio;

						// 	//
						// 	Object.assign(Inversor, { costoMonitoreo });
						// }

						//Modificar el [costoTotal] anterior para contemplar el -costoTotalAccesorios-
						Inversor.costoTotal = Inversor.costoTotal + costoTotalAccesorios /*+ costoTotalMonitoreo*/;
					}
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
	let potenciaNominal = 0;

	try{
		let { Inversor, noPaneles, potenciaReal, potenciaPanel } = data;

		let cantidadPaneles = noPaneles;

		if(Inversor.vTipoInversor === 'Inversor'){ /*[InversorCentral]*/
			numeroEquipos = Math.round(potenciaReal / Inversor.fPotencia);
			potenciaNominal = numeroEquipos * Inversor.fPotencia;
			let potenciaNominalRedimenArriba = potenciaNominal * 1.25;
			let potenciaNominalRedimenAbajo = potenciaNominal - ((25/100) * potenciaNominal);

			///
			if(potenciaNominal === potenciaReal || (potenciaNominalRedimenAbajo <= potenciaReal && potenciaNominalRedimenArriba  >= potenciaReal) && potenciaNominal <= (potenciaReal + 1500/*Watts*/)){
				numeroEquipos = numeroEquipos;
			}
			else{
				numeroEquipos = 0;
			}
		}
		else{ /*[MicroInversor]*/
			let totalMicros = 0;
			let totalPanelesSoportados = Inversor.siNumeroCanales * Inversor.siPanelSoportados;

			/* Se obtiene RANGOS de potencia del -[Panel]- permitido */
			/*#region Obtener [rango1] && [rango2]*/
			/*[Rango1]*/
			let totalCaracteres = Inversor.vRangPotenciaPermit.length;
			let indice = Inversor.vRangPotenciaPermit.indexOf("-");
			let rangoMenor = Number(Inversor.vRangPotenciaPermit.substring(0, indice));
			/*[Rango2]*/
			let rangoMayor = Number(Inversor.vRangPotenciaPermit.substring(indice+1, totalCaracteres));
			/*#endregion */

			/* Validar que la potencia del [Panel] se encuentre dentro de la indicada para el MicroInversor [.vRangPotenciaPermit] */
			if(potenciaPanel >= rangoMenor && potenciaPanel <= rangoMayor){
				//
				if(noPaneles >= totalPanelesSoportados){ /* Todos los [MicroInversores] que soportan 1 Panel por canal */
					///
					numeroEquipos = Math.round(noPaneles / totalPanelesSoportados);
					noPaneles -= (totalPanelesSoportados * numeroEquipos);
					totalMicros += numeroEquipos;

					///
					if(noPaneles >= Inversor.siPanelSoportados){
						numeroEquipos = Math.round(noPaneles / Inversor.siPanelSoportados);
						noPaneles -= (Inversor.siPanelSoportados * numeroEquipos);
						totalMicros += numeroEquipos;
					}
				}
				else if(noPaneles % 2 == 0){/* [DS3D] - Todos los [MicroInversores] que soportan 2 o mas paneles por canal */
					totalMicros = Math.round(noPaneles / totalPanelesSoportados);
				}				
			}

			///
			potenciaNominal = totalMicros * Inversor.fPotencia;
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

			///
			precioTotal = Math.round(precioTotal * 100) / 100;

			/*[ Result ]*/
			return { numeroEquipos, precioTotal, potenciaNominal };
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
	const result = await getInversoresCotizacion(data);
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