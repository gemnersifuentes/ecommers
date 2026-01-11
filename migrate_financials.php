<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

try {
    echo "Starting migrations...\n";

    // 1. Add precio_compra to productos
    $db->exec("ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(10,2) DEFAULT 0.00 AFTER precio_base");
    echo "Added precio_compra to productos.\n";

    // 2. Add precio_compra to producto_variantes
    $db->exec("ALTER TABLE producto_variantes ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(10,2) AFTER precio");
    echo "Added precio_compra to producto_variantes.\n";

    // 3. Add precio_compra to detalle_pedido
    $db->exec("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(10,2) AFTER variacion_id");
    // Populate with 75% of price as a fallback for old records
    $db->exec("UPDATE detalle_pedido SET precio_compra = precio_regular * 0.75 WHERE precio_compra IS NULL OR precio_compra = 0");
    echo "Added and populated precio_compra in detalle_pedido.\n";

    // 4. Add costo_insumos to reservaciones_servicios
    $db->exec("ALTER TABLE reservaciones_servicios ADD COLUMN IF NOT EXISTS costo_insumos DECIMAL(10,2) DEFAULT 0.00 AFTER costo_final");
    echo "Added costo_insumos to reservaciones_servicios.\n";

    // 5. Create gastos_operativos table
    $db->exec("CREATE TABLE IF NOT EXISTS gastos_operativos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha DATE NOT NULL,
        concepto VARCHAR(255) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        categoria ENUM('Alquiler', 'Servicios', 'Sueldos', 'Marketing', 'Mantenimiento', 'Otros') DEFAULT 'Otros',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Created gastos_operativos table.\n";

    echo "Migrations completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
