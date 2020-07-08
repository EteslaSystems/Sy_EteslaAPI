/*
- @description: 		Clase que extrae el tipo de cambio del dolar de la pagina oficial de BANORTE
- @author: 				LH420 
- @date: 				20/05/2020
*/

/*
    Para sacar el valor del dolar, se debe codificar una TAREA PROGRAMADA que a traves de SCRAPING
    extraiga el valor de tipo de cambio de la siguiente pagina:
        'https://www.banorte.com/wps/portal/banorte/Home/indicadores/dolares-y-divisas'
    
    Dicha tarea programada debe de ejecutarse cada 24 hrs, para asi evitar un banneo por parte de
    la pagina, por extracion sin permiso del dato.

    1$ = $23.50
*/

var precioDolar = 0;

function getDollarPrice(){
    precioDolar = 22.90;
    return precioDolar;
}

module.exports.obtenerPrecioDolar = function(){
    const result = getDollarPrice();
    return result;
}

