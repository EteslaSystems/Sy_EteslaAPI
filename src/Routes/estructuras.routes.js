const express = require('express');
const router = express.Router();

const estructura = require('../Controller/estructuraController.js');

//Initializations
router.use(express.json());

router.post('/agregar-estructura', function(request, response){
	estructura.insertar(request.body)
	.then(estructura => {
		response.json({
			status: 200,
			message: estructura.message
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});

router.put('/eliminar-estructura', function (request, response) {
	estructura.eliminar(request.body)
	.then(estructura => {
		response.json({
			status: 200,
			message: estructura.message,
		}).end();
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.get('/lista-estructuras', function(request, response){
	estructura.leer()
	.then(estructura => {
		response.json({
			status: 200,
			message: estructura.message
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error.message
		});
	});
});	

router.put('/buscar-estructura', function(request, response){
	estructura.buscar(request.body)
	.then(estructura => {
		response.json({
			status: 200,
			message: estructura.message
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
	});
});

module.exports = router;