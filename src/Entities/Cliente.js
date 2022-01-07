const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

// [ CRUD ]
module.exports.insertarBD = async function(datas){
	const { vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, cCodigoPostal, vCalle, vMunicipio, vCiudad, vEstado, id_Usuario } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, null, cCodigoPostal, vCalle, vMunicipio, vCiudad, vEstado, id_Usuario], (error, rows) => {
				if (error) {
					const response = {
						status: false,
						message: error
					}

					reject (response);
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
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.insertarBD(): ' +error.message });
        throw 'Error Cliente.insertarBD(): '+error;
	}
}

module.exports.eliminarBD = async function (datas){
	const { idPersona } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, null, idPersona, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.eliminarBD(): ' +error.message });
        throw 'Error Cliente.eliminarBD(): '+error;
	}
}

module.exports.editarBD = async function(datas){
	const { fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, vCalle, vMunicipio, vEstado } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, null, vCalle, vMunicipio, vEstado], (error, rows) => {
				if (error) {
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else {
					const response = {
						status: true,
						message: "El registro se ha editado con éxito."
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.editarBD(): ' +error.message });
        throw 'Error Cliente.editarBD(): '+error;
	}
}

module.exports.consultaBD = async function(){
	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
				if (error) {
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else {
					const response = {
						status: true,
						message: rows[0]
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.consultaBD(): ' +error.message });
        throw 'Error Cliente.consultaBD(): '+error;
	}
}

module.exports.consultaIdBD = async function(datas) {
	const { idPersona } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
				if(error){
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else{
					const response = {
						status: true,
						message: rows[0]
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.consultaIdBD(): ' +error.message });
        throw 'Error Cliente.consultaIdBD(): '+error;
	}
}

module.exports.consultaUserBD = async function(datas) {
	const { idUsuario } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, idUsuario, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
				if (error) {
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else {
					const response = {
						status: true,
						message: rows[0]
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.consultaUserBD(): ' +error.message });
        throw 'Error Cliente.consultaUserBD(): '+error;
	}
}

module.exports.consultaPorNombre = async function(datas){
	const { nombre, idUsuario } = datas;
	
	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, nombre, null, null, null, null, null, null, null, null, null, null, null, idUsuario], (error, rows) => {
				if(error){
					const response = {
						status: false,
						message: error
					}
	
					reject(response);
				} 
				else{
					const response = {
						status: true,
						message: rows[0]
					}
	
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Cliente.consultaPorNombre(): ' +error.message });
        throw 'Error Cliente.consultaPorNombre(): '+error;
	}
}