/*
- @description: 	Archivo de rutas, se recibe todo lo externo para su manejo dentro del servidor.
- @author: 			Yael Ramirez Herrerias / Jesus Daniel Carrera Fálcon
- @date: 			20/02/2020
*/
//Requires
const express = require('express');
const router = express.Router();



const vendedor_clienteBL = require('../BL/vendedor_clienteBL');
//const mediaTensionBL = require('../BL/mediaTensionBL');
const otrosMaterialesBL = require('../BL/otrosMaterialesBL');
const opcionesViaticsBL = require('../BL/opcionesViaticsBL');

const viaticosController = require('../Controller/opcionesViaticsController.js');


//Initializations
router.use(express.json());



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

/*#endregion*/

module.exports = router; //Exportar la constate 'router' con el fin de que esta clase pueda ser ocupada por las demas
