<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

// 1. Create Direcciones table
$sqlDirecciones = "
CREATE TABLE IF NOT EXISTS direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_contacto VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    referencia VARCHAR(255) NULL,
    departamento VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    cod_postal VARCHAR(20) NULL,
    telefono VARCHAR(20) NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
";

// 2. Add specific columns to Pedidos table (if they don't exist)
// We use ADD COLUMN IF NOT EXISTS logic (MySQL 8.0+) or try/catch for older versions safety
$sqlPedidos = "
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS departamento VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS provincia VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS distrito VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS referencia VARCHAR(255) NULL;
";

try {
    $conn->exec($sqlDirecciones);
    echo "Table 'direcciones' created/verified successfully.\n";
    
    $conn->exec($sqlPedidos);
    echo "Columns added to 'pedidos' table successfully.\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
