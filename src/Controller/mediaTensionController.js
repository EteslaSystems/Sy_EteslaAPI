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

/*#region GDMTH*/
const eficiencia = 0.82;
var averageBkWh = 0.0;
var averageIkWh = 0.0;
var averagePkWh = 0.0;
var averageBkW = 0.0;
var averageIkW = 0.0;
var averagePkW = 0.0;
var averageBmxn = 0.0;
var averageImxn = 0.0;
var averagePmxn = 0.0;
var averagePagoTransmi = 0.0;
var averageCmxn = 0.0;
var averageDmxn = 0.0;
var sumaConsumoTotalkWh = 0;
var promedioConsumoTotalkWh = 0;
var _objresulProm = {
	consumo:{
		consumoAnual: 0,
		promedioConsumo: 0,
		potenciaNecesaria: 0
	},
	panel:{
		nombre: '',
		marca: '',
		potencia: 0,
		potenciaReal: 0,
		noModulos: 0,
		precioPanel: 0,
		costoDeEstructuras: 0,
		costoPorWatt: 0,
		costoTotalPaneles: 0
	}
};

/* var newData = [];
var newObjArrayGDMTH = {
	bkwh: 0,
	ikwh: 0,
	pkwh: 0,
	bkw: 0,
	ikw: 0,
	pkw: 0,
	bmxn: 0,
	imxn: 0,
	pmxn: 0,
	pagoTransmi: 0,
	cmxn: 0,
	dmxn: 0
}; */


/*1.-Comprobar el tamanio de la data (>12 o ==12)*/
/*2.-Sacar en base al consumo la ENERGIA REQUERIDA y retornar -LA CONVINACION DE PANELES REQ.-
	-Filtrar Inversores, para que el usuario pueda seleccionar uno
*/
/*3.-En base al INVERSOR seleccionado. Retornar:
	*	-Numero de inversores requeridos
*/
/*4.-Viaticos y Totales
	*	-Enviar convinacion de paneles e inversores para poder obtener viaticos/cuadrillas y totales
*/




//Datos de consumo
//1st. and 2nd. Step (Energia y Paneles Requeridos):
async function obtenerEnergiaPaneles_Requeridos(data){
	_data = data.arrayPeriodosGDMTH;
	if(_data.length === 12){
		const resultStep = await promedioDePropiedadesPeriodoGDMTH(data);
		return resultStep;
	}
	else{
		newData = llenarEspaciosVaciosData(data);
		const resultStep = await promedioDePropiedadesPeriodoGDMTH(newData);
		return resultStep;
	}
}

//3rd. Step (Inversores):
	//Obtener Inversor filtrado
	//Enviar "_potenciaReal" (panel)
async function obtenerInversores_Requeridos(data){
	const resultStep = await inversores.obtenerInversores_cotizacion(data);
	return resultStep;
}

//4th. Step (Viaticos):
async function obtenerViaticos_Totales(data){
	const resultStep = await viaticos.mainViaticos(data);
	return resultStep;
}













// async function cotizacionGDMTH(data){
	
// 	menosUno = data.length - 1;
// 	//arrayConVinacionesPanelesInversores = await promedioDePropiedadesPeriodoGDMTH(data);
// 	// console.log('cotizacionGDMTH(data) says: ');
// 	// console.log(arrayConVinacionesPanelesInversores);

// 	/*1.- Obtener el consumo de energia y los paneles*/

// }



async function promedioDePropiedadesPeriodoGDMTH(data)
{
	var arrayResult = [];

	for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
	{
		var condicional_ = i == data.arrayPeriodosGDMTH.length - 1;
		var bkwh = parseFloat(data.arrayPeriodosGDMTH[i].bkwh) || 0;
		var ikwh = parseFloat(data.arrayPeriodosGDMTH[i].ikwh) || 0;
		var pkwh = parseFloat(data.arrayPeriodosGDMTH[i].pkwh) || 0;

		/*#region Hipotesis ConsumoTotal*/
		var periodo = bkwh + ikwh + pkwh;
		// console.log('Periodo: '+periodo);
		sumaConsumoTotalkWh += periodo;
		condicional_ ? promedioConsumoTotalkWh = parseFloat(sumaConsumoTotalkWh / 12) : null;
		
		/*#endregion*/
	}

	if(promedioConsumoTotalkWh > 0)
	{
		// console.log('Consumo anual: '+sumaConsumoTotalkWh);
		// console.log('Promedio inicial: '+promedioConsumoTotalkWh);
		promedioConsumoTotalkWh = Math.ceil(promedioConsumoTotalkWh);
		// console.log('Promedio redondeado: '+promedioConsumoTotalkWh);
		/*#region PotenciaNecesaria*/
		var municipio = data.destino; //Direccion del cliente
		// var irradiacion_ = await getIrradiation(municipio);
		var irradiacion_ = 4.60;
		var _potenciaNecesaria = parseFloat(await obtenerPotenciaNecesaria(irradiacion_));
		var _consumoDiario = parseFloat(await consumoPromedio365(sumaConsumoTotalkWh));
		/*#endregion*/
		// console.log('_irradiacion: '+irradiacion_);
		// console.log('_potenciaNecesaria: '+_potenciaNecesaria);
		// console.log('Consumo promedio 365: '+_consumoDiario)
		/*#region Paneles_cotizacion*/

		_objresulProm.consumo.consumoAnual = sumaConsumoTotalkWh;
		_objresulProm.consumo.promedioConsumo = promedioConsumoTotalkWh;
		_objresulProm.consumo.potenciaNecesaria = _potenciaNecesaria;

		arrayResult.push(_objresulProm);

		_arrayNoDePaneles = await paneles.numeroDePaneles(_consumoDiario, irradiacion_, eficiencia, 499/*TopeProduccion*/);
		// console.log('_arrayNoDePaneles says: ');
		// console.log(_arrayNoDePaneles);
		for(var x=0; x<_arrayNoDePaneles.length; x++)
		{
			nombrePanel = _arrayNoDePaneles[x].nombre;
			marcaPanel = _arrayNoDePaneles[x].marca;
			potenciaPanel = parseFloat(_arrayNoDePaneles[x].potencia);
			potenciaRealPanel = parseFloat(_arrayNoDePaneles[x].potenciaReal);
			noModulosP = parseFloat(_arrayNoDePaneles[x].noModulos);
			precioPanel = parseFloat(_arrayNoDePaneles[x].precioPorPanel);
			costoEstructuras = parseFloat(_arrayNoDePaneles[x].costoDeEstructuras);
			costoPorWatt = precioPanel;
			costoTotalPaneles = parseFloat((precioPanel * potenciaPanel) * noModulosP);

			_objresulProm = { 
				panel: {
					nombre: nombrePanel,
					marca: marcaPanel,
					potencia: potenciaPanel,
					potenciaReal: potenciaRealPanel,
					noModulos: noModulosP,
					costoDeEstructuras: costoEstructuras,
					costoPorWatt: costoPorWatt,
					costoTotalPaneles: costoTotalPaneles
				}
			};
			
			arrayResult.push(_objresulProm);
		}

		// console.log('promedioDePropiedadesPeriodoGDMTH(data) says:');
		// console.log(arrayResult);
		return arrayResult;

		/*#endregion*/
		/*#endregion*/
	}
}


/*#endregion*/

/*#endregion*/


/*#endregion*/

async function obtenerPotenciaNecesaria(irradiacion_lugar){
	let _porcentajePerdida = calcularPorcentajeDePerdida(18);//La cantidad que se envia 18%, tiene que cambiarse por una cantidad dinamica obtenida del clienteWeb
	potenciaNecesaria = ((sumaConsumoTotalkWh / irradiacion_lugar) / (1 - _porcentajePerdida))/365;
	potenciaNecesaria = parseFloat(Math.round(potenciaNecesaria * 100) / 100).toFixed(2);
	potenciaNecesaria >= 500 ? potenciaNecesaria = 499 : potenciaNecesaria;
	return potenciaNecesaria;
}

async function getIrradiation(municipio){
	_irradiacion = await irradiacion.buscarIrradiacionFiltrada(municipio);
	_irradiacion = _irradiacion.fIrradiacion;
	return _irradiacion;
}

async function consumoPromedio365(powerNeeded){
	__consumoPromedioMensual = powerNeeded/365;
	__consumoPromedioMensual = parseFloat(Math.round(__consumoPromedioMensual * 100) / 100).toFixed(2);
	return __consumoPromedioMensual;
}

function calcularPorcentajeDePerdida(_setPorcentajePerdida){
	var porcentajePerdida = _setPorcentajePerdida / 100;
	return porcentajePerdida;
}

function llenarEspaciosVaciosData(data)
{
	var newData = [];
	
	_data = data.arrayPeriodosGDMTH;

	for(var j=0; j < _data.length; j++)
	{
		var _condicional = j == data.length - 1;
		var bkwh = Number.parseFloat(_data[j].bkwh);
		var ikwh = Number.parseFloat(_data[j].ikwh);
		var pkwh = Number.parseFloat(_data[j].pkwh);
		var bkw = Number.parseFloat(_data[j].bkw);
		var ikw = Number.parseFloat(_data[j].ikw);	
		var pkw = Number.parseFloat(_data[j].pkw);
		var bmxn = Number.parseFloat(_data[j].bmxn);
		var imxn = Number.parseFloat(_data[j].imxn);
		var pmxn = Number.parseFloat(_data[j].pmxn);
		var pagoTransmision = Number.parseFloat(_data[j].pagoTransmi);
		var cmxn = Number.parseFloat(_data[j].cmxn);
		var dmxn = Number.parseFloat(_data[j].dmxn);

		averageBkWh = Number.parseFloat(averageBkWh + bkwh);
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
		averageDmxn = Number.parseFloat(averageDmxn + dmxn);

		nObjArrayGDMTH = {
			bkwh: bkwh,
			ikwh: ikwh,
			pkwh: pkwh,
			bkw: bkw,
			ikw: ikw,
			pkw: pkw,
			bmxn: bmxn,
			imxn: imxn,
			pmxn: pmxn,
			pagoTransmi: pagoTransmi,
			cmxn: cmxn,
			dmxn: dmxn
		};

		newData.push(nObjArrayGDMTH);

		if(_condicional){
			averageBkWh = Number.parseFloat(averageBkWh / (_data.length)) || null;
			averageIkWh = Number.parseFloat(averageIkWh / (_data.length)) || null;
			averagePkWh = Number.parseFloat(averagePkWh / (_data.length)) || null;
			averageBkW = Number.parseFloat(averageBkW / (_data.length)) || null;
			averageIkW = Number.parseFloat(averageIkW / (_data.length)) || null;
			averagePkW = Number.parseFloat(averagePkW / (_data.length)) || null;
			averageBmxn = Number.parseFloat(averageBmxn / (_data.length)) || null;
			averageImxn = Number.parseFloat(averageImxn / (_data.length)) || null;
			averagePmxn = Number.parseFloat(averagePmxn / (_data.length)) || null;
			averagePagoTransmi = Number.parseFloat(averagePagoTransmi / (_data.length)) || null;
			averageCmxn = Number.parseFloat(averageCmxn / (_data.length)) || null;
			averageDmxn = Number.parseFloat(averageDmxn / (_data.length)) || null;

			nObjArrayGDMTH = {
				bkwh: averageBkWh,
				ikwh: averageIkWh,
				pkwh: averagePkWh,
				bkw: averageBkW,
				ikw: averageIkW,
				pkw: averagePkW,
				bmxn: averageBmxn,
				imxn: averageImxn,
				pmxn: averagePmxn,
				pagoTransmi: averagePagoTransmi,
				cmxn: averageCmxn,
				dmxn: averageDmxn
			};

			for(var n=_data.length; n<=12; n++)
			{
				newData.push(nObjArrayGDMTH);
				
				if(n === 12){
					destino = data.destino;
					origen = data.origen;
					newObjeto = {
						arrayPeriodosGDMTH: newData,
						destino: destino,
						origen: origen
					};	

					return newObjeto;
				}
			}
		}
	}
}

module.exports.firstStepGDMTH = async function(data){
	const result = await obtenerEnergiaPaneles_Requeridos(data);
	return result;
}

module.exports.secondStepGDMTH = async function(data){
	const result = await obtenerInversores_Requeridos(data);
	return result;
}

module.exports.thirdStepGDMTH = async function(data){
	const result = await obtenerViaticos_Totales(data);
	return result;
}



// module.exports.cotizarGDMTH = async function(data){
//     await cotizacionGDMTH(data);
// }




//1er. Paso
// module.exports.obtenerEnergiaReqPanelesReq = async function(data){
// 	return result = await obtenerEnergiaPaneles_Requeridos(data);
// }

















// module.exports.promedioArray = async function (array, response) {
// 	const result = await promediarArray(array);
// 	return result;
// }

/*#region GDMTO*/
/*#endregion*/