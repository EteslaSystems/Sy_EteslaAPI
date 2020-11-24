/*
- @description: 		Archivo correspondiente a las funciones de la API con la BD.
- @author: 				Yael Ramirez Herrerias
- @date: 				19/02/2020
*/

const mysqlConnection = require('../../config/database');
const { all } = require('../Routes/web');

function insertarBD(datas) {
	const { vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, created_at, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null, deleted_at], (error, rows) => {
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
	const { idInversor, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, updated_at } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, idInversor, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, vGarantia, vOrigen, fISC, iVMIN, iVMAX, iPMAX, iPMIN, null, updated_at, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
	var objInversores = {};
	var arrayInversor = [];
	var potenciaReal_ = parseFloat(data.potenciaReal);
	allInversores = await consultaBD();
	allInversores = allInversores.message;

	for(var i = 0; i < allInversores.length; i++)
	{
		_potencia = allInversores[i].fPotencia;
		_potenciaMaximaInversor = _potencia * 1.25;
		NoOfInvestors = potenciaReal_ / _potenciaMaximaInversor;
		NoOfInvestors = NoOfInvestors * 1000;
		NoOfInvestors = NoOfInvestors < 0.9 ? 0 : Math.round(NoOfInvestors);

		if(NoOfInvestors > 0){
			idInversor = allInversores[i].idInversor;
			_nombreInversor = allInversores[i].vNombreMaterialFot;
			_precio = allInversores[i].fPrecio;
			_marca = allInversores[i].vMarca;
			_potenciaPicoInversor = potenciaReal_ / NoOfInvestors;
			_potenciaPicoInversor = _potenciaPicoInversor * 1000;

			_porcentajeSobreDimensionamiento = _potenciaPicoInversor / _potencia;
			_porcentajeSobreDimensionamiento = _porcentajeSobreDimensionamiento * 100;
			_porcentajeSobreDimensionamiento = parseFloat(Math.round(_porcentajeSobreDimensionamiento) / 100).toFixed(2);
			potenciaNominal = NoOfInvestors * _potencia;
			precioTotalInversores = _precio * NoOfInvestors;

			objInversores = {
				idInversor: idInversor,
				nombreInversor: _nombreInversor,
				marcaInversor: _marca,
				potenciaInversor: _potencia,
				potenciaNominalInversor: potenciaNominal,
				precioInversor: _precio,
				potenciaMaximaInversor: _potenciaMaximaInversor,
				numeroDeInversores: NoOfInvestors,
				potenciaPicoInversor: _potenciaPicoInversor,
				porcentajeSobreDimens: _porcentajeSobreDimensionamiento,
				precioTotalInversores: precioTotalInversores
			};
			
			arrayInversor.push(objInversores);
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

