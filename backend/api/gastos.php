<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM gastos_operativos WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $db->prepare("SELECT * FROM gastos_operativos ORDER BY fecha DESC, id DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        if (!isset($input['concepto']) || !isset($input['monto']) || !isset($input['fecha'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Faltan campos requeridos']);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO gastos_operativos (concepto, monto, fecha, categoria, metodo_pago, referencia, notas, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([
            $input['concepto'], 
            $input['monto'], 
            $input['fecha'], 
            $input['categoria'] ?? 'Otros',
            $input['metodo_pago'] ?? 'Efectivo',
            $input['referencia'] ?? null,
            $input['notas'] ?? null,
            $input['estado'] ?? 'Pagado'
        ])) {
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al crear gasto']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }
        $stmt = $db->prepare("UPDATE gastos_operativos SET concepto = ?, monto = ?, fecha = ?, categoria = ?, metodo_pago = ?, referencia = ?, notas = ?, estado = ? WHERE id = ?");
        if ($stmt->execute([
            $input['concepto'], 
            $input['monto'], 
            $input['fecha'], 
            $input['categoria'] ?? 'Otros',
            $input['metodo_pago'] ?? 'Efectivo',
            $input['referencia'] ?? null,
            $input['notas'] ?? null,
            $input['estado'] ?? 'Pagado',
            $id
        ])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al actualizar gasto']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }
        $stmt = $db->prepare("DELETE FROM gastos_operativos WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al eliminar gasto']);
        }
        break;
}
?>
