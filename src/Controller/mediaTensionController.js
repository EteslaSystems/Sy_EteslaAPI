/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Media Tension
- @author: 				LH420
- @date: 				20/03/2020
*/
const irradiacion = require('../Controller/irradiacionController');
const paneles = require('../Controller/panelesController');
const inversores = require('../Controller/inversorController');
const viaticos = require('../Controller/opcionesViaticsController');
const power = require('../Controller/powerController');

async function firstStep(data){
	let _arrayResult = [];
	var objPropuestaPaneles = {};
	//Se formatea el array de los periodos cuanto los periodos vengan incompletos (<12)
	var completarData = (data) => {
		_periodos = data.arrayPeriodos;

		for(var j=0; j<_periodos.length; j++)
		{
			ikwh = parseFloat(_periodos[j].ikwh);
			bkwh = parseFloat(_periodos[j].bkwh);
			pkwh = parseFloat(_periodos[j].pkwh);
			bkw= parseFloat(_periodos[j].bkw);
			ikw= parseFloat(_periodos[j].ikw);	
			pkw= parseFloat(_periodos[j].pkw);
			bmxn = parseFloat(_periodos[j].bmxn);
			imxn = parseFloat(_periodos[j].imxn);
			pmxn = parseFloat(_periodos[j].pmxn);
			pagoTransmision = parseFloat(_periodos[j].pagoTransmi);
			cmxn = parseFloat(_periodos[j].cmxn);
			dmxn = parseFloat(_periodos[j].dmxn);
			/*----------------------------------------*/
			pIkwh += bkwh;
			pBkwh += ikwh;
			pPkwh += pkwh;
			pBkw += bkw;
			pIkw += ikw;
			pPkw += pkw;
			pBmxn += bmxn;
			pImxn += imxn;
			pPmxn += pmxn;
			pPagoTrans += pagoTransmision;
			pCmxn += cmxn;
			pDmxn += dmxn;
		}

		pIkwh = pIkwh / _periodos.length;
		pBkwh = pBkwh / _periodos.length;
		pPkwh = pPkwh / _periodos.length;
		pBkw = pBkw / _periodos.length;
		pIkw = pIkw / _periodos.length;
		pPkw = pPkw / _periodos.length;
		pBmxn = pBmxn / _periodos.length;
		pImxn = pImxn / _periodos.length;
		pPmxn = pPmxn / _periodos.length;
		pPagoTrans = pPagoTrans / _periodos.length;
		pCmxn = pCmxn / _periodos.length;
		pDmxn = pDmxn / _periodos.length;
		
		//Formateada de nueva data => nuevosPeriodos
		for(var i=(_periodos.length - 1); i<12; i++)
		{
			data.arrayPeriodos[i].bkwh = pIkwh;
			data.arrayPeriodos[i].ikwh = pBkwh;
			data.arrayPeriodos[i].pkwh = pPkwh;
			data.arrayPeriodos[i].bkw = pBkw;
			data.arrayPeriodos[i].ikw = pIkw;
			data.arrayPeriodos[i].pkw = pPkw;
			data.arrayPeriodos[i].bmxn = pBmxn;
			data.arrayPeriodos[i].imxn = pImxn;
			data.arrayPeriodos[i].pmxn = pPmxn;
			data.arrayPeriodos[i].pagoTransmi = pPagoTrans;
			data.arrayPeriodos[i].cmxn = pCmxn;
			data.arrayPeriodos[i].dmxn = pDmxn;
		}
	};

	//Validar que en la data vengan los 12 periodos
	data.arrayPeriodos = data.arrayPeriodos.length === 12 ? data.arrayPeriodos : completarData(data);

	//Calculo de consumos
	objEnergiaConsumida = getPeriodosPromedios(data);

	potenciaNecesaria = await getPotenciaNecesaria(4.6,objEnergiaConsumida.consumoAnual); //Watts
	
	objPropuestaPaneles = {
        consumo: {
            _promCons: objEnergiaConsumida,
            potenciaNecesaria: potenciaNecesaria
        }
    };

	_arrayResult.push(objPropuestaPaneles);

	_paneles = await paneles.numeroDePaneles(potenciaNecesaria);

	for(var x=0; x<_paneles.length; x++)
    {
        costoTotalPaneles = Math.round(((parseFloat(_paneles[x].precioPorPanel * _paneles[x].potencia)) * _paneles[x].noModulos) * 100) / 100;
        _paneles[x].costoTotal = costoTotalPaneles;

        objPropuestaPaneles = {
            panel: _paneles[x]
        };

        _arrayResult.push(objPropuestaPaneles);
    }

	return _arrayResult;
}

async function getPotenciaNecesaria(irradiacion, consumoAnual){ //Retorna en watts
	var porcentajePerdida = 18 / 100;
	var potenciaNecesaria = Math.round((((consumoAnual / irradiacion) / (1 - porcentajePerdida)) / 365) * 100)/100;
	
	potenciaNecesaria = potenciaNecesaria >= 500 ? 499 : potenciaNecesaria;
	potenciaNecesaria = potenciaNecesaria * 1000;

	return potenciaNecesaria;
}

async function getPeriodosPromedios(data){ //Todo esta retornado en KWH
	_periods = data.arrayPeriodos;

	var getPeriodosSumados = (periodos) => { //PeriodoSumado = bkwh + ikwh + pkwh; => [Mes]
		_periodoSumado = [];

		for(var a=0; a<periodos.length; a++)
		{
			var bkwh = periodos[a].bkwh;
			var ikwh = periodos[a].ikwh;
			var pkwh = periodos[a].pkwh;

			sumaPeriodo = bkwh + ikwh + pkwh;

			_periodoSumado[a] = sumaPeriodo;
		}
		return _periodoSumado;
	};

	var consumoAnual = (periodoSumado) => {
		consAnual = 0;

		periodoSumado.forEach(periodo => { consAnual += periodo });

		return consAnual;
	};

	var consumoDiario = (consumoAnio) => {
		consDiario = consumoAnio / 365;
		return consDiario;
	};

	var consumoBimestral = (periodoSumado) => {
		consBimestral = [];
		bimestre = 0;

		for(e=0; e<6; e++)
		{
			if(e != 0 && e % 2 == 1){
				bimestre = periodoSumado[e+1] + periodoSumado[e+2];
			}
			else{
				bimestre = periodoSumado[e] + periodoSumado[e+1];
			}

			consBimestral[e] = bimestre;
		}

		return consBimestral;
	};

	var promedioConsumosMensuales = (periodoSumado) => {
		promConsumoMensual = 0;

		periodoSumado.forEach(periodo => { promConsumoMensual += periodo });

		promConsumoMensual = promedioConsumosMensuales / periodoSumado.length;
		return promConsumoMensual;
	};

	var promedioConsumosBimestrales = (consumosBimestrales) => {
		promConsBimest = 0;

		consumosBimestrales.forEach(bimestre => { promConsBimest += bimestre });
		promConsBimest = promConsBimest / consumosBimestrales.length;
		return promConsBimest;
	};

	_periodoSumados = getPeriodosSumados(periodos); //Consumos mensuales
	_consumosBimestral = consumoBimestral(_periodoSumados);
	consumoAnual = consumoAnual(_periodoSumados);
	consumoDiario = consumoDiario(consumoAnual);
	promedioConsumosMensuales = promedioConsumosMensuales(_periodoSumados);
	promedioConsumosBimestrales = promedioConsumosBimestrales(_consumosBimestral);

	objResult = {
		promedioConsumosMensuales: promedioConsumosMensuales,
        promConsumosBimestrales: promedioConsumosBimestrales,
        consumoMensual: _periodoSumados,
        consumoAnual: consumoAnual,
        consumoDiario: consumoDiario
	};

	return objResult;
}

/****************************-****************************/
module.exports.firstStepGDMTH = async function(data){
	const result = await firstStep(data);
	return result;
}