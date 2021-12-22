const ViaticoController = require('../Controller/viaticos.controller');
const Log = require('../../config/logConfig');

class ViaticosBL{
    //Instancia
    viaticosController = new ViaticoController();
};

module.exports = ViaticosBL;