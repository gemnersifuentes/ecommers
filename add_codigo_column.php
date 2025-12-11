<?php
require_once 'backend/config/conexion.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Add codigo column
    $sql = "ALTER TABLE pedidos ADD COLUMN codigo VARCHAR(20) UNIQUE AFTER id";
    $conn->exec($sql);
    echo "Column 'codigo' added successfully.\n";

    // Generate codes for existing orders
    $stmt = $conn->query("SELECT id FROM pedidos WHERE codigo IS NULL");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Updating " . count($orders) . " existing orders...\n";

    $updateStmt = $conn->prepare("UPDATE pedidos SET codigo = :codigo WHERE id = :id");

    foreach ($orders as $order) {
        $codigo = 'ORD-' . str_pad($order['id'], 6, '0', STR_PAD_LEFT);
        $updateStmt->execute([':codigo' => $codigo, ':id' => $order['id']]);
    }

    echo "Migration completed successfully.";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
