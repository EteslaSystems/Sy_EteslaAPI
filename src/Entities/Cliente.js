const mysqlConnection = require('../../config/database');

function insertarBD(datas){
    const { vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, cCodigoPostal, vCalle, vMunicipio, vCiudad, vEstado, id_Usuario } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [0, null, null, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, null, cCodigoPostal, vCalle, vMunicipio, vCiudad, vEstado, id_Usuario], (error, rows) => {
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

function eliminarBD(datas){
	const { idPersona } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [1, null, null, idPersona, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function editarBD(datas){
	const { fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, vCalle, vMunicipio, vEstado } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [2, null, fConsumo, idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, null, vCalle, vMunicipio, vEstado], (error, rows) => {
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

function consultaBD(){
  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [3, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [4, null, idPersona, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function consultaUserBD (datas) {
	const { idUsuario } = datas;

  	return new Promise((resolve, reject) => {
    	mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [5, idUsuario, null, null, null, null, null, null, null, null, null, null, null, null, null, null], (error, rows) => {
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

function consultaPorNombre(datas){
	const { nombre, idUsuario } = datas;

	return new Promise((resolve, reject) => {
	  mysqlConnection.query('CALL SP_Cliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [6, null, null, nombre, null, null, null, null, null, null, null, null, null, null, null, idUsuario], (error, rows) => {
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

module.exports = { 
    insertarBD, 
    eliminarBD, 
    editarBD, 
    consultaBD, 
    consultaIdBD,
    consultaUserBD,
    consultaPorNombre
};