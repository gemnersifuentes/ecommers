<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Limpiando y creando tabla carrito ===\n\n";
    
    // Desactivar foreign key checks temporalmente
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Eliminar tabla
    $pdo->exec("DROP TABLE IF EXISTS carrito");
    echo "✓ Tabla anterior eliminada\n";
    
    // Crear tabla nueva SIN foreign keys primero
    $sql = "CREATE TABLE carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        producto_id INT NOT NULL,
        variante_id INT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_usuario (usuario_id),
        INDEX idx_producto (producto_id),
        INDEX idx_variante (variante_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "✓ Tabla carrito creada (sin foreign keys)\n";
    
    // Ahora agregar foreign keys
    try {
        $pdo->exec("ALTER TABLE carrito ADD CONSTRAINT fk_carrito_usuario 
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE");
        echo "✓ Foreign key usuario_id agregada\n";
    } catch (Exception $e) {
        echo "⚠ No se pudo agregar FK usuario: " . $e->getMessage() . "\n";
    }
    
    try {
        $pdo->exec("ALTER TABLE carrito ADD CONSTRAINT fk_carrito_producto 
                    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE");
        echo "✓ Foreign key producto_id agregada\n";
    } catch (Exception $e) {
        echo "⚠ No se pudo agregar FK producto: " . $e->getMessage() . "\n";
    }
    
    try {
        $pdo->exec("ALTER TABLE carrito ADD CONSTRAINT fk_carrito_variante 
                    FOREIGN KEY (variante_id) REFERENCES producto_variantes(id) ON DELETE CASCADE");
        echo "✓ Foreign key variante_id agregada\n";
    } catch (Exception $e) {
        echo "⚠ No se pudo agregar FK variante: " . $e->getMessage() . "\n";
    }
    
    // Reactivar foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "\n=== Estructura final ===\n";
    $stmt = $pdo->query("DESCRIBE carrito");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        printf("%-20s %-20s %-10s\n", $row['Field'], $row['Type'], $row['Null']);
    }
    
    echo "\n✅ TABLA CARRITO CREADA EXITOSAMENTE\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
