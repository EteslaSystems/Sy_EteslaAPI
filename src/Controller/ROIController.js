module.exports.obtenerROI = async function getROI(objPower, _consums, costoProyectoMXN){
    let consumoAnualKwh = parseFloat(_consums._promCons.consumoAnual); //*KWH*
    let costoDeProyecto = costoProyectoMXN; //CostoProyectoMXN con IVA
    let generacionAnualKwp = 0; //*KWp* 
    let consumoAnualPesosMXN = 0, consumoBimestralPesosMXN = 0, consumoMensualPesosMXN = 0;
    let generacionBimestralPesosMXN = 0, generacionAnualPesosMXN = 0;
    let ahorroAnualKw = 0, ahorroAnualEnPesosMXN = 0, ahorroBimestralEnPesosMXN  = 0, ahorroMensualEnPesosMXN = 0;
    let ROIenAnios = 0;
    let ROIcnDeduccion = 0;

    try{
        if(objPower.generacion.generacionAnualMwh){ ///MediaTension - KWH
            generacionAnualKwp = objPower.generacion.produccionAnualKwh;

            ///Consumo - MXN
            consumoAnualPesosMXN = objPower.pagosTotales.arrayTotalesAhorro.totalAnualSinSolar;
            consumoBimestralPesosMXN = objPower.pagosTotales.arrayTotalesAhorro.ConsumoMXN.pagoPromedioBimest;
            consumoMensualPesosMXN = objPower.pagosTotales.arrayTotalesAhorro.ConsumoMXN.promPagosConsumsMes;
            
            ///Generacion - MXN
            generacionAnualPesosMXN = objPower.pagosTotales.arrayTotalesAhorro.GeneracionMXN.consumoAnualMXN; 
            generacionBimestralPesosMXN = objPower.pagosTotales.arrayTotalesAhorro.GeneracionMXN.pagoPromedioBimest;
        }
        else{///BajaTension ||  Individual - KWH
            generacionAnualKwp = objPower.generacion.generacionAnual;

            ///Consumo - MXN
            consumoAnualPesosMXN = objPower.objConsumoEnPesos.pagoAnual;
            consumoBimestralPesosMXN = objPower.objConsumoEnPesos.pagoPromedioBimestral;    
            consumoMensualPesosMXN = objPower.objConsumoEnPesos.pagoPromedioMensual;
            
            ///Generacion - MXN
            generacionAnualPesosMXN = objPower.objGeneracionEnpesos.pagoAnual; 
            generacionBimestralPesosMXN = objPower.objGeneracionEnpesos.pagoPromedioBimestral;
        }
    
        ahorroAnualKw = Math.round((consumoAnualKwh - generacionAnualKwp) * 100)/100; //kwh
    
        /*Ahorro (energia/$$)*/    
        ahorroAnualEnPesosMXN = Math.round(consumoAnualPesosMXN - generacionAnualPesosMXN); //$$
        ahorroBimestralEnPesosMXN = Math.round(consumoBimestralPesosMXN - generacionBimestralPesosMXN);
        ahorroMensualEnPesosMXN = Math.round(ahorroBimestralEnPesosMXN / 2); //$$
    
        ROIenAnios = Math.round((costoDeProyecto / ahorroAnualEnPesosMXN) * 100) / 100;
        ROIcnDeduccion = Math.round((ROIenAnios * 0.7) * 100) / 100;

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
                nuevoPagoBimestral: generacionBimestralPesosMXN
            },
            roiEnAnios: ROIenAnios,
            roiConDeduccion: ROIcnDeduccion
        };
    
        return objRespuesta;
    }
    catch(error){
        console.log(error);
    }
}