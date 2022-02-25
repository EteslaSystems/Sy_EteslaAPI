const express = require('express');
const router = express.Router();
const DolarBL = require('../BL/dolar.bl');

//Initializations
router.use(express.json());

router.get('/tipoDeCambio', function(request, response){
	DolarBL.obtenerPrecioDolar()
	.then(result => {
		response.json({ status: 200, message: result });
	})
	.catch(error => {
		response.json({ status: 500, message: error });
	});
});

router.get('/manualUpdate', function(request, response){
	DolarBL.actualizarPrecioDolar()
	.then(result => {
		response.json({ status: 200, message: result });
	})
	.catch(error => {
		response.json({ status: 500, message: error });
	});
});