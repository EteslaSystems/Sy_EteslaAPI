/*
- @description: 		Archivo que contiene todas las operaciones matematicas para llevar acabo una cotizaación de Baja Tension
- @author: 				LH420
- @date: 				24/07/2020
*/
var limite = 0;
var objetivoDAC = 0;
var limitePotencia = 0;

var consumoDiario = 0;
var potencia = 0;

function promedio_consumos(){
    var m = consumos.length === 12 ? 2 : 1;

    
}

function calcular_potencia(){
    switch(tarifa)
    {
        case '1':
            limite = 500;
            objetivoDAC = 250;
            limitePotencia = 50500;
        break;
        case '1a':
            limite = 600;
            objetivoDAC = 350;
            limitePotencia = 50500;
        break;
        case '1b':
            limite = 800;
            objetivoDAC = 450;
            limitePotencia = 50500;
        break;
        case '1c':
            limite = 1700;
            objetivoDAC = 850;
            limitePotencia = 50500;
        break;
        case '1d':
            limite = 2000;
            objetivoDAC = 1000;
            limitePotencia = 50500;
        break;
        case '1e':
            limite = 4000;
            objetivoDAC = 1800;
            limitePotencia = 50500;
        break;
        case '1f':
            limite = 5000;
            objetivoDAC = 5000;
            limitePotencia = 50500;
        break;
        case '2':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 30000;
        break;
        case 'IC':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 30000;
        break;
        case '3':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 30000;
        break;
        case 'OM':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 500000;
        break;
        case 'HM':
            limite = 0;
            objetivoDAC = 0;
            limitePotencia = 500000;
        break;
        default:
            return -1;
        break;
    }

    cuanto_menos = limite - (consumo_mensual * 2 * 0.10);
    objetivoDAC = cuanto_menos < objetivoDAC ? cuanto_menos : -1;
    objetivoDAC = objetivoDAC < 0 || objetivoDAC > (consumo_mensual * 2) ? 0 : -1; //????

    var subsidio_diario = (objetivoDAC * 6)/365;

    if(origen === 'Veracruz'){
        if(porcentaje === 1){
            potencia = consumo
        }
    }
}
