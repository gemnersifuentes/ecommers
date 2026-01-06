<?php
require 'backend/config/conexion.php';
try {
    $s = $db->query('DESCRIBE productos');
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo $row['Field'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
