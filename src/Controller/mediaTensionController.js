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
var eficiencia = 0.82;
var menosUno = 0;
var averagePeriodsGDMTH = {};
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
	if(validateLengthData(data) == null){
		// console.log(' obtenerEnergiaPaneles_Requeridos(data) says: ');
		// console.log(data);
		return resultStep = await promedioDePropiedadesPeriodoGDMTH(data);
	}
	else{
		//En caso de que la data venga incompleta (menor a 12 periodos)
		newData = validateLengthData(data);
		await promedioDePropiedadesPeriodoGDMTH(newData);
	}
}

//3rd. Step (Inversores):
	//Obtener Inversor filtrado
	//Enviar "_potenciaReal" (panel)
async function obtenerInversores_Requeridos(data){
	//const resultStep = await inversores.obtenerInversores_cotizacion(data);
}

//4th. Step (Viaticos):
function obtenerViaticos_Totales(data){

}













// async function cotizacionGDMTH(data){
	
// 	menosUno = data.length - 1;
// 	//arrayConVinacionesPanelesInversores = await promedioDePropiedadesPeriodoGDMTH(data);
// 	// console.log('cotizacionGDMTH(data) says: ');
// 	// console.log(arrayConVinacionesPanelesInversores);

// 	/*1.- Obtener el consumo de energia y los paneles*/

// }

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
		costoDeEstructuras: 0
	}
};

async function promedioDePropiedadesPeriodoGDMTH(data)
{
	var arrayResult = [];

	for(var i=0; i<data.arrayPeriodosGDMTH.length; i++)
	{
		var condicional_ = i == data.arrayPeriodosGDMTH.length - 1;
		var bkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].bkwh);
		var ikwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].ikwh);
		var pkwh = Number.parseFloat(data.arrayPeriodosGDMTH[i].pkwh);

		/*#region Hipotesis ConsumoTotal*/
		var periodo = bkwh + ikwh + pkwh;
		// console.log('Periodo: '+periodo);
		sumaConsumoTotalkWh += periodo;
		condicional_ ? promedioConsumoTotalkWh = Number.parseFloat(sumaConsumoTotalkWh / 12) : null;
		
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
		var irradiacion_ = await getIrradiation(municipio);
		var _potenciaNecesaria = await obtenerPotenciaNecesaria(irradiacion_);
		var _consumoPromedio365 = consumoPromedio365(sumaConsumoTotalkWh);
		/*#endregion*/
		// console.log('_irradiacion: '+irradiacion_);
		// console.log('_potenciaNecesaria: '+_potenciaNecesaria);
		// console.log('Consumo promedio 365: '+_consumoPromedio365)
		/*#region Paneles_cotizacion*/

		_objresulProm.consumo.consumoAnual = sumaConsumoTotalkWh;
		_objresulProm.consumo.promedioConsumo = promedioConsumoTotalkWh;
		_objresulProm.consumo.potenciaNecesaria = _potenciaNecesaria;

		arrayResult.push(_objresulProm);

		_arrayNoDePaneles = await paneles.numeroDePaneles(_consumoPromedio365, irradiacion_, eficiencia);
		// console.log('_arrayNoDePaneles says: ');
		// console.log(_arrayNoDePaneles);
		for(var x=0; x<_arrayNoDePaneles.length; x++)
		{
			nombrePanel = _arrayNoDePaneles[x].nombre;
			marcaPanel = _arrayNoDePaneles[x].marca;
			potenciaPanel = _arrayNoDePaneles[x].potencia;
			potenciaRealPanel = _arrayNoDePaneles[x].potenciaReal;
			noModulosP = _arrayNoDePaneles[x].noModulos;
			precioPanel = _arrayNoDePaneles[x].precioPorPanel;
			costoEstructuras = _arrayNoDePaneles[x].costoDeEstructuras;

			_objresulProm = { 
				panel: {
					nombre: nombrePanel,
					marca: marcaPanel,
					potencia: potenciaPanel,
					potenciaReal: potenciaRealPanel,
					noModulos: noModulosP,
					precioPanel: precioPanel,
					costoDeEstructuras: costoEstructuras
				}
			};
			
			arrayResult.push(_objresulProm);
		}

		// console.log('promedioDePropiedadesPeriodoGDMTH(data) says:');
		// console.log(arrayResult);
		return arrayResult;

		/*#endregion*/
		/*#region Inversores_cotizacion*/
		//Agregar SELECT * FROM Inversores junto con la convinacion de paneles





























		//Mandar el ID del Inversor seleccionado, para que este pueda ser filtrado



		//_arrayConvinacionesPanInv = await inversores.numeroDeInversores(_arrayNoDePaneles);
		
		//console.log('promedioDePropiedadesPeriodoGDMTH(data) says: ');
		//console.log(_arrayConvinacionesPanInv);
		/*#endregion*/
		/*#region CalculoDeCuadrillas_Instaladores*/
		// var oficinaSucursal = data[0].oficina;
		// var _arrayCotizacion = await viaticos.mainViaticos(_arrayConvinacionesPanInv, oficinaSucursal, municipio);

		// console.log('promedioDePropiedadesPeriodoGDMTH(data) says: ');
		// console.log(_arrayCotizacion);
		/*#endregion*/
	}
}


/*#endregion*/































// var responseEneryPanelsRequired = {
// 	energiaRequerida: {
// 		consumoAnual: 0,
// 		promedioDelConsumo: 0,
// 		potenciaNecesaria: 0
// 	},
// 	panel: {
// 		nombre: '',
// 		marca: '',
// 		potencia: 0,
// 		potenciaReal: 0,
// 		noModulos: 0,
// 		precioPorPanel: 0,
// 		costoDeEstructuras: 0
// 	}
// };

/*#region como debe de funcionar ahora*/
// async function obtenerEnergiaPaneles_Requeridos(data){
// 	var arrayResponse = [];
	
// 	if(obtenerEspaciosFaltantesDelArray(data) == null){
// 		for(var i = 0; i <= 11; i++) 
// 		{
// 			var condicional1 = i == 11;
// 			var bkwh = Number.parseFloat(data[i+1].bkwh);
// 			var ikwh = Number.parseFloat(data[i+1].ikwh);
// 			var pkwh = Number.parseFloat(data[i+1].pkwh);

// 			/*#region Hipotesis ConsumoTotal*/
// 			var periodo = bkwh + ikwh + pkwh;
// 			// console.log('Periodo: '+periodo);
// 			sumaConsumoTotalkWh += periodo;
// 			condicional1 ? promedioConsumoTotalkWh = Number.parseFloat(sumaConsumoTotalkWh / 12) : null;
// 			/*#endregion*/

// 			/*#region blahblah*/
// 			/*var bkw = Number.parseFloat(data[i].bkw);
// 			var ikw = Number.parseFloat(data[i].ikw);
// 			var pkw = Number.parseFloat(data[i].pkw);
// 			var bmxn = Number.parseFloat(data[i].bmxn);
// 			var imxn = Number.parseFloat(data[i].imxn);
// 			var pmxn = Number.parseFloat(data[i].pmxn);
// 			var pagoTransmision = Number.parseFloat(data[i].pagoTransmi);
// 			var cmxn = Number.parseFloat(data[i].cmxn);
// 			var dmxn = Number.parseFloat(data[i].dmxn);*/

// 			/*averageBkWh = Number.parseFloat(averageBkWh + bkwh);
// 			averageIkWh = Number.parseFloat(averageIkWh + ikwh);
// 			averagePkWh = Number.parseFloat(averagePkWh + pkwh);
// 			averageBkW = Number.parseFloat(averageBkW + bkw);
// 			averageIkW = Number.parseFloat(averageIkW + ikw);
// 			averagePkW = Number.parseFloat(averagePkW + pkw);
// 			averageBmxn = Number.parseFloat(averageBmxn + bmxn);
// 			averageImxn = Number.parseFloat(averageImxn + imxn);
// 			averagePmxn = Number.parseFloat(averagePmxn + pmxn);
// 			averagePagoTransmi = Number.parseFloat(averagePagoTransmi + pagoTransmision);
// 			averageCmxn = Number.parseFloat(averageCmxn + cmxn);
// 			averageDmxn = Number.parseFloat(averageDmxn + dmxn);*/

// 			/*condicional1 ? averageBkWh = Number.parseFloat(averageBkWh / 12) : null;
// 			condicional1 ? averageIkWh = Number.parseFloat(averageIkWh / 12) : null;
// 			condicional1 ? averagePkWh = Number.parseFloat(averagePkWh / 12) : null;
// 			condicional1 ? averageBkW = Number.parseFloat(averageBkW / 12) : null;
// 			condicional1 ? averageIkW = Number.parseFloat(averageIkW / 12) : null;
// 			condicional1 ? averagePkW = Number.parseFloat(averagePkW / 12) : null;
// 			condicional1 ? averageBmxn = Number.parseFloat(averageBmxn / 12) : null;
// 			condicional1 ? averageImxn = Number.parseFloat(averageImxn / 12) : null;
// 			condicional1 ? averagePmxn = Number.parseFloat(averagePmxn / 12) : null;
// 			condicional1 ? averagePagoTransmi = Number.parseFloat(averagePagoTransmi / 12) : null;
// 			condicional1 ? averageCmxn = Number.parseFloat(averageCmxn / 12) : null;
// 			condicional1 ? averageDmxn = Number.parseFloat(averageDmxn / 12) : null;*/

// 			//console.log(averageBkWh+','+averageIkWh+','+averagePkWh+','+averageBkW+','+averageIkW+','+averagePkW);
// 			/*#endregion*/
// 		}

// 		if(promedioConsumoTotalkWh > 0){
// 			// console.log('Consumo anual: '+sumaConsumoTotalkWh);
// 			// console.log('Promedio inicial: '+promedioConsumoTotalkWh);
// 			promedioConsumoTotalkWh = Math.ceil(promedioConsumoTotalkWh);
// 			// console.log('Promedio redondeado: '+promedioConsumoTotalkWh);
// 			/*#region PotenciaNecesaria*/
// 			//var municipio = data[0].direccionCliente;	//Programar metodo que formate y obtenga el municipio de la DIRECCION del Cliente, ya que se pretende obtener un string largo para este parametro
// 			var municipio = 'Tuxpan';
// 			var irradiacion_ = await getIrradiation(municipio);
// 			var _potenciaNecesaria = await obtenerPotenciaNecesaria(irradiacion_);
// 			var _consumoPromedio365 = consumoPromedio365(sumaConsumoTotalkWh);
// 			/*#endregion*/
// 			// console.log('_irradiacion: '+irradiacion_);
// 			// console.log('_potenciaNecesaria: '+_potenciaNecesaria);
// 			// console.log('Consumo promedio 365: '+_consumoPromedio365)
// 			/*#region Paneles_cotizacion*/
// 			_arrayNoDePaneles = await paneles.numeroDePaneles(_consumoPromedio365, irradiacion_, eficiencia);
// 			//console.log('_arrayNoDePaneles says: ');
// 			//console.log(_arrayNoDePaneles);
// 			/*#endregion*/
// 			/*#region Inversores_cotizacion*/
			
// 			responseEneryPanelsRequired = {
// 				energiaRequerida: {
// 					consumoAnual: sumaConsumoTotalkWh,
// 					promedioDelConsumo: promedioConsumoTotalkWh,
// 					potenciaNecesaria: _potenciaNecesaria
// 				}
// 			};

// 			arrayResponse.push(responseEneryPanelsRequired);

// 			for(var i=0; i<_arrayNoDePaneles.length; i++){
// 				responseEneryPanelsRequired = {
// 					panel: {
// 						nombre: _arrayNoDePaneles[i].nombre,
// 						marca: _arrayNoDePaneles[i].marca,
// 						potencia: _arrayNoDePaneles[i].potencia,
// 						potenciaReal: _arrayNoDePaneles[i].potenciaReal,
// 						noModulos: _arrayNoDePaneles[i].noModulos,
// 						precioPorPanel: _arrayNoDePaneles[i].precioPorPanel,
// 						costoDeEstructuras: _arrayNoDePaneles[i].costoDeEstructuras
// 					}
// 				};

// 				arrayResponse.push(responseEneryPanelsRequired);
// 			}
			
// 			return arrayResponse;
// 		}
// 	}
	// else{
	// 	for(var j = 0; j <= menosUno; j++)
	// 	{
	// 		var condicional2 = j == menosUno;
	// 		var bkwh = Number.parseFloat(data[j].bkwh);
	// 		var ikwh = Number.parseFloat(data[j].ikwh);
	// 		var pkwh = Number.parseFloat(data[j].pkwh);
	// 		var bkw = Number.parseFloat(data[j].bkw);
	// 		var ikw = Number.parseFloat(data[j].ikw);	
	// 		var pkw = Number.parseFloat(data[j].pkw);
	// 		/*var bmxn = Number.parseFloat(data[j].bmxn);
	// 		var imxn = Number.parseFloat(data[j].imxn);
	// 		var pmxn = Number.parseFloat(data[j].pmxn);
	// 		var pagoTransmision = Number.parseFloat(data[j].pagoTransmi);
	// 		var cmxn = Number.parseFloat(data[j].cmxn);
	// 		var dmxn = Number.parseFloat(data[j].dmxn);*/

	// 		averageBkWh = Number.parseFloat(averageBkWh + bkwh);
	// 		averageIkWh = Number.parseFloat(averageIkWh + ikwh);
	// 		averagePkWh = Number.parseFloat(averagePkWh + pkwh);
	// 		averageBkW = Number.parseFloat(averageBkW + bkw);
	// 		averageIkW = Number.parseFloat(averageIkW + ikw);
	// 		averagePkW = Number.parseFloat(averagePkW + pkw);
	// 		/*averageBmxn = Number.parseFloat(averageBmxn + bmxn);
	// 		averageImxn = Number.parseFloat(averageImxn + imxn);
	// 		averagePmxn = Number.parseFloat(averagePmxn + pmxn);
	// 		averagePagoTransmi = Number.parseFloat(averagePagoTransmi + pagoTransmision);
	// 		averageCmxn = Number.parseFloat(averageCmxn + cmxn);
	// 		averageDmxn = Number.parseFloat(averageDmxn + dmxn);*/

	// 		condicional2 ? averageBkWh = Number.parseFloat(averageBkWh / data.length) : null;
	// 		condicional2 ? averageIkWh = Number.parseFloat(averageIkWh / data.length) : null;
	// 		condicional2 ? averagePkWh = Number.parseFloat(averagePkWh / data.length) : null;
	// 		condicional2 ? averageBkW = Number.parseFloat(averageBkW / data.length) : null;
	// 		condicional2 ? averageIkW = Number.parseFloat(averageIkW / data.length) : null;
	// 		condicional2 ? averagePkW = Number.parseFloat(averagePkW / data.length) : null;
	// 		/*condicional2 ? averageBmxn = Number.parseFloat(averageBmxn / data.length) : null;
	// 		condicional2 ? averageImxn = Number.parseFloat(averageImxn / data.length) : null;
	// 		condicional2 ? averagePmxn = Number.parseFloat(averagePmxn / data.length) : null;
	// 		condicional2 ? averagePagoTransmi = Number.parseFloat(averagePagoTransmi / data.length) : null;
	// 		condicional2 ? averageCmxn = Number.parseFloat(averageCmxn / data.length) : null;
	// 		condicional2 ? averageDmxn = Number.parseFloat(averageDmxn / data.length) : null;*/
	// 	}

	// 	averagePeriodsGDMTH = {
	// 		bkwh: averageBkWh,
    //         ikwh: averageIkWh,
    //         pkwh: averagePkWh,
    //         bkw: averageBkW,
    //         ikw: averageIkW,
    //         pkw: averagePkW,
    //         /*bmxn: averageBmxn,
    //         imxn: averageImxn,
    //         pmxn: averagePmxn,
    //         pagoTransmi: averagePagoTransmi,
    //         cmxn: averageCmxn,
    //         dmxn: averageDmxn*/
	// 	};

	// 	for(var k = data.length; k <= 11; k++){
	// 		data.push(averagePeriodsGDMTH);
	// 	}
	// }
//}
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

function consumoPromedio365(powerNeeded){
	__consumoPromedioMensual = powerNeeded/365;
	__consumoPromedioMensual = parseFloat(Math.round(__consumoPromedioMensual * 100) / 100).toFixed(2);
	return __consumoPromedioMensual;
}

function calcularPorcentajeDePerdida(_setPorcentajePerdida){
	var porcentajePerdida = _setPorcentajePerdida / 100;
	return porcentajePerdida;
}

async function llenarEspaciosVaciosData(data)
{
	for(var j = 1; j < data.length; j++)
	{
		var _condicional = j == data.length - 1;
		var bkwh = Number.parseFloat(data[j].bkwh);
		var ikwh = Number.parseFloat(data[j].ikwh);
		var pkwh = Number.parseFloat(data[j].pkwh);
		var bkw = Number.parseFloat(data[j].bkw);
		var ikw = Number.parseFloat(data[j].ikw);	
		var pkw = Number.parseFloat(data[j].pkw);
		var bmxn = Number.parseFloat(data[j].bmxn);
		var imxn = Number.parseFloat(data[j].imxn);
		var pmxn = Number.parseFloat(data[j].pmxn);
		var pagoTransmision = Number.parseFloat(data[j].pagoTransmi);
		var cmxn = Number.parseFloat(data[j].cmxn);
		var dmxn = Number.parseFloat(data[j].dmxn);

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

		_condicional ? averageBkWh = Number.parseFloat(averageBkWh / (data.length - 1)) : null;
		_condicional ? averageIkWh = Number.parseFloat(averageIkWh / (data.length - 1)) : null;
		_condicional ? averagePkWh = Number.parseFloat(averagePkWh / (data.length - 1)) : null;
		_condicional ? averageBkW = Number.parseFloat(averageBkW / (data.length - 1)) : null;
		_condicional ? averageIkW = Number.parseFloat(averageIkW / (data.length - 1)) : null;
		_condicional ? averagePkW = Number.parseFloat(averagePkW / (data.length - 1)) : null;
		_condicional ? averageBmxn = Number.parseFloat(averageBmxn / (data.length - 1)) : null;
		_condicional ? averageImxn = Number.parseFloat(averageImxn / (data.length - 1)) : null;
		_condicional ? averagePmxn = Number.parseFloat(averagePmxn / (data.length - 1)) : null;
		_condicional ? averagePagoTransmi = Number.parseFloat(averagePagoTransmi / (data.length - 1)) : null;
		_condicional ? averageCmxn = Number.parseFloat(averageCmxn / (data.length - 1)) : null;
		_condicional ? averageDmxn = Number.parseFloat(averageDmxn / (data.length - 1)) : null;
	}

	averagePeriodsGDMTH = {
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

	for(var k = data.length; k <= 12; k++){
		data.push(averagePeriodsGDMTH);
	}

	return data;
}

function validateLengthData(data){
    if(data.length < 12){
		resultado = llenarEspaciosVaciosData(data);
		return resultado;
    }
    else if(data.length == 12){
        return null;
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