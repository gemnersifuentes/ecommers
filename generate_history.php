<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $pdo = $database->getConnection();
    if (!$pdo) die("Conexión fallida");

    // 1. Obtener datos base
    $usuarios = $pdo->query("SELECT id FROM usuarios WHERE rol = 'cliente'")->fetchAll(PDO::FETCH_COLUMN);
    $productos = $pdo->query("SELECT id, precio_base FROM productos WHERE activo = 1")->fetchAll(PDO::FETCH_ASSOC);

    if (empty($usuarios) || empty($productos)) {
        die("Error: Se necesitan usuarios (clientes) y productos activos para generar datos.");
    }

    echo "Iniciando generación de datos históricos (2024-2025)...\n";

    $estados = ['Completado', 'Pagado', 'En proceso', 'Entregado'];
    $años = [2024, 2025];
    $totalPedidosGenerados = 0;
    $contadorGlobal = rand(1000, 9999);

    foreach ($años as $año) {
        echo "Generando para el año $año...\n";
        
        for ($mes = 1; $mes <= 12; $mes++) {
            $currentYear = intval(date('Y'));
            $currentMonth = intval(date('m'));
            if ($año == $currentYear && $mes > $currentMonth) break;

            // Cantidad de pedidos por mes: más en dic/nov (temporada alta)
            $multiplicadorTemporada = ($mes >= 11) ? 1.5 : 1;
            $cantidadPedidosMes = rand(20, 40) * $multiplicadorTemporada;
            
            for ($i = 0; $i < $cantidadPedidosMes; $i++) {
                try {
                    $dia = rand(1, 28);
                    $hora = rand(8, 22);
                    $min = rand(0, 59);
                    $fecha = "$año-" . str_pad($mes, 2, '0', STR_PAD_LEFT) . "-" . str_pad($dia, 2, '0', STR_PAD_LEFT) . " $hora:$min:00";
                    
                    $usuarioId = $usuarios[array_rand($usuarios)];
                    $estado = $estados[array_rand($estados)];
                    $contadorGlobal++;
                    $numeroPedido = "ORD-" . $año . str_pad($mes, 2, '0', STR_PAD_LEFT) . str_pad($contadorGlobal, 6, '0', STR_PAD_LEFT);

                    // Insertar pedido
                    $stmt = $pdo->prepare("INSERT INTO pedidos (numero_pedido, fecha, total, estado, usuario_id, metodo_envio) VALUES (?, ?, 0, ?, ?, 'domicilio')");
                    $stmt->execute([$numeroPedido, $fecha, $estado, $usuarioId]);
                    $pedidoId = $pdo->lastInsertId();

                    // Insertar detalles (1 a 5 productos por pedido)
                    $numItems = rand(1, 5);
                    $totalPedido = 0;
                    
                    for ($j = 0; $j < $numItems; $j++) {
                        $producto = $productos[array_rand($productos)];
                        $cantidad = rand(1, 3);
                        $subtotal = $producto['precio_base'] * $cantidad;
                        
                        $stmtD = $pdo->prepare("INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)");
                        $stmtD->execute([$pedidoId, $producto['id'], $cantidad, $subtotal]);
                        
                        $totalPedido += $subtotal;
                    }

                    // Actualizar total del pedido
                    $pdo->prepare("UPDATE pedidos SET total = ? WHERE id = ?")->execute([$totalPedido, $pedidoId]);
                    $totalPedidosGenerados++;
                } catch (Exception $e) {
                    // Ignorar errores individuales (ej duplicados) y seguir
                    continue;
                }
            }
        }
    }

    echo "\n¡Finalizado! Se generaron $totalPedidosGenerados nuevos registros de venta.\n";

} catch (Exception $e) {
    echo "Error crítico: " . $e->getMessage();
}
