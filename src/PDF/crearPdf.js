const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment-timezone');
const configFile = require('../Controller/configFileController');
const cliente = require('../Controller/clienteController');
const vendedor = require('../Controller/usuarioController');

async function generarPDF(data){ ///Main()  
    let dataOrdenada = await ordenarData(data);
    let fileName = await getNameFile(dataOrdenada);
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

        objResultDatOrd.combinaciones = servirRutaImagenes(objResultDatOrd.combinaciones);

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

        propuesta = servirRutaImagenes(propuesta);

        objResultDatOrd.propuesta = propuesta;
    }
    else{
        //Cotizacion individual
        objResultDatOrd.propuesta = JSON.parse(dataa.propuesta_individual);

        objResultDatOrd.propuesta = servirRutaImagenes(objResultDatOrd.propuesta);
    }

    return objResultDatOrd;
}

async function getNameFile(data){
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
 
/////
function servirRutaImagenes(data){
    /* 
        -Esta funcion sirve la URL de la imagen alojada en GoogleDrive 'sistemas.etesla@gmail.com'
        -*Retorna la -data- con las rutas de las imagenes ya incrustadas en su respectiva seccion - especifica

        -*Mantenimiento: 
            -Agregar imagen al GoogleDrive, extraer la URI y copiarla aqui, junto con el nombre de la marca (panel/inversor)

        -*Futura implementacion:
            -Pasar el directorio de "marcas" e "rutas_imagenes" a un JSON para que este pueda ser administrado en el clienteWeb
    */
    let marcaPanel, marcaInversor;
    let rImgPanel, rImgInversor; //Rutas de imagenes
    const uriGoogleDriveImg = 'https://drive.google.com/thumbnail?id=';
    const diccionarioRutasImagenes = {
        paneles: {
            'Axitec': uriGoogleDriveImg+'1M7pCr8DeIAdcjFJiWnjSIMQE537iF77G',
            'Canadian': uriGoogleDriveImg+'1L-L87jYbe7Q2ZZUUNY9ee8DfLLBVAg_3',
            'Jinko': uriGoogleDriveImg+'1eFwmZHxzPfu4nJTPdzCE0mx-rbdAh47x',
            'Suntech': uriGoogleDriveImg+'1N2wEt4wgaqz2iJacrll-WJW8ygDqgfUN'
        },
        inversores: {
            'ABB-Fimer': uriGoogleDriveImg+'1DyGJc-0c2ZAaePFliXzsaZY_sT4cTiwr',
            'APS': uriGoogleDriveImg+'1IARf84lsXcwBcih6Tlo0q4bCUe3fFbUQ',
            'Enphase': uriGoogleDriveImg+'1qqa00EE52LwIsgsFtAzX2e9CFopEI37X',
            'Fronius Solar': uriGoogleDriveImg+'1nGDXlOh2mF-fujGm-9Y1v-fzNemUxx-2',
            'Goodwe': uriGoogleDriveImg+'1zoXWl60PzT_p5-2CZuFWh2OHuKb_45Ty',
            'Schneider': uriGoogleDriveImg+'1UKTcIrAZXYlzrHr79vXqTb8Q9Ujaqw4p',
            'SMA': uriGoogleDriveImg+'1-o-S2T4a2nyHmdRmypah97unrN0okyU4',
            'Solaredge': uriGoogleDriveImg+'1whPu4lhO85KtszNToPpX8htunLhaQMFY',
            'Solis': uriGoogleDriveImg+''
        }
    };

    //BT
    if(data.objCombinaciones){ ///Combinaciones
        for(let propCombi in data.objCombinaciones)
        {
            if(propCombi != "_arrayConsumos"){
                let objCombinacionIterada = data.objCombinaciones[propCombi];

                marcaPanel = objCombinacionIterada[0].paneles.marca;
                marcaInversor = objCombinacionIterada[0].inversores.vMarca;
                rImgPanel = diccionarioRutasImagenes.paneles[marcaPanel];
                rImgInversor = diccionarioRutasImagenes.inversores[marcaInversor];

                //Incrustacion de las rutas_img
                data.objCombinaciones[propCombi][0].paneles.imgRuta = rImgPanel;
                data.objCombinaciones[propCombi][0].inversores.imgRuta = rImgInversor;
            }
        }
    }
    else{ ///EquiposSeleccionados
        //GetMarcaEquipos
        marcaPanel = data[0].paneles.marca;
        marcaInversor = data[0].inversores.vMarca;
        rImgPanel = diccionarioRutasImagenes.paneles[marcaPanel];
        rImgInversor = diccionarioRutasImagenes.inversores[marcaInversor];

        //Incrustacion de las rutas_img
        data[0].paneles.imgRuta = rImgPanel;
        data[0].inversores.imgRuta = rImgInversor;
    }

    return data;
}

module.exports.crearPDF = async function(data){
    const result = await generarPDF(data);
    return result;
}