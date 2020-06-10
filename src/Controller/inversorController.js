/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
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

function editarBD (datas) {
	const { idInversor, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, iVMIN, iVMAX, iPMAX, iPMIN, null, updated_at, null], (error, rows) => {
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

function consultaBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function buscarBD (idInversor) {
	//const { idInversor } = datas;
	var _idInversor = idInversor;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, _idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
var objInversores = {
	nombreInversor: '',
	potenciaInversor: 0,
	precioInversor: 0,
	potenciaNominalInversor: 0,
	potenciaMaximaInversor: 0,
	numeroDeInversores: 0
};

// async function numberOfInvestors(NumberOfPanelesArray){
// 	var result = await getMaximumPower(NumberOfPanelesArray);
// 	return result;
// }

// async function getMaximumPower(NumberOfPanelesArray){
// 	var arrayInversoresWPmx = [];

// 	for(var j = 0; j < NumberOfPanelesArray.length; j++)
// 	{
// 		_nombrePanel = NumberOfPanelesArray[j].nombre;
// 		_marcaPanel = NumberOfPanelesArray[j].marca;
// 		_potenciaPanel = NumberOfPanelesArray[j].potencia;
// 		_potenciaReal = NumberOfPanelesArray[j].potenciaReal;
// 		_cantidadPaneles = NumberOfPanelesArray[j].noModulos;
// 		_precioPorWatt = NumberOfPanelesArray[j].precioPorPanel;
// 		_costoDeEstructuras = NumberOfPanelesArray[j].costoDeEstructuras;
		
// 		objInversores {
// 			no: j,
// 			panel: {
// 				nombrePanel: _nombrePanel,
// 				marcaPanel: _marcaPanel,
// 				potenciaPanel: _potenciaPanel,
// 				cantidadPaneles: _cantidadPaneles, //numeroDeModulos
// 				potenciaReal: _potenciaReal,
// 				precioPorWatt: _precioPorWatt,
// 				costoDeEstructuras: _costoDeEstructuras
// 			}
// 		};
		
// 		await putInvestorsToObject(_potenciaReal);
// 		arrayInversoresWPmx.push(objInversores
// 	}
// 	return arrayInversoresWPmx;
// }

// module.exports.numeroDeInversores = async function(arrayNoDePaneles){
// 	const result = await numberOfInvestors(arrayNoDePaneles);
// 	return result;
// }
/*#endregion*/


















/*#region SI_SIRVE*/
async function getFilteredInvestor(idInversor){
	consultaFiltradaInversor = await buscarBD(idInversor);
	consultaFiltradaInversor = consultaFiltradaInversor.message;
	arrayInversores = consultaFiltradaInversor;
	return arrayInversores;
}

async function getInversores_cotizacion(data){
	var arrayInversor = [];
	var idInversor = data.idInversor;
	var potenciaReal_ = data.potenciaReal;
	inversorFiltrado = await getFilteredInvestor(idInversor);

	for(var i = 0; i < inversorFiltrado.length; i++)
	{
		_nombreInversor = inversorFiltrado[i].vNombreMaterialFot;
		_potencia = inversorFiltrado[i].fPotencia;
		_precio = inversorFiltrado[i].fPrecio;
		_marca = inversorFiltrado[i].vMarca;
		_potenciaMaximaInversor = _potencia * 1.25;
		NoOfInvestors = potenciaReal_ / _potenciaMaximaInversor;
		NoOfInvestors = NoOfInvestors * 1000;
		NoOfInvestors = Math.ceil(NoOfInvestors);
		_potenciaPicoInversor = potenciaReal_ / NoOfInvestors;
		_potenciaPicoInversor = _potenciaPicoInversor * 1000;
		_porcentajeSobreDimensionamiento = _potenciaPicoInversor / _potencia;
		_porcentajeSobreDimensionamiento = _porcentajeSobreDimensionamiento * 100;
		_porcentajeSobreDimensionamiento = parseFloat(Math.round(_porcentajeSobreDimensionamiento) / 100).toFixed(2);
		potenciaNominal = NoOfInvestors * _potencia;

		objInversores = {
			nombreInversor: _nombreInversor,
			marcaInversor: _marca,
			potenciaInversor: _potencia,
			potenciaNominalInversor: potenciaNominal,
			precioInversor: _precio,
			potenciaMaximaInversor: _potenciaMaximaInversor,
			numeroDeInversores: NoOfInvestors,
			potenciaPicoInversor: _potenciaPicoInversor,
			porcentajeSobreDimens: _porcentajeSobreDimensionamiento
		};
		
		arrayInversor.push(objInversores);
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

