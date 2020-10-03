const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');

async function compileHandleFile(data){
    var fileName = 'cotizacion.hbs';
    var plantilla = await configFile.getHandlebarsTemplate(fileName);
    plantilla = plantilla.message;

    return handlebars.compile(plantilla)(data);
}

async function generarPDF(data){
    var now = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    var fileName = now.toString()+'_'+data.nombre.toString()+'.pdf';
    const fileCreatedPath = path.join(process.cwd(),'src/PDF/PDFs_created/'+fileName);
    
    const browser = await puppeteer.launch();
    const html = await compileHandleFile(data);
    const page = await browser.newPage();
    const configPDFDocument = {
        path: fileCreatedPath,
        format: 'A4',
        printBackground: true
    };

    //Create PDF
    await page.setContent(html);
    await page.emulateMediaType('screen');
    const pdf = await page.pdf(configPDFDocument);
    await browser.close();

    // return pdf;
}

module.exports.crearPDF = async function(data){
    const result = await generarPDF(data);
    /* return result; */
}