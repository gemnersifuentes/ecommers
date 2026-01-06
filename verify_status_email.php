<?php
// Simular entorno para pedidos.php
$_SERVER['REQUEST_METHOD'] = 'PUT';
$id = 904; // ID del pedido reciente
$method = 'PUT';

// Simular input JSON
$input = [
    'estado' => 'en_preparacion'
];
$tempInput = tempnam(sys_get_temp_dir(), 'php_input');
file_put_contents($tempInput, json_encode($input));

// Redefinir la lectura de php://input es difícil, así que usaremos una técnica de mocking si es posible
// Pero pedidos.php usa: $input = json_decode(file_get_contents('php://input'), true);
// Vamos a crear un script que parchee temporalmente pedidos.php para el test o simplemente llamar a las funciones de MailHelper directamente para validar el diseño.

// Mejor: Validar que MailHelper responde bien con datos reales
require_once 'backend/config/conexion.php';
require_once 'backend/helpers/MailHelper.php';

$database = new Database();
$db = $database->getConnection();

// Fetch order data
$stmtInfo = $db->prepare("
    SELECT p.numero_pedido, p.total, p.datos_envio, u.correo, u.nombre 
    FROM pedidos p 
    LEFT JOIN usuarios u ON p.usuario_id = u.id 
    WHERE p.id = ?
");
$stmtInfo->execute([$id]);
$info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

if (!$info) {
    die("Pedido $id no encontrado");
}

$stmtItems = $db->prepare("
    SELECT 
        dp.cantidad,
        dp.subtotal,
        p.nombre,
        (dp.subtotal / dp.cantidad) as precio,
        v.atributo as variacion_nombre
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    LEFT JOIN variaciones v ON dp.variacion_id = v.id
    WHERE dp.pedido_id = ?
");
$stmtItems->execute([$id]);
$items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

$shipping = !empty($info['datos_envio']) ? json_decode($info['datos_envio'], true) : null;

echo "Enviando correo de prueba para Pedido #" . $info['numero_pedido'] . " a " . $info['correo'] . "...\n";

$result = MailHelper::sendStatusUpdateEmail(
    $info['correo'],
    $info['nombre'] ?? 'Cliente',
    $info['numero_pedido'],
    'en_preparacion',
    $info['total'],
    $items,
    $shipping
);

if ($result['success']) {
    echo "¡ÉXITO! Correo enviado correctamente.\n";
} else {
    echo "ERROR: " . $result['message'] . "\n";
}
?>
