DELIMITER //
CREATE PROCEDURE SP_Persona
(
    IN Opcion INT,
    IN xIdPersona VARCHAR(255),
    IN NombrePersona VARCHAR(50),
    IN PrimerApellido VARCHAR(50),
    IN SegundoApellido VARCHAR(50),
    IN Telefono VARCHAR(13),
    IN Celular VARCHAR(13),
    IN Email VARCHAR(60),
    IN created TIMESTAMP,
    IN updated TIMESTAMP,
    IN deleted TIMESTAMP
)
BEGIN
    /* Insertar nueva Persona y recuperar sus datos al guardarse */
    IF (Opcion = 0) THEN
        INSERT INTO persona
        VALUES (UUID(), NombrePersona, PrimerApellido, SegundoApellido, Telefono, Celular, Email, created, updated, deleted);
        SELECT HEX(idPersona) AS idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, updated_at
        FROM persona
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
    /* Eliminar Persona */
    ELSEIF (Opcion = 1) THEN
        UPDATE persona
        SET deleted_at = deleted
        WHERE idPersona = UNHEX(xIdPersona);
    /* Editar Persona */
    ELSEIF (Opcion = 2) THEN
        UPDATE persona
        SET vNombrePersona = NombrePersona, vPrimerApellido = PrimerApellido, vSegundoApellido = SegundoApellido, vTelefono = Telefono, vCelular = Celular, vEmail = Email, updated_at = updated
        WHERE idPersona = UNHEX(xIdPersona);
    /* Consultar todos los registros de Persona */
    ELSEIF (Opcion = 3) THEN
        SELECT HEX(idPersona) AS idPersona, vNombrePersona, vPrimerApellido, vSegundoApellido, vTelefono, vCelular, vEmail, created_at, updated_at
        FROM persona
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC;
        
    END IF;
END
// DELIMITER ;