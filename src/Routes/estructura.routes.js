const express = require('express');
const router = express.Router();

const EstructuraBL = require('../BL/estructura.bl');

//Initializations
router.use(express.json());

router.post('/agregar-estructura', function(request, response){
	EstructuraBL.insertar(request.body)
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
	EstructuraBL.eliminar(request.body)
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
	EstructuraBL.leer()
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
	EstructuraBL.buscar(request.body)
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