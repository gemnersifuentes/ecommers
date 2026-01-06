<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("SELECT * FROM ajustes");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
