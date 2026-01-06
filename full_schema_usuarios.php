<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("DESCRIBE usuarios");
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}
?>
