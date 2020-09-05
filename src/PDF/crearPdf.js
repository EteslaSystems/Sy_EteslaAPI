const pdf = require('html-pdf');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');

async function compileHandleFile(data){
    const filename = 'cotizacion.hbs';
    var plantilla = await configFile.getHandlebarsTemplate(filename);
    plantilla = plantilla.message;

    return handlebars.compile(plantilla)(data);
}

async function generarPDF(data){
    var now = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    var fileName = now.toString()+'_'+data.nombre.toString()+'.pdf';
    const fileCreatedPath = path.join(process.cwd(),'src/PDF/PDFs_created/'+fileName);
    var html = await compileHandleFile(data);

    pdf.create(html).toFile(fileCreatedPath, function(err, res){
        if(!err){
            console.log('done');
            console.log(res.filename);
        }
        else{
            console.log(err);
        }
    });
}

module.exports.crearPDF = async function(data){
    const result = await generarPDF(data);
    /* return result; */
}