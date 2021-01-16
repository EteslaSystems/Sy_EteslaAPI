const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');

async function generarPDF(data){ ///Main()  
    var dataOrdenada = await ordenarData(data);
    var fileName = await getNameFile(dataOrdenada);
    const fileCreatedPath = path.join(process.cwd(),'src/PDF/PDFs_created/'+fileName);

    console.log(dataOrdenada);

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

    objResult = {
        nombreArchivo: fileName,
        rutaArchivo: fileCreatedPath
    };

    return objResult;
}

async function compileHandleFile(data){
    var fileName = 'cotizacion.hbs';
    var plantilla = await configFile.getHandlebarsTemplate(fileName);
    plantilla = plantilla.message;

    return handlebars.compile(plantilla)(data);
}

async function ordenarData(dataa){
    var objResultDatOrd = { vendedor:''||null, cliente:''||null, combinaciones:''||null, combinacionesPropuesta:false};
    var idCliente = dataa.idCliente;
    var idVendedor = dataa.idVendedor;
    var datas = { idPersona: '' };
    var combinacionEconomica = false;
    var combinacionMediana = false;
    var combinacionOptima = false;

    combinacionesPropuesta = dataa.combinacionesPropuesta;
    dataa.combinacionesPropuesta = combinacionesPropuesta == "true" ? true : false;

    datas.idPersona = idCliente;
    var uCliente = await cliente.consultarId(datas);
    uCliente = uCliente.message;

    datas.idPersona = idVendedor;
    var uVendedor = await vendedor.consultarId(datas);
    uVendedor = uVendedor.message;

    objResultDatOrd.vendedor = {
            nombre: uVendedor[0].vNombrePersona +' '+uVendedor[0].vPrimerApellido+' '+uCliente[0].vSegundoApellido,
            sucursal: uVendedor[0].vOficina
    };
    objResultDatOrd.cliente = {
        nombre: uCliente[0].vNombrePersona + ' ' + uCliente[0].vPrimerApellido + ' ' + uCliente[0].vSegundoApellido,
        direccion: uCliente[0].vCalle + ' ' + uCliente[0].vMunicipio + ' ' + uCliente[0].vEstado
    };

    //Se filtra si la propuesta contiene combinaciones o equipos seleccionados
    if(dataa.combinacionesPropuesta === true){ ///Combinaciones
        objCombinaciones = JSON.parse(dataa.dataCombinaciones);
    
        combinacionSeleccionada = dataa.combSeleccionada.toString();
    
        switch(combinacionSeleccionada)
        {
            case 'optConvinacionEconomica':
                combinacionEconomica = true;
            break;
            case 'optConvinacionMediana':
                combinacionMediana = true;
            break;
            case 'optConvinacionOptima':
                combinacionOptima = true;
            break;
            default:
                -1;
            break;
        }

        objResultDatOrd.combinaciones = {
                objCombinaciones: objCombinaciones,
                combinacionEconomica: combinacionEconomica,
                combinacionMediana: combinacionMediana,
                combinacionOptima: combinacionOptima
        };
        objResultDatOrd.combinacionesPropuesta = dataa.combinacionesPropuesta;
    }
    else{ ///Equipos seleccionados
        propuesta = JSON.parse(dataa.propuesta);
        _arrayConsumos = JSON.parse(dataa.consumos);
        _arrayConsumos = _arrayConsumos[0];

        propuesta.push(_arrayConsumos);

        objResultDatOrd.propuesta = propuesta;
    }

    return objResultDatOrd;
}

async function getNameFile(data){
    var fechaCreacion = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    var tipoPropuesta = '';
    var nombreCliente = data.cliente.nombre;
    var horaCreacion = moment().format('HH:mm:ss');
    horaCreacion = horaCreacion.replace(/:/g,"-");

    if(data.combinacionesPropuesta === true){
        if(data.combinaciones.combinacionEconomica === true){
            tipoPropuesta = "combinacionEconomica";
        }

        if(data.combinaciones.combinacionMediana === true){
            tipoPropuesta = "combinacionMediana";  
        }

        if(data.combinaciones.combinacionOptima === true){
            tipoPropuesta = "combinacionOptima";  
        }
    }
    else{
        tipoPropuesta = 'propuestaDe'+data.propuesta[0].paneles.potencia + 'W';
    }

    nombrArchivoPDF = nombreCliente+'_'+tipoPropuesta+'_'+fechaCreacion+'_'+horaCreacion+'.pdf';

    return nombrArchivoPDF.toString();
}

module.exports.crearPDF = async function(data){
    const result = await generarPDF(data);
    return result;
}