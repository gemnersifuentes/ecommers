<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Cleaning up invalid statuses...\n";
    // First, change any empty or clearly invalid status to 'Pendiente' so ALTER doesn't fail
    $db->exec("UPDATE pedidos SET estado = 'Pendiente' WHERE estado = '' OR estado IS NULL");

    echo "Updating pedidos table schema...\n";

    // Define all statuses including the new ones
    $statuses = [
        'Pendiente',
        'Pendiente de Verificación',
        'Pagado',
        'En Preparación',
        'Enviado',
        'Listo para recoger',
        'Entregado',
        'Completado',
        'Cancelado',
        'Devuelto'
    ];

    $enumList = "'" . implode("','", $statuses) . "'";
    $query = "ALTER TABLE pedidos MODIFY COLUMN estado ENUM($enumList) DEFAULT 'Pendiente'";

    $db->exec($query);
    echo "Success: Database schema updated.\n";

    // Now, if any order had "yape_manual", "plin", or "transferencia" but was saved as "Pendiente" or empty, restore it.
    // However, since we might have lost the original intended state if it was rejected, we'll check based on payment method.
    echo "Restoring correct states based on payment methods...\n";
    $queryRestore = "UPDATE pedidos SET estado = 'Pendiente de Verificación' 
                    WHERE metodo_pago IN ('yape_manual', 'yape', 'plin', 'transferencia') 
                    AND (estado = 'Pendiente' OR estado = '' OR estado IS NULL)";
    $rows = $db->exec($queryRestore);
    echo "Updated $rows orders to 'Pendiente de Verificación'.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
