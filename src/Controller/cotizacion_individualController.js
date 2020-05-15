/*
- @description: 		Cotizacion del proyecto fotovoltaico 
- @author: 				LH420
- @date: 				20/03/2020
*/
const irradiacion = require('../Controller/irradiacionController');
const paneles = require('../Controller/panelesController');
const inversores = require('../Controller/inversorController');
const viaticos = require('../Controller/opcionesViaticsController');

/*
1.-Filtras el id del panel para poder obtener su precio y multiplicarlo por la cantidad requerida
2.-Filtras el id del inversor para poder obtener su precio y multiplicarlo por la cantidad requerida
3.-Calcular viaticos
    3.1-Se calcula mano de obra
    3.2-Se calcula viaticos en caso de 
*/

async function cotizacionIndividual(data){
    var idPanel = data.idPanel;
    var idInversor = data.idInversor;
    var cantidadPaneles = data.cantidadPaneles;
    var cantidadInversores = data.cantidadInversores;
    var origen_oficina = data.origen;
    var destino_direccionClient = data.destino;

    panel = await paneles.buscar(idPanel);
    panel = panel.message;
    inversor = await inversores.buscar(idInversor);
    inversor = inversor.message;

    precioPanel = parseFloat(panel[0].fPrecio);
    precioInversor = parseFloat(inversor[0].fPrecio);
    precioTotalPaneles = precioPanel * cantidadPaneles;
    precioTotalInversores = precioInversor * cantidadInversores;
    
    console.log('Panel: '+panel[0].vNombreMaterialFot+'\nPrecio paneles: '+precioPanel+'\nPrecio total paneles: '+precioTotalPaneles+'\nInversor: '+inversor[0].vNombreMaterialFot+'\nPrecio inversores: '+precioInversor+'\nPrecio total inversores: '+precioTotalInversores);
    //console.log(panel);
}

module.exports.cotizacion_individual = async function(data){
    const result = await cotizacionIndividual(data);

    //return result;
}