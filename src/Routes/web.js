/**
 * En este archivo se definen las rutas con los métodos necesarios para poder recibir, procesar y enviar la información recibida
 * por parte del cliente, pasandola a las demás clases correspondientes.
 * @author: Jesús Daniel Carrera Falcón / Yael Ramirez Herrerias
 * @version: 1.0.0
 * @date: 14/Febrero/2020
 */

const express = require('express'); //Constante que instancia la libreria 'express'.
const router = express.Router(); //Constante que define las rutas del servidor.
const inversorBL = require('../BL/inversorBL');
const moment = require('moment'); //Constante que hace uso de la librería 'moment' para obtener fecha y hora actual.
const panelesBL = require('../BL/panelesBL'); //Constante que instancia la clase BL de paneles con sus métodos.
const usuarioBL = require('../BL/usuarioBL'); //Constante que instancia la clase BL de usuario con sus métodos.
const clienteBL = require('../BL/clienteBL'); //Constante que instancia la clase BL de cliente con sus métodos.
const vendedor_clienteBL = require('../BL/vendedor_clienteBL'); //Constante que instancia la clase BL de vendedor_cliente con sus métodos.
router.use(express.json()); //Se declara que los datos recibidos se parsean a traves de json.

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

//Section Paneles
router.post('/insertarPanel', function (request, response) {
	const panelModel = {
		vNombreMaterialFot: request.body.nombreMaterialFot,
		vMarca: request.body.marca,
        fPotencia: parseFloat(request.body.potencia),
        fPrecio: parseFloat(request.body.precio),
        vTipoMoneda: request.body.tipoMoneda,
        fISC: parseFloat(request.body.ISC),
        fVOC: parseFloat(request.body.VOC),
        fVMP: parseFloat(request.body.VMP),
        created_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' ')
	};

	panelesBL.insertar(panelModel)
	.then(panel => {
		response.json({
			status: 200,
			message: "Se ha insertado correctamente el panel."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/eliminarPanel', function (request, response) {
	const panelModel = {
		idPanel: request.body.idPanel,
        deleted_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' ')
	};

	panelesBL.eliminar(panelModel)
	.then(panel => {
		response.json({
			status: 200,
			message: "Se ha eliminado correctamente el panel."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/actualizarPanel', function (request, response) {
	const panelModel = {
        idPanel: request.body.idPanel,
		vNombreMaterialFot: request.body.nombreMaterialFot,
		vMarca: request.body.marca,
        fPotencia: parseFloat(request.body.potencia),
        fPrecio: parseFloat(request.body.precio),
        vTipoMoneda: request.body.tipoMoneda,
        fISC: parseFloat(request.body.ISC),
        fVOC: parseFloat(request.body.VOC),
        fVMP: parseFloat(request.body.VMP),
        updated_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' ')
	};

	panelesBL.actualizar(panelModel)
	.then(panel => {
		response.json({
			status: 200,
			message: "Se ha actualizado correctamente el panel."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.get('/listarPaneles', function (request, response) {
	panelesBL.consultar()
	.then(paneles => {
		response.json(paneles);
	})
	.catch(error => {
        response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/listarPanelPorId', function (request, response) {
    const { idPanel } = request.body;

	panelesBL.consultarPorId(idPanel)
	.then(panel => {
		response.json(panel);
	})
	.catch(error => {
        response.json({
			status: 500,
			message: error.message,
		});
	});
});
//EndSection Paneles

//Section Usuario
router.post('/insertarUsuario', function (request, response) {
	const usuarioModel = {
        siRol: request.body.rol,
        ttTipoUsuario: request.body.tipoUsuario,
        vContrasenia: request.body.contrasenia,
        vOficina: request.body.oficina,
        vNombrePersona: request.body.nombrePersona,
        vPrimerApellido: request.body.primerApellido,
        vSegundoApellido: request.body.segundoApellido,
        vTelefono: request.body.telefono,
        vCelular: request.body.celular,
        vEmail: request.body.email.toLowerCase(),
        created_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' ')
	};

	usuarioBL.insertar(usuarioModel)
	.then(usuario => {
		response.json({
			status: 200,
			message: "Se ha insertado correctamente el usuario."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/validarUsuario', function (request, response) {
	const usuarioModel = {
        vContrasenia: request.body.contrasenia,
        vEmail: request.body.email
	};

	usuarioBL.validar(usuarioModel)
	.then(usuario => {
        response.json({
    		status: 200,
    		message: "Se han validado correctamente las credenciales del usuario, son correctas.",
    		token: usuario
    	});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});
//EndSection

//Section Cliente
router.post('/insertarCliente', function (request, response) {
	const clienteModel = {
        id_Usuario: request.body.idUsuario,
		id_Cliente: '',
		fConsumo: parseFloat(request.body.consumo),
        vNombrePersona: request.body.nombrePersona,
        vPrimerApellido: request.body.primerApellido,
        vSegundoApellido: request.body.segundoApellido,
        vTelefono: request.body.telefono,
        vCelular: request.body.celular,
        vEmail: request.body.email.toLowerCase(),
        created_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' '),
        vCalle: request.body.calle,
        vMunicipio: request.body.municipio,
        vEstado: request.body.estado
	};

	clienteBL.insertar(clienteModel)
	.then(cliente => {
		response.json({
			status: 200,
			message: "Se ha insertado correctamente el cliente."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/eliminarCliente', function (request, response) {
	const clienteModel = {
		idPersona: request.body.idPersona,
        deleted_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' ')
	};

	clienteBL.eliminar(clienteModel)
	.then(cliente => {
		response.json({
			status: 200,
			message: "Se ha eliminado correctamente el cliente."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/actualizarCliente', function (request, response) {
    const clienteModel = {
        idPersona: request.body.idPersona,
		fConsumo: parseFloat(request.body.consumo),
        vNombrePersona: request.body.nombrePersona,
        vPrimerApellido: request.body.primerApellido,
        vSegundoApellido: request.body.segundoApellido,
        vTelefono: request.body.telefono,
        vCelular: request.body.celular,
        vEmail: request.body.email.toLowerCase(),
        updated_at: moment().format('YYYY-MM-DDTHH:mm:ss').replace(/T/, ' '),
        vCalle: request.body.calle,
        vMunicipio: request.body.municipio,
        vEstado: request.body.estado
	};

	clienteBL.actualizar(clienteModel)
	.then(cliente => {
		response.json({
			status: 200,
			message: "Se ha actualizado correctamente el cliente."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.get('/listarClientes', function (request, response) {
	clienteBL.consultar()
	.then(clientes => {
		response.json(clientes);
	})
	.catch(error => {
        response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/listarClientePorId', function (request, response) {
    const { idPersona } = request.body;

	clienteBL.consultarPorId(idPersona)
	.then(cliente => {
		response.json(cliente);
	})
	.catch(error => {
        response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/listarClientePorUsuario', function (request, response) {
    const { idUsuario } = request.body;

	clienteBL.consultarPorUsuario(idUsuario)
	.then(clientes => {
		response.json(clientes);
	})
	.catch(error => {
        response.json({
			status: 500,
			message: error.message,
		});
	});
});
//EndSection

//Section Vendedor_Cliente
router.post('/actualizarVendedorCliente', function (request, response) {
    const vendedor_clienteModel = {
        id_Usuario: request.body.id_Usuario,
		id_Cliente: request.body.id_Cliente
	};

	vendedor_clienteBL.actualizar(vendedor_clienteModel)
	.then(vendedor_cliente => {
		response.json({
			status: 200,
			message: "Se ha actualizado correctamente la relación del usuario con el cliente."
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});
//EndSection

module.exports = router;
/*Exportar la constate 'router' con el fin de que esta clase pueda
  ser ocupada por las demas*/
