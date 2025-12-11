<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conexión exitosa a db_tienda_redhard\n\n";
    
    // Verificar si la tabla carrito existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'carrito'");
    $exists = $stmt->rowCount() > 0;
    
    if ($exists) {
        echo "✓ La tabla 'carrito' YA EXISTE\n\n";
        echo "Estructura actual:\n";
        $stmt = $pdo->query("DESCRIBE carrito");
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            printf("%-20s %-20s %-10s\n", $row['Field'], $row['Type'], $row['Null']);
        }
    } else {
        echo "✗ La tabla 'carrito' NO EXISTE. Creándola...\n\n";
        
        $sql = "CREATE TABLE carrito (
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
        echo "✓ Tabla 'carrito' creada exitosamente\n";
    }
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
