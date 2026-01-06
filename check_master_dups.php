<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- BUSCANDO IDS DUPLICADOS EN TABLAS MAESTRAS ---\n";

function checkDups($pdo, $table) {
    echo "Check $table: ";
    $res = $pdo->query("SELECT id, COUNT(*) as c FROM $table GROUP BY id HAVING c > 1")->fetchAll(PDO::FETCH_ASSOC);
    if (empty($res)) {
        echo "OK (Sin duplicados)\n";
    } else {
        echo "¡FALLO! Duplicados encontrados:\n";
        print_r($res);
    }
}

checkDups($pdo, 'productos');
checkDups($pdo, 'categorias');
checkDups($pdo, 'pedidos');
?>
