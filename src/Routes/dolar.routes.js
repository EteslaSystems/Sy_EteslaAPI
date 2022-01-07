const express = require('express');
const router = express.Router();
const DolarBL = require('../BL/dolar.bl');

//Initializations
router.use(express.json());

//Instancia
let dolarBL = new DolarBL();

router.get('/tipoDeCambio', function(request, response){
	dolarBL.obtenerPrecioDolar()
	.then(result => {
		response.json({ status: 200, message: result });
	})
	.catch(error => {
		response.json({ status: 500, message: error });
	});
});

router.get('/manualUpdate', function(request, response){
	dolarBL.actualizarPrecioDolar()
	.then(result => {
		response.json({ status: 200, message: result });
	})
	.catch(error => {
		response.json({ status: 500, message: error });
	});
});