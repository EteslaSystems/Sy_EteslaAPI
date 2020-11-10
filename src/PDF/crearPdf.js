const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');

async function generarPDF(data){ ///Main()    
    var dataOrdenada = await ordenarData(data);
    var now = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    var fileName = now.toString()+'_'+dataOrdenada.cliente.nombre.toString()+'.pdf';
    const fileCreatedPath = path.join(process.cwd(),'src/PDF/PDFs_created/'+fileName);

    const browser = await puppeteer.launch();
    const html = await compileHandleFile(dataOrdenada);
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
    console.log('PDF creado!!');
    // return pdf;
}

async function compileHandleFile(data){
    var fileName = 'cotizacion.hbs';
    var plantilla = await configFile.getHandlebarsTemplate(fileName);
    plantilla = plantilla.message;

    return handlebars.compile(plantilla)(data);
}

async function ordenarData(dataa){
    var idCliente = dataa.idCliente;
    var idVendedor = dataa.idVendedor;
    var datas = { idPersona: '' };

    datas.idPersona = idCliente;
    var uCliente = await cliente.consultarId(datas);
    uCliente = uCliente.message;

    datas.idPersona = idVendedor;
    var uVendedor = await vendedor.consultarId(datas);
    uVendedor = uVendedor.message;

    objCombinaciones = JSON.parse(dataa.dataCombinaciones);
    
    objResult = {
        vendedor: {
            nombre: '',
            sucursal: ''
        },
        cliente: {
            nombre: uCliente[0].vNombrePersona + ' ' + uCliente[0].vPrimerApellido + ' ' + uCliente[0].vSegundoApellido,
            direccion: uCliente[0].vCalle + ' ' + uCliente[0].vMunicipio + ' ' + uCliente[0].vEstado
        },
        combinaciones: objCombinaciones,
        combinacionesPropuesta: dataa.combinacionesPropuesta,
        combinacionSelected: dataa.combSeleccionada
    }

   console.log('createPdf says: ');
   console.log(objResult);

   return objResult;
}

module.exports.crearPDF = async function(data){
    const result = await generarPDF(data);
    /* return result; */
}