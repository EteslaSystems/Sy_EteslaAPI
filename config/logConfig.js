// /**
//  * En este archivo se definen los parametros necesarios para la creación de un archivo log, tanto de eventos exitosos, neutrales y de error.
//  * También se define su estructura, las carpetas, las variables para acceder a el y los métodos para escribir en el.
//  * @author: Jesús Daniel Carrera Falcón
//  * @version: 1.0.0
//  * @date 11/Febrero/2020
//  */

// //Se obtiene la fecha actual, reformateandola para darle una vista más amigable para el usuario.
// //Fecha para el nombre del archivo log.
// let fecha = new Date();
// let fechacompleta = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate();
// //Fecha para el formato del log.
// let opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute:'numeric', second: 'numeric' };
// let fechaAmigable = '[[' + fecha.toLocaleDateString("es-ES", opciones) + ']]';
// //Se obtienen las rutas de los directorios donde se guardarán los log.
// let path = require('path');
// let dir = path.dirname(__dirname);
// let dirEventos = dir + '\\src\\Logs\\LogEventos';
// let dirErrores = dir + '\\src\\Logs\\LogErrores';

// //Creación de los log de registro continuo, ubicados cada uno en una carpeta en especifico y con la fecha actual.
// //Log de eventos.
// const eventos = {
// 	errorEventName:'eventos',
// 	logDirectory:dirEventos,
// 	fileNamePattern:fechacompleta + '_log_eventos.log',
// 	timestampFormat:fechaAmigable
// };

// //Log de errores.
// const errores = {
// 	errorEventName:'errores',
// 	logDirectory:dirErrores,
// 	fileNamePattern:fechacompleta + '_log_errores.log',
// 	timestampFormat:fechaAmigable
// };

// //Instacias del log de registro, usando la librería 'simple-node-logger' y el objeto 'eventos'.
// const events = require('simple-node-logger').createRollingFileLogger(eventos);
// const errors = require('simple-node-logger').createRollingFileLogger(errores);

// module.exports = { //Se exportan los métodos para acceder a los log y escribir en ellos los parámetros recibidos.
//     eventos(accion, detalles){
// 		events.info('|| ACCIÓN: ', accion, ' || ESTATUS: Correcto. || DETALLES: ', detalles, '\n----------------------------------------------------------------------------------------------------------------------------------------------------');
// 	},
// 	errores(accion, detalles){
// 		errors.error('|| ACCIÓN: ', accion, ' || ESTATUS: Error. || DETALLES: ', detalles, '\n----------------------------------------------------------------------------------------------------------------------------------------------------');
// 	}
// }
