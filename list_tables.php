<?php
require 'backend/config/conexion.php';
$tablesToDescribe = ['productos', 'producto_variantes', 'detalle_pedido', 'reservaciones_servicios'];
foreach ($tablesToDescribe as $table) {
    echo "--- Table: $table ---\n";
    $stmt = $db->query("DESCRIBE $table");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) echo "{$row['Field']} - {$row['Type']}\n";
    echo "\n";
}
?>
