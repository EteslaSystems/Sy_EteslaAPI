const InversorController = require('../Controller/inversor.controller');
const Log = require('../../config/logConfig');
const Validations = require('../Middleware/inversorMiddleware');

class InversorBL{
	//Instancia
	inversorController = new InversorController();

	async insertar(request){
		try{
			// let validate = await Validations.inversorValidation(request);

			let validate = { status: true };

			if (validate.status == true) {
				const datas = {
					vNombreMaterialFot: request.nombrematerial || null,
					vMarca: request.marca || null,
					fPotencia: request.potencia != null ? parseFloat(request.potencia) : null,
					fPrecio: request.precio != null ? parseFloat(request.precio) : null,
					vGarantia: request.garantia || null,
					vOrigen: request.origen || null,
					fISC: request.isc != null ? parseFloat(request.isc) : null,
					iVMIN: request.ivmin != null ? parseInt(request.ivmin) : null,
					iVMAX: request.ivmax != null ? parseInt(request.ivmax) : null,
					iPMAX: request.ipmax != null ? parseInt(request.ipmax) : null,
					iPMIN: request.ipmin != null ? parseInt(request.ipmin) : null,
					vTipoInversor: request.vTipoInversor || null,
					vInversor1: request.microInversor1 || null,
					vInversor2: request.microInversor2 || null,
					imgRuta: request.imgRuta || null,
					iPanelSoportados: request.panelesSoportados != null ? parseInt(request.panelesSoportados) : null
				};

				let result = await inversorController.insertar(datas);

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
			await Log.generateLog({ tipo: 'Error', contenido: 'INSERTAR / INVERSORES.' + error.message });
			throw 'Error InversorBL insertar: ' +error;
		}
	}

	async eliminar(request){
		try{
			const datas = { idInversor: request.id };
		
			let result = await inversorController.eliminar(datas);
		
			if(result.status !== true) {
				throw new Error(result.message);
			}
		
			await Log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / INVERSORES. ' + '1 fila eliminada.' });
		
			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'ELIMINAR / INVERSORES. ' + error.message });
			throw 'Error InversorBL eliminar(): '+error;
		}
	}

	async editar(request){
		try{
			let validate = await validations.inversorValidation(request);

			if (validate.status == true) {
				const datas = {
					idInversor: request.id,
					vNombreMaterialFot: request.nombrematerial,
					vMarca: request.marca,
					fPotencia: parseFloat(request.potencia),
					fPrecio: parseFloat(request.precio),
					vTipoMoneda: request.moneda,
					vGarantia: request.garantia,
					vOrige: request.origen,
					fISC: parseFloat(request.isc),
					iVMIN: parseInt(request.ivmin),
					iVMAX: parseInt(request.ivmax),
					iPMAX: parseInt(request.ipmax),
					iPMIN: parseInt(request.ipmin)
				};

				let result = await inversorController.editar(datas);

				if(result.status !== true){
					throw new Error(result.message);
				}

				await Log.generateLog({ tipo: 'Evento', contenido: 'EDITAR / INVERSORES. ' + '1 fila editada.' });

				return result.message;
			} 
			else{
				throw new Error(validate.message);
			}
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'EDITAR / INVERSORES. ' + result.message });
			throw 'Error InversorBL editar(): '+error;
		}
	}

	async consultar(){
		try{
			const result = await inversorController.consultar();

			if(result.status !== true){
				throw new Error(result.message);
			}

			await Log.generateLog({ tipo: 'Evento', contenido: 'CONSULTA / INVERSORES. ' + result.message.length + ' filas consultadas.' });

			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'CONSULTA / INVERSORES.' + result.message });
			throw 'Error InverrsorBL consultar(): '+error;
		}
	}

	async buscar(request){
		try{
			const datas = { idInversor: request.id };

			let result = await inversorController.buscar(datas);
		
			if(result.status !== true){
				throw new Error(result.message);
			}
		
			await Log.generateLog({ tipo: 'Evento', contenido: 'BUSQUEDA / INVERSORES. ' + result.message.length + ' filas consultadas.' });
		
			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA / INVERSORES. ' + result.message });
			throw 'Error InversorBL buscar(): ' +error;
		}
	}

	async obtenerEquiposTipo(request){
		try{
			const datas = { vTipoInversor: request.vTipoInversor };

			let result = await inversorController.consultarTipoEquipos(datas);

			if(result.status !== true){
				throw new Error(result.message);
			}

			await Log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA[vTipoInversor] / INVERSORES. ' + result.message.length + ' filas consultadas.' });

			return result.message;
		}
		catch(error){
			await Log.generateLog({ tipo: 'Error', contenido: 'BUSQUEDA[vTipoInversor] / INVERSORES. ' + result.message });
			throw 'Error InversorBL obtenerEquiposTipo(): '+error;
		}
	}
}

module.exports = InversorBL;