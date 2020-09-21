/*
- @description: 		Archivo de reglas, para el acceso a la capa de datos. Validaciones de datos 
- @author: 				Yael Ramirez (@iaelrmz)
- @date: 				19/02/2020
*/

// Instancia a la libreria de validaciones.
const yup = require('yup');

// Variable constante, contendrá los mensajes personalizados para cada tipo de validación creada.
const message = {
	string: ' debe ser una cadena de caracteres.',
	letter: ' debe contener solo caracteres alfabéticos.',
	required: ' es obligatorio.',
	number: ' debe contener solo caracteres numéricos.',
	email: ' debe contener un formato de correo electrónico válido.',
	int: ' debe contener valores enteros.'
}

// Función de validación. Se establecen las reglas que se requieren por campo, utilizando la librería "yup"
function usuarioValidation (data) {
	const schema = yup.object().shape({
		rol: yup
		  .string(message.string)
		  .matches(/^[0-9]+\.?[0-9]*$/, message.number)
		  .required(message.required),
		tipoUsuario: yup
		  .string(message.string)
		  .matches(/^[A-Za-z\s]+$/g, message.letter)
		  .required(message.required),
	  	contrasenia: yup
		  .string(message.string)
		  .required(message.required),
	  	oficina: yup
		  .string(message.string)
		  .matches(/^[A-Za-z\s]+$/g, message.letter)
		  .required(message.required),
	  	nombrePersona: yup
		  .string(message.string)
		  .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, message.letter)
		  .required(message.required),
		primerApellido: yup
		  .string(message.string)
		  .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, message.letter)
		  .required(message.required),
	  	segundoApellido: yup
		  .string(message.string)
		  .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, message.letter)
		  .required(message.required),
	  	email: yup
		  .string(message.string)
		  .matches(/^[a-z0-9_.]+@[a-z0-9]+\.[a-z0-9_.]+$/, message.email)
		  .required(message.required),
  	});

	// Retornamos los resultados mediante una promesa, incluyendo los mensajes o resultados.
	return new Promise((resolve, reject) => {
		yup
		.reach(schema)
		.validate(data)
		.then(function (data) {
			const response = {
				status: true,
				message: data
			}

			resolve(response);
		})
		.catch(function (error) {
			const response = {
				status: false,
				message: error.path + error.message
			}

			resolve(response);
		});
	});
}

//Función de validación para editar un usuario.
function usuarioValidationEdit (data) {
    const schema = yup.object().shape({
        contrasenia: yup
            .string(message.string)
            .required(message.required),
        oficina: yup
            .string(message.string)
            .matches(/^[A-Za-z\s]+$/g, message.letter)
            .required(message.required),
        nombrePersona: yup
            .string(message.string)
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, message.letter)
            .required(message.required),
        primerApellido: yup
            .string(message.string)
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, message.letter)
            .required(message.required),
        segundoApellido: yup
            .string(message.string)
            .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g, message.letter)
            .required(message.required),
    });

    // Retornamos los resultados mediante una promesa, incluyendo los mensajes o resultados.
    return new Promise((resolve, reject) => {
        yup
        .reach(schema)
        .validate(data)
        .then(function (data) {
            const response = {
                status: true,
                message: data
            }

            resolve(response);
        })
        .catch(function (error) {
            const response = {
                status: false,
                message: error.path + error.message
            }

            resolve(response);
        });
    });
}

// Exportamos la función para el uso de la misma en otros archivos.
module.exports = {
	usuarioValidation, usuarioValidationEdit,
};