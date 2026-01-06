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

// Determinar origen de datos (JSON o FormData)
$data = json_decode(file_get_contents("php://input"));

if (!$data && !empty($_POST)) {
    // Si no es JSON, intentar reconstruir desde $_POST (FormData)
    // Función auxiliar para limpiar valores "null" enviados como string por FormData
    $cleanValue = function($val) {
        if (is_string($val) && strtolower($val) === 'null') return null;
        return $val;
    };

    $data = new stdClass();
    $data->usuario_id = $cleanValue($_POST['usuario_id'] ?? null);
    $data->correo = $cleanValue($_POST['correo'] ?? null);
    $data->total = $cleanValue($_POST['total'] ?? 0);
    $data->metodo_envio = $cleanValue($_POST['metodo_envio'] ?? 'domicilio');
    $data->metodo_pago = $cleanValue($_POST['metodo_pago'] ?? null);
    $data->guardar_direccion = isset($_POST['guardar_direccion']) ? ($_POST['guardar_direccion'] === 'true' || $_POST['guardar_direccion'] == 1) : false;
    $data->direccion_id = $cleanValue($_POST['direccion_id'] ?? null);
    
    if (isset($_POST['items'])) {
        $data->items = json_decode($_POST['items']);
    }
    
    if (isset($_POST['shipping'])) {
        $shipping_raw = json_decode($_POST['shipping'], true);
        if (is_array($shipping_raw)) {
            foreach ($shipping_raw as $k => $v) {
                $shipping_raw[$k] = $cleanValue($v);
            }
        }
        $data->shipping = (object)$shipping_raw;
    }
} else if ($data) {
    // Si es JSON, también asegurar que IDs no sean strings vacíos o "null"
    $cleanValue = function($val) {
        if (is_string($val) && (strtolower($val) === 'null' || trim($val) === '')) return null;
        return $val;
    };
    $data->direccion_id = $cleanValue($data->direccion_id ?? null);
    $data->usuario_id = $cleanValue($data->usuario_id ?? null);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!$data && empty($_POST)) {
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
        
        // Usuario ID and Guest logic
        $usuario_id = !empty($data->usuario_id) ? $data->usuario_id : null;
        $correo = !empty($data->correo) ? $data->correo : ($shipping['correo'] ?? null);
        
        if (!$usuario_id && $correo) {
            // Buscar si ya existe un usuario con ese correo
            $stmtUser = $db->prepare("SELECT id FROM usuarios WHERE correo = ?");
            $stmtUser->execute([$correo]);
            $userFound = $stmtUser->fetch(PDO::FETCH_ASSOC);
            
            if ($userFound) {
                $usuario_id = $userFound['id'];
            } else {
                // Crear usuario invitado
                $nombre_invitado = $shipping['nombre'] ?? 'Invitado';
                $clave_temp = bin2hex(random_bytes(8));
                $clave_hash = password_hash($clave_temp, PASSWORD_BCRYPT);
                
                $stmtNewUser = $db->prepare("
                    INSERT INTO usuarios (nombre, correo, usuario, clave, rol, telefono, direccion) 
                    VALUES (?, ?, ?, ?, 'cliente', ?, ?)
                ");
                $stmtNewUser->execute([
                    $nombre_invitado,
                    $correo,
                    $correo, // Usamos el correo como nombre de usuario
                    $clave_hash,
                    $shipping['telefono'] ?? null,
                    $shipping['direccion'] ?? null
                ]);
                $usuario_id = $db->lastInsertId();
            }
        }

        // Método de envío y dirección
        $metodo_envio = $data->metodo_envio ?? 'domicilio';
        $direccion_id = !empty($data->direccion_id) ? $data->direccion_id : null;
        $guardar_direccion = $data->guardar_direccion ?? false;

        // Generar numero de pedido
        $numero_pedido = 'ORD-' . date('ymd') . '-' . rand(100, 999);
        
        // Si hay direccion_id, llenar datos desde DB (Optional override or fill missing)
        if ($direccion_id && empty($direccion)) {
            $stmtDir = $db->prepare("SELECT * FROM direcciones WHERE id = ?");
            $stmtDir->execute([$direccion_id]);
            $dirData = $stmtDir->fetch(PDO::FETCH_ASSOC);
            if ($dirData) {
                $nombre = $dirData['nombre_contacto'];
                $telefono = $dirData['telefono'];
                $direccion = $dirData['direccion'];
                $departamento = $dirData['departamento'];
                $provincia = $dirData['provincia'];
                $distrito = $dirData['distrito'];
                $cp = $dirData['cod_postal'];
                $referencia = $dirData['referencia'];
            }
        }
        
        // Si es dirección nueva y se debe guardar (FIXED COLUMN NAMES)
        if (!$direccion_id && $guardar_direccion && $metodo_envio === 'domicilio' && $direccion) {
            $stmt = $db->prepare("
                INSERT INTO direcciones 
                (usuario_id, nombre_contacto, telefono, direccion, departamento, 
                 provincia, distrito, cod_postal, referencia, es_principal) 
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

        // Procesar Comprobante de Pago (File Upload)
        $comprobante_pago = null;
        if (isset($_FILES['comprobante']) && $_FILES['comprobante']['error'] === UPLOAD_ERR_OK) {
            $file_tmp = $_FILES['comprobante']['tmp_name'];
            $file_name = $_FILES['comprobante']['name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            $new_file_name = $numero_pedido . '_' . time() . '.' . $file_ext;
            $upload_path = __DIR__ . '/../../uploads/comprobantes/' . $new_file_name;
            
            if (move_uploaded_file($file_tmp, $upload_path)) {
                $comprobante_pago = $new_file_name;
            }
        }

        // Definir estado inicial según método de pago (usando SLUGS)
        $metodo_pago_final = $data->metodo_pago ?? 'tarjeta';
        $estado_inicial = 'pagado';
        
        // Manual methods or bank transfers require verification
        if (in_array($metodo_pago_final, ['yape_manual', 'plin', 'transferencia'])) {
            $estado_inicial = 'pendiente_verificacion';
        } elseif (in_array($metodo_pago_final, ['pagoefectivo', 'contraentrega'])) {
            $estado_inicial = 'pendiente';
        }

        // 1. Insertar Pedido (UPDATED SCHEMA WITH COMPROBANTE)
        $query = "INSERT INTO pedidos 
                 (usuario_id, direccion_id, metodo_envio, metodo_pago, comprobante_pago, total, estado, fecha, datos_envio, referencia, dni, numero_pedido) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)";
                 
        $stmt = $db->prepare($query);
        $stmt->execute([
            $usuario_id,
            $direccion_id,
            $metodo_envio,
            $data->metodo_pago ?? 'Tarjeta de Crédito/Débito',
            $comprobante_pago,
            $data->total ?? 0,
            $estado_inicial,
            $datos_envio_json,
            $referencia,
            $dni,
            $numero_pedido
        ]);
        
        $pedido_id = $db->lastInsertId();
        
        // 2. Insertar Detalles y Descontar Stock
        $queryDetalle = "INSERT INTO detalle_pedido (pedido_id, producto_id, variacion_id, precio_regular, cantidad, subtotal) VALUES (?, ?, ?, ?, ?, ?)";
        $stmtDetalle = $db->prepare($queryDetalle);

        // Preparar statements de stock para eficiencia
        $stmtStockProd = $db->prepare("UPDATE productos SET stock = stock - ? WHERE id = ?");
        $stmtStockVar = $db->prepare("UPDATE producto_variantes SET stock = stock - ? WHERE id = ?");
        
        foreach ($data->items as $item) {
            $precio = $item->precio ?? 0;
            $precio_regular = $item->precio_regular ?? $precio;
            $cantidad = $item->cantidad ?? 1;
            $subtotal = $precio * $cantidad;
            $variacion_id = !empty($item->variacion_id) ? $item->variacion_id : null;
            $producto_id = $item->id ?? $item->producto_id;
            
            // Insertar detalle
            $stmtDetalle->execute([
                $pedido_id,
                $producto_id,
                $variacion_id,
                $precio_regular,
                $cantidad,
                $subtotal
            ]);

            // Descontar stock
            if ($variacion_id) {
                $stmtStockVar->execute([$cantidad, $variacion_id]);
            } else {
                $stmtStockProd->execute([$cantidad, $producto_id]);
            }
        }
        
        $db->commit();
        
        // Enviar Correo de Confirmación
        try {
            require_once __DIR__ . '/../../helpers/MailHelper.php';
            if (!empty($correo)) {
                MailHelper::sendOrderConfirmationEmail($correo, $nombre, $numero_pedido, $data->total, $data->items, $data->shipping ?? null);
            }
        } catch (Exception $mailEx) {
            error_log("Error enviando correo de confirmación: " . $mailEx->getMessage());
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Pedido creado exitosamente', 
            'pedido_id' => $pedido_id,
            'numero_pedido' => $numero_pedido
        ]);
        
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        $trace = $e->getTraceAsString();
        error_log("Error en pedidos.php: " . $e->getMessage() . "\nStack trace: " . $trace);
        file_put_contents('error_log_pedidos.txt', date('Y-m-d H:i:s') . " Error: " . $e->getMessage() . "\n" . $trace . "\n", FILE_APPEND);
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
            $query = "SELECT id, numero_pedido, total, estado, metodo_envio, datos_envio, fecha as fecha_creacion
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
