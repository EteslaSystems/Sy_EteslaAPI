const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');

async function generarPDF(data){ ///Main()  
    let dataOrdenada = await ordenarData(data);
    let fileName = getNameFile(dataOrdenada);
    const fileCreatedPath = path.join(process.cwd(),'src/PDF/PDFs_created/'+fileName);

    const browser = await puppeteer.launch({ headless: false });
    const html = await compileHandleFile(dataOrdenada);
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const configPDFDocument = {
        path: fileCreatedPath,
        format: 'A4',
        printBackground: true
    };

    //Create PDF
    await page.setContent(html);
    await page.emulateMediaType('screen');
    const pdf = await page.pdf(configPDFDocument);
    await context.close();

    objResult = {
        pdf_: pdf,
        nombreArchivo: fileName,
        rutaArchivo: fileCreatedPath
    };

    console.log('PDF creado: '+objResult.nombreArchivo);

    return objResult;
}

async function compileHandleFile(data){
    let fileName = '';

    //Se identifica el tipo de cotizacion
    if(data.tipoPropuesta != "individual"){ ///Cotizacion BajaTension && MediaTension
        fileName = 'cotizacion.hbs';
    }
    else{ ///Cotizacion Individual
        fileName = 'cotizacion_individual.hbs';
    }
    
    let plantilla = await configFile.getHandlebarsTemplate(fileName);
    plantilla = plantilla.message;

    return handlebars.compile(plantilla)(data);
}

async function ordenarData(dataa){
    let objResultDatOrd = { vendedor:''||null, cliente:''||null, combinaciones:''||null, combinacionesPropuesta:null, tipoPropuesta:''};
    let idCliente = dataa.idCliente;
    let idVendedor = dataa.idVendedor;
    let datas = { idPersona: '' };
    let combinacionEconomica = false;
    let combinacionMediana = false;
    let combinacionOptima = false;
    let propuesta = [];

    if(dataa.combinacionesPropuesta){
        combinacionesPropuesta = dataa.combinacionesPropuesta;
        dataa.combinacionesPropuesta = combinacionesPropuesta == "true" ? true : false;
    }

    datas.idPersona = idCliente; ///Formating data to consulting BD
    let uCliente = await cliente.consultarId(datas);
    uCliente = uCliente.message;

    datas.idPersona = idVendedor; ///Formating data to consulting BD
    let uVendedor = await vendedor.consultarId(datas);
    uVendedor = uVendedor.message;

    objResultDatOrd.vendedor = {
        nombre: uVendedor[0].vNombrePersona +' '+uVendedor[0].vPrimerApellido+' '+uCliente[0].vSegundoApellido,
        sucursal: uVendedor[0].vOficina
    };
    objResultDatOrd.cliente = {
        nombre: uCliente[0].vNombrePersona + ' ' + uCliente[0].vPrimerApellido + ' ' + uCliente[0].vSegundoApellido,
        direccion: uCliente[0].vCalle + ' ' + uCliente[0].vMunicipio + ' ' + uCliente[0].vEstado
    };

    //Tipo de propuesta (bajaTension, mediaTension, individual)
    objResultDatOrd.tipoPropuesta = dataa.tipoPropuesta;

    //Se filtra si la propuesta contiene combinaciones o equipos seleccionados
    if(dataa.combinacionesPropuesta === true){ ///Combinaciones
        let objCombinaciones = JSON.parse(dataa.dataCombinaciones);
    
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
    else if(dataa.combinacionesPropuesta === false){ ///Equipos seleccionados
        //Se obtiene la propuesta calculada
        propuesta = JSON.parse(dataa.propuesta);

        ///Formating microinversor_combinacion [QS1 + YC600]
        propuesta[0].inversores.combinacion = propuesta[0].inversores.combinacion == 'true' ? true : false;

        //Se obtiene los consumos del cliente
        _arrayConsumos = JSON.parse(dataa.consumos);
        _arrayConsumos = _arrayConsumos.consumo;

        propuesta.push(_arrayConsumos);

        objResultDatOrd.propuesta = propuesta;
    }
    else{
        //Cotizacion individual
        objResultDatOrd.propuesta = JSON.parse(dataa.propuesta_individual);
    }

    return objResultDatOrd;
}

function getNameFile(data){
    let fechaCreacion = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    let tipoPropuesta = ''; //MT, BT, Indv
    let nombreCliente = data.cliente.nombre;
    let horaCreacion = moment().format('HH:mm:ss');

    horaCreacion = horaCreacion.replace(/:/g,"_"); //Se remplazan ":" por "_" del formato de hora
    nombreCliente = nombreCliente.replace(/\s+/g, ''); //Se borra los espacios en blanco 

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
        tipoPropuesta = 'cotizacion'+data.tipoPropuesta+'_'+data.propuesta[0].paneles.potencia + 'W';
    }

    nombrArchivoPDF = nombreCliente+'_'+tipoPropuesta+'_'+fechaCreacion+'_'+horaCreacion+'.pdf';

    return nombrArchivoPDF.toString();
}

module.exports.crearPDF = async function(data){
    const result = await generarPDF(data);
    return result;
}