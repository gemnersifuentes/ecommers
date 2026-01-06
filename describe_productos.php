<?php
require 'backend/config/conexion.php';
try {
    $s = $db->query('DESCRIBE productos');
    print_r($s->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
