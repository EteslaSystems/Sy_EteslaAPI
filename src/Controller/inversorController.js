/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD(datas) {
	const { vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
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
	const { idInversor, deleted_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
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
	const { idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vTipoInversor, vNombreMaterialFot, vMarca, fPotencia, iPanelSoportados, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, null, updated_at, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}

				resolve (response);
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
	let arrayInversor = [];
	let combinacion = false;
	let noPaneles = 0; //No. paneles a instalar
	let numeroDeInversores = 0;

	try{
		let allInversores = await consultaBD();
		allInversores = allInversores.message;

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
			data = data = data.objPanelSelect.panel;
		}
	
		potenciaReal_= parseFloat(data.potenciaReal);
		potenciaReal_ = potenciaReal_ * 1000; ///Watss 
	
		for(let i = 0; i < allInversores.length; i++)
		{
			let invSoportMay = 0;
			let invSoportMen = 0;
			noPaneles = parseFloat(data.noModulos);
			redimensinoamiento = allInversores[i].fPotencia * 1.25;
	
			if(allInversores[i].vTipoInversor === 'Microinversor'){ //Calculo de MicroInversores
				numeroDeInversores =  noPaneles / allInversores[i].iPanelSoportados;
			}
			else if(allInversores[i].vTipoInversor === 'Combinacion'){ ///Combinacion de micros
				/***Soporte de micros para combinacion *-* QS1 + YC600
					-QS1 => 4 paneles
					-YC600 => 2 paneles 
				*/
	
				//Se valida el noPaneles, que sea >6, para que pudiera aplicar para al menos 1 combinacion (6 paneles en total)
				if(noPaneles >= 6){
					//Cantidad de micros del modelo QS1
					invSoportMay = Math.floor(noPaneles / 4);
					noPaneles = noPaneles - (invSoportMay * 4);
	
					invSoportMen = noPaneles >= 1 ? Math.round(noPaneles / 2) : 0;
					noPaneles = noPaneles - (invSoportMen * 2);
	
					cantidadTotalEquipos = invSoportMay+invSoportMen;
	
					numeroDeInversores = { invSoportMay: invSoportMay, invSoportMen:invSoportMen, cantidadTotalEquipos: cantidadTotalEquipos };
	
					combinacion = true;
				}
				else{
					numeroDeInversores = 0;
				}
			}
			else{//Calculo de inversores
				numeroDeInversores = potenciaReal_ / redimensinoamiento;
			}
	
			if(combinacion === false && numeroDeInversores > 0){
				numeroDeInversores = numeroDeInversores < 1 ? 0 : Math.round(numeroDeInversores);
				
				if(numeroDeInversores > 0){
					_potenciaPicoInversor = Math.round((potenciaReal_ / numeroDeInversores) * 100) / 100;
					porcentajeSobreDimens = Math.round(((_potenciaPicoInversor / allInversores[i].fPotencia) * 100) * 100)/100;
					potenciaNominal = numeroDeInversores *  allInversores[i].fPotencia;
	
					precioTotal = Math.round((allInversores[i].fPrecio * numeroDeInversores)*100)/100; //Precio total de los inversores_totales
					
					inversoresResult = {
						id: allInversores[i].idInversor,
						fISC: allInversores[i].fISC,
						fPotencia: allInversores[i].fPotencia,
						fPrecio: allInversores[i].fPrecio,
						iPMAX: allInversores[i].iPMAX,
						iPMIN: allInversores[i].iPMIN,
						iVMAX: allInversores[i].iVMAX,
						iVMIN: allInversores[i].iVMIN,
						vGarantia: allInversores[i].vGarantia,
						vMarca: allInversores[i].vMarca,
						vNombreMaterialFot: allInversores[i].vNombreMaterialFot,
						vOrigen: allInversores[i].vOrigen,
						vTipoMoneda: allInversores[i].vTipoMoneda,
						precioTotal: precioTotal,
						numeroDeInversores: numeroDeInversores,
						porcentajeSobreDimens: porcentajeSobreDimens,
						potenciaNominal: potenciaNominal,
						potenciaPico: _potenciaPicoInversor,
						combinacion: combinacion,
						imgRuta: null
					};
	
					arrayInversor.push(inversoresResult);
				}
			}
			else if(combinacion === true){ //combinacion - QS1+YC600
				/*#region CostoTotal_combinacion - QS1+YC600*/
				costoTotalInvSMay = allInversores.filter(function(inversor){ return inversor.vNombreMaterialFot === 'Microinversor APS QS1' });
				costoTotalInvSMay = Math.round((costoTotalInvSMay[0].fPrecio * invSoportMay)*100)/100;
				costoTotalInvSMen = allInversores.filter(function(inversor){ return inversor.vNombreMaterialFot === 'Microinversor APS YC600' });
				costoTotalInvSMen = Math.round((costoTotalInvSMen[0].fPrecio * invSoportMen)*100)/100;
				precioTotal = costoTotalInvSMay + costoTotalInvSMen;
				/*#endregion*/
	
				inversoresResult = {
					id: allInversores[i].idInversor,
					fISC: allInversores[i].fISC,
					fPotencia: allInversores[i].fPotencia,
					fPrecio: allInversores[i].fPrecio,
					iPMAX: allInversores[i].iPMAX,
					iPMIN: allInversores[i].iPMIN,
					iVMAX: allInversores[i].iVMAX,
					iVMIN: allInversores[i].iVMIN,
					vGarantia: allInversores[i].vGarantia,
					vMarca: allInversores[i].vMarca,
					vNombreMaterialFot: allInversores[i].vNombreMaterialFot,
					vOrigen: allInversores[i].vOrigen,
					vTipoMoneda: allInversores[i].vTipoMoneda,
					precioTotal: precioTotal,
					numeroDeInversores: numeroDeInversores,
					porcentajeSobreDimens: null,
					potenciaNominal: null,
					potenciaPico: null,
					combinacion: combinacion,
					imgRuta: null
				};
				
				arrayInversor.push(inversoresResult);
				combinacion = false;
			}
		}

		return arrayInversor;
	}
	catch(error){
		console.log(error);
	}
}

module.exports.obtenerInversores_cotizacion = async function(data){
	const result = await getInversores_cotizacion(data);
	return result;
}
/*#endregion*/



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

