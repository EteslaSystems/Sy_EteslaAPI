module.exports.obtenerROI = async function getROI(data){
    let generacionAnualKwp = 0; //*KWp* 
    let consumoAnualPesosMXN = 0, consumoBimestralPesosMXN = 0, consumoMensualPesosMXN = 0;
    let generacionBimestralPesosMXN = 0, generacionAnualPesosMXN = 0;

    try{
        let { objPower, _consums, precioMXNSinIVA } = data;
        
        let consumoAnualKwh = parseFloat(_consums._promCons.consumoAnual); //*KWH*

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
    
        let ahorroAnualKw = Math.round((consumoAnualKwh - generacionAnualKwp) * 100)/100; //kwh
    
        /*Ahorro (energia/$$)*/    
        let ahorroAnualEnPesosMXN = Math.round(consumoAnualPesosMXN - generacionAnualPesosMXN); //$$
        let ahorroBimestralEnPesosMXN = Math.round(consumoBimestralPesosMXN - generacionBimestralPesosMXN);
        let ahorroMensualEnPesosMXN = Math.round(ahorroBimestralEnPesosMXN / 2); //$$
    
        /*ROI [Anual - c/Deduccion] */
        let ROI = obtainROI({ ahorroMensualEnPesosMXN, precioMXNSinIVA });

        return {
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
            roiEnAnios: ROI.ROIbruto,
            roiConDeduccion: ROI.ROIneto
        };
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

function obtainROI(data){
    try{
        let { ahorroMensualEnPesosMXN, precioMXNSinIVA } = data;

        let meses = 0;
        let ahorro_acumulado = ahorroMensualEnPesosMXN;
        ahorroMensualEnPesosMXN = ahorroMensualEnPesosMXN * (1 + 0.00643403/*IncrementoCFE*/);

        while(ahorro_acumulado <= precioMXNSinIVA){
            meses++;
            ahorro_acumulado += ahorroMensualEnPesosMXN;
        }

        let ROIbruto = Math.round((meses/12) * 10) / 10;
        let ROIneto = Math.round((ROIbruto * 0.7) * 10) / 10;

        return { ROIbruto, ROIneto };
    }
    catch(error){
        console.log(error);
        throw error;
    }
}