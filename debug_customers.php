<?php
require 'backend/config/conexion.php';
try {
    $stmt = $db->query("SELECT nombre, correo FROM usuarios WHERE rol = 'cliente' AND activo = 1");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Active Customers: " . count($users) . "\n";
    print_r($users);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
