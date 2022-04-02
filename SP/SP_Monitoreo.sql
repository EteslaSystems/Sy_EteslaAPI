DELIMITER //
CREATE PROCEDURE SP_Monitoreo
	IN Opcion INT,
	IN IdMicroInversor VARCHAR(255)
)
BEGIN
    IF (Opcion = 3) THEN
        SELECT mon.idMonitoreo, mon.vNombre, mon.vMarca, mon.fPrecio, mon.cTipoMoneda, mon.crerated_at, mon.deleted_at, mon.updated_at
		FROM monitoreo mon
		INNER JOIN micro_monitoreo mic
		ON mon.idMonitoreo = mic.id_monitoreo
		WHERE mon.deleted_at IS NULL
		AND mic.id_microinversor = UNHEX(IdMicroInversor);
    END IF;
END
// DELIMITER ;