module.exports.obtenerIrradiacion = function(origen){
    let irradiacion = 0;

    if(origen == 'CDMX' || origen == 'Puebla'){
        irradiacion =  5.42;
    }
    else{
        irradiacion =  4.6;
    }

    return irradiacion;
}