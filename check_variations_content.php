<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

$stmt = $db->query("SELECT id, atributo FROM variaciones LIMIT 5");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "--- VARIATIONS DATA ---\n";
foreach($rows as $r) {
    echo "ID: " . $r['id'] . " | Atributo: [" . $r['atributo'] . "]\n";
}
?>
