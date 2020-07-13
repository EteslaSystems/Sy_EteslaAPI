DELIMITER //
CREATE PROCEDURE SP_Panel
(
	IN Opcion INT,
	IN xIdPanel VARCHAR(255),
	IN NombreMaterialFot VARCHAR(50),
	IN Marca VARCHAR(50),
	IN Potencia FLOAT,
	IN Precio FLOAT,
	IN TipoMoneda VARCHAR(20),
	IN ISC FLOAT,
	IN VOC FLOAT,
	IN VMP FLOAT,
	IN created TIMESTAMP,
	IN updated TIMESTAMP,
	IN deleted TIMESTAMP
)
BEGIN
    /* Insertar nuevo Panel */
    IF (Opcion = 0) THEN
        INSERT INTO panel
        VALUES (UUID(), NombreMaterialFot, Marca, Potencia, Precio, TipoMoneda, ISC, VOC, VMP, created, updated, deleted);
    /* Eliminar Panel */
    ELSEIF (Opcion = 1) THEN
        UPDATE panel
        SET deleted_at = deleted
        WHERE idPanel = UNHEX(xIdPanel);
    /* Editar Panel */
    ELSEIF (Opcion = 2) THEN
        UPDATE panel
        SET vNombreMaterialFot = NombreMaterialFot, vMarca = Marca, fPotencia = Potencia, fPrecio = Precio, vTipoMoneda = TipoMoneda, fISC = ISC, fVOC = VOC, fVMP = VMP, updated_at = updated
        WHERE idPanel = UNHEX(xIdPanel);
    /* Consultar todos los registros de Paneles */
    ELSEIF (Opcion = 3) THEN
        SELECT HEX(idPanel) AS idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, created_at, updated_at
        FROM panel
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC;
    /* Leer - filtrado */
    ELSEIF (Opcion = 4) THEN
        SELECT HEX(idPanel) AS idPanel, vNombreMaterialFot, vMarca, fPotencia, fPrecio, vTipoMoneda, fISC, fVOC, fVMP, created_at, updated_at
        FROM panel
        WHERE deleted_at IS NULL AND idPanel = UNHEX(xIdPanel);
    END IF;
END
// DELIMITER ;