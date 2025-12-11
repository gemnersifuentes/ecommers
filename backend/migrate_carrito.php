<?php
// Suppress warnings for CLI execution
error_reporting(E_ERROR | E_PARSE);

require_once __DIR__ . '/config/conexion.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "Creando tabla carrito...\n";
    
    // Drop existing table if needed (be careful in production!)
    // $pdo->exec("DROP TABLE IF EXISTS carrito");
    
    $sql = "CREATE TABLE IF NOT EXISTS carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        producto_id INT NOT NULL,
        variante_id INT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (variante_id) REFERENCES producto_variantes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cart_item (usuario_id, producto_id, variante_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "✓ Tabla carrito creada exitosamente\n";
    
    // Verificar estructura
    echo "\n=== Estructura de la tabla carrito ===\n";
    $stmt = $pdo->query("DESCRIBE carrito");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-20s %-10s %-10s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key']
        );
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
