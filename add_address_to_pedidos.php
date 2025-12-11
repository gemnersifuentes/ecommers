<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

$sql = "
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS direccion_envio TEXT NULL,
ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS estado VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS cp VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20) NULL;
";

try {
    $conn->exec($sql);
    echo "Columns added successfully to pedidos table.";
} catch(PDOException $e) {
    echo "Error adding columns: " . $e->getMessage();
}
?>
