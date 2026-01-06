<?php
// backend/api/tienda/mercado_pago_handler.php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/conexion.php';

use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;

header('Content-Type: application/json');

// Get keys from config or environment (using placeholders for now)
$accessToken = 'APP_USR-7170104772096898-122118-9c5952f9c9f0c6c7b9b1875c7b9b1875-123456789'; // REEMPLAZAR CON TU TOKEN REAL
MercadoPagoConfig::setAccessToken($accessToken);
MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'create_preference') {
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || empty($data->items)) {
                throw new Exception("Datos de pedido inválidos");
            }

            $client = new PreferenceClient();
            
            $items = [];
            foreach ($data->items as $item) {
                $items[] = [
                    "id" => $item->id,
                    "title" => $item->nombre ?? "Producto TiendaTEC",
                    "quantity" => (int)$item->cantidad,
                    "unit_price" => (float)$item->precio,
                    "currency_id" => "PEN"
                ];
            }

            $preference = $client->create([
                "items" => $items,
                "back_urls" => [
                    "success" => "http://localhost:5173/checkout?step=3&status=success",
                    "failure" => "http://localhost:5173/checkout?step=2&status=failure",
                    "pending" => "http://localhost:5173/checkout?step=3&status=pending"
                ],
                "auto_return" => "approved",
                "notification_url" => "https://tu-webhook-real.com/backend/api/tienda/mercado_pago_handler.php?action=webhook", // REEMPLAZAR
                "external_reference" => $data->numero_pedido ?? 'ORD-' . time(),
                "payment_methods" => [
                    "excluded_payment_types" => [
                        ["id" => "ticket"]
                    ],
                    "installments" => 12
                ]
            ]);

            echo json_encode([
                "success" => true,
                "preference_id" => $preference->id,
                "init_point" => $preference->init_point
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } elseif ($action === 'webhook') {
        // Log notification to a file for debugging
        $json = file_get_contents('php://input');
        file_put_contents('mercado_pago_log.txt', date('Y-m-d H:i:s') . " - Webhook: " . $json . "\n", FILE_APPEND);
        
        $data = json_decode($json);
        
        if (isset($data->type) && $data->type === 'payment') {
            try {
                $payment_id = $data->data->id;
                $client = new PaymentClient();
                $payment = $client->get($payment_id);
                
                $external_reference = $payment->external_reference;
                $status = $payment->status;
                
                if ($status === 'approved') {
                    $database = new Database();
                    $db = $database->getConnection();
                    
                    $stmt = $db->prepare("UPDATE pedidos SET estado = 'pagado', metodo_pago = 'Mercado Pago' WHERE numero_pedido = ?");
                    $stmt->execute([$external_reference]);
                    
                    file_put_contents('mercado_pago_log.txt', date('Y-m-d H:i:s') . " - Pedido $external_reference aprobado.\n", FILE_APPEND);
                }
                
                http_response_code(200);
                echo json_encode(["status" => "ok"]);
            } catch (Exception $e) {
                file_put_contents('mercado_pago_log.txt', date('Y-m-d H:i:s') . " - Error Webhook: " . $e->getMessage() . "\n", FILE_APPEND);
                http_response_code(500);
            }
        } else {
             http_response_code(200);
             echo json_encode(["status" => "skipped"]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?>
