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
	
	try{
		let porcentajePropuesta = parseFloat(data.porcentajePropuesta) / 100 || 0;
		let _Periodos = data.arrayPeriodos;
		_Periodos = formatearToNumber({ _periodos: _Periodos, tarifa: data.tarifa });

		//Se formatea el array de los periodos cuanto los periodos vengan incompletos (<12)
		let completarData = (_periodos, tarifa) => {
			//[GDMTH]
			let pBkw=0, pBkWh=0, pBmxnkWh=0, pPkw=0, pPkWh=0, pPmxnkWh=0;
			//Standard
			let pIkw=0, pIkWh=0, pCmxnkW=0, pDmxnkW=0, pImxnkWh=0, pPagoTransmision=0;
			//Object
			let objPeriodos = {  };

			for(let Periodo of _periodos)
			{
				if(tarifa === 'GDMTH'){
					let Bkw = Periodo.Bkw; 
					let BkWh = Periodo.BkWh;
					let BmxnkWh = Periodo.B_mxnkWh; 
					let Pkw = Periodo.Pkw; 
					let PkWh = Periodo.PkWh; 
					let PmxnkWh = Periodo.P_mxnkWh;

					///
					pBkw += Bkw; 
					pBkWh += BkWh;
					pBmxnkWh += BmxnkWh;
					pPkw += Pkw;
					pPkWh += PkWh;
					pPmxnkWh += PmxnkWh;
				}

				let Ikw = Periodo.Ikw; 
				let IkWh = Periodo.IkWh; 
				let CmxnkW = Periodo.C_mxnkW; 
				let DmxnkW = Periodo.D_mxnkW; 
				let ImxnkWh = Periodo.I_mxnkWh; 
				let pagoTransmision = Periodo.pagoTransmision;

				///
				pIkw += Ikw;  
				pIkWh += IkWh;  
				pCmxnkW += CmxnkW;  
				pDmxnkW += DmxnkW;  
				pImxnkWh += ImxnkWh;  
				pPagoTransmision += pagoTransmision;
			}

			if(tarifa === 'GDMTH'){
				pBkw = Math.round((pBkw / _periodos.length) * 100) / 100; 
				pBkWh = Math.round((pBkWh / _periodos.length) * 100) / 100;
				pBmxnkWh = Math.round((pBmxnkWh / _periodos.length) * 100) / 100;
				pPkw = Math.round((pPkw / _periodos.length) * 100) / 100;
				pPkWh = Math.round((pPkWh / _periodos.length) * 100) / 100;
				pPmxnkWh = Math.round((pPmxnkWh / _periodos.length) * 100) / 100;
			}

			pIkw = Math.round((pIkw / _periodos.length) * 100) / 100;  
			pIkWh = Math.round((pIkWh / _periodos.length) * 100) / 100;  
			pCmxnkW = Math.round((pCmxnkW / _periodos.length) * 100) / 100;  
			pDmxnkW = Math.round((pDmxnkW / _periodos.length) * 100) / 100;  
			pImxnkWh = Math.round((pImxnkWh / _periodos.length) * 100) / 100;  
			pPagoTransmision = Math.round((pPagoTransmision / _periodos.length) * 100) / 100;

			//Llenar Objeto
			if(tarifa === 'GDMTO'){
				objPeriodos = { 
					C_mxnkW: pCmxnkW,
					D_mxnkW: pDmxnkW,
					I_mxnkWh: pImxnkWh,
					Ikw: pIkw,
					IkWh:pIkWh
				};
			}
			else{
				objPeriodos = { 
					B_mxnkWh: pBmxnkWh,
					C_mxnkW: pCmxnkW,
					D_mxnkW: pDmxnkW,
					I_mxnkWh: pImxnkWh,
					P_mxnkWh: pPmxnkWh,
					Bkw: pBkw,
					BkWh: pBkWh,
					Ikw: pIkw,
					IkWh: pIkWh,
					Pkw: pPkw,
					PkWh: pPkWh
				};
			}
			
			//
			objPeriodos = Object.assign(objPeriodos,{ pagoTransmision: pPagoTransmision });	
			
			//Formateada de nueva data => nuevosPeriodos
			for(let i=_periodos.length; i<12; i++)
			{
				_Periodos.push(objPeriodos);
			}
		};

		//Validar que en la data vengan los 12 periodos
		if(_Periodos.length < 12){
			completarData(_Periodos, data.tarifa);
		}

		//Calculo de consumos
		let objEnergiaConsumida = await getPeriodosPromedios(_Periodos);

		let potenciaNecesaria = await getPotenciaNecesaria(4.6,objEnergiaConsumida.consumoAnual, porcentajePropuesta); //Watts

		_arrayResult.push({
			consumo: { //Procesados
				_promCons: objEnergiaConsumida,
				potenciaNecesaria: potenciaNecesaria
			},
			periodos: _Periodos
		});

		let _paneles = await paneles.numeroDePaneles(potenciaNecesaria);

		_paneles.forEach(Panel => {
			Panel.costoTotal = Math.round(((Panel.fPrecio * Panel.fPotencia) * Panel.noModulos) * 100) / 100;
			_arrayResult.push({ panel: Panel });
		});

		return _arrayResult;
	}
	catch(error){
		console.log(error);
	}
}
/*#endregion Cotizacion*/



async function getPotenciaNecesaria(irradiacion, consumoAnual, porcentajePropuesta){ //Retorna en watts
	try{
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
	catch(error){
		console.log(error);
	}
}

async function getPeriodosPromedios(_periods){ //Todo esta retornado en KWH
	try{
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
	
		return {
			promedioConsumosMensuales: promedioConsumosMensuales,
			promConsumosBimestrales: promedioConsumosBimestrales,
			consumoMensual: _periodoSumados,
			consumoAnual: consumoAnual,
			consumoDiario: consumoDiario
		};
	}
	catch(error){
		console.log(error);
	}
}

//@
function formatearToNumber(data){
	let { _periodos, tarifa } = data;

	try{
		_periodos.forEach((Periodo, i) => {
			if(tarifa === 'GDMTH'){
				Periodo.Bkw = Number(Periodo.Bkw);
				Periodo.BkWh = Number(Periodo.BkWh);
				Periodo.B_mxnkWh = Number(Periodo.B_mxnkWh);
				Periodo.Pkw = Number(Periodo.Pkw);
				Periodo.PkWh = Number(Periodo.PkWh);
				Periodo.P_mxnkWh = Number(Periodo.P_mxnkWh);
			}

			Periodo.Ikw = Number(Periodo.Ikw);
			Periodo.IkWh = Number(Periodo.IkWh);
			Periodo.C_mxnkW = Number(Periodo.C_mxnkW);
			Periodo.D_mxnkW = Number(Periodo.D_mxnkW);
			Periodo.I_mxnkWh = Number(Periodo.I_mxnkWh);
			Periodo.pagoTransmision = Number(Periodo.pagoTransmision);

			//
			_periodos[i] = Periodo;
		});

		return _periodos;
	}
	catch(error){
		console.log(error);
	}
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