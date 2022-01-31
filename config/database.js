/**
 * En este archivo se define la conexión a base de datos a utilizar en el proyecto.
 * @date: 11/Febrero/2020
 */
require('dotenv').config();
const mysql = require ('mysql'); //Constante que instancia la dependencia de MySQL


const mysqlConnection = mysql.createConnection({ //Cadena de conexión a la base de datos de MySQL
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
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
