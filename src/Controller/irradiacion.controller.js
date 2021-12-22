class IrradiacionController{
    obtenerIrradiacion(origen){
        if(origen == 'CDMX' || origen == 'Puebla'){
            return 5.42;
        }
        else{
            return 4.6;
        }
    }
}

module.exports = IrradiacionController;