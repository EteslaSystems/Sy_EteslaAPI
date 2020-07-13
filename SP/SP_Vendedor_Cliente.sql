DELIMITER //
CREATE PROCEDURE SP_Vendedor_Cliente
(
    /* Variables para Vendedor_Cliente */
    IN Opcion INT,
    IN xIdVendedorCliente VARCHAR(255),
    IN xId_Usuario VARCHAR(255),
    IN xId_Cliente VARCHAR(255)
)
BEGIN
    /* Insertar */
    IF (Opcion = 0) THEN
        INSERT INTO vendedor_cliente
        VALUES (UUID(), UNHEX(xId_Usuario), UNHEX(xId_Cliente));
    /* Editar */
    ELSEIF (Opcion = 1) THEN
        UPDATE vendedor_cliente
        SET id_Usuario = UNHEX(xId_Usuario)
        WHERE id_Cliente = UNHEX(xId_Cliente);
    END IF;
END
// DELIMITER ;