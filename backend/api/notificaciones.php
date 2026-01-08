<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

// Verificar que sea admin
verificarAdmin();

try {
    // 1. Pedidos Pendientes
    $stmtPedidosCount = $db->query("SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente'");
    $pedidosCount = $stmtPedidosCount->fetchColumn();
    
    $stmtPedidosRecent = $db->query("
        SELECT p.id, p.numero_pedido, p.total, p.fecha, u.nombre as cliente 
        FROM pedidos p 
        LEFT JOIN usuarios u ON p.usuario_id = u.id 
        WHERE p.estado = 'pendiente' 
        ORDER BY p.fecha DESC 
        LIMIT 4
    ");
    $pedidosRecent = $stmtPedidosRecent->fetchAll(PDO::FETCH_ASSOC);

    // 2. Mensajes Pendientes
    $stmtMensajesCount = $db->query("SELECT COUNT(*) FROM mensajes_contacto WHERE estado = 'PENDIENTE'");
    $mensajesCount = $stmtMensajesCount->fetchColumn();
    
    $stmtMensajesRecent = $db->query("
        SELECT id, nombre, email, asunto, fecha_creacion 
        FROM mensajes_contacto 
        WHERE estado = 'PENDIENTE' 
        ORDER BY fecha_creacion DESC 
        LIMIT 4
    ");
    $mensajesRecent = $stmtMensajesRecent->fetchAll(PDO::FETCH_ASSOC);

    // 3. Reservaciones de Servicios Pendientes
    $stmtReservacionesCount = $db->query("SELECT COUNT(*) FROM reservaciones_servicios WHERE estado = 'Pendiente'");
    $reservacionesCount = $stmtReservacionesCount->fetchColumn();
    
    $stmtReservacionesRecent = $db->query("
        SELECT r.id, r.nombre_cliente, s.nombre as servicio_nombre, r.fecha_registro 
        FROM reservaciones_servicios r 
        JOIN servicios s ON r.servicio_id = s.id 
        WHERE r.estado = 'Pendiente' 
        ORDER BY r.fecha_registro DESC 
        LIMIT 4
    ");
    $reservacionesRecent = $stmtReservacionesRecent->fetchAll(PDO::FETCH_ASSOC);

    // 4. Stock Bajo (Umbral: 5 unidades)
    $stmtStockBajoCount = $db->query("SELECT COUNT(*) FROM productos WHERE stock <= 5 AND id NOT IN (SELECT producto_id FROM variaciones)");
    $stockBajoCount = $stmtStockBajoCount->fetchColumn();
    
    // También considerar variaciones con stock bajo
    $stmtVariantesBajo = $db->query("SELECT COUNT(*) FROM variaciones WHERE stock <= 5");
    $variantesBajoCount = $stmtVariantesBajo->fetchColumn();
    
    $totalStockBajo = $stockBajoCount + $variantesBajoCount;

    $stmtStockRecent = $db->query("
        (SELECT id, nombre, stock, 'producto' as tipo, id as real_id FROM productos WHERE stock <= 5 AND id NOT IN (SELECT producto_id FROM variaciones))
        UNION
        (SELECT p.id, CONCAT(p.nombre, ' (', v.atributo, ')') as nombre, v.stock, 'variante' as tipo, v.id as real_id 
         FROM variaciones v 
         JOIN productos p ON v.producto_id = p.id 
         WHERE v.stock <= 5)
        ORDER BY stock ASC 
        LIMIT 4
    ");
    $stockRecent = $stmtStockRecent->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "counts" => [
            "pedidos" => (int)$pedidosCount,
            "mensajes" => (int)$mensajesCount,
            "servicios" => (int)$reservacionesCount,
            "stock_bajo" => (int)$totalStockBajo,
            "total_alertas" => (int)(count($pedidosRecent) + count($stockRecent) + count($reservacionesRecent))
        ],
        "recent" => [
            "pedidos" => $pedidosRecent,
            "mensajes" => $mensajesRecent,
            "servicios" => $reservacionesRecent,
            "stock" => $stockRecent
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
