<?php
require_once __DIR__ . '/backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if columns exist first to avoid errors
    $columns = $db->query("SHOW COLUMNS FROM gastos_operativos")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('metodo_pago', $columns)) {
        $db->exec("ALTER TABLE gastos_operativos ADD COLUMN metodo_pago VARCHAR(50) DEFAULT 'Efectivo'");
        echo "Added metodo_pago\n";
    }
    if (!in_array('referencia', $columns)) {
        $db->exec("ALTER TABLE gastos_operativos ADD COLUMN referencia VARCHAR(100)");
        echo "Added referencia\n";
    }
    if (!in_array('notas', $columns)) {
        $db->exec("ALTER TABLE gastos_operativos ADD COLUMN notas TEXT");
        echo "Added notas\n";
    }
    if (!in_array('estado', $columns)) {
        $db->exec("ALTER TABLE gastos_operativos ADD COLUMN estado ENUM('Pagado', 'Pendiente') DEFAULT 'Pagado'");
        echo "Added estado\n";
    }
    
    echo "Database updated successfully";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
