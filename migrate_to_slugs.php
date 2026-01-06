<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Starting migration to slug-based statuses...\n";

    // 1. Temporary broaden the ENUM to allow both formats during migration
    $db->exec("ALTER TABLE pedidos MODIFY COLUMN estado VARCHAR(50)");

    // 2. Map existing labels to slugs
    $mapping = [
        'Pendiente' => 'pendiente',
        'Pendiente de Verificación' => 'pendiente_verificacion',
        'Pagado' => 'pagado',
        'En Preparación' => 'en_preparacion',
        'Enviado' => 'enviado',
        'Listo para recoger' => 'listo_recoger',
        'Entregado' => 'entregado',
        'Completado' => 'completado',
        'Cancelado' => 'cancelado',
        'Devuelto' => 'devuelto'
    ];

    foreach ($mapping as $label => $slug) {
        $stmt = $db->prepare("UPDATE pedidos SET estado = ? WHERE estado = ?");
        $stmt->execute([$slug, $label]);
        echo "Converted '$label' -> '$slug'\n";
    }

    // 3. Fix truncated or unknown values based on payment method for recently created orders
    echo "Fixing unknown/truncated statuses...\n";
    $db->exec("UPDATE pedidos SET estado = 'pendiente_verificacion' 
              WHERE (estado LIKE 'Pendiente de%' OR estado = '' OR estado IS NULL) 
              AND metodo_pago IN ('yape_manual', 'yape', 'plin', 'transferencia')");
    
    $db->exec("UPDATE pedidos SET estado = 'pagado' 
              WHERE (estado = '' OR estado IS NULL) AND metodo_pago = 'tarjeta'");

    $db->exec("UPDATE pedidos SET estado = 'pendiente' 
              WHERE (estado = '' OR estado IS NULL) OR estado NOT IN ('" . implode("','", array_values($mapping)) . "')");

    // 4. Finalize ENUM with slugs
    $slugs = array_values($mapping);
    $enumList = "'" . implode("','", $slugs) . "'";
    $db->exec("ALTER TABLE pedidos MODIFY COLUMN estado ENUM($enumList) DEFAULT 'pendiente'");

    echo "Success: Migration completed successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
