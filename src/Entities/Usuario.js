const mysqlConnection = require('../../config/database');
const Log = require('../../config/logConfig');

module.exports.insertarBD = async function(datas){
	let { siRol, ttTipoUsuario, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vEmail } = datas;

	try{
		switch(vOficina)
		{
			case 'Veracruz':
				vOficina = 'Av. Ricardo Flores Magón 1181, Ignacio Zaragoza, 91910 Veracruz, Ver.';
			break;
			case 'CDMX':
				vOficina = 'Oso, Col del Valle Sur, Benito Juárez, 03100 Ciudad de México, CDMX';
			break;
			case 'Puebla':
				vOficina = 'Av. 25 Ote. & C. 18 Sur, Bella Vista, 72500 Puebla, Pue.';
			break;
			default: 
				-1
			break;
		}
	
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, null, siRol, ttTipoUsuario, vContrasenia, vOficina, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, null, vEmail], (error, rows) => {
				if(error){
					const response = {
						status: false,
						message: error
					}
					reject(response);
				} 
				else {
					const response = {
						status: true,
						message: "El registro se ha guardado con éxito."
					}
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.insertarBD(): ' +error.message });
		throw 'Error Usuario.insertarBD(): '+error;
	}
}

module.exports.eliminarBD = async function(datas){
	const { idPersona} = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
						message: "El registro se ha eliminado con éxito."
					}
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.eliminarBD(): ' +error.message });
		throw 'Error Usuario.eliminarBD(): '+error;
	}
}

module.exports.editarBD = async function(datas){
	let { idPersona, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido} = datas;

	try{
		switch(vOficina)
		{
			case 'Veracruz':
				vOficina = 'Av. Ricardo Flores Magón 1181, Ignacio Zaragoza, 91910 Veracruz, Ver.';
			break;
			case 'CDMX':
				vOficina = 'Oso, Col del Valle Sur, Benito Juárez, 03100 Ciudad de México, CDMX';
			break;
			case 'Puebla':
				vOficina = 'Av. 25 Ote. & C. 18 Sur, Bella Vista, 72500 Puebla, Pue.';
			break;
			default: 
				-1
			break;
		}

		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, null, null, null, vContrasenia, vOficina, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, null, null, null], (error, rows) => {
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.editarBD(): ' +error.message });
		throw 'Error Usuario.editarBD(): '+error;
	}
}

module.exports.consultaBD = async function(){
	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.consultaBD(): ' +error.message });
		throw 'Error Usuario.consultaBD(): '+error;
	}
}

module.exports.consultaIdBD = async function(datas){
	const { idPersona } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, null, null, null, null, idPersona, null, null, null, null, null, null], (error, rows) => {
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.consultaIdBD(): ' +error.message });
		throw 'Error Usuario.consultaIdBD(): '+error;
	}
}

module.exports.validarBD = async function(datas){
	const { vContrasenia, vEmail } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, null, null, null, vContrasenia, null, null, null, null, null, null, null, vEmail], (error, rows) => {
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.validarBD(): ' +error.message });
		throw 'Error Usuario.validarBD(): '+error;
	}
}

module.exports.verificarEmailBD = async function(datas){
	const { vEmail } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [7, null, null, null, null, null, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
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
						message: "El usuario se ha verificado con éxito."
					}
					resolve(response);
				}
			});
		});
	}
	catch(error){
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.verificarEmailBD(): ' +error.message });
		throw 'Error Usuario.verificarEmailBD(): '+error;
	}
}

module.exports.recuperarPasswordBD = async function(datas){
	const { vEmail } = datas;

	try{
		return new Promise((resolve, reject) => {
			mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, null, null, null, null, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
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
		await Log.generateLog({ tipo: 'Error', contenido: 'Usuario.recuperarPasswordBD(): ' +error.message });
		throw 'Error Usuario.recuperarPasswordBD(): '+error;
	}
}