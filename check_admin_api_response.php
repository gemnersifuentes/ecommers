<?php
// Simulate the environment for backend/api/pedidos.php
// We can't easily include it because it expects input/method. 
// Instead, let's just run a query similar to what it does.

require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $id = 15; // The order we saw was 'tienda'

    echo "--- SIMULATED API RESPONSE FOR ID $id ---\n";
    
    $stmt = $db->prepare("
        SELECT p.*, u.nombre as cliente_nombre, u.correo, u.telefono, u.direccion 
        FROM pedidos p 
        LEFT JOIN usuarios u ON p.usuario_id = u.id 
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Simulate what API returns
    echo json_encode($pedido, JSON_PRETTY_PRINT);

} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
