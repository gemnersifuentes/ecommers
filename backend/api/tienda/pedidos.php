<?php
// backend/api/tienda/pedidos.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!$data) {
            throw new Exception("Datos inválidos");
        }
        
        // Validar datos básicos
        if (empty($data->items) || !is_array($data->items)) {
            throw new Exception("El carrito está vacío");
        }
        
        
        $db->beginTransaction();
        
        // Mapeo seguro de datos shipping
        $shipping = $data->shipping ?? [];
        // Convert to array if object
        if (is_object($shipping)) {
            $shipping = (array)$shipping;
        }

        $nombre = $shipping['nombre'] ?? '';
        $direccion = $shipping['direccion'] ?? '';
        $departamento = $shipping['departamento'] ?? '';
        $provincia = $shipping['provincia'] ?? '';
        $distrito = $shipping['distrito'] ?? '';
        $referencia = $shipping['referencia'] ?? '';
        $cp = $shipping['cp'] ?? '';
        $telefono = $shipping['telefono'] ?? '';
        $dni = $shipping['dni'] ?? '';
        
        // Usuario ID logic
        $usuario_id = $data->usuario_id ?? 0; 
        if ($usuario_id == 0 && isset($data->userId)) $usuario_id = $data->userId;

        // Método de envío y dirección
        $metodo_envio = $data->metodo_envio ?? 'domicilio';
        $direccion_id = $data->direccion_id ?? null;
        $guardar_direccion = $data->guardar_direccion ?? false;

        // Generar numero de pedido
        $numero_pedido = 'ORD-' . date('ymd') . '-' . rand(100, 999);
        
        // Si hay direccion_id, llenar datos desde DB (Optional override or fill missing)
        // ... (Logic kept simple, trusting frontend sends clean data mostly)
        
        // Si es dirección nueva y se debe guardar
        if (!$direccion_id && $guardar_direccion && $metodo_envio === 'domicilio' && $direccion) {
            $stmt = $db->prepare("
                INSERT INTO direcciones 
                (usuario_id, nombre_destinatario, telefono, direccion, departamento, 
                 provincia, distrito, codigo_postal, referencia, es_predeterminada) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            ");
            
            $stmt->execute([
                $usuario_id,
                $nombre,
                $telefono,
                $direccion,
                $departamento,
                $provincia,
                $distrito,
                $cp,
                $referencia
            ]);
            
            $direccion_id = $db->lastInsertId();
        }
        
        // Preparar JSON de datos de envío
        $datos_envio_json = json_encode($shipping);

        // 1. Insertar Pedido (UPDATED SCHEMA)
        // Columns present: usuario_id, dni, direccion_id, metodo_envio, datos_envio, estado, referencia, numero_pedido, total, fecha
        $query = "INSERT INTO pedidos 
                 (usuario_id, direccion_id, metodo_envio, total, estado, fecha, datos_envio, referencia, dni, numero_pedido) 
                 VALUES (?, ?, ?, ?, 'Pagado', NOW(), ?, ?, ?, ?)";
                 
        $stmt = $db->prepare($query);
        $stmt->execute([
            $usuario_id,
            $direccion_id,
            $metodo_envio,
            $data->total,
            $datos_envio_json,
            $referencia,
            $dni,
            $numero_pedido
        ]);
        
        $pedido_id = $db->lastInsertId();
        
        // 2. Insertar Detalles
        $queryDetalle = "INSERT INTO detalle_pedido (pedido_id, producto_id, variacion_id, cantidad, subtotal) VALUES (?, ?, ?, ?, ?)";
        $stmtDetalle = $db->prepare($queryDetalle);
        
        foreach ($data->items as $item) {
            $precio = $item->precio ?? 0;
            $cantidad = $item->cantidad ?? 1;
            $subtotal = $precio * $cantidad;
            $variacion_id = !empty($item->variacion_id) ? $item->variacion_id : null;
            
            $stmtDetalle->execute([
                $pedido_id,
                $item->id, // producto_id
                $variacion_id,
                $cantidad,
                $subtotal
            ]);
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Pedido creado exitosamente', 
            'pedido_id' => $pedido_id,
            'numero_pedido' => $numero_pedido
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        file_put_contents('error_log_pedidos.txt', date('Y-m-d H:i:s') . " Error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Check if fetching single order
        if (isset($_GET['id'])) {
            $pedido_id = $_GET['id'];
            
            // Fetch order header
            $query = "SELECT *, fecha as fecha_creacion 
                      FROM pedidos 
                      WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$pedido_id]);
            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$pedido) {
                throw new Exception("Pedido no encontrado");
            }
            
            // Fetch order items with product details
            $queryItems = "SELECT dp.*, prod.nombre, prod.imagen, 
                          COALESCE(pv.precio, prod.precio_base) as precio_actual,
                          pv.id as variacion_id, 
                          CONCAT(a.nombre, ': ', av.valor) as variacion_nombre
                          FROM detalle_pedido dp
                          INNER JOIN productos prod ON dp.producto_id = prod.id
                          LEFT JOIN producto_variantes pv ON dp.variacion_id = pv.id
                          LEFT JOIN atributo_valores av ON pv.atributo_valor_id = av.id
                          LEFT JOIN atributos a ON av.atributo_id = a.id
                          WHERE dp.pedido_id = ?";
            $stmtItems = $db->prepare($queryItems);
            $stmtItems->execute([$pedido_id]);
            $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
            
            
            $pedido['items'] = $items;
            echo json_encode($pedido);
            
        } else {
            // Fetch all orders for user
            $usuario_id = $_GET['usuario_id'] ?? 0;
            
            if (!$usuario_id) {
                throw new Exception("ID de usuario requerido");
            }
            
            // Fetch orders
            $query = "SELECT id, numero_pedido, total, estado, fecha as fecha_creacion
                      FROM pedidos
                      WHERE usuario_id = ?
                      ORDER BY fecha DESC";
                      
            $stmt = $db->prepare($query);
            $stmt->execute([$usuario_id]);
            $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Fetch items for each order
            foreach ($pedidos as &$pedido) {
                $queryItems = "SELECT dp.*, prod.nombre, prod.imagen, 
                              COALESCE(pv.precio, prod.precio_base) as precio_actual,
                              pv.id as variacion_id, 
                              CONCAT(a.nombre, ': ', av.valor) as variacion_nombre
                              FROM detalle_pedido dp
                              INNER JOIN productos prod ON dp.producto_id = prod.id
                              LEFT JOIN producto_variantes pv ON dp.variacion_id = pv.id
                              LEFT JOIN atributo_valores av ON pv.atributo_valor_id = av.id
                              LEFT JOIN atributos a ON av.atributo_id = a.id
                              WHERE dp.pedido_id = ?";
                $stmtItems = $db->prepare($queryItems);
                $stmtItems->execute([$pedido['id']]);
                $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
                
                $pedido['items'] = $items;
                $pedido['items_count'] = count($items);
            }
            
            echo json_encode($pedidos);
        }
        
    } catch (Exception $e) {
        // Log detailed error
        error_log("Error in pedidos.php GET: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        
        http_response_code(500);
        echo json_encode([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
