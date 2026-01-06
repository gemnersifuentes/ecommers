<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

// Total
$stmt = $db->query("SELECT COUNT(*) FROM productos");
echo "Total Raw: " . $stmt->fetchColumn() . "\n";

// Active
$stmt = $db->query("SELECT COUNT(*) FROM productos WHERE activo = 1");
echo "Active: " . $stmt->fetchColumn() . "\n";

// Active & Price <= 3000
$stmt = $db->query("SELECT COUNT(*) FROM productos WHERE activo = 1 AND precio_base <= 3000");
echo "Active & <= 3000: " . $stmt->fetchColumn() . "\n";
?>
