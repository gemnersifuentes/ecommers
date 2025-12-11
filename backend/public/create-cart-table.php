<?php
// Script para crear la tabla carrito con referencias correctas
require_once __DIR__ . '/../config/conexion.php';

try {
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        echo "✗ Error: No se pudo conectar a la base de datos\n";
        exit(1);
    }
    
    echo "→ Conectado a la base de datos: db_tienda_redhard\n";
    echo "→ Creando tabla 'carrito' con referencias correctas...\n\n";
    
    // SQL para crear la tabla carrito con el nombre correcto de la tabla de variantes
    $sql = "CREATE TABLE IF NOT EXISTS `carrito` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `variante_id` INT NULL,
  `cantidad` INT NOT NULL DEFAULT 1,
  `fecha_agregado` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variante_id`) REFERENCES `producto_variantes`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_carrito_usuario_producto_variante` (`usuario_id`, `producto_id`, `variante_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $pdo->exec($sql);
    
    echo "✓ Tabla 'carrito' creada exitosamente\n\n";
    
    // Verificar que se creó
    $stmt = $pdo->query("SHOW TABLES LIKE 'carrito'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Tabla 'carrito' verificada ✓\n\n";
        
        // Mostrar estructura
        $stmt = $pdo->query("DESCRIBE carrito");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Estructura de la tabla 'carrito':\n";
        echo str_repeat("=", 75) . "\n";
        printf("%-20s %-25s %-10s %-15s\n", 'Campo', 'Tipo', 'Nulo', 'Extra');
        echo str_repeat("-", 75) . "\n";
        foreach ($columns as $col) {
            printf("%-20s %-25s %-10s %-15s\n", 
                $col['Field'], 
                $col['Type'],
                $col['Null'],
                $col['Extra']
            );
        }
        echo str_repeat("=", 75) . "\n\n";
        
        echo "✓ ¡Carrito persistente configurado!\n";
        echo "→ Los carritos ahora se guardarán en la BD para usuarios autenticados\n";
        echo "→ Los carritos se guardarán en localStorage para visitantes\n\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Error al crear la tabla: " . $e->getMessage() . "\n";
    
    if (stripos($e->getMessage(), 'already exists') !== false) {
        echo "\n→ La tabla 'carrito' ya existe en la base de datos\n";
        exit(0);
    }
    
    exit(1);
}
?>
