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

function buscarBD (datas) {
	const { idInversor } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Inversor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, idInversor, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
var objNoDeInversores = {};

function numberOfInvestors(NumberOfPanelesArray){
	getMaximumPower(NumberOfPanelesArray);
}

async function getAllInvestors(){
	consultaInversores = await consultaBD();
	consultaInversores = consultaInversores.message;
	arrayInversores = consultaInversores;
	return arrayInversores;
}

async function getMaximumPower(NumberOfPanelesArray){
	arrayInversoresWPmx = [];

	arrayAllInvestors = await getAllInvestors();
	
	var j;
	for(j = 0; j < NumberOfPanelesArray.length; j++)
	{
		_nombrePanel = NumberOfPanelesArray[j];
		_potenciaPicoInvrsr = NumberOfPanelesArray[j].potenciaReal;

		for(var i = 0; i <= j; i++){
			_nombreInversor = arrayAllInvestors[i].vNombreMaterialFot;
			_potencia = arrayAllInvestors[i].fPotencia;
			_precio = arrayAllInvestors[i].fPrecio;
			_potenciaMaximaInversor = _potencia * 1.25;
			NoOfInvestors = _potenciaPicoInvrsr / _potenciaMaximaInversor;
		}

		objNoDeInversores = {
			nombrePanel: _nombrePanel,
			nombreInversor: _nombreInversor,
			potencia: _potencia,
			precio: _precio,
			potenciaMaxima: _potenciaMaximaInversor,
			noInversores: NoOfInvestors
		}

		arrayInversoresWPmx.push(objNoDeInversores);
	}

	console.log('getMaximumPower() says: ');
	console.log(arrayInversoresWPmx);

	/*for(var i = 0; i < arrayAllInvestors.length; i++){
		_nombreInversor = arrayAllInvestors[i].vNombreMaterialFot;
		_potencia = arrayAllInvestors[i].fPotencia;
		_precio = arrayAllInvestors[i].fPrecio;
		_potenciaMaximaInversor = _potencia * 1.25;
		_nombrePanel = NumberOfPanelesArray[i].nombre;
		_potenciaPicoInvrsr = NumberOfPanelesArray[i].potenciaReal;
		NoOfIvestors = _potenciaPicoInvrsr / _potenciaMaximaInversor;

		console.log('getMaximumPower() says: '+NumberOfPanelesArray[i].nombre);

		objNoDeInversores = {
			nombrePanel: _nombrePanel,
			nombreInversor: _nombre,
			potencia: _potencia,
			precio: _precio,
			potenciaMaxima: _potenciaMaximaInversor,
			noInversores: NoOfIvestors
		}

		arrayInversoresWPmx.push(objNoDeInversores);
	}
	//console.log('getMaximumPower() says: '+NumberOfPanelesArray[0].nombre);
	console.log(arrayInversoresWPmx);
	//return arrayAllInvestors;*/
}

module.exports.numeroDeInversores = function(arrayNoDePaneles){
	const result = numberOfInvestors(arrayNoDePaneles);
	
	//return result;
}
/*#endregion*/

module.exports.insertar = async function (datas, response) {
	const result = await insertarBD(datas);

	return result;
}

module.exports.eliminar = async function (datas, response) {
	const result = await eliminarBD(datas);

	return result;
}

module.exports.buscar = async function (datas, response) {
	const result = await buscarBD(datas);

	return result;
}

module.exports.editar = async function (datas, response) {
	const result = await editarBD(datas);

	return result;
}

module.exports.consultar = async function (response) {
	const result = await consultaBD();

	return result;
}