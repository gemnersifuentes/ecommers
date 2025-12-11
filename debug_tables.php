<?php
require_once 'backend/config/conexion.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SHOW TABLES");
    print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
