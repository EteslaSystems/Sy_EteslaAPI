/*
- @description: 	Archivo de rutas, se recibe todo lo externo para su manejo dentro del servidor.
- @author: 			Yael Ramirez Herrerias / Jesus Daniel Carrera Fálcon
- @date: 			20/02/2020
*/
//Requires
const express = require('express');
const fs = require('fs');
const router = express.Router();
const usuarioBL = require('../BL/usuarioBL');
const inversorBL = require('../BL/inversorBL');
const panelBL = require('../BL/panelesBL');
const clienteBL = require('../BL/clienteBL');
const vendedor_clienteBL = require('../BL/vendedor_clienteBL');
//const mediaTensionBL = require('../BL/mediaTensionBL');
const otrosMaterialesBL = require('../BL/otrosMaterialesBL');
const opcionesViaticsBL = require('../BL/opcionesViaticsBL');
const dollar = require('../Controller/dolar_tipoCambio');
const viaticosController = require('../Controller/opcionesViaticsController.js');
const archivoPDF = require('../PDF/crearPdf');  // Ruta del PDF.

//Initializations
router.use(express.json());

//Routes
router.get('/', function(requeset, response){
	response.json({
		status: 200,
		message: 'Hello Etesla!'
	});
});

/*
- @section: 		Rutas para la sección de usuarios.
*/

/*#region Region de prueba : Favor de ignorar /borrar cuando sea necesario(Solo LH420)\*/
const bajaTensionController = require('../Controller/bajaTensionController');
const mediaTensionController = require('../Controller/mediaTensionController');
const powerController = require('../Controller/powerController');


/*#region Cotizador*/
/*#region PrecioDelDolar*/
router.get('/tipoCambioDolar', function(request, response){
	dollar.obtenerPrecioDolar()
	.then(result => {
		response.json({
			status: 200,
			message: result,
			alert: 'Archivo respaldado y precio del dolar actualizado'
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});
});

router.get('/manualUpdateDolarPrice', function(request, response){
	dollar.actualizarManualPrecioDolar()
	.then(result => {
		console.log(result);
		/* response.json({
		}).end(); */
	})
	.catch(error => {
		response.json({ error });
	}).end();
});
/*#endregion*/
/*#region bajaTension*/
//1st. Step
router.post('/sendPeriodsBT', function(request, response){
	bajaTensionController.firstStepBT(request.body)
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

//Calcular viaticos BTI
router.post('/calcularViaticosBTI',function(request, response){
	viaticosController.calcularViaticosBTI(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
	});
});

//[HOJA: POWER]
router.post('/obtenerPowerBT',function(request, response){
	powerController.obtenerPowerBTI(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		})
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
	});
});
/*#endregion*/
/*#region individual*/
const cotizIndiv = require('../Controller/cotizacion_individualController');

router.post('/cotizacionIndividual', function(request, response){
	cotizIndiv.cotizacion_individual(request.body)
	.then(cotizacion_individual => {
		response.json({
			status: 200,
			message: cotizacion_individual
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	});
	
});
/*#endregion*/
/*#region mediaTension*/ 
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
});

router.post('/firstStepPower', function(request, response){
	powerController.getCD_DatosConsumo_(request.body)
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
/* 
	powerController.getProduccionIntermedia_(request.body)
	.then(result => {
		console.log(result);
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		}).end();
	}); */
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
/*#endregion GDMTH*/
/*#endregion mediaTension*/
/*#endregion*/
/*#endregion*/

router.post('/agregar-usuario', function (request, response) {
	usuarioBL.insertar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

router.put('/eliminar-usuario', function (request, response) {
	usuarioBL.eliminar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

router.put('/editar-usuario', function (request, response) {
	usuarioBL.editar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

router.get('/consultar-usuarios', function (request, response) {
	usuarioBL.consultar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

router.put('/buscar-usuario', function (request, response) {
	usuarioBL.consultarId(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

router.post('/validar-usuario', function (request, response) {
	usuarioBL.validar(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

router.post('/verificar-email', function (request, response) {
	usuarioBL.verificarEmail(request.body)
	.then(usuario => {
		response.json({
			status: 200,
			message: usuario,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});



/*
- @section: 		Rutas para la sección de inversores.
*/
/*#regionLH420_experimental*/
const inversor = require('../Controller/inversorController');
const cotizacion = require('../Controller/cotizacionController');

/*#region financiamiento?exp*/
const financiamiento = require('../Controller/financiamientoProjController');

router.post('/finan', function(request, response){
	financiamiento.financiamiento(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
	});
});
/*#end region*/

router.post('/inversores-selectos', function(request, response){
	inversor.obtenerInversores_cotizacion(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
	});
});

//Busqueda_inteligente
router.post('/busqueda-inteligente', function(request, response){
	cotizacion.mainBusqInteligente(request.body)
	.then(result => {
		response.json({
			status: 200,
			message: result
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
	});
});

//RouteView Handlebars
router.get('/cotizacionView', (request, response) => {
	response.render('cotizacion');
});
/*#endregion*/

router.get('/lista-inversores', function (request, response) {
	inversorBL.consultar()
	.then(inversor => {
		response.json(inversor).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.post('/agregar-inversor', function (request, response) {
	inversorBL.insertar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-inversor', function (request, response) {
	inversorBL.eliminar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-inversor', function (request, response) {
	inversorBL.buscar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-inversor', function (request, response) {
	inversorBL.editar(request.body)
	.then(inversor => {
		response.json({
			status: 200,
			message: inversor,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

/*
- @section: 		Rutas para la sección de paneles.
*/

router.get('/lista-paneles', function (request, response) {
	panelBL.consultar()
	.then(panel => {
		response.json(panel).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.post('/agregar-panel', function (request, response) {
	panelBL.insertar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-panel', function (request, response) {
	panelBL.eliminar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-panel', function (request, response) {
	panelBL.buscar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-panel', function (request, response) {
	panelBL.editar(request.body)
	.then(panel => {
		response.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
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
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-cliente', function (request, response) {
	clienteBL.eliminar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-cliente', function (request, response) {
	clienteBL.editar(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.get('/lista-clientes', function (request, response) {
	clienteBL.consultar()
	.then(cliente => {
		response.json(cliente).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/lista-clientes-id', function (request, response) {
	clienteBL.consultarId(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/lista-clientes-usuario', function (request, response) {
	clienteBL.consultarUser(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
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
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
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
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.eliminarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.editarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.get('/listar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.consultaCategoriaMaterialesBL()
	.then(material => {
		response.json(material).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-categoriaMateriales', function (request, response) {
	otrosMaterialesBL.buscarCategoriaMaterialesBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

/* --------------------------------------------------------------------------- */

router.post('/agregar-otroMaterial', function (request, response) {
	otrosMaterialesBL.insertarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-otroMaterial', function (request, response) {
	otrosMaterialesBL.eliminarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-otroMaterial', function (request, response) {
	otrosMaterialesBL.editarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.get('/listar-otroMaterial', function (request, response) {
	otrosMaterialesBL.consultaOtroMaterialBL()
	.then(material => {
		response.json(material).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-otroMaterial', function (request, response) {
	otrosMaterialesBL.buscarOtroMaterialBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

/* --------------------------------------------------------------------------- */

router.post('/agregar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.insertarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.eliminarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.editarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.get('/listar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.consultaMaterialesPropuestaBL()
	.then(material => {
		response.json(material).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-materialesPropuesta', function (request, response) {
	otrosMaterialesBL.buscarMaterialesPropuestaBL(request.body)
	.then(material => {
		response.json({
			status: 200,
			message: material,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
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
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.eliminar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.editar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.get('/listar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.consultar()
	.then(viatics => {
		response.json(viatics).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-opcionesViatics', function (request, response) {
	opcionesViaticsBL.buscar(request.body)
	.then(viatics => {
		response.json({
			status: 200,
			message: viatics,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

/*
- @section: 		Ruta para la creación del archivo PDF.
*/

router.post('/pdf',function (request, response) {
	archivoPDF.crearPDF(request.body)
	.then(objPdf => {
		pdf64 = fs.readFileSync(objPdf.rutaArchivo, { encoding: 'base64' });

		if(objPdf.nombreArchivo != null){
			var respuesta = {
				fileName: objPdf.nombreArchivo,
				pdfBase64: pdf64
			};
		}
		
		response.json({
			status: 200,
			message: respuesta
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		}).end();
	});
});

/*#endregion*/

module.exports = router; //Exportar la constate 'router' con el fin de que esta clase pueda ser ocupada por las demas
