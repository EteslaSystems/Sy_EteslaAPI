"use strict";
const nodemailer = require('nodemailer');
const log = require('../config/logConfig');

class mailConfig {

	constructor() {
		this.createTransport = nodemailer.createTransport({
			"host": "smtp.gmail.com",
			"port": "587",
			"smtpsecure": "tls",
			"auth": {
				"type": "login",
				"user": "sistemas.etesla@gmail.com",
				"pass": "@Etesla123_4"
			}
		});
	}

	async enviarCorreo(oEmail) {
		try {
			let Log = {};
			
			this.createTransport.sendMail(oEmail, function(error, info) {
				if (error) {
					Log = { tipo: 'Error', contenido: "Error al enviar el correo a: " + oEmail.to };
				} else {
					Log = { tipo: 'Evento', contenido: "Correo enviado correctamente a: " + oEmail.to };
				}
			})

			await log.generateLog(Log);
		} catch(x){
			await log.generateLog();
		}
	}
}

module.exports = mailConfig;