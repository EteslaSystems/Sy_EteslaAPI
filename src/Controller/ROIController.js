module.exports.obtenerROI = async function getROI(objPower, _consums, costoProyectoMXN){
    let consumoAnual = parseFloat(_consums._promCons.consumoAnual); //*KWH*
    let generacionAnual = 0; //*KWp* 
    let costoDeProyecto = costoProyectoMXN; //CostoProyectoMXN con IVA
  
    if(objPower.generacion.generacionAnualMwh){ ///Kwh
        generacionAnual = objPower.generacion.produccionAnualKwh;
    }
    else{
        generacionAnual = objPower.generacion.generacionAnual;
    }

    /*$$ - Pago a CFE y Ahorro(s)*/
    ///Pago a CFE
    consumoAnualPesosMXN = objPower.objConsumoEnPesos.pagoAnualIva;
    consumoBimestralPesosMXN = objPower.objConsumoEnPesos.pagoPromedioBimestralConIva;    
    consumoMensualPesosMXN = objPower.objConsumoEnPesos.pagoPromedioMensualConIva;
    ///
    generacionAnualPesosMXN = objPower.objGeneracionEnpesos.pagoAnualIva; //(generacionAnual_kwh) * costoKwh
    ROIenAnios = Math.round((costoDeProyecto / generacionAnualPesosMXN) * 100) / 100;

    ahorroAnualKw = Math.round((consumoAnual - generacionAnual) * 100)/100; //kwh

    /*Ahorro (energia/$$)*/    
    /*#region Hipotesis_aboutROI*/
    ahorroAnualEnPesosMXN = Math.round((consumoAnualPesosMXN - generacionAnualPesosMXN) * 100)/100; //$$
    ahorroBimestralEnPesosMXN = consumoBimestralPesosMXN - objPower.objGeneracionEnpesos.pagoPromedioBimestralConIva;
    ahorroMensualEnPesosMXN = Math.round((ahorroBimestralEnPesosMXN / 2) * 100) / 100; //$$
    /*#endregion*/

    objRespuesta = {
        ahorro: {
            ahorroAnualKw: ahorroAnualKw,
            ahorroAnualEnPesosMXN: ahorroAnualEnPesosMXN,
            ahorroBimestralEnPesosMXN: ahorroBimestralEnPesosMXN,
            ahorroMensualEnPesosMXN: ahorroMensualEnPesosMXN
        },
        consumo: {
            consumoAnualPesosMXN: consumoAnualPesosMXN,
            consumoBimestralPesosMXN: consumoBimestralPesosMXN,
            consumoMensualPesosMXN: consumoMensualPesosMXN
        },
        generacion: {
            nuevoPagoAnual: generacionAnualPesosMXN,
            nuevoPagoBimestral: objPower.objGeneracionEnpesos.pagoPromedioBimestralConIva
        },
        roiEnAnios: ROIenAnios
    };

    return objRespuesta;
}