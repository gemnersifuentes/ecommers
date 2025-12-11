<?php
require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

$tables = ['usuarios', 'categorias', 'marcas', 'productos', 'variaciones', 'clientes', 'pedidos', 'detalle_pedido', 'servicios', 'reportes'];

echo "<h1>Estado de la Base de Datos</h1>";
echo "<pre>";

foreach ($tables as $table) {
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "Tabla '$table': $count registros\n";
    } catch (PDOException $e) {
        echo "Tabla '$table': ERROR - " . $e->getMessage() . "\n";
    }
}

echo "\n--- Vistas ---\n";
$views = ['vista_productos_completa', 'vista_pedidos_completa', 'vista_productos_con_descuento'];
foreach ($views as $view) {
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM $view");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "Vista '$view': $count registros\n";
    } catch (PDOException $e) {
        echo "Vista '$view': ERROR - " . $e->getMessage() . "\n";
    }
}

echo "</pre>";
?>
