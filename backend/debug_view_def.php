<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $stmt = $db->query("SHOW CREATE VIEW vista_productos_con_descuento");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    print_r($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
