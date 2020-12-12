module.exports.obtenerROI = async function getROI(objPower, _consums, costoProyectoMXN){
    let costoKwh = 5; //Pesos MXN
    var tarifa = objPower.dac_o_nodac; //dac o no dac - tarifas
    var consumoAnual = _consums._promCons.consumoAnual; //*KWH*
    var generacionAnual = objPower.generacion.generacionAnual; //*KWp* 
    var costoDeProyecto = costoProyectoMXN; //CostoProyectoMXN con IVA

    /*kwh - Ahorro energia*/
    consumoAnualaCFE = Math.round((consumoAnual - generacionAnual) * 100)/100;

    /*$$ - Ahorro dinero(s)*/
    consumoAnualPesosMXN = consumoAnual * costoKwh; 
    generacionAnualPesosMXN = (generacionAnual * costoKwh); //(generacionAnual_kwh) * costoKwh
    ROIenAnios = Math.round((costoDeProyecto / generacionAnualPesosMXN) * 100) / 100;

    /*$$ - Nuevo pago a CFE*/
    nuevoPagoAnual = Math.round((consumoAnualaCFE * 1.5) * 100) / 100;
    nuevoPagoBimestral = Math.round((nuevoPagoAnual / 6) * 100)/100;

    objRespuesta = {
        ahorroAnualEnKwh: generacionAnual,
        consumoAnualaCFE: consumoAnualaCFE,
        consumoAnualPesosMXN: consumoAnualPesosMXN,
        generacionAnualPesosMXN: generacionAnualPesosMXN,
        ROIenAnios: ROIenAnios,
        nuevoPagoAnual: nuevoPagoAnual,
        nuevoPagoBimestral: nuevoPagoBimestral
    };

    return objRespuesta;
}