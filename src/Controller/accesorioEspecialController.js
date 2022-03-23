const mysqlConnection = require('../../config/database');

//@main
module.exports.calcular = async function(Inversor){
    let cantidad = 0;

    try{
        //Obtener el/los [accesorio_especial] del equipo
		let _Accesorios = await this.consultar({ idMicroInversor: Inversor.idInversor });
        _Accesorios = _Accesorios.message;

        //
        if(Array.isArray(_Accesorios)){
            _Accesorios.filter((Accesorio, i) => {
                if(Inversor.vNombreMaterialFot == 'MicroInversor APS DS3D'){
                    switch(Accesorio.vNombre)
                    {
                        case 'AC BUS CABLE 10 AWG':
                            cantidad = Inversor.numeroDeInversores;
                        break;
                        case 'AC END CAP':
                            cantidad = 1;
                        break;
                        default:
                            -1;
                        break;
                    }
                }

                Object.assign(Accesorio,{
                    cantidad: cantidad,
                    costoTotal: cantidad * Accesorio.dPrecio
                });

                //Se corrige el array con el [Accesorio] y sus nuevas propiedades
                _Accesorios[i] = Accesorio;
            });
        }

        return _Accesorios;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

//CRUD
module.exports.consultar = function(data){
    let { idMicroInversor } = data;

    return new Promise((resolve,reject)=>{
        mysqlConnection.query('CALL SP_Accesorio(?, ?, ?, ?, ?, ?)', [3, null, idMicroInversor, null, null, null], (err, rows) => {
            if(!err){
                resolve({ status:200, message: rows[0] });
            }
            else{
                reject({ status: 500, message: err })
            }
        });
    });
}