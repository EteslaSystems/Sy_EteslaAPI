/*
- @description: 		Archivo que filtra que tipo de cotizacion esta solicitando el webClient:
                            -Individual (solo por cantidad de paneles e inversores)
                            -BajaTensión
                            -Media tensión
- @author: 				LH420
- @date: 				20/03/2020
*/
/*#region SwitchCotizaciones*/
/*#endregion*/
/*#region Busqueda_inteligente*/
function mainBusquedaInteligente(data){
    var tipoBusqueda = data.tipoBusqueda.toString();
    var limiteProduccion = '';

    switch(tipoBusqueda)
    {
        case "economica":
        break;
        case "mediana":
        break;
        case "mayor_produccion":
        break;
        default:
            return -1;
        break;
    }
}
/*#endregion*/