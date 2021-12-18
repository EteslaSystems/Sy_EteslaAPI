const Usuario = require('./Entities/Usuario');
const Log = require('../../config/logConfig');

class UsuarioController{
	usuario = new Usuario();

	//CRUD
	async insertar(datas){
		const result = await usuario.insertarBD(datas);
		return result;
	}

	async eliminar(datas){
		const result = await usuario.eliminarBD(datas);
		return result;
	}

	async editar(datas){
		const result = await usuario.editarBD(datas);
		return result;
	}

	async consultar(){
		const result = await usuario.consultaBD();
		return result;
	}

	async consultarId(datas){
		const result = await usuario.consultaIdBD(datas);
		return result;
	}

	async validar(datas){
		const result = await usuario.validarBD(datas);
		return result;
	}

	async verificarEmail(datas){
		const result = await usuario.verificarEmailDB(datas);
		return result;
	}

	async recuperarPassword(datas){
		const result = await usuario.recuperarPasswordDB(datas);
		return result;
	}
}

module.exports = UsuarioController;