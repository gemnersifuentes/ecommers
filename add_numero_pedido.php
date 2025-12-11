<?php
require_once 'backend/config/conexion.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Check if column already exists
    $stmt = $conn->query("DESCRIBE pedidos");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array('numero_pedido', $columns)) {
        // Add numero_pedido column
        $sql = "ALTER TABLE pedidos ADD COLUMN numero_pedido VARCHAR(20) UNIQUE AFTER id";
        $conn->exec($sql);
        echo "Column 'numero_pedido' added successfully.\n";
    } else {
        echo "Column 'numero_pedido' already exists.\n";
    }

    // Generate codes for existing orders
    $stmt = $conn->query("SELECT id FROM pedidos WHERE numero_pedido IS NULL");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($orders) > 0) {
        echo "Updating " . count($orders) . " existing orders...\n";
        $updateStmt = $conn->prepare("UPDATE pedidos SET numero_pedido = :num WHERE id = :id");

        foreach ($orders as $order) {
            // Generate format: ORD-000001
            $num = 'ORD-' . str_pad($order['id'], 6, '0', STR_PAD_LEFT);
            $updateStmt->execute([':num' => $num, ':id' => $order['id']]);
        }
        echo "Existing orders updated.\n";
    } else {
        echo "No existing orders need updating.\n";
    }

    echo "Migration completed successfully.";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
