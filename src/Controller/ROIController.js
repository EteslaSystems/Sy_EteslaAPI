module.exports = async function getROI(data){
    let costoKwh = 5; //Pesos MXN
    var consumoAnual = data.consumos.consumoAnual; //*KWH*
    var generacionBimestral = data.generacion.generacionBimestral; //*KWH*
    var costoDeProyecto = data.totales.costoProyectoConIVA; //*USD - COSTO DEL PROYECTO EN DOLARES

    /*kwh - Ahorro energia*/
    ahorroAnualEnKwh = generacionBimestral * 6;
    consumoAnualaCFE = consumoAnual - ahorroAnualEnKwh;

    /*$$ - Ahorro dinero(s)*/
    consumoAnualPesosMXN = consumoAnual * costoKwh; 
    generacionAnualPesosMXN = ((generacionBimestral * 6) * costoKwh); //(generacionAnual_kwh) * costoKwh
    ROIenAnios = costoDeProyecto / generacionAnualPesosMXN;

    /*$$ - Nuevo pago a CFE*/
    nuevoPagoAnual = consumoAnualaCFE * 1.5;
    nuevoPagoBimestral = nuevoPagoAnual / 6;

    objRespuesta = {
        ahorroAnualEnKwh: ahorroAnualEnKwh,
        consumoAnualaCFE: consumoAnualaCFE,
        consumoAnualPesosMXN: consumoAnualPesosMXN,
        generacionAnualPesosMXN: generacionAnualPesosMXN,
        ROIenAnios: ROIenAnios,
        nuevoPagoAnual: nuevoPagoAnual,
        nuevoPagoBimestral: nuevoPagoBimestral
    };

    return objRespuesta;
}