/*
- @description: 		Clase que extrae el tipo de cambio del dolar de la pagina oficial de BANORTE
- @author: 				LH420 
- @date: 				20/05/2020
*/
/*
    Para sacar el valor del dolar, se debe codificar una TAREA PROGRAMADA que a traves de SCRAPING
    extraiga el valor de tipo de cambio de la siguiente pagina:
        'https://www.banorte.com/wps/portal/banorte/Home/indicadores/dolares-y-divisas' OR
        'https://www.infodolar.com.mx/tipo-de-cambio-dof-diario-oficial-de-la-federacion.aspx'
    
    Dicha tarea programada debe de ejecutarse cada 24 hrs, para asi evitar un banneo por parte de
    la pagina, por extracion del dato sin permiso.
*/
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const process = require('process'); 
const cronJob = require('node-cron');

var moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');

/*                               -Tarea Programada_Obtener precio del dolar-
    1.-Dicha tarea programada debe de verificar o crear un directorio temporal
    2.-Una vez creado/comprobado el directorio dentro del server... Se crea un archivo temporal
    3.-Se guarda en JSON el valor del dolar
       {
           valorDolar: getDollarPrice(),
           fecha: now() => timestamp,
           fuente: uri/url
       }
    PD. NO OLVIDAR VALIDACIONES PARA COMPROBAR LA EXISTENCIA DE DIRECTORIO/ARCHIVO
    PD2. LOS ARCIHVOS DEBEN DE SER TEMPORALES, PARA NO REPRESENTAR CARGA/ALMACENAMIENTO EN EL SERVER
*/
//Tarea programada
/* cronJob.schedule("* * 6 * * *", async function(){
    await saveDollarPrice();
}); */

//Salvar precio del dolar en un archivo local
async function saveDollarPrice(){
    var directoryRoute = path.dirname(require.main.filename || process.mainModule.filename) + '/dirDollarPrice';
    const rutaArchivo = '\\Sy_EteslaAPI\\config\\dirDollarPrice\\'; //(ruta_absoluta)
    var objDolarPriceRegistered = {};
    var _dollarPrices = [];
    

    precioDolar = await scrapDollarPrice();

    /*Se verifica/crea el directorio "__dirDollarPrice"*/
    fs.mkdir(path.join(directoryRoute), { recursive: true }, async (err) => {
        if(!err){
            //Objeto del -Registro Precio_Dolar-
            uri = 'https://www.infodolar.com.mx/tipo-de-cambio-dof-diario-oficial-de-la-federacion.aspx';
            now = moment().tz("America/Mexico_City").format();

            objDolarPriceRegistered = {
                precioDolar: precioDolar,
                fuente: uri,
                fechaUpdate: now
            };

            now = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
            fileName = 'pdl_'+now.toString()+'.json'; ///pdl = precio dolar log

            /* fileExist = await configFile.ifExistConfigFile(rutaArchivo, fileName);

            json_dollarPrices = await configFile.getArrayJSONDollarPrice(rutaArchivo, fileName);
            _dollarPrices = JSON.parse(json_dollarPrices); 
            
            //Falta agregar la funcionalidad para que se pueda generar un historial de los precios
            //del dolar descargados en el dia. (Se debe de generar un tipo *log*)

            */

            _dollarPrices.push(objDolarPriceRegistered);
            json_dollarPrices = JSON.stringify(_dollarPrices, null, 2);

            //Creacion del archivo (log - pdl) : .JSON
            fs.appendFile(rutaArchivo+fileName, json_dollarPrices, 'utf-8', function(err){
                if(!err){
                    console.log('Precio del dolar actualizado, correctamente.');
                    return true;
                }
                else{
                    return false;
                }
            });
        }
        else{
            console.log('Hubo un error al intentar crear un directorio!');
        }
    });
}

//Scrapping para obtener precio del dolar
async function scrapDollarPrice(){
    var priceDolar = 0;

    try
    {
        const $ = await request({
            uri: 'https://www.infodolar.com.mx/tipo-de-cambio-dof-diario-oficial-de-la-federacion.aspx',
            transform: body => cheerio.load(body)
        });
    
        priceDolar = $('#Referencia tbody td.colCompraVenta').text().trim().slice(1);
        priceDolar = Math.round(parseFloat(priceDolar) * 100) / 100;

        return priceDolar;
    }
    catch(error)
    {
        console.log(error);
    }
}

//Obtener precio del dolar $local
async function getDollarPrice(){
    const response = {};
    var dollarPrice = 0;

    now = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    fileName = 'pdl_'+now.toString()+'.json'; ///pdl = precio dolar log

    dollarPrice = await configFile.getArrayJSONDollarPrice(fileName);

    if(dollarPrice.status != true)
    {
        //Error
        dollarPrice = parseFloat(dollarPrice.valueOfDollar.precioDolar);
    }
    else{
        //Success
        dollarPrice = dollarPrice.message;
    }

    return dollarPrice;
}

module.exports.obtenerPrecioDolar = async function(){
    const result = await getDollarPrice();
    return result;
}

/*CAUTION: SOLO OCUPAR EN CASO DE EMERGENCIA*/
module.exports.actualizarManualPrecioDolar = async function(){
    const result = await saveDollarPrice();
    return result;
}
