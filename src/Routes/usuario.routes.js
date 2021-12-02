const express = require('express');
const router = express.Router();
const usuarioBL = require('../BL/usuarioBL');
const dollar = require('../Controller/dollarController');

//Initializations
router.use(express.json());

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

/*#region PrecioDelDolar*/
router.get('/tipoCambioDolar', function(request, response){
	dollar.obtenerPrecioDolar()
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

router.get('/manualUpdateDolarPrice', function(request, response){
	dollar.actualizarManualPrecioDolar()
	.then(result => {
		response.json({ status: 200, message: result });
	})
	.catch(error => {
		response.json({ status: 500, message: error });
	});
});
/*#endregion*/

module.exports = router;