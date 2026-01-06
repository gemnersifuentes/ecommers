<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

try {
    echo "--- PRODUCT IMAGES AUDIT ---\n";
    $stmt = $db->query("SELECT id, nombre, imagen FROM productos LIMIT 10");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
