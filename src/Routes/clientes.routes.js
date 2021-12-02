const express = require('express');
const router = express.Router();
const clienteBL = require('../BL/clienteBL');
const clienteCont = require('../Controller/clienteController');

//Initializations
router.use(express.json());

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

router.put('/cliente-por-id', function (request, response) {
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

router.put('/busqueda-cliente-nombre', function (request, response) {
	clienteCont.consultarPorNombre(request.body)
	.then(cliente => {
		response.json({
			status: 200,
			message: cliente.message,
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

module.exports = router;