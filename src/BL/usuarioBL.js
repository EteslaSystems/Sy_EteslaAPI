/*
- @description: 		Archivo correspondiente a la sección de reglas a cumplir de los datos recibidos.
- @author: 			Yael Ramirez Herrerias / Jesus Daniel Carrera Falcon
- @date: 				19/02/2020
*/

const usuario = require('../Controller/usuarioController');
const log = require('../../config/logConfig');
const validations = require('../Middleware/usuarioMiddleware');
const mailer = require('../../config/mailConfig');
const jwt = require('jsonwebtoken'); 
const secret = 'eTeslaSecret';
var moment = require('moment-timezone');

module.exports.insertar = async function (request, response) {
	let validate = await validations.usuarioValidation(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;
		let telefono = 666;

		const datas = {
			siRol: parseInt(request.rol),
			ttTipoUsuario: request.tipoUsuario,
			vContrasenia: request.contrasenia,
	        	vOficina: request.oficina,
	        	vNombrePersona: request.nombrePersona,
	        	vPrimerApellido: request.primerApellido,
	        	vSegundoApellido: request.segundoApellido,
	        	vTelefono: telefono,
	        	vEmail: request.email.toLowerCase(),
			created_at: fecha
		};

		result = await usuario.insertar(datas);

		if(result.status !== true) {
			await log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / USUARIOS.' + result.message });

			throw new Error('Error al insertar los datos.');
		}

		await log.generateLog({ tipo: 'Evento', contenido: 'INSERTAR / USUARIOS.' + '1 fila insertada.' });

		const payload = { email: datas.vEmail };
		const emailToken = jwt.sign(payload, secret, { expiresIn: 86400 });
		//La parte del host de la url se cambiará una vez se ponga en producción o si tu host es diferente.
		const url = 'http://127.0.0.1:8000/verificarEmail/' + emailToken;
		const oEmail = new mailer();

		let email = {
			from: 'Depto. de sistemas Etesla',
			to: datas.vEmail,
			subject: "Verificación de correo electrónico",
			html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
			<head> 
			<meta charset="UTF-8"> 
			<meta content="width=device-width, initial-scale=1" name="viewport"> 
			<meta name="x-apple-disable-message-reformatting"> 
			<meta http-equiv="X-UA-Compatible" content="IE=edge"> 
			<meta content="telephone=no" name="format-detection"> 
			<title>Bienvenida</title> 
			<!--[if (mso 16)]>
			<style type="text/css">
			a {text-decoration: none;}
			</style>
			<![endif]--> 
			<!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
			<style type="text/css">
			@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:20px!important; text-align:center; line-height:120%!important } h2 { font-size:16px!important; text-align:left; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:20px!important } h2 a { font-size:16px!important; text-align:left } h3 a { font-size:20px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:10px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { font-size:14px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
			#outlook a {
				padding:0;
			}
			.ExternalClass {
				width:100%;
			}
			.ExternalClass,
			.ExternalClass p,
			.ExternalClass span,
			.ExternalClass font,
			.ExternalClass td,
			.ExternalClass div {
				line-height:100%;
			}
			.es-button {
				mso-style-priority:100!important;
				text-decoration:none!important;
			}
			a[x-apple-data-detectors] {
				color:inherit!important;
				text-decoration:none!important;
				font-size:inherit!important;
				font-family:inherit!important;
				font-weight:inherit!important;
				line-height:inherit!important;
			}
			.es-desk-hidden {
				display:none;
				float:left;
				overflow:hidden;
				width:0;
				max-height:0;
				line-height:0;
				mso-hide:all;
			}
			.es-button-border:hover a.es-button {
				background:#ffffff!important;
				border-color:#ffffff!important;
			}
			.es-button-border:hover {
				background:#ffffff!important;
				border-style:solid solid solid solid!important;
				border-color:#3d5ca3 #3d5ca3 #3d5ca3 #3d5ca3!important;
			}
			td .es-button-border:hover a.es-button-1 {
				background:#3d5ca3!important;
				border-color:#3d5ca3!important;
				color:#ffffff!important;
			}
			td .es-button-border-2:hover {
				background:#3d5ca3!important;
			}
			</style> 
			</head> 
			<body style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"> 
			<div class="es-wrapper-color" style="background-color:#FAFAFA;"> 
			<!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
			<v:fill type="tile" color="#fafafa"></v:fill>
			</v:background>
			<![endif]--> 
			<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;"> 
			<tr style="border-collapse:collapse;"> 
			<td valign="top" style="padding:0;Margin:0;"> 
			<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;"> 
			<tr style="border-collapse:collapse;"> 
			<td class="es-adaptive" align="center" style="padding:0;Margin:0;"> 
			<table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#3D5CA3;border-left:1px solid #000000;border-right:1px solid #000000;border-top:1px solid #000000;" width="600" cellspacing="0" cellpadding="0" bgcolor="#3d5ca3" align="center"> 
			<tr style="border-collapse:collapse;"> 
			<td style="Margin:0;padding-top:5px;padding-bottom:10px;padding-left:20px;padding-right:20px;background-color:#06118B;" bgcolor="#06118b" align="left"> 
			<!--[if mso]><table dir="rtl" width="558" cellpadding="0" 
			cellspacing="0"><tr><td dir="ltr" width="268" valign="top"><![endif]--> 
			<table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right;"> 
			<tr style="border-collapse:collapse;"> 
			<td class="es-m-p20b" width="270" align="left" style="padding:0;Margin:0;"> 
			<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr class="es-mobile-hidden" style="border-collapse:collapse;"> 
			<td align="left" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:21px;color:#333333;"><br></p></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table> 
			<!--[if mso]></td><td dir="ltr" width="20"></td><td dir="ltr" width="270" valign="top"><![endif]--> 
			<table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
			<tr style="border-collapse:collapse;"> 
			<td width="268" align="left" style="padding:0;Margin:0;"> 
			<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0px;"><a href="https://etesla.mx" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;text-decoration:none;color:#1376C8;"><img src="https://i.imgur.com/EDtLfDb.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" width="140"></a></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table> 
			<!--[if mso]></td></tr></table><![endif]--></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table> 
			<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
			<tr style="border-collapse:collapse;"> 
			<td style="padding:0;Margin:0;background-color:#FAFAFA;" bgcolor="#fafafa" align="center"> 
			<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;border-left:1px solid #000000;border-right:1px solid #000000;border-bottom:1px solid #000000;" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"> 
			<tr style="border-collapse:collapse;"> 
			<td style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:40px;background-color:transparent;background-image:url(https://eqnwdo.stripocdn.email/content/guids/CABINET_52faefb719f723664dcd3d0515c76781/images/64211587485934694.png);background-repeat:no-repeat;background-position:left top;" bgcolor="transparent" align="left" background="https://eqnwdo.stripocdn.email/content/guids/CABINET_52faefb719f723664dcd3d0515c76781/images/64211587485934694.png"> 
			<table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td width="558" valign="top" align="center" style="padding:0;Margin:0;"> 
			<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="padding:0;Margin:0;padding-left:40px;padding-right:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;">&nbsp;<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br></p></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px;"><h1 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#333333;"><strong style="background-color:transparent;">¡Hola&nbsp;${datas.vNombrePersona}!</strong></h1></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="padding:0;Margin:0;padding-left:40px;padding-right:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;"><br></p></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="padding:0;Margin:0;padding-right:35px;padding-left:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;">Nos complace tenerte con nosotros.<br>Por favor, da click en el siguiente botón&nbsp;para<br>confirmar tu dirección de correo electrónico.</p></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-bottom:25px;padding-top:35px;"><span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#3D5CA3;background:#FFFFFF;border-width:2px;display:inline-block;border-radius:10px;width:auto;"><a href="${url}" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;color:#3D5CA3;border-style:solid;border-color:#FFFFFF;border-width:15px 20px;display:inline-block;background:#FFFFFF;border-radius:10px;font-weight:bold;font-style:normal;line-height:17px;width:auto;text-align:center;">Confirmar correo</a></span></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="padding:0;Margin:0;padding-top:25px;padding-left:40px;padding-right:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;"><em>Asegúrese de guardar sus credenciales en un lugar seguro<br>y no las comparta con nadie para evitar que<br>alguien más ingrese a su cuenta.</em><br><br></p></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td style="padding:0;Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;background-color:#69CD39;" align="left" bgcolor="#69cd39"> 
			<!--[if mso]><table   width="578" cellpadding="0" cellspacing="0"><tr><td width="233" valign="top"><![endif]--> 
			<table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
			<tr style="border-collapse:collapse;"> 
			<td width="233" align="left" style="padding:0;Margin:0;"> 
			<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td align="right" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:15px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#FFFFFF;"><strong>Siguenos:</strong></p></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table> 
			<!--[if mso]></td><td width="20"></td><td width="325" valign="top"><![endif]--> 
			<table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right;"> 
			<tr style="border-collapse:collapse;"> 
			<td width="325" align="left" style="padding:0;Margin:0;"> 
			<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-top:10px;font-size:0px;background-color:transparent;" bgcolor="transparent"> 
			<table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px;"><a target="_blank" href="https://www.facebook.com/eteslasolar/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/facebook-circle-colored.png" alt="Fb" title="Facebook" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
			<td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px;"><a target="_blank" href="https://twitter.com/eteslasolar" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/twitter-circle-colored.png" alt="Tw" title="Twitter" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
			<td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px;"><a target="_blank" href="https://www.youtube.com/channel/UCa2zUycCrOrL1ex0oGUKeRQ" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/youtube-circle-colored.png" alt="Yt" title="Youtube" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
			<td valign="top" align="center" style="padding:0;Margin:0;"><a target="_blank" href="https://www.linkedin.com/company/etesla/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/linkedin-circle-colored.png" alt="In" title="Linkedin" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table> 
			<!--[if mso]></td></tr></table><![endif]--></td> 
			</tr> 
			<tr style="border-collapse:collapse;"> 
			<td style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#69CD39;" align="left" bgcolor="#6aa84f"> 
			<table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td width="558" valign="top" align="center" style="padding:0;Margin:0;"> 
			<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
			<tr style="border-collapse:collapse;"> 
			<td align="center" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:21px;color:#FFFFFF;">Contactanos: <a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;text-decoration:none;color:#FFFFFF;" href="tel:(229)6884430">(229) 688 44 30</a> | <a target="_blank" href="mailto:contacto@etesla.mx" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;text-decoration:none;color:#FFFFFF;">contacto@etesla.mx</a></p></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table></td> 
			</tr> 
			</table> 
			</div>  
			</body>
			</html>`
		};

		oEmail.enviarCorreo(email);

		return result.message;
	} else {
		throw new Error(validate.message);
	}
}

module.exports.eliminar = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		idPersona: request.id,
		deleted_at: fecha
	};

	result = await usuario.eliminar(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / USUARIO.' + result.message });

		throw new Error('Error al eliminar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'ELIMINAR / USUARIO.' + '1 fila eliminada.' });

	return result.message;
}

module.exports.editar = async function (request, response) {
	let validate = await validations.usuarioValidationEdit(request);

	if (validate.status == true) {
		let now = moment().tz("America/Mexico_City").format();
		let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

		const datas = {
			idPersona: request.idPersona,
			vContrasenia: request.contrasenia,
	        	vOficina: request.oficina,
	        	vNombrePersona: request.nombrePersona,
	        	vPrimerApellido: request.primerApellido,
	        	vSegundoApellido: request.segundoApellido,
			updated_at: fecha
	     };

		result = await usuario.editar(datas);

		if(result.status !== true) {
			await log.generateLog({ tipo: 'Error', contenido: 'EDITAR / USUARIO.' + result.message });

			throw new Error('Error al editar los datos.');
		}

		await log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / USUARIO.' + '1 fila editada.' });

		const payload = {
			idUsuario: result.message[0].idUsuario,
			rol: result.message[0].siRol,
			tipoUsuario: result.message[0].ttTipoUsuario,
			contrasenia: result.message[0].vContrasenia,
			oficina: result.message[0].vOficina,
			idPersona: result.message[0].idPersona,
			nombrePersona: result.message[0].vNombrePersona,
			primerApellido: result.message[0].vPrimerApellido,
			segundoApellido: result.message[0].vSegundoApellido,
			telefono: result.message[0].vTelefono,
			celular: result.message[0].vCelular,
			email: result.message[0].vEmail,
			created_at: result.message[0].created_at,
			updated_at: result.message[0].updated_at
		};

		return new Promise((resolve, reject) => {
			jwt.sign(payload, secret, { expiresIn: 36000 }, (error, token) => {
				if (error) {
					reject('Error en la genereación del token.' +error);
				} else {
					resolve(token);
				}
			});
		});
	} else {
		throw new Error(validate.message);
	}
}

module.exports.consultar = async function (response) {
	const result = await usuario.consultar();

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / USUARIOS.' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / USUARIOS.' + result.message.length + ' filas consultadas.' });

	return result.message;
}

module.exports.consultarId = async function (request, response) {
	const datas = {
		idPersona: request.id
	};

	result = await usuario.consultarId(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA / USUARIO POR ID.' + result.message });

		throw new Error('Error al consultar los datos.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'BUSQUEDA / USUARIO POR ID.' + result.message.length + ' filas consultadas.' });

	result.message[0].vContrasenia = String.fromCharCode.apply(null, result.message[0].vContrasenia);

	return result.message;
}

module.exports.validar = async function (request, response) {
	const datas = {
		vContrasenia: request.contrasenia,
		vEmail: request.email
	};

	result = await usuario.validar(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'VALIDAR / USUARIOS.' + result.message });

		throw new Error('Error al validar los datos del usuario.');
	}

	if(result.message.propertyIsEnumerable(0) !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'VALIDAR / USUARIOS. ' + 'Las credenciales proporcionadas por el usuario no coinciden con los registros de la base de datos.' });

		throw new Error('Las credenciales proporcionadas son incorrectas.');
	}

	if (result.message[0].vTelefono != null || result.message[0].vTelefono == 666) {
		const nombrecompleto = result.message[0].vNombrePersona +' '+ result.message[0].vPrimerApellido +' '+ result.message[0].vSegundoApellido;
		await log.generateLog({ tipo: 'Evento', contenido: 'VALIDAR / USUARIOS. ' + 'El usuario ' + nombrecompleto + ', intentó iniciar sesión sin haber verificado su correo electrónico.' });

		throw new Error('Debe verificar su correo electrónico para iniciar sesión.');
	}

	const payload = {
		idUsuario: result.message[0].idUsuario,
		rol: result.message[0].siRol,
		tipoUsuario: result.message[0].ttTipoUsuario,
		contrasenia: result.message[0].vContrasenia,
		oficina: result.message[0].vOficina,
		idPersona: result.message[0].idPersona,
		nombrePersona: result.message[0].vNombrePersona,
		primerApellido: result.message[0].vPrimerApellido,
		segundoApellido: result.message[0].vSegundoApellido,
		telefono: result.message[0].vTelefono,
		celular: result.message[0].vCelular,
		email: result.message[0].vEmail,
		created_at: result.message[0].created_at,
		updated_at: result.message[0].updated_at
	};

	return new Promise((resolve, reject) => {
		jwt.sign(payload, secret, { expiresIn: 36000 }, (error, token) => {
			if (error) {
				reject('Error en la genereación del token.' +error)
			} else {
				resolve(token);
			}
		});
	});
}

module.exports.verificarEmail = async function (request, response) {
	const datas = { vEmail: request.email.toLowerCase() };
	result = await usuario.verificarEmail(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'VERIFICAR / EMAIL.' + result.message });

		throw new Error('Error al verificar el email: ' + request.email);
	}
	await log.generateLog({ tipo: 'Evento', contenido: 'VERIFICAR / EMAIL.' + 'Se verificó con éxito el email: ' + request.email });

	return result.message;
}

module.exports.recuperarPassword = async function (request, response) {
	const datas = { vEmail: request.email.toLowerCase() };
	result = await usuario.recuperarPassword(datas);

	if(result.status !== true) {
		await log.generateLog({ tipo: 'Error', contenido: 'RECUPERAR CONTRASEÑA. ' + result.message });

		throw new Error('Error al recuperar la contraseña.');
	}

	if(result.message.propertyIsEnumerable(0) !== true || result.message.length == 0) {
		await log.generateLog({ tipo: 'Error', contenido: 'RECUPERAR CONTRASEÑA. ' + 'No existe ningún usuario registrado con el correo: ' + datas.vEmail + ' en la base de datos.' });

		throw new Error('No existe ningún usuario registrado con ese correo, verifiquelo e intente de nuevo.');
	}

	await log.generateLog({ tipo: 'Evento', contenido: 'RECUPERAR CONTRASEÑA.' + 'Se recuperó con éxito la contraseña.' });
	
	const contrasenia = String.fromCharCode.apply(null, result.message[0].vContrasenia);
	const oEmail = new mailer();

	let email = {
		from: 'Depto. de sistemas Etesla',
		to: datas.vEmail,
		subject: "Recuperación de contraseña",
		html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
		<head> 
		<meta charset="UTF-8"> 
		<meta content="width=device-width, initial-scale=1" name="viewport"> 
		<meta name="x-apple-disable-message-reformatting"> 
		<meta http-equiv="X-UA-Compatible" content="IE=edge"> 
		<meta content="telephone=no" name="format-detection"> 
		<title>Recuperar_contrasenia</title> 
		<!--[if (mso 16)]>
		<style type="text/css">
		a {text-decoration: none;}
		</style>
		<![endif]--> 
		<!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
		<style type="text/css">
		@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:20px!important; text-align:center; line-height:120%!important } h2 { font-size:16px!important; text-align:left; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:20px!important } h2 a { font-size:16px!important; text-align:left } h3 a { font-size:20px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:10px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { font-size:14px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
		#outlook a {
			padding:0;
		}
		.ExternalClass {
			width:100%;
		}
		.ExternalClass,
		.ExternalClass p,
		.ExternalClass span,
		.ExternalClass font,
		.ExternalClass td,
		.ExternalClass div {
			line-height:100%;
		}
		.es-button {
			mso-style-priority:100!important;
			text-decoration:none!important;
		}
		a[x-apple-data-detectors] {
			color:inherit!important;
			text-decoration:none!important;
			font-size:inherit!important;
			font-family:inherit!important;
			font-weight:inherit!important;
			line-height:inherit!important;
		}
		.es-desk-hidden {
			display:none;
			float:left;
			overflow:hidden;
			width:0;
			max-height:0;
			line-height:0;
			mso-hide:all;
		}
		.es-button-border:hover a.es-button {
			background:#ffffff!important;
			border-color:#ffffff!important;
		}
		.es-button-border:hover {
			background:#ffffff!important;
			border-style:solid solid solid solid!important;
			border-color:#3d5ca3 #3d5ca3 #3d5ca3 #3d5ca3!important;
		}
		td .es-button-border:hover a.es-button-1 {
			background:#3d5ca3!important;
			border-color:#3d5ca3!important;
			color:#ffffff!important;
		}
		td .es-button-border-2:hover {
			background:#3d5ca3!important;
		}
		</style> 
		</head> 
		<body style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"> 
		<div class="es-wrapper-color" style="background-color:#FAFAFA;"> 
		<!--[if gte mso 9]>
		<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
		<v:fill type="tile" color="#fafafa"></v:fill>
		</v:background>
		<![endif]--> 
		<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;"> 
		<tr style="border-collapse:collapse;"> 
		<td valign="top" style="padding:0;Margin:0;"> 
		<table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;"> 
		<tr style="border-collapse:collapse;"> 
		<td class="es-adaptive" align="center" style="padding:0;Margin:0;"> 
		<table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#3D5CA3;border-left:1px solid #000000;border-right:1px solid #000000;border-top:1px solid #000000;" width="600" cellspacing="0" cellpadding="0" bgcolor="#3d5ca3" align="center"> 
		<tr style="border-collapse:collapse;"> 
		<td style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#06118B;" bgcolor="#06118b" align="left"> 
		<!--[if mso]><table width="558" cellpadding="0" 
		cellspacing="0"><tr><td width="268" valign="top"><![endif]--> 
		<table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
		<tr style="border-collapse:collapse;"> 
		<td class="es-m-p20b" width="268" align="left" style="padding:0;Margin:0;"> 
		<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr style="border-collapse:collapse;"> 
		<td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0px;"><a href="https://etesla.mx" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;text-decoration:none;color:#1376C8;"><img src="https://i.imgur.com/EDtLfDb.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" width="160"></a></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table> 
		<!--[if mso]></td><td width="20"></td><td width="270" valign="top"><![endif]--> 
		<table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right;"> 
		<tr style="border-collapse:collapse;"> 
		<td width="270" align="left" style="padding:0;Margin:0;"> 
		<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr class="es-mobile-hidden" style="border-collapse:collapse;"> 
		<td align="left" class="es-m-txt-c" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:21px;color:#333333;"><br></p></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table> 
		<!--[if mso]></td></tr></table><![endif]--></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table> 
		<table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
		<tr style="border-collapse:collapse;"> 
		<td style="padding:0;Margin:0;background-color:#FAFAFA;" bgcolor="#fafafa" align="center"> 
		<table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;border-left:1px solid #000000;border-right:1px solid #000000;border-bottom:1px solid #000000;" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"> 
		<tr style="border-collapse:collapse;"> 
		<td style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:40px;background-color:transparent;background-position:left top;" bgcolor="transparent" align="left"> 
		<table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr style="border-collapse:collapse;"> 
		<td width="558" valign="top" align="center" style="padding:0;Margin:0;"> 
		<table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:left top;" width="100%" cellspacing="0" cellpadding="0" role="presentation"> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0;"><img src="https://eqnwdo.stripocdn.email/content/guids/CABINET_dd354a98a803b60e2f0411e893c82f56/images/23891556799905703.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" width="175"></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px;"><h1 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#333333;"><strong style="background-color:transparent;">¿Olvidó su contraseña?</strong></h1></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="padding:0;Margin:0;padding-left:40px;padding-right:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;"><br></p></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="padding:0;Margin:0;padding-right:35px;padding-left:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;">Recibimos una petición para recuperar sus <br>credenciales mediante este correo.<br>Su contraseña es la siguiente:<br></p></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="padding:0;Margin:0;padding-top:25px;padding-left:40px;padding-right:40px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;"><b>${contrasenia}</b></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;"><br>Si usted no solicitó este dato, favor de ignorar el correo.<br><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666;"><em>Asegúrese de guardar su contraseña en un lugar seguro <br>y no la comparta con nadie para evitar que <br>alguien más ingrese a su cuenta.</em></p></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:40px;padding-bottom:40px;"><span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#3D5CA3;background:#FFFFFF;border-width:2px;display:inline-block;border-radius:10px;width:auto;"><a href="http://127.0.0.1:8000" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#3D5CA3;border-style:solid;border-color:#FFFFFF;border-width:15px 20px 15px 20px;display:inline-block;background:#FFFFFF;border-radius:10px;font-weight:bold;font-style:normal;line-height:17px;width:auto;text-align:center;">Iniciar sesión</a></span></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td style="padding:0;Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;background-color:#69CD39;" align="left" bgcolor="#69cd39"> 
		<!--[if mso]><table width="578" cellpadding="0" cellspacing="0"><tr><td width="233" valign="top"><![endif]--> 
		<table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
		<tr style="border-collapse:collapse;"> 
		<td width="233" align="left" style="padding:0;Margin:0;"> 
		<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr style="border-collapse:collapse;"> 
		<td align="right" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:15px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#FFFFFF;"><strong>Siguenos:</strong></p></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table> 
		<!--[if mso]></td><td width="20"></td><td width="325" valign="top"><![endif]--> 
		<table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right;"> 
		<tr style="border-collapse:collapse;"> 
		<td width="325" align="left" style="padding:0;Margin:0;"> 
		<table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:center center;" width="100%" cellspacing="0" cellpadding="0" role="presentation"> 
		<tr style="border-collapse:collapse;"> 
		<td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-top:10px;font-size:0px;background-color:transparent;" bgcolor="transparent"> 
		<table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr style="border-collapse:collapse;"> 
		<td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px;"><a target="_blank" href="https://www.facebook.com/eteslasolar/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/facebook-circle-colored.png" alt="Fb" title="Facebook" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
		<td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px;"><a target="_blank" href="https://twitter.com/eteslasolar" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/twitter-circle-colored.png" alt="Tw" title="Twitter" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
		<td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px;"><a target="_blank" href="https://www.youtube.com/channel/UCa2zUycCrOrL1ex0oGUKeRQ" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/youtube-circle-colored.png" alt="Yt" title="Youtube" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
		<td valign="top" align="center" style="padding:0;Margin:0;"><a target="_blank" href="https://www.linkedin.com/company/etesla/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;text-decoration:none;color:#0B5394;"><img src="https://eqnwdo.stripocdn.email/content/assets/img/social-icons/circle-colored/linkedin-circle-colored.png" alt="In" title="Linkedin" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></a></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table> 
		<!--[if mso]></td></tr></table><![endif]--></td> 
		</tr> 
		<tr style="border-collapse:collapse;"> 
		<td style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#69CD39;" align="left" bgcolor="#6aa84f"> 
		<table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr style="border-collapse:collapse;"> 
		<td width="558" valign="top" align="center" style="padding:0;Margin:0;"> 
		<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
		<tr style="border-collapse:collapse;"> 
		<td align="center" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:21px;color:#FFFFFF;">Contactanos: <a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;text-decoration:none;color:#FFFFFF;" href="tel:(229)6884430">(229) 688 44 30</a> | <a target="_blank" href="mailto:contacto@etesla.mx" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:14px;text-decoration:none;color:#FFFFFF;">contacto@etesla.mx</a></p></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table></td> 
		</tr> 
		</table> 
		</div>  
		</body>
		</html>`
	};

	oEmail.enviarCorreo(email);

	return 'Se ha enviado su contraseña a su correo electrónico.';
}
