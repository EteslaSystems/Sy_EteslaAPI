/*
- @description: 	Archivo de rutas, se recibe todo lo externo para su manejo dentro del servidor.
- @author: 			Yael Ramirez Herrerias / Jesus Daniel Carrera Fálcon
- @date: 			20/02/2020
*/

const express = require('express');
const router = express.Router();
const usuarioBL = require('../BL/usuarioBL');
const inversorBL = require('../BL/inversorBL');
const panelBL = require('../BL/panelesBL');
const clienteBL = require('../BL/clienteBL');
const vendedor_clienteBL = require('../BL/vendedor_clienteBL');
//const mediaTensionBL = require('../BL/mediaTensionBL');
const otrosMaterialesBL = require('../BL/otrosMaterialesBL');
const opcionesViaticsBL = require('../BL/opcionesViaticsBL');

const archivoPDF = require('../PDF/create-pdf');  // Ruta del PDF.

router.use(express.json());

/*
- @section: 		Rutas para la sección de usuarios.
*/

/*#region Region de prueba : Favor de ignorar /borrar cuando sea necesario(Solo LH420)\*/
const mediaTensionController = require('../Controller/mediaTensionController');
const powerController = require('../Controller/powerController');
/*#region Cotización*/

/*#region cotizacion_producto(sin ingresar datos de consumo)*/
const cotizIndiv = require('../Controller/cotizacion_individualController');

router.post('/cotizacionIndividual', function(request, response){
	cotizIndiv.cotizacion_individual(request.body)
	.then(cotizacion_individual => {
		response.json({
			status: 200,
			message: cotizacion_individual
		}).end();
		
		// console.log(cotizacion_individual);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});
	
});
/*#endregion*/
/*#region GDMTO*/
/*#endregion*/
/*#region GDMTH*/
//1st. Step
router.post('/sendPeriods', function(request, response){
	mediaTensionController.firstStepGDMTH(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});

	/* powerController.getCD_DatosConsumo_(request.body)
	.then(result => {
		console.log('entro');
		console.log(result);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	}); */
});
//2nd. Step
router.post('/sendInversorSelected', function(request, response){
	mediaTensionController.secondStepGDMTH(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		}).end();
		
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});

	powerController.getProduccionIntermedia_(request.body)
	.then(result => {
		console.log(result);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});
});

//3rd. Step
///Calcular Viaticos y Totales
router.post('/calcularVT', function(request, response){
	mediaTensionController.thirdStepGDMTH(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});
});








//1er. Paso:
// router.post('/sendPeriods', function(request, response){
// 	mediaTensionController.obtenerEnergiaReqPanelesReq(request.body)
// 	.then(convinacionPaneles => {
// 		response.json({
// 			status: 200,
// 			message: convinacionPaneles
// 		});
// 	})
// 	.catch(error => {
// 		response.json({
// 			status: 500,
// 			message: error
// 		});
// 	});
// });








/*#endregion GDMTH*/
/*#endregion*/

const y = require('../Controller/powerController');

router.post('/y', function(request){
	y.getCD_DatosConsumo(request.body);
});

/*#endregion*/



router.post('/agregar-usuario', function (request, response) {
	usuarioBL.insertar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.put('/eliminar-usuario', function (request, response) {
	usuarioBL.eliminar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.put('/editar-usuario', function (request, response) {
	usuarioBL.editar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.get('/consultar-usuarios', function (request, response) {
	usuarioBL.consultar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.put('/buscar-usuario', function (request, response) {
	usuarioBL.consultarId(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/validar-usuario', function (request, response) {
	usuarioBL.validar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.post('/verificar-email', function (request, response) {
	usuarioBL.verificarEmail(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.post('/recuperar-password', function (request, response) {
	usuarioBL.recuperarPassword(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de inversores.
*/

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
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-inversor', function (request, response) {
	inversorBL.eliminar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-inversor', function (request, response) {
	inversorBL.buscar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-inversor', function (request, response) {
	inversorBL.editar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de paneles.
*/

router.get('/lista-paneles', function (request, response) {
	panelBL.consultar()
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

router.post('/agregar-panel', function (request, response) {
	panelBL.insertar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-panel', function (request, response) {
	panelBL.eliminar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-panel', function (request, response) {
	panelBL.buscar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-panel', function (request, response) {
	panelBL.editar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de clientes.
*/

router.post('/agregar-cliente', function (request, response) {
	clienteBL.insertar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-cliente', function (request, response) {
	clienteBL.eliminar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-cliente', function (request, response) {
	clienteBL.editar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.get('/lista-clientes', function (request, response) {
	clienteBL.consultar()
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

router.put('/lista-clientes-id', function (request, response) {
	clienteBL.consultarId(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/lista-clientes-usuario', function (request, response) {
	clienteBL.consultarUser(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de vendedores/clientes.
*/

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

/*
- @section: 		Rutas para la sección de media tensión.
*/

/*
- @section: 		Rutas para la sección de otros materiales y viaticos.
*/

router.post('/agregar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.insertarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.eliminarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.editarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.get('/listar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.consultaCategoriaMaterialesBL()
	.then(material => {
		response.json(material);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.buscarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/* --------------------------------------------------------------------------- */

router.post('/agregar-otroMaterial', function (request, response) {
	otrosMaterialesBL.insertarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-otroMaterial', function (request, response) {
	otrosMaterialesBL.eliminarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-otroMaterial', function (request, response) {
	otrosMaterialesBL.editarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.get('/listar-otroMaterial', function (request, response) {
	otrosMaterialesBL.consultaOtroMaterialBL()
	.then(material => {
		response.json(material);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-otroMaterial', function (request, response) {
	otrosMaterialesBL.buscarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/* --------------------------------------------------------------------------- */

router.post('/agregar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.insertarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.eliminarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.editarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.get('/listar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.consultaMaterialesPropuestaBL()
	.then(material => {
		response.json(material);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.buscarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Rutas para la sección de opciones viaticos.
*/

router.post('/agregar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.insertar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/eliminar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.eliminar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/editar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.editar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.get('/listar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.consultar()
	.then(viatics => {
		response.json(viatics);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

router.put('/buscar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.buscar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

/*
- @section: 		Ruta para la creación del archivo PDF.
*/

router.post('/pdf', function (request, response) {
	archivoPDF.crear(request.body)
	.then(pdf => {
		response.json({
			status: 200,
			message: pdf,
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

module.exports = router; //Exportar la constate 'router' con el fin de que esta clase pueda ser ocupada por las demas
