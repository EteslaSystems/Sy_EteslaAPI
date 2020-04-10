/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 				Yael Ramirez Herrerias / Jesus Daniel Carrera Falcon
- @date: 				19/02/2020
*/

const usuario = require('../Controller/usuarioController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/usuarioMiddleware');
//const mailer = require('../../config/mailConfig');
const jwt = require('jsonwebtoken'); 
const secret = 'eTeslaSecret';
var moment = require('moment-timezone');


module.exports.insertar = async function (request, response) {
	let validate = await validations.usuarioValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;
		let telefono = 666;

		const datas = {
			siRol: parseInt(request.rol),
			ttTipoUsuario: request.tipoUsuario,
			vContrasenia: request.contrasenia,
	        	vOficina: request.oficina,
	        	vNombrePersona: request.nombrePersona,
	        	vPrimerApellido: request.primerApellido,
	        	vSegundoApellido: request.segundoApellido,
	        	vTelefono: telefono,
	        	vEmail: request.email.toLowerCase(),
			created_at: fecha
		};

		result = await usuario.insertar(datas);

		if(result.status !== true) {
			log.errores('INSERTAR / USUARIOS.', result.message);

			throw new Error('Error al insertar los datos.');
		}

		log.eventos('INSERTAR / USUARIOS.', '1 fila insertada.');

		const payload = { email: datas.vEmail };
		const emailToken = jwt.sign(payload, secret, { expiresIn: 86400 });
		//La parte del host de la url se cambiará una vez se ponga en producción o si tu host es diferente.
		const url = 'http://127.0.0.1:8000/verificarEmail/' + emailToken;
		const oEmail = new mailer();

		let email = {
			from: 'Depto. de sistemas Etesla',
			to: datas.vEmail,
			subject: "Verificación de correo electrónico",
			html: `<b>Por favor de click en el siguiente enlace para confirmar su correo electrónico:</b>
				<br><br><a href="${url}">${url}</a><br><br><br>
				<b>El enlace caduca en un día.</b>`
		};

		oEmail.enviarCorreo(email);

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.validar = async function (request, response) {
	const datas = {
		vContrasenia: request.contrasenia,
		vEmail: request.email
	};

	result = await usuario.validar(datas);

	if(result.status !== true) {
		log.errores('VALIDAR / USUARIOS.', result.message);

		throw new Error('Error al validar los datos del usuario.');
	}

	if(result.message.propertyIsEnumerable(0) !== true) {
		log.errores('VALIDAR / USUARIOS.', 'Las credenciales proporcionadas por el usuario no coinciden con los registros de la base de datos.');

		throw new Error('Las credenciales proporcionadas son incorrectas.');
	}

	if (result.message[0].vTelefono != null || result.message[0].vTelefono == 666) {
		const nombrecompleto = result.message[0].vNombrePersona +' '+ result.message[0].vPrimerApellido +' '+ result.message[0].vSegundoApellido;
		log.eventos('VALIDAR / USUARIOS.', 'El usuario ' + nombrecompleto + ', intentó iniciar sesión sin haber verificado su correo electrónico.');

		throw new Error('Debe verificar su correo electrónico para iniciar sesión.');
	}

	const payload = {
		idUsuario: result.message[0].idUsuario,
		rol: result.message[0].siRol,
		tipoUsuario: result.message[0].ttTipoUsuario,
		contrasenia: result.message[0].vContrasenia,
		oficina: result.message[0].vOficina,
		idPersona: result.message[0].idPersona,
		nombrePersona: result.message[0].vNombrePersona,
		primerApellido: result.message[0].vPrimerApellido,
		segundoApellido: result.message[0].vSegundoApellido,
		telefono: result.message[0].vTelefono,
		celular: result.message[0].vCelular,
		email: result.message[0].vEmail,
		created_at: result.message[0].created_at,
		updated_at: result.message[0].updated_at
	};

	return new Promise((resolve, reject) => {
		jwt.sign(payload, secret, { expiresIn: 36000 }, (error, token) => {
			if (error) {
				log.errores('VALIDAR / USUARIOS.', 'Ocurrió un error al generar el token de usuario.');

				throw new Error('Error en la genereación del token.');
			} else {
                log.eventos('VALIDAR / USUARIOS.', 'Token de usuario generado, acceso a: ' + payload.nombrePersona + '.');

                resolve(token);
			}
		});
	});
}

module.exports.verificarEmail = async function (request, response) {
	const datas = { vEmail: request.email.toLowerCase() };
	result = await usuario.verificarEmail(datas);

	if(result.status !== true) {
		log.errores('VERIFICAR / EMAIL.', result.message);

		throw new Error('Error al verificar el email: ' + request.email);
	}
	log.eventos('VERIFICAR / EMAIL.', 'Se verificó con éxito el email: ' + request.email);

	return result.message;
}
