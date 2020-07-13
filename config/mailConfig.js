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
				"user": "danyhacks28@gmail.com",
				"pass": "Urakirabe28"
				/*"user": "sistemas.etesla@gmail.com",
				"pass": "@Etesla123_4"*/
			}
		});
	}

	enviarCorreo(oEmail) {
		try {
			this.createTransport.sendMail(oEmail, function(error, info) {
				if (error) {
					log.errores('ENVIAR CORREO.', "Error al enviar el correo a: " + oEmail.to);
				} else {
					log.eventos('ENVIAR CORREO.', "Correo enviado correctamente a: " + oEmail.to);
				}
				//this.createTransport.close();
			})
		} catch(x) {
			log.errores('ENVIAR CORREO.', "Error al enviar el correo - " + x.message);
		}
	}
}

module.exports = mailConfig;