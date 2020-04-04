/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Media Tension
- @author: 				LH420
- @date: 				20/03/2020
*/
const irradiacion = require('../Controller/irradiacionController');
const paneles = require('../Controller/panelesController');

/*#region GDMTH*/
var eficiencia = 0.82;
var menosUno;
var averagePeriodsGDMTH = {};
var averageBkWh = 0.0;
var averageIkWh = 0.0;
var averagePkWh = 0.0;
var averageBkW = 0.0;
var averageIkW = 0.0;
var averagePkW = 0.0;
/*var averageBmxn = 0.0;
var averageImxn = 0.0;
var averagePmxn = 0.0;
var averagePagoTransmi = 0.0;
var averageCmxn = 0.0;
var averageDmxn = 0.0;*/

//Datos de consumo
function cotizacionGDMTH(data){
	menosUno = data.length - 1;
	promedioDePropiedadesPeriodoGDMTH(data);
}

/*#endregion*/
/*#region GDMTO*/
/*#endregion*/

var sumaConsumoTotalkWh = 0;
var promedioConsumoTotalkWh = 0;

async function promedioDePropiedadesPeriodoGDMTH(data){
	if(obtenerEspaciosFaltantesDelArray(data) == null){
		for(var i = 0; i <= 11; i++) 
		{
			var condicional1 = i == 11;
			var bkwh = Number.parseFloat(data[i].bkwh);
			var ikwh = Number.parseFloat(data[i].ikwh);
			var pkwh = Number.parseFloat(data[i].pkwh);

			/*#region Hipotesis ConsumoTotal*/
			var periodo = bkwh + ikwh + pkwh;
			console.log('Periodo: '+periodo);
			sumaConsumoTotalkWh += periodo;
			condicional1 ? promedioConsumoTotalkWh = Number.parseFloat(sumaConsumoTotalkWh / 12) : null;
			if(promedioConsumoTotalkWh > 0){
				console.log('Suma total de periodos: '+sumaConsumoTotalkWh);
				console.log('Promedio inicial: '+promedioConsumoTotalkWh);
				promedioConsumoTotalkWh = Math.ceil(promedioConsumoTotalkWh);
				console.log('Promedio redondeado: '+promedioConsumoTotalkWh);
				
				var municipio = 'Tuxpan';
				var irradiacion_ = await getIrradiation(municipio);
				var _potenciaNecesaria = await obtenerPotenciaNecesaria(irradiacion_);
				var _consumoPromedio365 = consumoPromedio365(sumaConsumoTotalkWh);
				
				console.log('_irradiacion: '+irradiacion_);
				console.log('_potenciaNecesaria: '+_potenciaNecesaria);
				console.log('Consumo promedio 365: '+_consumoPromedio365)
				_arrayNoDePaneles = await paneles.numeroDePaneles(_consumoPromedio365, irradiacion_, eficiencia);
				
				console.log('promedioDePropiedadesPeriodoGDMTH() says: ');
				console.log(_arrayNoDePaneles);
			}
			/*#endregion*/

			/*#region blahblah*/
			/*var bkw = Number.parseFloat(data[i].bkw);
			var ikw = Number.parseFloat(data[i].ikw);
			var pkw = Number.parseFloat(data[i].pkw);
			var bmxn = Number.parseFloat(data[i].bmxn);
			var imxn = Number.parseFloat(data[i].imxn);
			var pmxn = Number.parseFloat(data[i].pmxn);
			var pagoTransmision = Number.parseFloat(data[i].pagoTransmi);
			var cmxn = Number.parseFloat(data[i].cmxn);
			var dmxn = Number.parseFloat(data[i].dmxn);*/

			/*averageBkWh = Number.parseFloat(averageBkWh + bkwh);
			averageIkWh = Number.parseFloat(averageIkWh + ikwh);
			averagePkWh = Number.parseFloat(averagePkWh + pkwh);
			averageBkW = Number.parseFloat(averageBkW + bkw);
			averageIkW = Number.parseFloat(averageIkW + ikw);
			averagePkW = Number.parseFloat(averagePkW + pkw);
			averageBmxn = Number.parseFloat(averageBmxn + bmxn);
			averageImxn = Number.parseFloat(averageImxn + imxn);
			averagePmxn = Number.parseFloat(averagePmxn + pmxn);
			averagePagoTransmi = Number.parseFloat(averagePagoTransmi + pagoTransmision);
			averageCmxn = Number.parseFloat(averageCmxn + cmxn);
			averageDmxn = Number.parseFloat(averageDmxn + dmxn);*/

			/*condicional1 ? averageBkWh = Number.parseFloat(averageBkWh / 12) : null;
			condicional1 ? averageIkWh = Number.parseFloat(averageIkWh / 12) : null;
			condicional1 ? averagePkWh = Number.parseFloat(averagePkWh / 12) : null;
			condicional1 ? averageBkW = Number.parseFloat(averageBkW / 12) : null;
			condicional1 ? averageIkW = Number.parseFloat(averageIkW / 12) : null;
			condicional1 ? averagePkW = Number.parseFloat(averagePkW / 12) : null;
			condicional1 ? averageBmxn = Number.parseFloat(averageBmxn / 12) : null;
			condicional1 ? averageImxn = Number.parseFloat(averageImxn / 12) : null;
			condicional1 ? averagePmxn = Number.parseFloat(averagePmxn / 12) : null;
			condicional1 ? averagePagoTransmi = Number.parseFloat(averagePagoTransmi / 12) : null;
			condicional1 ? averageCmxn = Number.parseFloat(averageCmxn / 12) : null;
			condicional1 ? averageDmxn = Number.parseFloat(averageDmxn / 12) : null;*/

			//console.log(averageBkWh+','+averageIkWh+','+averagePkWh+','+averageBkW+','+averageIkW+','+averagePkW);
			/*#endregion*/
		}
	}
	else{
		for(var j = 0; j <= menosUno; j++)
		{
			var condicional2 = j == menosUno;
			var bkwh = Number.parseFloat(data[j].bkwh);
			var ikwh = Number.parseFloat(data[j].ikwh);
			var pkwh = Number.parseFloat(data[j].pkwh);
			var bkw = Number.parseFloat(data[j].bkw);
			var ikw = Number.parseFloat(data[j].ikw);	
			var pkw = Number.parseFloat(data[j].pkw);
			/*var bmxn = Number.parseFloat(data[j].bmxn);
			var imxn = Number.parseFloat(data[j].imxn);
			var pmxn = Number.parseFloat(data[j].pmxn);
			var pagoTransmision = Number.parseFloat(data[j].pagoTransmi);
			var cmxn = Number.parseFloat(data[j].cmxn);
			var dmxn = Number.parseFloat(data[j].dmxn);*/

			averageBkWh = Number.parseFloat(averageBkWh + bkwh);
			averageIkWh = Number.parseFloat(averageIkWh + ikwh);
			averagePkWh = Number.parseFloat(averagePkWh + pkwh);
			averageBkW = Number.parseFloat(averageBkW + bkw);
			averageIkW = Number.parseFloat(averageIkW + ikw);
			averagePkW = Number.parseFloat(averagePkW + pkw);
			/*averageBmxn = Number.parseFloat(averageBmxn + bmxn);
			averageImxn = Number.parseFloat(averageImxn + imxn);
			averagePmxn = Number.parseFloat(averagePmxn + pmxn);
			averagePagoTransmi = Number.parseFloat(averagePagoTransmi + pagoTransmision);
			averageCmxn = Number.parseFloat(averageCmxn + cmxn);
			averageDmxn = Number.parseFloat(averageDmxn + dmxn);*/

			condicional2 ? averageBkWh = Number.parseFloat(averageBkWh / data.length) : null;
			condicional2 ? averageIkWh = Number.parseFloat(averageIkWh / data.length) : null;
			condicional2 ? averagePkWh = Number.parseFloat(averagePkWh / data.length) : null;
			condicional2 ? averageBkW = Number.parseFloat(averageBkW / data.length) : null;
			condicional2 ? averageIkW = Number.parseFloat(averageIkW / data.length) : null;
			condicional2 ? averagePkW = Number.parseFloat(averagePkW / data.length) : null;
			/*condicional2 ? averageBmxn = Number.parseFloat(averageBmxn / data.length) : null;
			condicional2 ? averageImxn = Number.parseFloat(averageImxn / data.length) : null;
			condicional2 ? averagePmxn = Number.parseFloat(averagePmxn / data.length) : null;
			condicional2 ? averagePagoTransmi = Number.parseFloat(averagePagoTransmi / data.length) : null;
			condicional2 ? averageCmxn = Number.parseFloat(averageCmxn / data.length) : null;
			condicional2 ? averageDmxn = Number.parseFloat(averageDmxn / data.length) : null;*/
		}

		averagePeriodsGDMTH = {
			bkwh: averageBkWh,
            ikwh: averageIkWh,
            pkwh: averagePkWh,
            bkw: averageBkW,
            ikw: averageIkW,
            pkw: averagePkW,
            /*bmxn: averageBmxn,
            imxn: averageImxn,
            pmxn: averagePmxn,
            pagoTransmi: averagePagoTransmi,
            cmxn: averageCmxn,
            dmxn: averageDmxn*/
		};

		for(var k = data.length; k <= 11; k++){
			data.push(averagePeriodsGDMTH);
		}
	}
}

async function obtenerPotenciaNecesaria(irradiacion_lugar){
	let _porcentajePerdida = calcularPorcentajeDePerdida(18);//La cantidad que se envia 18%, tiene que cambiarse por una cantidad dinamica obtenida del clienteWeb
	potenciaNecesaria = ((sumaConsumoTotalkWh / irradiacion_lugar) / (1 - _porcentajePerdida))/365;
	potenciaNecesaria = parseFloat(Math.round(potenciaNecesaria * 100) / 100).toFixed(2);
	return potenciaNecesaria;
}

async function getIrradiation(municipio){
	_irradiacion = await irradiacion.buscarIrradiacionFiltrada(municipio);
	_irradiacion = _irradiacion[0].fIrradiacion;
	return _irradiacion;
}

function consumoPromedio365(powerNeeded){
	__consumoPromedioMensual = powerNeeded/365;
	__consumoPromedioMensual = parseFloat(Math.round(__consumoPromedioMensual * 100) / 100).toFixed(2);
	return __consumoPromedioMensual;
}

function calcularPorcentajeDePerdida(_setPorcentajePerdida){
	var porcentajePerdida = _setPorcentajePerdida / 100;
	return porcentajePerdida;
}

function obtenerEspaciosFaltantesDelArray(data){
    if(data.length < 12){
        return 12 - data.length;
    }
    else if(data.length == 12){
        return null;
	}
}

module.exports.cotizarGDMTH = async function(data){
    await cotizacionGDMTH(data);
}

module.exports.promedioArray = async function (array, response) {
	const result = await promediarArray(array);
	return result;
}
