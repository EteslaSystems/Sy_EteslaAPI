/*
- @description: 		Archivo correspondiente al Financiamiento - PDF page.
- @author: 				LH420
- @date: 				27/10/2020
*/
async function mainFinanciamiento(data){
    var costoTotalProyecto = data.costoTotal; //$$MXN

    var objGetEnganche = (costTotalProyecto) => {
        quincePorcent = Math.ceil(costoTotalProyecto * 0.15);
        treintacincoPorcent = Math.ceil(costoTotalProyecto * 0.35);
        cincuentaPorcent = Math.ceil(costoTotalProyecto * 0.50);

        objResult = {
            quincePorcent: quincePorcent,
            treintacincoPorcent: treintacincoPorcent,
            cincuentaPorcent: cincuentaPorcent
        };
        
        return objResult;
    };

    var objGetMensualidades_TarjetaCredito = (costTotalProyecto) => {
        tresMeses = Math.ceil((costTotalProyecto * 1.03) / 3);
        seisMeses = Math.ceil((costTotalProyecto * 1.06) / 6); 
        nueveMeses = Math.ceil((costTotalProyecto * 1.09) / 9); 
        doceMeses = Math.ceil((costTotalProyecto * 1.12) / 12);
        dieciochoMeses = Math.ceil((costTotalProyecto * 1.18) / 18);

        objResult = {
            tresMeses: tresMeses,
            seisMeses: seisMeses,
            nueveMeses: nueveMeses,
            doceMeses: doceMeses,
            dieciochoMeses: dieciochoMeses
        };

        return objResult;
    };

    var _getPagosMensualesPorPlazo = (cstTotalProyecto, obJGetEnganche) => {
        _porcentaje15 = [0.096,0.053,0.039,0.032,0.028,0.025,0.023];
        _porcentaje35 = [0.098,0.054,0.039,0.032,0.028,0.025,0.023];
        _porcentaje50 = [0.095,0.053,0.038,0.031,0.027,0.025,0.023];
        enganche15 = obJGetEnganche.quincePorcent;
        enganche35 = obJGetEnganche.treintacincoPorcent;
        enganche50 = obJGetEnganche.cincuentaPorcent;
        var objMensualidades = { 12:'', 24:'', 36:'', 48:'', 60:'', 72:'', 84:'' };
        var _result = [];
        var meses = 0;

        for(var i=0; i<=6; i++)
        {   
            meses += 12;
            plazo15porcent = Math.ceil(_porcentaje15[i] / 1 * (cstTotalProyecto - enganche15));
            plazo35porcent = Math.ceil(_porcentaje35[i] / 1 * (cstTotalProyecto - enganche35));
            plazo50porcent = Math.ceil(_porcentaje50[i] / 1 * (cstTotalProyecto - enganche50));

            objMensualidades[meses] = {
                fifteenPorcent: plazo15porcent,
                thirtyFive: plazo35porcent,
                fiftyPorcent: plazo50porcent
            };

            _result.push(objMensualidades);
        }

        return _result;
    };

    objEnganche = objGetEnganche(costoTotalProyecto);
    objMensualidadesCreditCard = objGetMensualidades_TarjetaCredito(costoTotalProyecto);
    _pagosMensualesPorPlazo = _getPagosMensualesPorPlazo(costoTotalProyecto, objEnganche);

    objectResult = {
        objEnganche: objEnganche,
        objMensualidadesCreditCard: objMensualidadesCreditCard,
        _pagosMensualesPorPlazo: _pagosMensualesPorPlazo
    };

    return objectResult;
}

module.exports.financiamiento = async function (data){
    const result = await mainFinanciamiento(data);
    return result;
};