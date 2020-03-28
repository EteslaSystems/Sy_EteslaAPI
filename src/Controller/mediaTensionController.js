/*
- @description: Archivo correspondiente a las funciones de la API del módulo de media tensión.
- @author: 	 Jesus Daniel Carrera Falcón
- @date: 		 17/03/2020
*/

function promediarArray(array) {
  	return new Promise((resolve, reject) => {
  		const longitud = array.length;
  		var sumaObjetos = 0;
  		var promedio = 0;
  		if (longitud == 12) {
  			for (var i in array) {
  				var suma = 0;
  				for (var j in array[i]) {
  					suma = suma + array[i][j];
  				}
  				sumaObjetos = sumaObjetos + suma;
  			}
  			promedio = sumaObjetos / longitud;

  			const response = {
  				status: true,
  				message: promedio
  			}

  			resolve(response);
  		} else {
  			const faltantes = 12 - longitud;

  			for (var i in array) {
  				var suma = 0;
  				for (var j in array[i]) {
  					suma = suma + array[i][j];
  				}
  				sumaObjetos = sumaObjetos + suma;
  			}
  			promedio = sumaObjetos / longitud;

  			for(var i = 0; i < faltantes; i++) {
  				array.push(promedio);
  			}

  			const response = {
  				status: true,
  				message: array
  			}

  			resolve(response);
  		}
  	});
}

/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Media Tension
- @author: 				LH420
- @date: 				20/03/2020
*/
const irradiacion = require('../Controller/irradiacionController');

/*#region GDMTH*/
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

function promedioDePropiedadesPeriodoGDMTH(data){
	if(obtenerEspaciosFaltantesDelArray(data) == null){
		for(var i = 0; i <= 11; i++) //Cambiar al condiconal21 del for de "data.length" a "12"
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
				_pontenciaNecesaria = obtenerPotenciaNecesaria();
				console.log('_potenciaNecesaria: '+_pontenciaNecesaria);
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

function obtenerPotenciaNecesaria(){
	var municipio = 'Tuxpan';

	irradiacion.buscarIrradiacionFiltrada(municipio)
	.then(irradiacionLugar => {
		var _irradiacionLugar = irradiacionLugar[0].fIrradiacion;
		var _porcentajePerdida = calcularPorcentajeDePerdida(18); //La cantidad que se envia 18%, tiene que cambiarse por una cantidad dinamica obtenida del clienteWeb
		var potenciaNecesaria = ((sumaConsumoTotalkWh / _irradiacionLugar) / (1 - _porcentajePerdida))/365;

		console.log('Irradiacion del lugar: '+_irradiacionLugar);
		return potenciaNecesaria;
	})
	.catch(error => {
		console.log('Error: '+error.message)
	});
}

function calcularPorcentajeDePerdida(_setPorcentajePerdida){
	var porcentajePerdida = _setPorcentajePerdida / 100;
	console.log('Porcentaje de perdia: '+porcentajePerdida);

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
