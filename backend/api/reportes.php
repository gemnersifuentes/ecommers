<?php
// API de reportes

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if (strpos($path, 'dashboard') !== false) {
            // Estadísticas para el dashboard
            $periodo = isset($_GET['periodo']) ? $_GET['periodo'] : '12M';
            
            // Determinar intervalo y agrupación para la gráfica principal
            $intervalo = "12 MONTH";
            $formatoAgrupacion = "%Y-%m";
            $labelPeriodo = "mes";

            if ($periodo === '7D') {
                $intervalo = "7 DAY";
                $formatoAgrupacion = "%Y-%m-%d";
                $labelPeriodo = "mes"; // Mantenemos el nombre del campo para compatibilidad
            } elseif ($periodo === '1M') {
                $intervalo = "1 MONTH";
                $formatoAgrupacion = "%Y-%m-%d";
                $labelPeriodo = "mes";
            } elseif ($periodo === '6M') {
                $intervalo = "6 MONTH";
                $formatoAgrupacion = "%Y-%m";
            } elseif ($periodo === '24M') {
                $intervalo = "24 MONTH";
                $formatoAgrupacion = "%Y-%m";
            }

            if ($periodo === 'YEAR') {
                $stmtVentasMesQuery = "
                    SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, SUM(total) as total, COUNT(*) as pedidos 
                    FROM pedidos 
                    WHERE estado != 'cancelado' AND YEAR(fecha) = YEAR(NOW())
                    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
                    ORDER BY mes
                ";
            } else {
                $stmtVentasMesQuery = "
                    SELECT DATE_FORMAT(fecha, '$formatoAgrupacion') as mes, SUM(total) as total, COUNT(*) as pedidos 
                    FROM pedidos 
                    WHERE estado != 'cancelado' AND fecha >= DATE_SUB(NOW(), INTERVAL $intervalo)
                    GROUP BY DATE_FORMAT(fecha, '$formatoAgrupacion')
                    ORDER BY mes
                ";
            }
            // Ventas del mes actual (Tarjeta Principal) - INCLUYE SERVICIOS COMPLETADOS
            $stmtVentasMes = $pdo->prepare("
                SELECT (
                    SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE estado != 'cancelado' AND MONTH(fecha) = MONTH(NOW()) AND YEAR(fecha) = YEAR(NOW())
                ) + (
                    SELECT COALESCE(SUM(costo_final), 0) FROM reservaciones_servicios WHERE estado = 'Completado' AND MONTH(fecha_registro) = MONTH(NOW()) AND YEAR(fecha_registro) = YEAR(NOW())
                ) as total
            ");
            $stmtVentasMes->execute();
            $ventasMes = $stmtVentasMes->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Gastos del mes actual (COGS + Insumos + Gastos Operativos)
            $stmtGastosMes = $pdo->prepare("
                SELECT (
                    SELECT COALESCE(SUM(precio_compra * cantidad), 0) FROM detalle_pedido dp JOIN pedidos p ON dp.pedido_id = p.id WHERE p.estado != 'cancelado' AND MONTH(p.fecha) = MONTH(NOW()) AND YEAR(p.fecha) = YEAR(NOW())
                ) + (
                    SELECT COALESCE(SUM(costo_insumos), 0) FROM reservaciones_servicios WHERE estado = 'Completado' AND MONTH(fecha_registro) = MONTH(NOW()) AND YEAR(fecha_registro) = YEAR(NOW())
                ) + (
                    SELECT COALESCE(SUM(monto), 0) FROM gastos_operativos WHERE MONTH(fecha) = MONTH(NOW()) AND YEAR(fecha) = YEAR(NOW())
                ) as total
            ");
            $stmtGastosMes->execute();
            $gastosMes = $stmtGastosMes->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Ventas Históricas Totales
            $stmtVentasTotal = $pdo->prepare("
                SELECT (
                    SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE estado != 'cancelado'
                ) + (
                    SELECT COALESCE(SUM(costo_final), 0) FROM reservaciones_servicios WHERE estado = 'Completado'
                ) as total
            ");
            $stmtVentasTotal->execute();
            $totalVentasBase = $stmtVentasTotal->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Gastos Históricos Totales
            $stmtGastosTotal = $pdo->prepare("
                SELECT (
                    SELECT COALESCE(SUM(precio_compra * cantidad), 0) FROM detalle_pedido dp JOIN pedidos p ON dp.pedido_id = p.id WHERE p.estado != 'cancelado'
                ) + (
                    SELECT COALESCE(SUM(costo_insumos), 0) FROM reservaciones_servicios WHERE estado = 'Completado'
                ) + (
                    SELECT COALESCE(SUM(monto), 0) FROM gastos_operativos
                ) as total
            ");
            $stmtGastosTotal->execute();
            $totalGastosBase = $stmtGastosTotal->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Utilidad Real
            $totalUtilidadReal = $totalVentasBase - $totalGastosBase;
            
            // Pedidos del mes actual (Solo pedidos físicos)
            $stmtPedidosMes = $pdo->prepare("SELECT COUNT(*) as total FROM pedidos WHERE MONTH(fecha) = MONTH(NOW()) AND YEAR(fecha) = YEAR(NOW())");
            $stmtPedidosMes->execute();
            $totalPedidosMes = $stmtPedidosMes->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Total de pedidos (Histórico)
            $stmtPedidos = $pdo->prepare("SELECT COUNT(*) as total_pedidos FROM pedidos");
            $stmtPedidos->execute();
            $totalPedidos = $stmtPedidos->fetch(PDO::FETCH_ASSOC)['total_pedidos'];
            
            // Total de productos
            $stmtProductos = $pdo->prepare("SELECT COUNT(*) as total_productos FROM productos WHERE activo = 1");
            $stmtProductos->execute();
            $totalProductos = $stmtProductos->fetch(PDO::FETCH_ASSOC)['total_productos'];
            
            // Total de clientes
            $stmtClientes = $pdo->prepare("SELECT COUNT(*) as total_clientes FROM usuarios WHERE rol = 'cliente'");
            $stmtClientes->execute();
            $totalClientes = $stmtClientes->fetch(PDO::FETCH_ASSOC)['total_clientes'];
            
            // ============================================
            // GENERAR RESUMEN DIARIO (Últimos 7 días)
            // ============================================
            $resumenDiario = [];
            for ($i = 6; $i >= 0; $i--) {
                $fechaLoop = date('Y-m-d', strtotime("-$i days"));
                $resumenDiario[$fechaLoop] = [
                    'dia' => $fechaLoop,
                    'total' => 0,
                    'pedidos' => 0,
                    'productos' => 0,
                    'clientes' => 0
                ];
            }

            // 1. Ventas por día
            $stmtVentasDia = $pdo->prepare("
                SELECT DATE(fecha) as dia, SUM(total) as total, COUNT(*) as cantidad 
                FROM pedidos 
                WHERE estado != 'cancelado' AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(fecha)
            ");
            $stmtVentasDia->execute();
            while ($row = $stmtVentasDia->fetch(PDO::FETCH_ASSOC)) {
                if (isset($resumenDiario[$row['dia']])) {
                    $resumenDiario[$row['dia']]['total'] = floatval($row['total']);
                    $resumenDiario[$row['dia']]['pedidos'] = intval($row['cantidad']);
                }
            }
            
            // 2. Productos vendidos por día
            $stmtProdDia = $pdo->prepare("
                SELECT DATE(ped.fecha) as dia, SUM(dp.cantidad) as cantidad 
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'cancelado' AND ped.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(ped.fecha)
            ");
            $stmtProdDia->execute();
            while ($row = $stmtProdDia->fetch(PDO::FETCH_ASSOC)) {
                if (isset($resumenDiario[$row['dia']])) {
                    $resumenDiario[$row['dia']]['productos'] = intval($row['cantidad']);
                }
            }
            
            // 3. Nuevos clientes por día
            $stmtClieDia = $pdo->prepare("
                SELECT DATE(fecha_registro) as dia, COUNT(*) as cantidad 
                FROM usuarios 
                WHERE rol = 'cliente' AND fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(fecha_registro)
            ");
            $stmtClieDia->execute();
            while ($row = $stmtClieDia->fetch(PDO::FETCH_ASSOC)) {
                if (isset($resumenDiario[$row['dia']])) {
                    $resumenDiario[$row['dia']]['clientes'] = intval($row['cantidad']);
                }
            }

            $datosDiariosArr = array_values($resumenDiario);
            // ============================================
            
            // Productos vendidos este mes
            $stmtProductosVendidosMes = $pdo->prepare("
                SELECT SUM(dp.cantidad) as total
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'cancelado' AND MONTH(ped.fecha) = MONTH(NOW()) AND YEAR(ped.fecha) = YEAR(NOW())
            ");
            $stmtProductosVendidosMes->execute();
            $productosVendidosMes = $stmtProductosVendidosMes->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Total productos vendidos (Histórico)
            $stmtTotalProductosVendidos = $pdo->prepare("
                SELECT SUM(dp.cantidad) as total
                FROM detalle_pedido dp
                INNER JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'cancelado'
            ");
            $stmtTotalProductosVendidos->execute();
            $totalProductosVendidos = $stmtTotalProductosVendidos->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // Nuevos clientes (del mes actual)
            $stmtClientesNuevos = $pdo->prepare("
                SELECT COUNT(*) as total
                FROM usuarios
                WHERE rol = 'cliente' AND MONTH(fecha_registro) = MONTH(NOW()) AND YEAR(fecha_registro) = YEAR(NOW())
            ");
            $stmtClientesNuevos->execute();
            $clientesNuevos = $stmtClientesNuevos->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            // ============================================
            // CALCULAR APORTACIÓN MENSUAL (Porcentajes Reales)
            // ============================================
            
            // Cuota de ventas del mes sobre el total
            $ventasTrend = 0;
            if ($totalVentasBase > 0) {
                $ventasTrend = ($ventasMes / $totalVentasBase) * 100;
            }
            
            // Cuota de pedidos del mes
            $pedidosTrend = 0;
            if ($totalPedidos > 0) {
                $pedidosTrend = ($totalPedidosMes / $totalPedidos) * 100;
            }
            
            // Cuota de productos vendidos este mes
            $productosVendidosTrend = 0;
            if ($totalProductosVendidos > 0) {
                $productosVendidosTrend = ($productosVendidosMes / $totalProductosVendidos) * 100;
            }
            
            // Cuota de nuevos clientes sobre la base total
            $clientesNuevosTrend = 0;
            if ($totalClientes > 0) {
                $clientesNuevosTrend = ($clientesNuevos / $totalClientes) * 100;
            }
            
            // Formatear como porcentaje de participación (siempre <= 100%)
            $ventasTrendStr = sprintf("%.2f%%", min(100, $ventasTrend));
            $pedidosTrendStr = sprintf("%.2f%%", min(100, $pedidosTrend));
            $productosVendidosTrendStr = sprintf("%.2f%%", min(100, $productosVendidosTrend));
            $clientesNuevosTrendStr = sprintf("%.2f%%", min(100, $clientesNuevosTrend));
            
            // ============================================
            
            // Ventas por mes (Dinámico según periodo)
            $stmtVentasMes = $pdo->prepare($stmtVentasMesQuery);
            $stmtVentasMes->execute();
            $ventasPorMes = $stmtVentasMes->fetchAll(PDO::FETCH_ASSOC);
            
            // Productos más vendidos
            $stmtMasVendidos = $pdo->prepare("
                SELECT p.id, p.nombre, p.precio_base as precio, p.imagen, SUM(dp.cantidad) as total_vendido 
                FROM detalle_pedido dp
                LEFT JOIN productos p ON dp.producto_id = p.id
                LEFT JOIN pedidos ped ON dp.pedido_id = ped.id
                WHERE ped.estado != 'cancelado'
                GROUP BY dp.producto_id
                ORDER BY total_vendido DESC
                LIMIT 5
            ");
            $stmtMasVendidos->execute();
            $productosMasVendidos = $stmtMasVendidos->fetchAll(PDO::FETCH_ASSOC);
            
            // Pedidos por estado (Doughnut Chart)
            $stmtPorEstado = $pdo->prepare("
                SELECT estado, COUNT(*) as cantidad 
                FROM pedidos 
                GROUP BY estado
                ORDER BY cantidad DESC
            ");
            $stmtPorEstado->execute();
            $pedidosPorEstado = $stmtPorEstado->fetchAll(PDO::FETCH_ASSOC);

            // Ventas por Hora (Bar Chart)
            $stmtVentasHora = $pdo->prepare("
                SELECT HOUR(fecha) as hora, COUNT(*) as cantidad, SUM(total) as total
                FROM pedidos 
                WHERE estado != 'cancelado' AND fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY HOUR(fecha)
                ORDER BY hora
            ");
            $stmtVentasHora->execute();
            $ventasPorHora = $stmtVentasHora->fetchAll(PDO::FETCH_ASSOC);

            // Ventas por Día de la Semana (Radar/Bar Chart)
            $stmtVentasSemana = $pdo->prepare("
                SELECT DAYOFWEEK(fecha) as num_dia, COUNT(*) as cantidad, SUM(total) as total
                FROM pedidos
                WHERE estado != 'cancelado' AND fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY num_dia
                ORDER BY num_dia
            ");
            $stmtVentasSemana->execute();
            $ventasPorDiaSemana = $stmtVentasSemana->fetchAll(PDO::FETCH_ASSOC);

            // Ventas por Marca (Bar Chart)
            $stmtVentasMarca = $pdo->prepare("
                SELECT COALESCE(m.nombre, 'Otras Marcas') as marca, SUM(dp.subtotal) as total_ventas
                FROM detalle_pedido dp
                JOIN pedidos ped ON dp.pedido_id = ped.id
                LEFT JOIN productos p ON dp.producto_id = p.id
                LEFT JOIN marcas m ON p.marca_id = m.id
                WHERE ped.estado != 'cancelado'
                GROUP BY COALESCE(m.nombre, 'Otras Marcas')
                ORDER BY total_ventas DESC
                LIMIT 8
            ");
            $stmtVentasMarca->execute();
            $ventasPorMarca = $stmtVentasMarca->fetchAll(PDO::FETCH_ASSOC);

            
            // Últimos pedidos
            $stmtUltimosPedidos = $pdo->prepare("
                SELECT p.id, p.fecha, p.total, p.estado, c.nombre as cliente_nombre 
                FROM pedidos p 
                LEFT JOIN usuarios c ON p.usuario_id = c.id 
                ORDER BY p.fecha DESC 
                LIMIT 8
            ");
            $stmtUltimosPedidos->execute();
            $ultimosPedidos = $stmtUltimosPedidos->fetchAll(PDO::FETCH_ASSOC);

            // Últimas reservaciones (Tickets de servicio)
            $stmtUltimasRes = $pdo->prepare("
                SELECT r.id, r.fecha_registro as fecha, COALESCE(r.costo_final, r.costo_sugerido) as total, r.estado, r.nombre_cliente as cliente_nombre 
                FROM reservaciones_servicios r 
                ORDER BY r.fecha_registro DESC 
                LIMIT 8
            ");
            $stmtUltimasRes->execute();
            $ultimasReservaciones = $stmtUltimasRes->fetchAll(PDO::FETCH_ASSOC);

            // --- ADVANCED BI & FINANCIAL ANALYSIS (v2) ---

            // 1. Ticket Promedio (AOV)
            $ticketPromedio = $totalPedidos > 0 ? ($totalVentasBase / $totalPedidos) : 0;

            // 2. Tasa de Retención (Returning Customers)
            $stmtRetencion = $pdo->prepare("
                SELECT COUNT(*) as repetidores
                FROM (
                    SELECT usuario_id FROM pedidos 
                    WHERE estado != 'cancelado' 
                    GROUP BY usuario_id 
                    HAVING COUNT(*) > 1
                ) as sub
            ");
            $stmtRetencion->execute();
            $clientesRepetidores = $stmtRetencion->fetch(PDO::FETCH_ASSOC)['repetidores'] ?? 0;
            
            $stmtTotalClientes = $pdo->prepare("SELECT COUNT(DISTINCT usuario_id) as total FROM pedidos WHERE estado != 'cancelado'");
            $stmtTotalClientes->execute();
            $totalClientesUnicos = $stmtTotalClientes->fetch(PDO::FETCH_ASSOC)['total'] ?? 1;
            $tasaRetencion = ($clientesRepetidores / $totalClientesUnicos) * 100;

            // 3. Utilidad Real (Basada en costos)
            $utilidadReal = $totalVentasBase - $totalGastosBase;

            // 4. Top Clientes (Spenders)
            $stmtTopClientes = $pdo->prepare("
                SELECT u.nombre, u.correo as email, COUNT(p.id) as pedidos, SUM(p.total) as total_gastado
                FROM pedidos p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.estado != 'cancelado'
                GROUP BY u.id
                ORDER BY total_gastado DESC
                LIMIT 5
            ");
            $stmtTopClientes->execute();
            $topClientes = $stmtTopClientes->fetchAll(PDO::FETCH_ASSOC);

            // 5. Crecimiento MoM (Month over Month)
            $stmtVentasMesAnterior = $pdo->prepare("
                SELECT SUM(total) as total 
                FROM pedidos 
                WHERE estado != 'cancelado' 
                AND fecha >= DATE_SUB(DATE_SUB(NOW(), INTERVAL DAY(NOW())-1 DAY), INTERVAL 1 MONTH)
                AND fecha < DATE_SUB(NOW(), INTERVAL DAY(NOW())-1 DAY)
            ");
            $stmtVentasMesAnterior->execute();
            $ventasMesAnterior = $stmtVentasMesAnterior->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            
            $crecimientoMoM = $ventasMesAnterior > 0 
                ? (($totalVentasBase - $ventasMesAnterior) / $ventasMesAnterior) * 100 
                : 0;

            // 6. Nuevos vs Recurrentes (Time series)
            $stmtClientesTrend = $pdo->prepare("
                SELECT 
                    DATE_FORMAT(p.fecha, '%Y-%m') as mes,
                    COUNT(DISTINCT p.usuario_id) as total_usuarios,
                    SUM(CASE WHEN (SELECT COUNT(*) FROM pedidos p2 WHERE p2.usuario_id = p.usuario_id AND p2.fecha < p.fecha) = 0 THEN 1 ELSE 0 END) as nuevos,
                    SUM(CASE WHEN (SELECT COUNT(*) FROM pedidos p2 WHERE p2.usuario_id = p.usuario_id AND p2.fecha < p.fecha) > 0 THEN 1 ELSE 0 END) as recurrentes
                FROM pedidos p
                WHERE p.estado != 'cancelado'
                GROUP BY mes
                ORDER BY mes DESC
                LIMIT 6
            ");
            $stmtClientesTrend->execute();
            $clientesTrend = array_reverse($stmtClientesTrend->fetchAll(PDO::FETCH_ASSOC));

            // 7. Distribución de Métodos de Pago (Real data)
            $stmtMetodos = $pdo->prepare("
                SELECT metodo_pago as metodo, COUNT(*) as cantidad, SUM(total) as total
                FROM pedidos
                WHERE estado != 'cancelado'
                GROUP BY metodo_pago
                ORDER BY total DESC
            ");
            $stmtMetodos->execute();
            $metodosPago = $stmtMetodos->fetchAll(PDO::FETCH_ASSOC);

            // 8. Ventas por Ubicación (Simulación para estructura UI)
            $ventasPorUbicacion = [
                ['region' => 'Lima Metrop.', 'total' => $totalVentasBase * 0.55, 'pedidos' => round($totalPedidos * 0.5)],
                ['region' => 'Arequipa', 'total' => $totalVentasBase * 0.15, 'pedidos' => round($totalPedidos * 0.15)],
                ['region' => 'La Libertad', 'total' => $totalVentasBase * 0.10, 'pedidos' => round($totalPedidos * 0.10)],
                ['region' => 'Cusco', 'total' => $totalVentasBase * 0.08, 'pedidos' => round($totalPedidos * 0.08)],
                ['region' => 'Piura', 'total' => $totalVentasBase * 0.07, 'pedidos' => round($totalPedidos * 0.07)],
                ['region' => 'Otros', 'total' => $totalVentasBase * 0.05, 'pedidos' => round($totalPedidos * 0.10)]
            ];

            // --- END OF BI ANALYSIS v2 ---

            // Ventas por categoría
            $stmtVentasCategoria = $pdo->prepare("
                SELECT 
                    c.id as categoria_id,
                    COALESCE(c.nombre, 'Sin Categoría') as categoria, 
                    SUM(dp.subtotal) as total_ventas
                FROM detalle_pedido dp
                JOIN pedidos ped ON dp.pedido_id = ped.id
                LEFT JOIN productos p ON dp.producto_id = p.id
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE ped.estado != 'cancelado'
                GROUP BY COALESCE(c.nombre, 'Sin Categoría'), c.id
                ORDER BY total_ventas DESC
            ");
            $stmtVentasCategoria->execute();
            $ventasPorCategoria = $stmtVentasCategoria->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'estadisticas' => [
                    'totalVentas' => floatval($totalVentasBase),
                    'totalVentasMes' => floatval($ventasMes),
                    'totalGastos' => floatval($totalGastosBase),
                    'totalGastosMes' => floatval($gastosMes),
                    'utilidadReal' => floatval($totalUtilidadReal),
                    'totalPedidos' => intval($totalPedidos),
                    'totalPedidosMes' => intval($totalPedidosMes),
                    'totalProductos' => intval($totalProductos),
                    'totalClientes' => intval($totalClientes),
                    'productosVendidos' => intval($totalProductosVendidos),
                    'productosVendidosMes' => intval($productosVendidosMes),
                    'clientesNuevos' => intval($clientesNuevos),
                    'ventasTrend' => number_format($crecimientoMoM, 2) . '%',
                    'ticketPromedio' => floatval($ticketPromedio),
                    'tasaRetencion' => floatval($tasaRetencion),
                    'margenEstimado' => floatval($totalUtilidadReal) // Para mantener compatibilidad si el front aún usa este nombre
                ],
                'ventasPorMes' => $ventasPorMes,
                'ventasPorDia' => array_map(function($d) { return ['dia' => $d['dia'], 'total' => $d['total']]; }, $datosDiariosArr),
                'ventasPorHora' => $ventasPorHora,
                'ventasPorDiaSemana' => $ventasPorDiaSemana,
                'ventasPorMarca' => $ventasPorMarca,
                'pedidosPorDia' => array_map(function($d) { return ['dia' => $d['dia'], 'cantidad' => $d['pedidos']]; }, $datosDiariosArr),
                'productosVendidosPorDia' => array_map(function($d) { return ['dia' => $d['dia'], 'cantidad' => $d['productos']]; }, $datosDiariosArr),
                'clientesNuevosPorDia' => array_map(function($d) { return ['dia' => $d['dia'], 'cantidad' => $d['clientes']]; }, $datosDiariosArr),
                'productosMasVendidos' => $productosMasVendidos,
                'pedidosPorEstado' => $pedidosPorEstado,
                'ultimosPedidos' => $ultimosPedidos,
                'ultimasReservaciones' => $ultimasReservaciones,
                'ventasPorCategoria' => $ventasPorCategoria,
                'topClientes' => $topClientes,
                'clientesTrend' => $clientesTrend,
                'metodosPago' => $metodosPago,
                'ventasPorUbicacion' => $ventasPorUbicacion
            ]);

        }
        elseif (strpos($path, 'ventas') !== false) {
            // Reporte de ventas
            $fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : date('Y-m-01');
            $fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : date('Y-m-d');
            
            $stmt = $pdo->prepare("
                SELECT p.*, c.nombre as cliente_nombre 
                FROM pedidos p 
                LEFT JOIN usuarios c ON p.usuario_id = c.id 
                WHERE p.fecha BETWEEN ? AND ? AND p.estado != 'cancelado'
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
            $stmt = $pdo->prepare("SELECT * FROM reportes ORDER BY fecha DESC");
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

        $stmt = $pdo->prepare("INSERT INTO reportes (tipo, contenido) VALUES (?, ?)");
        
        if ($stmt->execute([$input['tipo'], $input['contenido'] ?? null])) {
            echo json_encode([
                'success' => true,
                'message' => 'Reporte creado exitosamente',
                'id' => $pdo->lastInsertId()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al crear reporte']);
        }
        break;
}
?>
