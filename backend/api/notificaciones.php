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
    // 1. Pedidos del día (Incluyendo pagados y por verificar, solo no vistos)
    $stmtPedidosCount = $db->query("SELECT COUNT(*) FROM pedidos WHERE estado IN ('pendiente', 'pagado', 'pendiente_verificacion') AND (visto_admin = 0 OR visto_admin IS NULL) AND DATE(fecha) = CURDATE()");
    $pedidosCount = $stmtPedidosCount->fetchColumn();
    
    $stmtPedidosRecent = $db->query("
        SELECT p.id, p.numero_pedido, p.total, p.fecha, u.nombre as cliente 
        FROM pedidos p 
        LEFT JOIN usuarios u ON p.usuario_id = u.id 
        WHERE p.estado IN ('pendiente', 'pagado', 'pendiente_verificacion') 
        AND (p.visto_admin = 0 OR p.visto_admin IS NULL)
        AND DATE(p.fecha) = CURDATE()
        ORDER BY p.fecha DESC 
        LIMIT 4
    ");
    $pedidosRecent = $stmtPedidosRecent->fetchAll(PDO::FETCH_ASSOC);

    // 2. Mensajes Pendientes
    $stmtMensajesCount = $db->query("SELECT COUNT(*) FROM mensajes_contacto WHERE estado = 'PENDIENTE' AND (visto_admin = 0 OR visto_admin IS NULL)");
    $mensajesCount = $stmtMensajesCount->fetchColumn();
    
    $stmtMensajesRecent = $db->query("
        SELECT id, nombre, email, asunto, fecha_creacion 
        FROM mensajes_contacto 
        WHERE estado = 'PENDIENTE' AND (visto_admin = 0 OR visto_admin IS NULL)
        ORDER BY fecha_creacion DESC 
        LIMIT 4
    ");
    $mensajesRecent = $stmtMensajesRecent->fetchAll(PDO::FETCH_ASSOC);

    // 3. Reservaciones de Servicios Pendientes
    $stmtReservacionesCount = $db->query("SELECT COUNT(*) FROM reservaciones_servicios WHERE estado = 'Pendiente' AND (visto_admin = 0 OR visto_admin IS NULL)");
    $reservacionesCount = $stmtReservacionesCount->fetchColumn();
    
    $stmtReservacionesRecent = $db->query("
        SELECT r.id, r.nombre_cliente, s.nombre as servicio_nombre, r.fecha_registro 
        FROM reservaciones_servicios r 
        JOIN servicios s ON r.servicio_id = s.id 
        WHERE r.estado = 'Pendiente' AND (r.visto_admin = 0 OR r.visto_admin IS NULL)
        ORDER BY r.fecha_registro DESC 
        LIMIT 4
    ");
    $reservacionesRecent = $stmtReservacionesRecent->fetchAll(PDO::FETCH_ASSOC);

    // 4. Stock Bajo (Umbral: 5 unidades, solo no vistos o vistos hace más de 2 horas)
    $stmtStockBajoCount = $db->query("SELECT COUNT(*) FROM productos WHERE stock <= 5 AND (visto_admin IS NULL OR visto_admin < DATE_SUB(NOW(), INTERVAL 2 HOUR)) AND id NOT IN (SELECT producto_id FROM variaciones)");
    $stockBajoCount = $stmtStockBajoCount->fetchColumn();
    
    // También considerar variaciones con stock bajo (solo no vistos o vistos hace más de 2 horas)
    $stmtVariantesBajo = $db->query("SELECT COUNT(*) FROM variaciones WHERE stock <= 5 AND (visto_admin IS NULL OR visto_admin < DATE_SUB(NOW(), INTERVAL 2 HOUR))");
    $variantesBajoCount = $stmtVariantesBajo->fetchColumn();
    
    $totalStockBajo = $stockBajoCount + $variantesBajoCount;

    $stmtStockRecent = $db->query("
        (SELECT id, nombre, stock, 'stock' as tipo, id as real_id FROM productos WHERE stock <= 5 AND (visto_admin IS NULL OR visto_admin < DATE_SUB(NOW(), INTERVAL 2 HOUR)) AND id NOT IN (SELECT producto_id FROM variaciones))
        UNION
        (SELECT p.id, CONCAT(p.nombre, ' (', v.atributo, ')') as nombre, v.stock, 'stock' as tipo, v.id as real_id 
         FROM variaciones v 
         JOIN productos p ON v.producto_id = p.id 
         WHERE v.stock <= 5 AND (v.visto_admin IS NULL OR v.visto_admin < DATE_SUB(NOW(), INTERVAL 2 HOUR)))
        ORDER BY stock ASC 
        LIMIT 20
    ");
    $stockRecent = $stmtStockRecent->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "counts" => [
            "pedidos" => (int)$pedidosCount,
            "mensajes" => (int)$mensajesCount,
            "servicios" => (int)$reservacionesCount,
            "stock_bajo" => (int)$totalStockBajo,
            "total_alertas" => (int)($pedidosCount + $mensajesCount + $reservacionesCount + $totalStockBajo)
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
