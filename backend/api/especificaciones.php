<?php
require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        header('Content-Type: application/json');
        if (isset($_GET['producto_id'])) {
            try {
                $stmt = $db->prepare("SELECT * FROM especificaciones WHERE producto_id = ? ORDER BY orden ASC, id ASC");
                $stmt->execute([$_GET['producto_id']]);
                $specs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($specs ?: []); // Ensure empty array if null/false
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Falta producto_id"]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->producto_id) || !isset($data->especificaciones)) {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos"]);
            break;
        }

        try {
            $db->beginTransaction();

            // 1. Eliminar especificaciones existentes
            $stmt = $db->prepare("DELETE FROM especificaciones WHERE producto_id = ?");
            $stmt->execute([$data->producto_id]);

            // 2. Insertar nuevas
            if (!empty($data->especificaciones)) {
                $stmt = $db->prepare("INSERT INTO especificaciones (producto_id, nombre, valor, orden) VALUES (?, ?, ?, ?)");
                $orden = 0;
                foreach ($data->especificaciones as $spec) {
                    $stmt->execute([
                        $data->producto_id,
                        $spec->nombre,
                        $spec->valor,
                        $orden++
                    ]);
                }
            }

            $db->commit();
            echo json_encode(["message" => "Especificaciones actualizadas correctamente"]);

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Error al guardar: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido"]);
        break;
}
?>
