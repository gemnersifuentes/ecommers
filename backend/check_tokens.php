<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Verificando tabla tokens ===\n\n";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'tokens'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Tabla 'tokens' existe\n\n";
        echo "Estructura:\n";
        $stmt = $pdo->query("DESCRIBE tokens");
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            printf("%-20s %-20s\n", $row['Field'], $row['Type']);
        }
        
        echo "\n\nTokens activos:\n";
        $stmt = $pdo->query("SELECT id, usuario_id, LEFT(token, 20) as token_preview, expira FROM tokens WHERE expira > NOW() LIMIT 5");
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            printf("ID: %d, Usuario: %d, Token: %s..., Expira: %s\n", 
                $row['id'], $row['usuario_id'], $row['token_preview'], $row['expira']);
        }
    } else {
        echo "✗ Tabla 'tokens' NO EXISTE\n";
        echo "Creando tabla tokens...\n\n";
        
        $sql = "CREATE TABLE tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expira DATETIME NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        
        $pdo->exec($sql);
        echo "✓ Tabla 'tokens' creada\n";
    }
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
