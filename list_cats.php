<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->query("SELECT id, nombre FROM categorias");
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $cat) {
        echo "ID: " . $cat['id'] . " | NAME: " . $cat['nombre'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
