<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("SELECT id, destinatario, asunto, estado, reintentos, mensaje_error, fecha_creacion FROM cola_correos LIMIT 10");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($rows)) {
    echo "La tabla cola_correos está vacía.\n";
} else {
    print_r($rows);
}

$stmtCounts = $db->query("SELECT estado, COUNT(*) as total FROM cola_correos GROUP BY estado");
$counts = $stmtCounts->fetchAll(PDO::FETCH_ASSOC);
print_r($counts);
?>
