const express = require('express');
const router = express.Router();
const panelBL = require('../BL/panelesBL');

//Initializations
router.use(express.json());

router.get('/lista-paneles', function (req, res) {
	panelBL.consultar()
	.then(panel => {
		res.json(panel).end();
	})
	.catch(error => {
		res.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.post('/agregar-panel', function (req, res) {
	panelBL.insertar(req.body)
	.then(panel => {
		res.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		res.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/eliminar-panel', function (req, res) {
	panelBL.eliminar(req.body)
	.then(panel => {
		res.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		res.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/buscar-panel', function (req, res) {
	panelBL.buscar(req.body)
	.then(panel => {
		res.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		res.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

router.put('/editar-panel', function (req, res) {
	panelBL.editar(req.body)
	.then(panel => {
		res.json({
			status: 200,
			message: panel,
		}).end();
	})
	.catch(error => {
		res.json({
			status: 500,
			message: error.message,
		}).end();
	});
});

module.exports = router;