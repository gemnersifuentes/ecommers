<?php
require_once __DIR__ . '/../config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $db->query("SELECT * FROM ajustes LIMIT 1");
            $ajustes = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($ajustes) {
                // Decodificar JSON si existe
                if (isset($ajustes['redes_sociales'])) {
                    $ajustes['redes_sociales'] = json_decode($ajustes['redes_sociales'], true);
                }
                echo json_encode($ajustes);
            } else {
                echo json_encode(['error' => 'No se encontraron ajustes']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['message' => 'Datos inválidos']);
            break;
        }

        try {
            // Asegurar que redes_sociales sea JSON
            if (isset($data['redes_sociales']) && is_array($data['redes_sociales'])) {
                $data['redes_sociales'] = json_encode($data['redes_sociales']);
            }

            $fields = [];
            $params = [];
            
            // Campos permitidos para actualizar
            $allowedFields = [
                'nombre_empresa', 'ruc', 'telefono', 'correo_contacto', 
                'direccion', 'mision', 'vision', 'smtp_host', 
                'smtp_user', 'smtp_pass', 'smtp_port', 'redes_sociales',
                'logo_url', 'favicon_url', 'color_primario', 'color_secundario',
                'google_client_id'
            ];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }

            if (empty($fields)) {
                echo json_encode(['message' => 'Nada que actualizar']);
                break;
            }

            $query = "UPDATE ajustes SET " . implode(", ", $fields) . " WHERE id = 1";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute($params)) {
                echo json_encode(['success' => true, 'message' => 'Ajustes actualizados correctamente']);
            } else {
                throw new Exception("Error al ejecutar la actualización");
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
