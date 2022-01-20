/**
 * En este archivo se define la conexión a base de datos a utilizar en el proyecto.
 * @author: Jesús Daniel Carrera Falcón
 * @version: 1.0.0
 * @date: 11/Febrero/2020
 */

const mysql = require ('mysql'); //Constante que instancia la dependencia de MySQL

const mysqlConnection = mysql.createConnection({ //Cadena de conexión a la base de datos de MySQL
<<<<<<< HEAD
	host: 'localhost',
	user: 'esclavo',
        //user: root,
	password: '$!Etesla123$',
	database: 'eteslapanelessolares_sy'
=======
	host: '137.184.97.127',
	user: 'esclavo',
	password: '$!Etesla123$',
	database: 'eteslapanelessolares_sy',
	/* ---------------------------------------- */
	// host: 'localhost',
	// user: 'root',
	// database: 'eteslapanelessolares_sy'
>>>>>>> 96f656f4d6d597cfcf2b6a3560b41dfb96149019
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
