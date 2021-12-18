const EstructuraController = require('../Controller/estructura.controller');
const Log = require('../../config/logConfig');

class EstructuraBL{
    //Instancia
	estructuraController = new EstructuraController();

    async insertar(request){
		try{
			// let validate = await Validations.inversorValidation(request);

			let validate = { status: true };

			if (validate.status == true) {
				const datas = {
					vNombreMaterialFot: request.vNombreMaterialFot,
                    vMarca: request.vMarca,
                    fPrecio: request.fPrecio,
                    vGarantia: request.vGarantia,
                    vOrigen: request.vOrigen
				};

				let result = await estructuraController.insertar(datas);

				if(result.status !== true){
					throw new Error(result.message);
				}

				await Log.generateLog({ tipo: 'Evento', contenido: 'INSERTAR / INVERSORES. ' + '1 fila insertada.' });

				return result.message;
			} else {
				throw new Error(validate.message);
			}
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / EstructuraBL.' + error.message });
			throw 'Error EstructuraBL insertar: ' +error;
		}
	}

	async eliminar(request){
		try{
			const datas = { id: request.id };
		
			let result = await estructuraController.eliminar(datas);
		
			if(result.status !== true) {
				throw new Error(result.message);
			}
		
			await Log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / INVERSORES. ' + '1 fila eliminada.' });
		
			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / INVERSORES. ' + error.message });
			throw 'Error EstructuraBL eliminar(): '+error;
		}
	}

	// async editar(request){
	// 	try{
	// 		let validate = await validations.inversorValidation(request);

	// 		if (validate.status == true) {
	// 			const datas = {
					
	// 			};

	// 			let result = await estructuraController.editar(datas);

	// 			if(result.status !== true){
	// 				throw new Error(result.message);
	// 			}

	// 			await Log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / INVERSORES. ' + '1 fila editada.' });

	// 			return result.message;
	// 		} 
	// 		else{
	// 			throw new Error(validate.message);
	// 		}
	// 	}
	// 	catch(error){
	// 		await Log.generateLog({ tipo: 'Error', contenido: 'EDITAR / INVERSORES. ' + result.message });
	// 		throw 'Error InversorBL editar(): '+error;
	// 	}
	// }

	async consultar(){
		try{
			const result = await estructuraController.consultar();

			if(result.status !== true){
				throw new Error(result.message);
			}

			await Log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / EstructuraBL. ' + result.message.length + ' filas consultadas.' });

			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / EstructuraBL.' + result.message });
			throw 'Error EstructuraBL consultar(): '+error;
		}
	}
}

module.exports = EstructuraBL;