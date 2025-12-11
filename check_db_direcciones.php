<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Conexión exitosa.\n";
    
    // 1. Verificar si la tabla existe
    $stmt = $db->query("SHOW TABLES LIKE 'direcciones'");
    if ($stmt->rowCount() > 0) {
        echo "Tabla 'direcciones' EXISTE.\n";
        
        // 2. Mostrar columnas
        $stmt = $db->query("DESCRIBE direcciones");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Columnas:\n";
        foreach ($columns as $col) {
            echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
        
        // 3. Intentar SELECT simple
        echo "\nIntentando SELECT simple...\n";
        $stmt = $db->query("SELECT * FROM direcciones LIMIT 1");
        echo "SELECT ejecutado OK.\n";
        
        // 4. Intentar SELECT con ORDER BY (la que falla)
        echo "\nIntentando SELECT con ORDER BY...\n";
        $usuario_id = 1; 
        $stmt = $db->prepare("
            SELECT * FROM direcciones 
            WHERE usuario_id = ? 
            ORDER BY es_predeterminada DESC, fecha_creacion DESC
        ");
        $stmt->execute([$usuario_id]);
        echo "SELECT con ORDER BY ejecutado OK. Filas: " . $stmt->rowCount() . "\n";
        
    } else {
        echo "ERROR: La tabla 'direcciones' NO EXISTE.\n";
    }
    
} catch (Exception $e) {
    echo "ERROR GRAVE: " . $e->getMessage() . "\n";
}
?>
