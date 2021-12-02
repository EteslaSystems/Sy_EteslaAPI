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
const configFile = require('../Controller/configFileController');
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const process = require('process'); 
const cronJob = require('node-cron');
const moment = require('moment-timezone');

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
    let objPrecioDelDolar = {};
    
    try{
        //
        let uriFile = path.join(process.cwd(), 'config','dirDollarPrice'); //Directory-File
        let precioDolar = await scrapDollarPrice();
        let fechaToday = moment().tz("America/Mexico_City").format('YYYY-MM-DD');

        //Creando directorio
        await fs.mkdir(uriFile, {recursive: true});
        
        //Objeto del precio del dolar
        objPrecioDelDolar = {
            fuente: 'https://www.infodolar.com.mx/tipo-de-cambio-dof-diario-oficial-de-la-federacion.aspx',
            precioDolar: precioDolar,
            fechaUpdate: fechaToday
        };

        objPrecioDelDolar = JSON.stringify(objPrecioDelDolar, null, 2);

        //Nombre del futuro archivo-log
        let fileName = 'pdl_'+fechaToday.toString()+'.json';
        
        await fs.writeFile(uriFile+'/'+fileName, objPrecioDelDolar, { encoding: 'utf-8' });
        
        return 'Precio del dolar actualizado';
    }
    catch(error){
        console.log("Error (1):\n"+error);
    }
}

//Scrapping para obtener precio del dolar
async function scrapDollarPrice(){
    try{
        const precioDolarRequest = await request({
            uri: 'https://www.infodolar.com.mx/tipo-de-cambio-dof-diario-oficial-de-la-federacion.aspx',
            headers: {},
            gzip: true
        });
    
        let $ = cheerio.load(precioDolarRequest);
        let priceDolar = $('#Referencia tbody td.colCompraVenta').text().trim().slice(1);
        priceDolar = parseFloat(priceDolar);
    
        return priceDolar;
    }
    catch(error){
        console.log(error);
    }
}

//Obtener precio del dolar $local
async function getDollarPrice(){
    try{
        let now = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
        let fileName = 'pdl_'+now.toString()+'.json'; ///pdl = precio dolar log
        let dollarPrice = await configFile.getArrayJSONDollarPrice(fileName);

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
    catch(error){
        console.log(error)
    }
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
