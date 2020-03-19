/*
- @description:         Archivo de reglas, para el acceso a la capa de datos. Validaciones de datos 
- @author:              Yael Ramirez Herrerias
- @date:                19/02/2020
*/

// Instancia a la libreria de validaciones.
const yup = require('yup');

// Variable constante, contendrá los mensajes personalizados para cada tipo de validación creada.
const message = {
    string: ' debe ser una cadena de caracteres.',
    letter: ' debe contener solo caracteres alfabéticos.',
    required: ' es obligatorio.',
    number: ' debe contener solo caracteres numéricos.',
    int: ' debe contener valores enteros.'
}

// Función de validación. Se establecen las reglas que se requieren por campo, utilizando la librería "yup"
function clienteValidation (data) {
    const schema = yup.object().shape({
        consumo: yup
            .string(message.string)
            .matches(/^[0-9]+\.?[0-9]*$/, message.number)
            .required(message.required),
        nombrePersona: yup
            .string(message.string)
            .matches(/^[A-Za-z\s]+$/g, message.letter)
            .required(message.required),
        primerApellido: yup
            .string(message.string)
            .matches(/^[A-Za-z\s]+$/g, message.letter)
            .required(message.required),
        segundoApellido: yup
            .string(message.string)
            .matches(/^[A-Za-z\s]+$/g, message.letter)
            .required(message.required),
        telefono: yup
            .string(message.string)
            .matches(/^([0-9])*$/, message.number)
            .required(message.required),
        celular: yup
            .string(message.string)
            .matches(/^([0-9])*$/, message.number)
            .required(message.required),
        email: yup
            .string(message.string)
            .matches(/^[a-z0-9_.]+@[a-z0-9]+\.[a-z0-9_.]+$/, message.email)
            .required(message.required),
        calle: yup
            .string(message.string)
            .required(message.required),
        municipio: yup
            .string(message.string)
            .matches(/^[A-Za-z\s]+$/g, message.letter)
            .required(message.required),
        estado: yup
            .string(message.string)
            .matches(/^[A-Za-z\s]+$/g, message.letter)
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
    clienteValidation,
};