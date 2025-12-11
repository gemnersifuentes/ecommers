<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->query("SHOW TABLES LIKE 'especificaciones'");
    if ($stmt->rowCount() > 0) {
        echo "La tabla 'especificaciones' EXISTE.\n";
        $stmt = $db->query("DESCRIBE especificaciones");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo " - " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
    } else {
        echo "La tabla 'especificaciones' NO EXISTE.\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
