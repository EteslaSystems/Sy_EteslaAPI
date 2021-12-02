const express = require('express');
const router = express.Router();
const inversorBL = require('../BL/inversorBL');

const inversor = require('../Controller/inversorController');

//Initializations
router.use(express.json());

router.put('/listar-micros', function(request, response){
	inversorBL.obtenerEquiposTipo(request.body)
	.then(vTipoEquipos => {
		response.json({
			status: 200,
			message: vTipoEquipos
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		});
	});
});

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

module.exports = router;