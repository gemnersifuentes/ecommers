<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conectado a db_tienda_redhard\n\n";
    
    // Eliminar tabla si existe (para empezar limpio)
    echo "Eliminando tabla carrito si existe...\n";
    $pdo->exec("DROP TABLE IF EXISTS carrito");
    echo "✓ Tabla eliminada (si existía)\n\n";
    
    // Crear tabla carrito
    echo "Creando tabla carrito...\n";
    $sql = "CREATE TABLE carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        producto_id INT NOT NULL,
        variante_id INT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_usuario (usuario_id),
        INDEX idx_producto (producto_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (variante_id) REFERENCES producto_variantes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "✓ Tabla carrito creada exitosamente\n\n";
    
    // Verificar que se creó
    echo "Verificando estructura de la tabla:\n";
    $stmt = $pdo->query("DESCRIBE carrito");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        printf("%-20s %-20s %-10s %-10s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key']
        );
    }
    
    echo "\n✓ TODO LISTO - La tabla carrito está creada y lista para usar\n";
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "\nDetalles del error:\n";
    echo "Código: " . $e->getCode() . "\n";
}
