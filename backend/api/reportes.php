<?php
// API de reportes

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if (strpos($path, 'dashboard') !== false) {
            // Estadísticas para el dashboard
            
            // Total de ventas
            $stmtVentas = $db->prepare("SELECT SUM(total) as total_ventas FROM pedidos WHERE estado != 'Cancelado'");
            $stmtVentas->execute();
            $totalVentas = $stmtVentas->fetch(PDO::FETCH_ASSOC)['total_ventas'] ?? 0;
            
            // Total de pedidos
            $stmtPedidos = $db->prepare("SELECT COUNT(*) as total_pedidos FROM pedidos");
            $stmtPedidos->execute();
            $totalPedidos = $stmtPedidos->fetch(PDO::FETCH_ASSOC)['total_pedidos'];
            
            // Total de productos
            $stmtProductos = $db->prepare("SELECT COUNT(*) as total_productos FROM productos WHERE activo = 1");
            $stmtProductos->execute();
            $totalProductos = $stmtProductos->fetch(PDO::FETCH_ASSOC)['total_productos'];
            
            // Total de clientes
            $stmtClientes = $db->prepare("SELECT COUNT(*) as total_clientes FROM clientes");
            $stmtClientes->execute();
            $totalClientes = $stmtClientes->fetch(PDO::FETCH_ASSOC)['total_clientes'];
            
            // Ventas por día (últimos 6 días)
            $stmtVentasDia = $db->prepare("
                SELECT DATE(fecha) as dia, SUM(total) as total 
                FROM pedidos 
                WHERE estado != 'Cancelado' AND fecha >= DATE_SUB(NOW(), INTERVAL 6 DAY)
                GROUP BY DATE(fecha)
                ORDER BY dia
            ");
            $stmtVentasDia->execute();
            $ventasPorDia = $stmtVentasDia->fetchAll(PDO::FETCH_ASSOC);
            
            // Pedidos por día (últimos 6 días)
            $stmtPedidosDia = $db->prepare("
                SELECT DATE(fecha) as dia, COUNT(*) as cantidad 
                FROM pedidos 
                WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 DAY)
                GROUP BY DATE(fecha)
                ORDER BY dia
            ");
            $stmtPedidosDia->execute();
            $pedidosPorDia = $stmtPedidosDia->fetchAll(PDO::FETCH_ASSOC);
            
            // Productos vendidos por día (últimos 6 días)
            $stmtProductosVendidosDia = $db->prepare("
                SELECT DATE(ped.fecha) as dia, SUM(dp.cantidad) as cantidad 
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado' AND ped.fecha >= DATE_SUB(NOW(), INTERVAL 6 DAY)
                GROUP BY DATE(ped.fecha)
                ORDER BY dia
            ");
            $stmtProductosVendidosDia->execute();
            $productosVendidosPorDia = $stmtProductosVendidosDia->fetchAll(PDO::FETCH_ASSOC);
            
            // Nuevos clientes por día (últimos 6 días)
            $stmtClientesDia = $db->prepare("
                SELECT DATE(fecha_registro) as dia, COUNT(*) as cantidad 
                FROM clientes 
                WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 6 DAY)
                GROUP BY DATE(fecha_registro)
                ORDER BY dia
            ");
            $stmtClientesDia->execute();
            $clientesNuevosPorDia = $stmtClientesDia->fetchAll(PDO::FETCH_ASSOC);
            
            // Total productos vendidos
            $stmtTotalProductosVendidos = $db->prepare("
                SELECT SUM(dp.cantidad) as total
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado'
            ");
            $stmtTotalProductosVendidos->execute();
            $totalProductosVendidos = $stmtTotalProductosVendidos->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Nuevos clientes (del mes actual)
            $stmtClientesNuevos = $db->prepare("
                SELECT COUNT(*) as total
                FROM clientes
                WHERE MONTH(fecha_registro) = MONTH(NOW()) AND YEAR(fecha_registro) = YEAR(NOW())
            ");
            $stmtClientesNuevos->execute();
            $clientesNuevos = $stmtClientesNuevos->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // ============================================
            // CALCULAR TENDENCIAS REALES (Hoy vs Ayer)
            // ============================================
            
            // Ventas de HOY
            $stmtVentasHoy = $db->prepare("
                SELECT SUM(total) as total 
                FROM pedidos 
                WHERE estado != 'Cancelado' AND DATE(fecha) = DATE(NOW())
            ");
            $stmtVentasHoy->execute();
            $ventasHoy = $stmtVentasHoy->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Ventas de AYER
            $stmtVentasAyer = $db->prepare("
                SELECT SUM(total) as total 
                FROM pedidos 
                WHERE estado != 'Cancelado' AND DATE(fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY))
            ");
            $stmtVentasAyer->execute();
            $ventasAyer = $stmtVentasAyer->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Calcular tendencia de ventas
            $ventasTrend = 0;
            if ($ventasAyer > 0) {
                $ventasTrend = (($ventasHoy - $ventasAyer) / $ventasAyer) * 100;
            }
            
            // Pedidos de HOY
            $stmtPedidosHoy = $db->prepare("
                SELECT COUNT(*) as total 
                FROM pedidos 
                WHERE DATE(fecha) = DATE(NOW())
            ");
            $stmtPedidosHoy->execute();
            $pedidosHoy = $stmtPedidosHoy->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Pedidos de AYER
            $stmtPedidosAyer = $db->prepare("
                SELECT COUNT(*) as total 
                FROM pedidos 
                WHERE DATE(fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY))
            ");
            $stmtPedidosAyer->execute();
            $pedidosAyer = $stmtPedidosAyer->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Calcular tendencia de pedidos
            $pedidosTrend = 0;
            if ($pedidosAyer > 0) {
                $pedidosTrend = (($pedidosHoy - $pedidosAyer) / $pedidosAyer) * 100;
            }
            
            // Productos vendidos HOY
            $stmtProductosHoy = $db->prepare("
                SELECT SUM(dp.cantidad) as total
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado' AND DATE(ped.fecha) = DATE(NOW())
            ");
            $stmtProductosHoy->execute();
            $productosHoy = $stmtProductosHoy->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Productos vendidos AYER
            $stmtProductosAyer = $db->prepare("
                SELECT SUM(dp.cantidad) as total
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado' AND DATE(ped.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY))
            ");
            $stmtProductosAyer->execute();
            $productosAyer = $stmtProductosAyer->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Calcular tendencia de productos vendidos
            $productosVendidosTrend = 0;
            if ($productosAyer > 0) {
                $productosVendidosTrend = (($productosHoy - $productosAyer) / $productosAyer) * 100;
            }
            
            // Clientes nuevos HOY
            $stmtClientesHoy = $db->prepare("
                SELECT COUNT(*) as total
                FROM clientes
                WHERE DATE(fecha_registro) = DATE(NOW())
            ");
            $stmtClientesHoy->execute();
            $clientesHoy = $stmtClientesHoy->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Clientes nuevos AYER
            $stmtClientesAyer = $db->prepare("
                SELECT COUNT(*) as total
                FROM clientes
                WHERE DATE(fecha_registro) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY))
            ");
            $stmtClientesAyer->execute();
            $clientesAyer = $stmtClientesAyer->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Calcular tendencia de nuevos clientes
            $clientesNuevosTrend = 0;
            if ($clientesAyer > 0) {
                $clientesNuevosTrend = (($clientesHoy - $clientesAyer) / $clientesAyer) * 100;
            }
            
            // Formatear tendencias como string con signo
            $ventasTrendStr = sprintf("%+.2f%%", $ventasTrend);
            $pedidosTrendStr = sprintf("%+.2f%%", $pedidosTrend);
            $productosVendidosTrendStr = sprintf("%+.2f%%", $productosVendidosTrend);
            $clientesNuevosTrendStr = sprintf("%+.2f%%", $clientesNuevosTrend);
            
            // ============================================
            
            // Ventas por mes (últimos 6 meses)
            $stmtVentasMes = $db->prepare("
                SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, SUM(total) as total 
                FROM pedidos 
                WHERE estado != 'Cancelado' AND fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha, '%Y-%m')
                ORDER BY mes
            ");
            $stmtVentasMes->execute();
            $ventasPorMes = $stmtVentasMes->fetchAll(PDO::FETCH_ASSOC);
            
            // Productos más vendidos
            $stmtMasVendidos = $db->prepare("
                SELECT p.nombre, p.precio_base as precio, p.imagen, SUM(dp.cantidad) as total_vendido 
                FROM detalle_pedido dp
                LEFT JOIN productos p ON dp.producto_id = p.id
                LEFT JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado'
                GROUP BY dp.producto_id
                ORDER BY total_vendido DESC
                LIMIT 5
            ");
            $stmtMasVendidos->execute();
            $productosMasVendidos = $stmtMasVendidos->fetchAll(PDO::FETCH_ASSOC);
            
            // Pedidos por estado
            $stmtPorEstado = $db->prepare("
                SELECT estado, COUNT(*) as cantidad 
                FROM pedidos 
                GROUP BY estado
            ");
            $stmtPorEstado->execute();
            $pedidosPorEstado = $stmtPorEstado->fetchAll(PDO::FETCH_ASSOC);
            
            // Últimos pedidos
            $stmtUltimosPedidos = $db->prepare("
                SELECT p.id, p.fecha, p.total, p.estado, c.nombre as cliente_nombre 
                FROM pedidos p 
                LEFT JOIN clientes c ON p.cliente_id = c.id 
                ORDER BY p.fecha DESC 
                LIMIT 10
            ");
            $stmtUltimosPedidos->execute();
            $ultimosPedidos = $stmtUltimosPedidos->fetchAll(PDO::FETCH_ASSOC);

            // Ventas por categoría
            $stmtVentasCategoria = $db->prepare("
                SELECT c.nombre as categoria, SUM(dp.cantidad * p.precio_base) as total_ventas
                FROM detalle_pedido dp
                JOIN productos p ON dp.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'Cancelado'
                GROUP BY c.id
                ORDER BY total_ventas DESC
            ");
            $stmtVentasCategoria->execute();
            $ventasPorCategoria = $stmtVentasCategoria->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'estadisticas' => [
                    'totalVentas' => floatval($totalVentas),
                    'totalPedidos' => intval($totalPedidos),
                    'totalProductos' => intval($totalProductos),
                    'totalClientes' => intval($totalClientes),
                    'productosVendidos' => intval($totalProductosVendidos),
                    'clientesNuevos' => intval($clientesNuevos),
                    'ventasTrend' => $ventasTrendStr,
                    'pedidosTrend' => $pedidosTrendStr,
                    'productosVendidosTrend' => $productosVendidosTrendStr,
                    'clientesNuevosTrend' => $clientesNuevosTrendStr
                ],
                'ventasPorMes' => $ventasPorMes,
                'ventasPorDia' => $ventasPorDia,
                'pedidosPorDia' => $pedidosPorDia,
                'productosVendidosPorDia' => $productosVendidosPorDia,
                'clientesNuevosPorDia' => $clientesNuevosPorDia,
                'productosMasVendidos' => $productosMasVendidos,
                'pedidosPorEstado' => $pedidosPorEstado,
                'ultimosPedidos' => $ultimosPedidos,
                'ventasPorCategoria' => $ventasPorCategoria
            ]);
        }
        elseif (strpos($path, 'ventas') !== false) {
            // Reporte de ventas
            $fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : date('Y-m-01');
            $fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : date('Y-m-d');
            
            $stmt = $db->prepare("
                SELECT p.*, c.nombre as cliente_nombre 
                FROM pedidos p 
                LEFT JOIN clientes c ON p.cliente_id = c.id 
                WHERE p.fecha BETWEEN ? AND ? AND p.estado != 'Cancelado'
                ORDER BY p.fecha DESC
            ");
            $stmt->execute([$fecha_inicio, $fecha_fin]);
            $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $total = array_sum(array_column($ventas, 'total'));
            
            echo json_encode([
                'ventas' => $ventas,
                'total' => $total,
                'periodo' => ['inicio' => $fecha_inicio, 'fin' => $fecha_fin]
            ]);
        }
        else {
            // Obtener todos los reportes
            $stmt = $db->prepare("SELECT * FROM reportes ORDER BY fecha DESC");
            $stmt->execute();
            $reportes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($reportes);
        }
        break;

    case 'POST':
        if (!isset($input['tipo'])) {
            http_response_code(400);
            echo json_encode(['message' => 'El tipo de reporte es requerido']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO reportes (tipo, contenido) VALUES (?, ?)");
        
        if ($stmt->execute([$input['tipo'], $input['contenido'] ?? null])) {
            echo json_encode([
                'success' => true,
                'message' => 'Reporte creado exitosamente',
                'id' => $db->lastInsertId()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al crear reporte']);
        }
        break;
}
?>
