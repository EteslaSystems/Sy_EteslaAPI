/**
 * En este archivo se define la conexión a base de datos a utilizar en el proyecto.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 11/Febrero/2020
 */

const mysql = require ('mysql'); //Constante que instancia la dependencia de MySQL

const mysqlConnection = mysql.createConnection({ //Cadena de conexión a la base de datos de MySQL
	host: 'etesla.mx',
	user: 'eteslamx_chucho',
	password: 'gpO7DIlzfU*c',
	database: 'eteslamx_eteslapanelessolares_sy',
});

mysqlConnection.connect(function (err){ //función que manda un mensaje a la consola con el resultado de la conección, ya sea exitosa o no
	if(err){
		console.log('Se produjo un error al intentar conectar con la base de datos: ' + err);
		console.log('---------------------------------------------------------------------');
		return;
	}
	else{
		console.log('Conexion exitosa con la base de datos.');
		console.log('---------------------------------------------------------------------');
	}
});

module.exports = mysqlConnection;
