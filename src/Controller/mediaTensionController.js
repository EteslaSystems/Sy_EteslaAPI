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

/*#region Cotizacion*/
async function firstStep(data){
	let _arrayResult = [];
	let objPropuestaPaneles = {};
	let objPromPerodsIncomp = {};
	let porcentajePropuesta = parseFloat(data.porcentajePropuesta) / 100 || 0;

	//Se formatea el array de los periodos cuanto los periodos vengan incompletos (<12)
	let completarData = (data) => {
		let pIkwh=0, pBkwh=0, pPkwh=0, pBkw=0, pIkw=0, pPkw=0, pBmxn=0, pImxn=0, pPmxn=0, pPagoTrans=0, pCmxn=0, pDmxn=0;
		let _periodos = data.arrayPeriodos;

		for(let j=0; j<_periodos.length; j++)
		{
			let bkwh = parseFloat(_periodos[j].BkWh) || 0;
			let ikwh = parseFloat(_periodos[j].IkWh) || 0;
			let pkwh = parseFloat(_periodos[j].PkWh) || 0;
			let bkw= parseFloat(_periodos[j].Bkw) || 0;
			let ikw= parseFloat(_periodos[j].Ikw) || 0;	
			let pkw= parseFloat(_periodos[j].Pkw) || 0;
			let bmxn = parseFloat(_periodos[j].B_mxnkWh) || 0;
			let imxn = parseFloat(_periodos[j].I_mxnkWh) || 0;
			let pmxn = parseFloat(_periodos[j].P_mxnkWh) || 0;
			let pagoTransmision = parseFloat(_periodos[j].pagoTransmision) || 0;
			let cmxn = parseFloat(_periodos[j].C_mxnkW) || 0;
			let dmxn = parseFloat(_periodos[j].D_mxnkW) || 0;
			/*----------------------------------------*/
			pIkwh += ikwh;
			pBkwh += bkwh;
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

		pIkwh = Math.round((pIkwh / _periodos.length) * 100) / 100;
		pBkwh = Math.round((pBkwh / _periodos.length) * 100) / 100;
		pPkwh = Math.round((pPkwh / _periodos.length) * 100) / 100;
		pBkw = Math.round((pBkw / _periodos.length) * 100) / 100;
		pIkw = Math.round((pIkw / _periodos.length) * 100) / 100;
		pPkw = Math.round((pPkw / _periodos.length) * 100) / 100;
		pBmxn = Math.round((pBmxn / _periodos.length) * 100) / 100;
		pImxn = Math.round((pImxn / _periodos.length) * 100) / 100;
		pPmxn = Math.round((pPmxn / _periodos.length) * 100) / 100;
		pPagoTrans = Math.round((pPagoTrans / _periodos.length) * 100) / 100;
		pCmxn = Math.round((pCmxn / _periodos.length) * 100) / 100;
		pDmxn = Math.round((pDmxn / _periodos.length) * 100) / 100;
		
		if(data.tarifa === 'GDMTH'){
			objPromPerodsIncomp = { 
				BkWh: pBkwh, 
				IkWh: pIkwh, 
				PkWh: pPkwh, 
				Bkw: pBkw, 
				Ikw: pIkw, 
				Pkw: pPkw, 
				B_mxnkWh: pBmxn, 
				I_mxnkWh: pImxn, 
				P_mxnkWh: pPmxn, 
				pagoTransmision: pPagoTrans, 
				C_mxnkW: pCmxn, 
				D_mxnkW: pDmxn, 
			};
		}
		else{
			objPromPerodsIncomp = { 
				IkWh: pIkwh, 
				Ikw: pIkw,
				I_mxnkWh: pImxn,
				pagoTransmision: pPagoTrans, 
				C_mxnkW: pCmxn,
			};
		}
		
		//Formateada de nueva data => nuevosPeriodos
		for(var i=_periodos.length; i<12; i++)
		{
			data.arrayPeriodos.push(objPromPerodsIncomp);
		}
	};

	//Validar que en la data vengan los 12 periodos
	if(data.arrayPeriodos.length < 12){
		completarData(data);
	}

	//Calculo de consumos
	objEnergiaConsumida = await getPeriodosPromedios(data);

	potenciaNecesaria = await getPotenciaNecesaria(4.6,objEnergiaConsumida.consumoAnual, porcentajePropuesta); //Watts
	
	objPropuestaPaneles = {
        consumo: { //Procesados
            _promCons: objEnergiaConsumida,
            potenciaNecesaria: potenciaNecesaria
        },
		periodos: data
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
/*#endregion Cotizacion*/



async function getPotenciaNecesaria(irradiacion, consumoAnual, porcentajePropuesta){ //Retorna en watts
	let porcentajePerdida = 18 / 100;
	let potenciaNecesaria = 0;
	
	if(porcentajePropuesta === 0){
		potenciaNecesaria = Math.round((((consumoAnual / irradiacion) / (1 - porcentajePerdida)) / 365) * 100)/100;
	}
	else{
		potenciaNecesaria = Math.round(((((consumoAnual * porcentajePropuesta) / irradiacion) / (1 - porcentajePerdida)) / 365)  * 100)/100;
	}

	potenciaNecesaria = potenciaNecesaria >= 500 ? 499 : potenciaNecesaria;
	potenciaNecesaria = potenciaNecesaria * 1000;

	return potenciaNecesaria;
}

async function getPeriodosPromedios(data){ //Todo esta retornado en KWH
	let _periods = data.arrayPeriodos;

	let getPeriodosSumados = (periodos) => { //PeriodoSumado = bkwh + ikwh + pkwh; => [Mes - kwh]
		let _periodoSumado = [];
		let sumaPeriodo = 0;

		for(let a=0; a<periodos.length; a++)
		{
			let bkwh = parseFloat(periodos[a].BkWh) || 0;
			let ikwh = parseFloat(periodos[a].IkWh) || 0;
			let pkwh = parseFloat(periodos[a].PkWh) || 0;

			sumaPeriodo = bkwh + ikwh + pkwh;

			_periodoSumado[a] = sumaPeriodo;
		}
		return _periodoSumado;
	};

	let consumoAnual = (periodoSumado) => {
		consAnual = 0;

		periodoSumado.forEach(periodo => { consAnual += periodo });
		consAnual = Math.round(consAnual * 100)/100;

		return consAnual;
	};

	let consumoDiario = (consumoAnio) => {
		consDiario = Math.round((consumoAnio / 365)*100)/100;
		return consDiario;
	};

	let consumoBimestral = (periodoSumado) => {
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

	let promedioConsumosMensuales = (periodoSumado) => {
		let promConsumoMensual = 0;

		periodoSumado.forEach(periodo => { promConsumoMensual += periodo });

		promConsumoMensual = Math.round((promConsumoMensual / periodoSumado.length) * 100) / 100;
		return promConsumoMensual;
	};

	let promedioConsumosBimestrales = (consumosBimestrales) => {
		let promConsBimest = 0;

		consumosBimestrales.forEach(bimestre => { promConsBimest += bimestre });
		promConsBimest = Math.round((promConsBimest / consumosBimestrales.length) * 100)/100;
		return promConsBimest;
	};

	_periodoSumados = getPeriodosSumados(_periods); //Consumos mensuales
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

module.exports.calcularViaticos = async function(data){
	const result = await viaticos.mainViaticosMT(data);
	return result;
}