const mysqlConnection = require('../../config/database');

function insertarBD (datas) {
	let { siRol, ttTipoUsuario, vContrasenia, vOficina, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vEmail } = datas;

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

function eliminarBD (datas) {
	const { idPersona} = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
	catch(error){
		console.log(error);
	}
}

function consultaBD () {
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function consultaIdBD (datas) {
	const { idPersona } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, null, null, null, null, idPersona, null, null, null, null, null, null], (error, rows) => {
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

function validarBD (datas) {
    const { vContrasenia, vEmail } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, null, null, null, vContrasenia, null, null, null, null, null, null, null, vEmail], (error, rows) => {
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

function verificarEmailDB(datas) {
	const { vEmail } = datas;

	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [7, null, null, null, null, null, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
			if (error) {
				const response = {
					status: false,
					message: error
				}
				resolve (response);
			} else {
				const response = {
					status: true,
					message: "El usuario se ha verificado con éxito."
				}
				resolve(response);
			}
		});
	});
}

function recuperarPasswordDB(datas) {
	const { vEmail } = datas;

	return new Promise((resolve, reject) => {
		mysqlConnection.query('CALL SP_Usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, null, null, null, null, null, null, null, null, null, null, null, null, vEmail, null, null, null], (error, rows) => {
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

module.exports = {
    insertarBD,
    eliminarBD,
    editarBD,
    consultaBD,
    consultaIdBD,
    validarBD,
    verificarEmailDB,
    recuperarPasswordDB
};