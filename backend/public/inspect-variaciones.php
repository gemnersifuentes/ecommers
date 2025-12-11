<?php
require_once __DIR__ . '/../config/conexion.php';
$db = (new Database())->getConnection();
$stmt = $db->query("DESCRIBE variaciones");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
