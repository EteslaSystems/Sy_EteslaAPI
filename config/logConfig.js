/**
 * @author: LH420
 */

const path = require('path');
const fs = require('fs').promises;
const process = require('process');
const moment = require('moment-timezone');

module.exports.generateLog = async function(Event){ ///Main()
	try{
		//
		let uriFile = path.join(process.cwd(),'Logs');
		let fecha = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
		let fileName = '';

		switch(Event.tipo)
		{
			case 'Evento':
				uriFile = path.join(uriFile,'Eventos');
				fileName = 'Evento' + '-' + fecha.toString() + '.txt';
			break;
			case 'Error':
				uriFile = path.join(uriFile,'Errores');
				fileName = 'Error' + '-' + fecha.toString() + '.txt';
			break;
			default: 
				-1;
			break;
		}

		///Crear directorio
		await fs.mkdir(uriFile, {recursive: true});

		///Escribir log
		await fs.writeFile(uriFile + '/' + fileName, Event.contenido, { encoding: 'utf-8' });

		return 1;
	}
	catch(error)
	{
		console.log(error);
	}
}