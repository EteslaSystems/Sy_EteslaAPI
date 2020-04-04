/*
- @description: 		Funciones para calcular los materiales que no son paneles o inversores, 
                        pero que igual van incluidos en una instalación (estructuras, etc)
- @author: 				LH420
- @date: 				03/04/2020
*/
/*#region Paneles*/
var costoEstructura = 42; //Este dato tiene que ser dinamico y extraido de una tabla de BD (Nota: agregar tabla "otros_materiales" a la Bd)

function getCostPanelsStructures(numberOfPanels){
    structuresCost = numberOfPanels * costoEstructura;
    return structuresCost;
}
/*#endregion*/
/*#region Inversores*/
/*#endregion*/

module.exports.obtenerCostoDeEstructuras = function (numeroDePaneles){
    const result = getCostPanelsStructures(numeroDePaneles);
    return result;
}