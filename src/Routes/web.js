/*
- @description: 	Archivo de rutas, se recibe todo lo externo para su manejo dentro del servidor.
- @author: 			Yael Ramirez Herrerias (@iaelrmz)
- @date: 			20/02/2020
*/

const express = require('express');
const router = express.Router();
const inversorBL = require('../BL/inversorBL');

router.use(express.json());

router.get('/lista-inversores', function (request, response) {
	inversorBL.consultar()
	.then(inversor => {
		response.json(inversor);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/agregar-inversor', function (request, response) {
	inversorBL.insertar(request.body)
	.then(inversor => {
		response.json(inversor);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-inversor/:id', function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;
	
	const datas = {
		idInversor: request.params.id,
		deleted_at: fecha
	};

	inversorBL.eliminar(datas)
	.then(inversor => {
		response.json(inversor);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-inversor/:id', function (request, response) {
	inversorBL.editar(request.body)
	.then(inversor => {
		response.json(inversor);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

// RUTA DE VISTA, LISTADO DE REGISTROS DETECTADOS.
router.get('/verempresa/:id', (request, response, next) => {
	// CONSTANTES RECIBIDAS DEL CLIENTE.
	const {id} = request.params;

	usuariosModelo
	.listar(id)
	.then(empresa => {
		response.json(empresa);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: VIEW / EMPRESAS. || STATUS: CORRECT', '\n-------------------------------------------------------------------------------------------------------------------');
	})
	.catch(error => {
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: VIEW / EMPRESAS. || STATUS: ERROR || DETAILS: ', error, '\n-------------------------------------------------------------------------------------------------------------------');
	})
});

// RUTA DE VISTA, LISTADO DE REGISTROS DETECTADOS.
router.post('/validarUsuario', (request, response, next) => {
	// CONSTANTES RECIBIDAS DEL CLIENTE.
	const {vEmail, vContrasenia} = request.body;
	//console.log(request.body);
	usuariosModelo
	.validar(vEmail, vContrasenia)
	.then(empresa => {
		console.log(empresa);
		if(empresa.isEmpty) {
			response.json(empresa);
			log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: LOGIN / EMPRESA. || STATUS: CORRECT', '\n-------------------------------------------------------------------------------------------------------------------');
		} else {
			response.json(empresa);
			log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: LOGIN / EMPRESA. || STATUS: ERROR || DETAILS: CREDENCIALES INCORRECTAS \n-------------------------------------------------------------------------------------------------------------------');
		}
	})
	.catch(error => {
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: LOGIN / EMPRESA. || STATUS: ERROR || DETAILS: ', error, '\n-------------------------------------------------------------------------------------------------------------------');
	})
});

// RUTA DE EDICIÓN, EDITAR UNA EMRPESA.
router.put('/editarempresa/:id', (request, response, next) => {
	// CONSTANTES RECIBIDAS DEL CLIENTE.
	const {id} = request.params;
	const {vEmpresa, vEmail, vContrasenia, updated_at} = request.body;

	usuariosModelo
	.actualizar(id, vEmpresa, vEmail, vContrasenia, updated_at)
	.then(() => {
		response.send(true);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: EDIT / EMPRESAS. || STATUS: CORRECT. || DATAS: ', request.body, '\n-------------------------------------------------------------------------------------------------------------------');
	})
	.catch(error => {
		response.send(false);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: EDIT / EMPRESAS. || STATUS: ERROR || DETAILS: ', error, '\n-------------------------------------------------------------------------------------------------------------------');
	})
});

// RUTA DE ELIMINACIÓN, ELIMINAR UNA EMRPESA.
router.put('/eliminarempresa/:id', (request, response, next) => {
	// CONSTANTES RECIBIDAS DEL CLIENTE.
	const {id} = request.params;
	const {deleted_at} = request.body;

	usuariosModelo
	.eliminar(id, deleted_at)
	.then(() => {
		response.send(true);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: DELETE / EMPRESAS. || STATUS: CORRECT. || DATAS: ', request.body, '\n-------------------------------------------------------------------------------------------------------------------');
	})
	.catch(error => {
		response.send(false);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: DELETE / EMPRESAS. || STATUS: ERROR || DETAILS: ', error, '\n-------------------------------------------------------------------------------------------------------------------');
	})
});

// RUTA DE ADICIÓN, AGREGAR UNA NUEVA EMRPESA.
router.post('/crearUsuario', (request, response, next) => {
	// CONSTANTES RECIBIDAS DEL CLIENTE.
	const {vEmail, vContrasenia, vNombre, vApellidoPaterno, created_at} = request.body;
	//console.log(request.body);

	usuariosModelo
	.insertar(vEmail, vContrasenia, vNombre, vApellidoPaterno, created_at)
	.then(() => {
		response.send(true);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: CREATE / EMPRESAS. || STATUS: CORRECT. || DATAS: ', request.body, '\n-------------------------------------------------------------------------------------------------------------------');
	})
	.catch(error => {
		response.send(false);
		log.info('TIMESTAMP: ', new Date().toJSON(), '|| ACTION: CREATE / EMPRESAS. || STATUS: ERROR || DETAILS: ', error, '\n-------------------------------------------------------------------------------------------------------------------');
	})
});

module.exports = router; 
/*Exportar la constate 'router' con el fin de que esta clase pueda 
  ser ocupada por las demas*/