/*
- @description: 		Archivo de creación de formato PDF para la cotización del sistema.
- @author: 				Yael Ramirez Herrerias
- @date: 				01/04/2020
*/

//var pdf = require('html-pdf');
var moment = require('moment-timezone');

module.exports.crear = async function (request, response) {
	let now = moment().tz("America/Mexico_City").format();
	let fecha = now.replace(/T/, ' ').replace(/\..+/, '') ;

	const datas = {
		created_at: fecha,
		no_cotizacion: request.quotation,
		sucursal: request.office,
		asesor: request.adviser,
		cliente: request.name,
		direccion: request.address,
		ubicacion: request.location,
		telefono: request.phone,
		correo: request.email,
		proyecto: request.project,
		gasto_actual: request.current_expense,
		pago_paneles: request.payment_panels,
		bimestral: request.bimonthly,
		anual: request.annual,
		mas_años: request.more_years,
		consumo_actual: request.current_consumption,
		generacion_paneles: request.generation_panels,
		nuevo_consumo: request.new_consumption
	};

	options = {
		// Opciones de tamaño de papel: http://phantomjs.org/api/webpage/property/paper-size.html

		// Opciones para exportar
		"directory": "/tmp", //El directorio en el que el fichero se escribe si no usas .toFile(filename, callback).por defecto es: ‘/tmp’

		// Opciones de tamaño de papel: http://phantomjs.org/api/webpage/property/paper-size.html
		"height": "216mm", // unidades permitidas: mm, cm, in, px
		"width": "279mm", // unidades permitidas: mm, cm, in, px
		// – o bien –
		// "format": "Letter", // unidades permitidas: A3, A4, A5, Legal, Letter, Tabloid
		// "orientation": "portrait", // portrait = vertical o landscape = horizontal

		// Opciones de páginas
		//"border": "0", // por defecto es 0, unidades: mm, cm, in, px
		// – o bien –
		"border": {
			"top": ".5px", // por defecto es 0, unidades: mm, cm, in, px
			"right": "2.5px",
			"bottom": "2.5px",
			"left": "2.5px"
		},

		// Opciones de rendering
		//"base": "file:///xampp/htdocs/Sy_EteslaAPI/PDF",
		"base": "file:///xampp/htdocs/Sy_EteslaAPI/src/PDF/", // Directorio base que se usa para cargar ficheros (imágenes, css, js) cuando no están referenciados usando un servidor

		// Opción de zoom, se puede usar para escalarimágenes si `options.type` no es pdf
		"zoomFactor": "1", // por defecto es 1

		// Opciones de fichero
		"type": "pdf", // Tipos de fichero permitidos: png, jpeg, pdf
	}

	var code = `
		<!DOCTYPE html>
	    <html>
	       <head>
	            <meta charset="utf-8">
	            <title>PDF Result Template</title>
	            <link rel="stylesheet" href="style.css">
	        </head>

	        <body>
                <div class="document-page">
                    <div class="header-pdf">
                        <div class="header-info">
                            <div class="top">
                                <div class="info">
                                    <div class="datas">
                                        <div class="label-datas">
                                            <label>Fecha:</label>
                                        </div>

                                        <div class="input-datas">
                                            <input type="text" value="`+ datas.created_at +`">
                                        </div>
                                    </div>

                                    <div class="datas">
                                        <div class="label-datas">
                                            <label>No. de Cotización:</label>
                                        </div>

                                        <div class="input-datas">
                                            <input type="text" value="`+ datas.no_cotizacion +`">
                                        </div>
                                    </div>

                                    <div class="datas">
                                        <div class="label-datas">
                                            <label>Sucursal:</label>
                                        </div>

                                        <div class="input-datas">
                                            <input type="text" value="`+ datas.sucursal +`">
                                        </div>
                                    </div>

                                    <div class="datas">
                                        <div class="label-datas">
                                            <label>Asesor:</label>
                                        </div>

                                        <div class="input-datas">
                                            <input type="text" value="`+ datas.asesor +`">
                                        </div>
                                    </div>
                                </div>

                                <div class="logo">
                                    <img src="img/etesla.png">
                                </div>
                            </div>

                            <div class="bottom">
                                <div class="bottom-left">
                                    <div class="icons"></div>

                                    <div class="client">
                                        <div class="client-info">
                                            <input type="text" value="`+ datas.cliente +`">
                                        </div>

                                        <div class="client-info">
                                            <input type="text" value="`+ datas.direccion +`">
                                        </div>

                                        <div class="client-info">
                                            <input type="text" value="`+ datas.ubicacion +`">
                                        </div>
                                    </div>
                                </div>

                                <div class="bottom-right">
                                    <div class="icons"></div>

                                    <div class="client">
                                        <div class="client-info">
                                            <input type="text" value="`+ datas.telefono +`">
                                        </div>

                                        <div class="client-info">
                                            <input type="text" value="`+ datas.correo +`">
                                        </div>

                                        <div class="client-info">
                                            <input type="text" value="`+ datas.proyecto +`">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="header-map">
                            <div>

                            </div>
                        </div>
                    </div>

                    <div class="body-pdf">
                        <div class="body-left">
                            <div class="left-margin">
                                <div class="left-content">
                                    <div class="row">
                                        <label>GASTO ACTUAL:</label>
                                    </div>

                                    <div class="row">
                                        <input type="text" value="$`+ datas.gasto_actual +`">
                                    </div>

                                    <div class="row">
                                        <div class="triangle"></div>
                                    </div>

                                    <div class="row">
                                        <div class="colors"></div>
                                    </div>
                                </div>

                                <div class="left-content">
                                    <div class="row">
                                        <label>PAGO CON PANELES:</label>
                                    </div>

                                    <div class="row">
                                        <input type="text" value="$`+ datas.pago_paneles +`">
                                    </div>

                                    <div class="row">
                                        <div class="triangle-1"></div>
                                    </div>

                                    <div class="row">
                                        <div class="colors"></div>
                                    </div>
                                </div>

                                <div class="left-content-an">
                                    <label>* ESTA INFORMACIÓN ES DE CARACTER INFORMATIVO Y <br> REPRESENTA UN VALOR APROXIMADO.</label>
                                </div>
                            </div>
                        </div>

                        <div class="body-right">
                            <div class="right-margin">
                                <h1>AHORRO:</h1>
                                <hr>

                                <div class="right-input">
                                        <div class="input-div">
                                            <div class="div-ll">
                                                <label>BIMESTRAL:</label>
                                            </div>

                                            <div class="div-it">
                                                <input type="text" value="$`+ datas.bimestral +`">
                                            </div>
                                        </div>

                                        <div class="input-div">
                                            <div class="div-ll">
                                                <label>ANUAL:</label>
                                            </div>

                                            <div class="div-it">
                                                <input type="text" value="$`+ datas.anual +`">
                                            </div>
                                        </div>

                                        <div class="input-div">
                                            <div class="div-ll">
                                                <label>25 AÑOS:</label>
                                            </div>

                                            <div class="div-it">
                                                <input type="text" value="$`+ datas.mas_años +`">
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer-pdf">
                        <div class="footer-title">
                            <h1>Ahorro de energía:</h1>
                        </div>

                        <div class="footer-body">
                            <div class="footer-section-1">
                                <div class="section-img">
                                    <div>
                                        <img src="img/icon-1.png">
                                    </div>
                                </div>

                                <div class="section-txt">
                                    <div class="txt">
                                        <label>Consumo Actual Bimestral:</label>
                                    </div>

                                    <div class="txt-1">
                                        <input type="text" value="`+ datas.consumo_actual +` kWh">
                                    </div>
                                </div>
                            </div>

                            <div class="footer-section-2">
                                <div class="section-img">
                                    <div>
                                        <img src="img/icon-2.png">
                                    </div>
                                </div>

                                <div class="section-txt">
                                    <div class="txt">
                                        <label>Generación de Paneles:</label>
                                    </div>

                                    <div class="txt-1">
                                        <input type="text" value="`+ datas.generacion_paneles +` kWh">
                                    </div>
                                </div>
                            </div>

                            <div class="footer-section-3">
                                <div class="section-img">
                                    <div>
                                        <img src="img/icon-3.png">
                                    </div>
                                </div>

                                <div class="section-txt">
                                    <div class="txt">
                                        <label>Nuevo Consumo CFE:</label>
                                    </div>

                                    <div class="txt-1">
                                        <input type="text" value="`+ datas.nuevo_consumo +` kWh">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="page-break-after:always;"></div>

                <div class="document-page-2">
                    <div class="content-logo">
                        <img src="img/etesla.png">
                    </div>

                    <div class="content-top">
                        <div class="top-left">
                            <div class="section-title">
                                <p>(Propuesta Optima Canadian 350 + Abb)</p>
                            </div>

                            <div class="section-subtitle">
                                <p>Propuesta Elite Micro - Inverter</p>
                            </div>

                            <div class="section-img-proposal">
                                <div class="img-proposal-left">
                                    <img src="img/panel.png">
                                </div>

                                <div class="img-proposal-right">
                                    <img src="img/inversor.png">
                                </div>
                            </div>

                            <div class="bottom-left-info">
                                <div class="bottom-left-info-left">
                                    <h4>JA SOLAR de 370w</h4>

                                    <ul>
                                        <li>1. Más alta tecnología</li>
                                        <li>2. 30 años en mercado</li>
                                        <li>3. Panel inteligente</li>
                                        <li>4. Panel Tier 1</li>
                                        <li>5. Top 1-3 mundial</li>
                                    </ul>
                                </div>

                                <div class="bottom-left-info-right">
                                    <h4>Modelo IQ 7+</h4>

                                    <ul>
                                        <li>1. Calidad Americana</li>
                                        <li>2. 10 años de garantía</li>
                                        <li>3. #5 a nivel mundial</li>
                                        <li>4. Monitoreo individual</li>
                                        <li>5. Monitoreo consumo</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="section-price">
                                <div class="price">
                                    <p>Precio sistema</p>
                                </div>

                                <div class="price-total">
                                    <b>$</b> <p>102,280.71</p>
                                </div>
                            </div>
                        </div>

                        <div class="top-right">
                            <div class="section-title-2">
                                <p>(Propuesta Optima Canadian 350 + Abb)</p>
                            </div>

                            <div class="section-subtitle-2">
                                <p>Propuesta Elite Micro - Inverter</p>
                            </div>

                            <div class="section-img-proposal-2">
                                <div class="img-proposal-left-2">
                                    <img src="img/panel.png">
                                </div>

                                <div class="img-proposal-right-2">
                                    <img src="img/inversor-2.png">
                                </div>
                            </div>

                            <div class="bottom-right-info">
                                <div class="bottom-right-info-left">
                                    <h4>JA SOLAR de 370w</h4>

                                    <ul>
                                        <li>1. Más alta tecnología</li>
                                        <li>2. 30 años en mercado</li>
                                        <li>3. Panel inteligente</li>
                                        <li>4. Panel Tier 1</li>
                                        <li>5. Top 1-3 mundial</li>
                                    </ul>
                                </div>

                                <div class="bottom-right-info-right">
                                    <h4>Modelo IQ 7+</h4>

                                    <ul>
                                        <li>1. Calidad Americana</li>
                                        <li>2. 10 años de garantía</li>
                                        <li>3. #5 a nivel mundial</li>
                                        <li>4. Monitoreo individual</li>
                                        <li>5. Monitoreo consumo</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="section-price-2">
                                <div class="price-2">
                                    <p>Precio sistema</p>
                                </div>

                                <div class="price-total-2">
                                    <b>$</b> <p>102,280.71</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="content-bottom">
                        <div class="bottom-left">
                            <div class="section-title-3">
                                <p>(Propuesta Optima Canadian 350 + Abb)</p>
                            </div>

                            <div class="section-subtitle-3">
                                <p>Propuesta Elite Micro - Inverter</p>
                            </div>

                            <div class="section-img-proposal-3">
                                <div class="img-proposal-left-3">
                                    <img src="img/panel.png">
                                </div>

                                <div class="img-proposal-right-3">
                                    <img src="img/inversor.png">
                                </div>
                            </div>

                            <div class="bottom-left-info-3">
                                <div class="bottom-left-info-left-3">
                                    <h4>JA SOLAR de 370w</h4>

                                    <ul>
                                        <li>1. Más alta tecnología</li>
                                        <li>2. 30 años en mercado</li>
                                        <li>3. Panel inteligente</li>
                                        <li>4. Panel Tier 1</li>
                                        <li>5. Top 1-3 mundial</li>
                                    </ul>
                                </div>

                                <div class="bottom-left-info-right-3">
                                    <h4>Modelo IQ 7+</h4>

                                    <ul>
                                        <li>1. Calidad Americana</li>
                                        <li>2. 10 años de garantía</li>
                                        <li>3. #5 a nivel mundial</li>
                                        <li>4. Monitoreo individual</li>
                                        <li>5. Monitoreo consumo</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="section-price-3">
                                <div class="price-3">
                                    <p>Precio sistema</p>
                                </div>

                                <div class="price-total-3">
                                    <b>$</b> <p>102,280.71</p>
                                </div>
                            </div>
                        </div>

                        <div class="bottom-right">
                            <div class="section-title-4">
                                <p>(Propuesta Optima Canadian 350 + Abb)</p>
                            </div>

                            <div class="section-subtitle-4">
                                <p>Propuesta Elite Micro - Inverter</p>
                            </div>

                            <div class="section-img-proposal-4">
                                <div class="img-proposal-left-4">
                                    <img src="img/panel.png">
                                </div>

                                <div class="img-proposal-right-4">
                                    <img src="img/inversor-2.png">
                                </div>
                            </div>

                            <div class="bottom-right-info-2">
                                <div class="bottom-right-info-left-2">
                                    <h4>JA SOLAR de 370w</h4>

                                    <ul>
                                        <li>1. Más alta tecnología</li>
                                        <li>2. 30 años en mercado</li>
                                        <li>3. Panel inteligente</li>
                                        <li>4. Panel Tier 1</li>
                                        <li>5. Top 1-3 mundial</li>
                                    </ul>
                                </div>

                                <div class="bottom-right-info-right-2">
                                    <h4>Modelo IQ 7+</h4>

                                    <ul>
                                        <li>1. Calidad Americana</li>
                                        <li>2. 10 años de garantía</li>
                                        <li>3. #5 a nivel mundial</li>
                                        <li>4. Monitoreo individual</li>
                                        <li>5. Monitoreo consumo</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="section-price-4">
                                <div class="price-4">
                                    <p>Precio sistema</p>
                                </div>

                                <div class="price-total-4">
                                    <b>$</b> <p>102,280.71</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="page-break-after:always;"></div>

                <div class="document-page-3">
                    <div class="content-logo">
                        <img src="img/etesla.png">
                    </div>

                    <div class="table-content-3">
                        <div class="section-3-top">
                            <div class="top-left">
                                <div class="table-top-left">
                                    <table>
                                        <thead>
                                            <tr style="color: #00b050;">
                                                <th colspan="5">¿Como se verán mis consumos de energía en kWh?</th>
                                            </tr>

                                            <tr>
                                                <th style="width: 20%;"></th>
                                                <th style="width: 20%;">Consumo Actual</th>
                                                <th style="width: 20%;">Producción</th>
                                                <th style="width: 20%;">Consumo Nuevo</th>
                                                <th style="width: 20%;"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th>Enero</th>
                                                <td>722.00</td>
                                                <td>395.21</td>
                                                <td>343.26</td>
                                                <td>$ 726.80</td>
                                            </tr>

                                            <tr>
                                                <th>Febrero</th>
                                                <td>722.00</td>
                                                <td>453.16</td>
                                                <td>287.73</td>
                                                <td>$ 546.29</td>
                                            </tr>

                                            <tr>
                                                <th>Marzo</th>
                                                <td>160.50</td>
                                                <td>530.11</td>
                                                <td>-347.52</td>
                                                <td>$ -</td>
                                            </tr>

                                            <tr>
                                                <th>Abril</th>
                                                <td>160.50</td>
                                                <td>566.21</td>
                                                <td>-382.11</td>
                                                <td>$ -</td>
                                            </tr>

                                            <tr>
                                                <th>Mayo</th>
                                                <td>750.50</td>
                                                <td>592.82</td>
                                                <td>182.40</td>
                                                <td>$ 203.93</td>
                                            </tr>

                                            <tr>
                                                <th>Junio</th>
                                                <td>750.50</td>
                                                <td>554.81</td>
                                                <td>218.81</td>
                                                <td>$ 264.31</td>
                                            </tr>

                                            <tr>
                                                <th>Julio</th>
                                                <td>874.00</td>
                                                <td>509.21</td>
                                                <td>386.01</td>
                                                <td>$ 447.01</td>
                                            </tr>

                                            <tr>
                                                <th>Agosto</th>
                                                <td>874.00</td>
                                                <td>511.11</td>
                                                <td>384.19</td>
                                                <td>$ 447.01</td>
                                            </tr>

                                            <tr>
                                                <th>Septiembre</th>
                                                <td>541.00</td>
                                                <td>438.91</td>
                                                <td>120.39</td>
                                                <td>$ 97.33</td>
                                            </tr>

                                            <tr>
                                                <th>Octubre</th>
                                                <td>541.00</td>
                                                <td>418.01</td>
                                                <td>140.41</td>
                                                <td>$ 179.89</td>
                                            </tr>

                                            <tr>
                                                <th>Noviembre</th>
                                                <td>283.00</td>
                                                <td>383.81</td>
                                                <td>-84.81</td>
                                                <td>$ -</td>
                                            </tr>

                                            <tr>
                                                <th>Diciembre</th>
                                                <td>283.00</td>
                                                <td>369.56</td>
                                                <td>-71.15</td>
                                                <td>$ -</td>
                                            </tr>

                                            <tr>
                                                <th>Total anual</th>
                                                <td>6,662.00</td>
                                                <td>5,722.95</td>
                                                <td>1177.62</td>
                                                <td>$ 2,912.56</td>
                                            </tr>

                                            <tr>
                                                <th></th>
                                                <td>kWh</td>
                                                <td>kWh</td>
                                                <td>kWh</td>
                                                <td>$$</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div class="table-top-rigth">
                                    <p>
                                        <b>86%</b> <br><br>
                                        Energía limpia generada <br><br>
                                        Nos da ahorros en MXN de <br><br>
                                        <b>81.61.%</b>
                                    </p>
                                </div>
                            </div>

                            <div class="top-rigth">
                                <!-- SECCIÓN A LLENAR CON UNA GRAQFICA -->
                            </div>
                        </div>

                        <div class="section-3-bottom">
                            <div class="table-details">
                                <div class="section-table-1">
                                    <div class="s1">
                                        <p>Sin paneles solares</p>
                                    </div>

                                    <div class="s2">
                                        <div class="s2-title">
                                            <div class="s2-title-sub1">
                                                <p>Mes</p>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>Consumo kw</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>Facturación sin iva</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>Tarifa</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-1">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Agosto</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Septiembre</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>2084</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 12,898</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-2">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Octubre</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Noviembre</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1878</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 8,639</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-3">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Diciembre</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Enero</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>2378</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 10,939</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-4">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Febrero</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Marzo</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1918</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 8,823</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-5">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Abril</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Mayo</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1656</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 7,618</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-6">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Junio</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Julio</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>2782</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 12,797</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="s3">
                                        <div class="s3-part1">
                                            <p>Pago total anual</p>
                                        </div>

                                        <div class="s3-part2">
                                            <p>$ 77,390</p>
                                        </div>

                                        <div class="s3-part3"></div>
                                    </div>
                                </div>

                                <div class="section-table-2">
                                    <div class="s1">
                                        <p>Con 18 paneles de 330w paneles solares año 1</p>
                                    </div>

                                    <div class="s2">
                                        <div class="s2-title">
                                            <div class="s2-title-sub1">
                                                <p>Mes</p>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>Consumo kw</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>Facturación sin iva</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>Tarifa</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-1">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Agosto</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Septiembre</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1336</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 6,147</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-2">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Octubre</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Noviembre</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>673</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 3,096</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-3">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Diciembre</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Enero</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1346</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 4,671</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>DAC</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-4">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Febrero</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Marzo</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>552</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 889</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-5">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Abril</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Mayo</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>34</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 64</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-6">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Junio</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Julio</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1080</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 1,275</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="s3">
                                        <div class="s3-part1">
                                            <p>Pago total anual</p>
                                        </div>

                                        <div class="s3-part2">
                                            <p style="color: #FFFFFF !important;">$ 16,142</p>
                                        </div>

                                        <div class="s3-part3"></div>
                                    </div>
                                </div>

                                <div class="section-table-3">
                                    <div class="s1">
                                        <p>Con 18 paneles de 330w paneles solares año 1</p>
                                    </div>

                                    <div class="s2">
                                        <div class="s2-title">
                                            <div class="s2-title-sub1">
                                                <p>Mes</p>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>Consumo kw</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>Facturación sin iva</p>
                                            </div>

                                            <div class="s2-title-sub4">
                                                <p>Tarifa</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-1">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Agosto</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Septiembre</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1336</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 1,994</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-2">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Octubre</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Noviembre</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>673</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 1,216</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-3">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Diciembre</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Enero</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1346</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 3,102</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-4">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Febrero</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Marzo</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>552</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 889</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-5">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Abril</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Mayo</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>34</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 64</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>

                                        <div class="s2-content-6">
                                            <div class="s2-title-sub1">
                                                <div class="sub1-p1">
                                                    <p>Junio</p>
                                                </div>

                                                <div class="sub1-p2">
                                                    <p>Julio</p>
                                                </div>
                                            </div>

                                            <div class="s2-title-sub2">
                                                <p>1080</p>
                                            </div>

                                            <div class="s2-title-sub3">
                                                <p>$ 1,275</p>
                                            </div>

                                            <div class="s2-title-sub4" style="background: #00b050 !important;">
                                                <p>1C</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="s3">
                                        <div class="s3-part1">
                                            <p>Pago total anual</p>
                                        </div>

                                        <div class="s3-part2">
                                            <p style="color: #FFFFFF !important;">$ 8,540</p>
                                        </div>

                                        <div class="s3-part3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="page-break-after:always;"></div>

                <div class="document-page-4">
                    <div class="content-logo">
                        <img src="img/etesla.png">
                    </div>

                    <div class="table-content">
                        <table class="table-1">
                            <thead>
                                <tr>
                                    <th class="t1">Pago contado</th>
                                    <th class="t2">$236,193</th>
                                    <th class="t3">Ahorro Mensual de luz</th>
                                    <th class="t4"> $4,194</th>
                                    <th class="t5">Retorno de inversión</th>
                                    <th class="t6">3 años</th>
                                </tr>
                            </thead>
                        </table>

                        <table class="table-2">
                            <thead>
                                <tr>
                                    <th class="t1">Tarjeta de Crédito</th>
                                    <th class="t2">3 meses</th>
                                    <th class="t3">6 meses</th>
                                    <th class="t4">9 meses </th>
                                    <th class="t5">12 meses</th>
                                    <th class="t6">18 meses</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <th class="t1-1">Pago Mensual</th>
                                    <th class="t2-1">$81,094</th>
                                    <th class="t3-1">$41,728</th>
                                    <th class="t4-1">$28,606</th>
                                    <th class="t5-1">$22,045</th>
                                    <th class="t6-1">$15,484</th>
                                </tr>
                            </tbody>
                        </table>

                        <table class="table-3">
                            <thead>
                                <tr>
                                    <th class="t1">Financiamiento</th>
                                    <th class="t2">15%</th>
                                    <th class="t3">35%</th>
                                    <th class="t4">50%</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <th class="t1-1">Enganche</th>
                                    <th class="t2-1">$35,429</th>
                                    <th class="t3-1">$82,668</th>
                                    <th class="t4-1">$118,097</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">Pagos mensuales por plazo</th>
                                    <th class="t2-1">15%</th>
                                    <th class="t3-1">35%</th>
                                    <th class="t4-1">50%</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">A 12 meses</th>
                                    <th class="t2-1">$19,274</th>
                                    <th class="t3-1">$15,046</th>
                                    <th class="t4-1">$11,220</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">A 24 meses</th>
                                    <th class="t2-1">$10,641</th>
                                    <th class="t3-1">$8,291</th>
                                    <th class="t4-1">$6,260</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">A 36 meses</th>
                                    <th class="t2-1">$7,830</th>
                                    <th class="t3-1">$5,988</th>
                                    <th class="t4-1">$4,488</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">A 48 meses</th>
                                    <th class="t2-1">$6,425</th>
                                    <th class="t3-1">$4,913</th>
                                    <th class="t4-2">$3,661</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">A 60 meses</th>
                                    <th class="t2-1">$5,622</th>
                                    <th class="t2-2">$4,299</th>
                                    <th class="t4-2">$3,189</th>
                                </tr>

                                <tr>
                                    <th class="t1-1">A 72 meses</th>
                                    <th class="t2-1">$5,020</th>
                                    <th class="t2-2">$3,839</th>
                                    <th class="t4-2">$2,953</th>
                                </tr>

                                <tr>
                                    <th class="t1-2">A 84 meses</th>
                                    <th class="t2-2">$4,618</th>
                                    <th class="t3-2">$3,532</th>
                                    <th class="t4-3">$2,717</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </body>
	    </html>
	`;

	var cliente_nombre = datas.cliente;
	cliente_nombre = cliente_nombre.replace(/\s/g,"_");

	let name = "Cotización_" + cliente_nombre + ".pdf";

	pdf.create(code, options).toFile(name, function(error, response) {
		if (!error){
			const response = {
				status: false,
				message: "El archivo PDF no se ha creado."
			}

			return response.message;
			console.log(response.message);
		} else {
			const response = {
				status: true,
				message: "El archivo PDF se ha creado con exito."
			}

			return response.message;
			console.log(response.message);
		}
	});
}