<?php
require_once __DIR__ . '/config/conexion.php';

try {
    echo "Verificando estructura de usuarios...\n";
    $columns = $db->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('telefono', $columns)) {
        $db->exec("ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) AFTER correo");
        echo "- Columna telefono agregada.\n";
    } else {
        echo "- Columna telefono ya existe.\n";
    }
    
    if (!in_array('direccion', $columns)) {
        $db->exec("ALTER TABLE usuarios ADD COLUMN direccion TEXT AFTER telefono");
        echo "- Columna direccion agregada.\n";
    } else {
        echo "- Columna direccion ya existe.\n";
    }
    
    echo "Estructura de usuarios verificada.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
