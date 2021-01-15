/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');
const { all } = require('../Routes/web');

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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
async function getFilteredInvestor(idInversor){
	consultaFiltradaInversor = await buscarBD(idInversor);
	consultaFiltradaInversor = consultaFiltradaInversor.message;
	arrayInversores = consultaFiltradaInversor;
	return arrayInversores;
}

async function getInversores_cotizacion(data){
	var arrayInversor = [];
	allInversores = await consultaBD();
	allInversores = allInversores.message;

	if(data.objPanelSelect){
		data = data.objPanelSelect;
	}

	potenciaReal_= parseFloat(data.potenciaReal);
	potenciaReal_ = potenciaReal_ * 1000; ///Watss - Kw ===> wtts

	for(var i = 0; i < allInversores.length; i++)
	{
		redimensinoamiento = allInversores[i].fPotencia * 1.25;

		//Aca se calcula el numero de Inversores/Micros dependiendo 
		if(allInversores[i].vTipoInversor === 'Microinversor'){
			numeroDeInversores = parseFloat(data.noModulos) / allInversores[i].iPanelSoportados;
		}
		else{
			numeroDeInversores = potenciaReal_ / redimensinoamiento;
		}

		numeroDeInversores = numeroDeInversores < 0.9 ? 0 : Math.round(numeroDeInversores);

		if(numeroDeInversores > 0){
			_potenciaPicoInversor = Math.round((potenciaReal_ / numeroDeInversores) * 100) / 100;
			PMIN_inversor = allInversores[i].iPMIN
			PMAX_inversor = allInversores[i].iPMAX;
			porcentajeSobreDimens = Math.round(((_potenciaPicoInversor / allInversores[i].fPotencia) * 100) * 100)/100;
			potenciaNominal = numeroDeInversores *  allInversores[i].fPotencia;

			if(_potenciaPicoInversor > PMIN_inversor && _potenciaPicoInversor < PMAX_inversor){
				precioTotal = Math.round((allInversores[i].fPrecio * numeroDeInversores)*100)/100; //Precio total de los inversores_totales
				
				inversoresResult = {
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
					potenciaPico: _potenciaPicoInversor
				};


				//Se agrega el elemento al array de inversores_seleccionados
				arrayInversor.push(inversoresResult);
			}
		}
	}
	
	return arrayInversor;
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

