/**
 * En este archivo se define la lógica del proceso, administrando el control de acceso al controller de usuario,
 * implementando validaciones y manejando los resultados obtenidos en conjunto con el log de eventos y errores.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 2.0.0
 * @date: 21/Febrero/2020
 */

const controller = require('../Controller/usuarioController'); //Constante que hace uso de la clase controller de usuario.
const log = require('../../config/logConfig'); //Constante que instancia el modelo del log de eventos y errores.
const jwt = require('jsonwebtoken');
const secret = 'eTeslaSecret';

module.exports.insertar = async function (usuarioModel, response) {
	const nombreCompleto = usuarioModel.vNombrePersona + ' ' + usuarioModel.vPrimerApellido + ' ' + usuarioModel.vSegundoApellido;

	result = await controller.insertar(usuarioModel);

	if (result !== true) {
		log.errores('Insertar Usuario', 'Ocurrió un error al insertar los datos del usuario "' + nombreCompleto + '" en la base de datos.');
		throw new Error('Ocurrió un error al insertar los datos del usuario.');
	}

	log.eventos('Insertar Usuario', 'Se ha insertado correctamente el usuario "' + nombreCompleto + '" en la base de datos.');
	return result;
}

module.exports.validar = async function (usuarioModel, response) {
	result = await controller.validar(usuarioModel);

	if (result.propertyIsEnumerable(0) !== true) {
		log.errores('Validar Usuario', 'Ocurrió un error al validar las credenciales del usuario en la base de datos.');
		throw new Error('Ocurrió un error al validar las credenciales del usuario.');
	}

	const payload = {
		idUsuario: result[0].idUsuario,
		rol: result[0].siRol,
		tipoUsuario: result[0].ttTipoUsuario,
		contrasenia: result[0].vContrasenia,
		oficina: result[0].vOficina,
		idPersona: result[0].idPersona,
		nombrePersona: result[0].vNombrePersona,
		primerApellido: result[0].vPrimerApellido,
		segundoApellido: result[0].vSegundoApellido,
		telefono: result[0].vTelefono,
		celular: result[0].vCelular,
		email: result[0].vEmail,
		created_at: result[0].created_at,
		updated_at: result[0].updated_at
	};
	const nombreCompleto = payload.nombrePersona + ' ' + payload.primerApellido + ' ' + payload.segundoApellido;

	return new Promise((resolve, reject) => {
		jwt.sign(payload, secret, { expiresIn: 36000 }, (error, token) => {
			if (error){
				log.errores('Validar Usuario', 'Ocurrió un error al generar el token de acceso para el usuario "' + nombreCompleto + '".');
				throw new Error('Ocurrió un error al generar el token de acceso para el usuario "' + nombreCompleto + '".');
			} else {
				log.eventos('Validar Usuario', 'Las credenciales del usuario "' + nombreCompleto + '" son correctas, se generó el token de acceso.');
                resolve(token);
			}
		});
	});
}
