const express = require('express');
const router = express.Router();

const cotizacion = require('../Controller/cotizacionController');

const bajaTensionController = require('../Controller/bajaTensionController');
const mediaTensionController = require('../Controller/mediaTensionController');
const powerController = require('../Controller/powerController');

//Initializations
router.use(express.json());

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
		});
	})
	.catch(error => {
		response.json({
			status: 500,
			message: error
		});
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
	mediaTensionController.calcularViaticos(request.body)
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
/*#endregion*/
/*#endregion*/



module.exports = router;