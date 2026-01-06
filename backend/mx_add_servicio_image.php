<?php
// Suppress headers from conexion.php for CLI
ob_start();
require_once __DIR__ . '/config/conexion.php';
ob_end_clean();

try {
    // $db is created in conexion.php
    if (!isset($db)) {
        $database = new Database();
        $db = $database->getConnection();
    }

    // Check if column exists
    $stmt = $db->prepare("SHOW COLUMNS FROM servicios LIKE 'imagen'");
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        // Add column
        $sql = "ALTER TABLE servicios ADD COLUMN imagen VARCHAR(255) NULL AFTER descripcion";
        $db->exec($sql);
        echo "Column 'imagen' added successfully to 'servicios' table.\n";
    } else {
        echo "Column 'imagen' already exists.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
