const PanelController = require('../Controller/panel.controller');
const Log = require('../../config/logConfig');
const Validations = require('../Middleware/panelesMiddleware');

class PanelBL{
	//Instancia
	panelController = new PanelController();

	async insertar(request){
		try{
			let validate = await Validations.panelValidation(request);
	
			if (validate.status == true) {
				const datas = {
					vNombreMaterialFot: request.nombrematerial,
					vMarca: request.marca,
					fPotencia: parseFloat(request.potencia),
					fPrecio: parseFloat(request.precio),
					vGarantia: request.garantia,
					vOrigen: request.origen,
					fISC: parseFloat(request.isc),
					fVOC: parseFloat(request.voc),
					fVMP: parseFloat(request.vmp)
				};
		
				let result = await panelController.insertar(datas);
		
				if(result.status !== true) {
					throw new Error(result.message);
				}
		
				await Log.generateLog({ tipo: 'Evento', contenido: 'INSERTAR / PANELES.' + '1 fila insertada.' });
		
				return result.message;
			} 
			else{
				throw new Error(validate.message);
			}
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / PANELES. ' +error });
			throw 'Error PanelBL Insertar: '+error;
		}
	}

	async eliminar(request){
		try{
			const datas = {
				idPanel: request.id,
				deleted_at: fecha
			};
		
			let result = await panelController.eliminar(datas);
		
			if(result.status !== true) {
				throw new Error(result.message);
			}
		
			await Log.generateLog({ tipo: 'Evento', contenido: 'ELIMINAR / PANELES.' + '1 fila eliminada.' });
		
			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / PANELES.' + error });
			throw 'Error PanelBL eliminar: '+error;
		}
	}

	async editar(request){
		try{
			let validate = await Validations.panelValidation(request);

			if (validate.status == true) {
				const datas = {
					idPanel: request.id,
					vNombreMaterialFot: request.nombrematerial,
					vMarca: request.marca,
					fPotencia: parseFloat(request.potencia),
					fPrecio: parseFloat(request.precio),
					vGarantia: request.garantia,
					vOrigen: request.origen,
					fISC: parseFloat(request.isc),
					fVOC: parseFloat(request.voc),
					fVMP: parseFloat(request.vmp)
				};

				let result = await panelController.editar(datas);

				if(result.status !== true) {
					throw new Error(result.message);
				}

				await Log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / PANELES.' + '1 fila editada.' });

				return result.message;
			} 
			else{
				throw new Error(validate.message);
			}
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'EDITAR / PANELES. ' + error });
			throw 'Error PanelBl editar: '+error;
		}
	}

	async consultar(){
		try{
			let result = await panelController.consulta();

			if(result.status !== true) {
				throw new Error(result.message);
			}
		
			await Log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / PANELES.' + result.message.length + ' filas consultadas.' });
		
			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / PANELES.' + error });
			throw 'Error PanelBL consultar: ' + error;
		}
	}

	async buscar(request){
		try{
			const datas = { idPanel: request.id };
		
			let result = await panelController.buscar(datas);
		
			if(result.status !== true) {
				throw new Error(result.message);
			}
		
			await Log.generateLog({ tipo: 'Evento', contenido: 'BUSQUEDA / PANELES. ' + result.message.length + ' filas consultadas.' });
		
			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA / PANELES. ' + error });
			throw 'Error PanelBL buscar: ' + error;
		}
	}
}

module.exports = PanelBL;