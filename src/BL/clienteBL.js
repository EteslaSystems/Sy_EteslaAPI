/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 				Yael Ramirez Herrerias / Jesus Daniel Carrera Falcon
- @date: 				19/02/2020
*/

const cliente = require('../Controller/clienteController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/clienteMiddleware');
const vendedor_clienteBL = require('./vendedor_clienteBL');

var moment = require('moment-timezone');

module.exports.insertar = async function (request, response) {
	// let validate = await validations.clienteValidation(request);
	let validate = { status: true }; //Borrar y modificar validaciones

	try{
		if (validate.status == true) {
			let now = moment().tz("America/Mexico_City").format();
			let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;
	
			const datas = {
				id_Usuario: request.idUsuario || null,
				id_Cliente: null,
				vNombrePersona: request.nombre || null,
				vPrimerApellido: request.primerApellido || null,
				vSegundoApellido: request.segundoApellido || null,
				vTelefono: request.telefono || null,
				vCelular: request.celular || null,
				vEmail: request.email != null ? request.email.toLowerCase() : null,
				cCodigoPostal: request.codigoPostal || null,
				vCalle: request.calle || null,
				vCiudad: request.ciudad || null,
				vMunicipio: request.municipio || null,
				vEstado: request.estado || null,
				bTienePropuesta: 0
				/////
				// bTienePropuesta: request.tienePropuesta
			};
	
			result = await cliente.insertar(datas);
	
			if(result.status !== true) {
				log.errores('INSERTAR / CLIENTES.', result.message.sqlMessage);
	
				throw new Error('Error al insertar los datos: '+result.message.sqlMessage.toString());
			}
	
			const dCliente = {
				idUsuario: datas.id_Usuario,
				idCliente: result.message[0].idCliente
			} 
	
			new_result = await vendedor_clienteBL.insertar(dCliente);
			
			if(new_result.status !== 200) {
				const eCliente = {
					idCliente: new_result.message
				};
	
				del_result = await cliente.destruir(eCliente);
	
				return del_result.message;
			}
	
			return new_result.message;
		}
		else{
			throw validate.message;
		}
	}
	catch(error){
		console.log(error);
		// throw 'Ocurrio un problema en clienteBL:\n'+error;
	}
}

module.exports.eliminar = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		idPersona: request.id,
		deleted_at: fecha
	};

	result = await cliente.eliminar(datas);

	if(result.status !== true) {
		log.errores('ELIMINAR / CLIENTE.', result.message);

		throw new Error('Error al eliminar los datos.');
	}

	log.eventos('ELIMINAR / CLIENTE.', '1 fila eliminada.');

	return result.message;
}

module.exports.editar = async function (request, response) {
	let validate = await validations.clienteValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		fConsumo = request.consumo === null ? 0 : parseFloat(request.consumo);

		const datas = {
	        idPersona: request.idPersona,
			fConsumo: fConsumo,
	        vNombrePersona: request.nombrePersona,
	        vPrimerApellido: request.primerApellido,
	        vSegundoApellido: request.segundoApellido,
	        vTelefono: request.telefono,
	        vCelular: request.celular,
	        vEmail: request.email.toLowerCase(),
	        updated_at: fecha,
	        vCalle: request.calle,
	        vMunicipio: request.municipio,
	        vEstado: request.estado
		};

		result = await cliente.editar(datas);

		if(result.status !== true) {
			log.errores('EDITAR / CLIENTES.', result.message);

			throw new Error('Error al editar los datos.');
		}

		log.eventos('EDITAR / CLIENTES.', '1 fila editada.');

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await cliente.consultar();

	if(result.status !== true) {
		log.errores('CONSULTA / CLIENTES.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('CONSULTA / CLIENTES.', result.message.length + ' filas consultadas.');

	return result.message;
}

module.exports.consultarId = async function (request, response) {
	const datas = {
		idPersona: request.id
	};

	result = await cliente.consultarId(datas);

	if(result.status !== true) {
		log.errores('BUSQUEDA / CLIENTES POR ID.', result.message);

		throw new Error('Error al consultar los datos.');
	}

	log.eventos('BUSQUEDA / CLIENTES POR ID.', result.message.length + ' filas consultadas.');

	return result.message;
}

module.exports.consultarUser = async function (request, response) {
	const datas = {
		idUsuario: request.id
	};

	result = await cliente.consultarUser(datas);

	if(result.status !== true) {
		log.errores('BUSQUEDA / CLIENTES POR USUARIO.', result.message);

		throw new Error('Error al consultar los datos: '+result.message.sqlMessage);
	}

	log.eventos('BUSQUEDA / CLIENTES POR USUARIO.', result.message.length + ' filas consultadas.');

	return result.message;
}
