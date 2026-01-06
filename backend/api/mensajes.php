<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../helpers/MailHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Listar mensajes (Para Admin)
        try {
            $stmt = $db->prepare("SELECT m.*, u.usuario as respondido_por FROM mensajes_contacto m LEFT JOIN usuarios u ON m.usuario_respuesta_id = u.id ORDER BY m.fecha_creacion DESC");
            $stmt->execute();
            $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($mensajes);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener mensajes: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Crear nuevo mensaje (Público o Responder desde Admin)
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['id']) && isset($data['respuesta'])) {
            // Es una respuesta desde el Admin
            responderMensaje($db, $data);
        } else {
            // Es un mensaje nuevo desde la web pública
            crearMensaje($db, $data);
        }
        break;

    case 'PUT':
        // Marcar como leído o actualizar respuesta
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['id'])) {
            try {
                if (isset($data['estado'])) {
                    $stmt = $db->prepare("UPDATE mensajes_contacto SET estado = ? WHERE id = ?");
                    $stmt->execute([$data['estado'], $data['id']]);
                }
                echo json_encode(["success" => true, "message" => "Mensaje actualizado"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Error al actualizar mensaje: " . $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            try {
                $stmt = $db->prepare("DELETE FROM mensajes_contacto WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                echo json_encode(["success" => true, "message" => "Mensaje eliminado"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Error al eliminar mensaje: " . $e->getMessage()]);
            }
        }
        break;
}

function crearMensaje($db, $data) {
    if (empty($data['nombre']) || empty($data['email']) || empty($data['mensaje'])) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan campos obligatorios"]);
        return;
    }

    try {
        $stmt = $db->prepare("INSERT INTO mensajes_contacto (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['nombre'],
            $data['email'],
            $data['telefono'] ?? null,
            $data['asunto'] ?? 'Consulta desde la web',
            $data['mensaje']
        ]);
        echo json_encode(["success" => true, "message" => "Mensaje enviado correctamente"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar el mensaje: " . $e->getMessage()]);
    }
}

function responderMensaje($db, $data) {
    if (empty($data['id']) || empty($data['respuesta'])) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos para la respuesta"]);
        return;
    }

    try {
        // Obtener datos del mensaje original
        $stmtOrig = $db->prepare("SELECT * FROM mensajes_contacto WHERE id = ?");
        $stmtOrig->execute([$data['id']]);
        $mensajeOrig = $stmtOrig->fetch(PDO::FETCH_ASSOC);

        if (!$mensajeOrig) {
            http_response_code(404);
            echo json_encode(["error" => "Mensaje no encontrado"]);
            return;
        }

        // Actualizar base de datos
        $stmt = $db->prepare("UPDATE mensajes_contacto SET respuesta = ?, fecha_respuesta = NOW(), estado = 'RESPONDIDO', usuario_respuesta_id = ? WHERE id = ?");
        $stmt->execute([$data['respuesta'], $data['usuario_id'] ?? null, $data['id']]);

        // Enviar correo de respuesta
        $mailHelper = new MailHelper();
        $asunto = "Respuesta a su consulta: " . $mensajeOrig['asunto'];
        $cuerpo = "
            <h2>Hola " . $mensajeOrig['nombre'] . ",</h2>
            <p>Hemos recibido su consulta y un miembro de nuestro equipo le ha respondido:</p>
            <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0;'>
                <strong>Su mensaje:</strong><br>
                <em>" . nl2br(htmlspecialchars($mensajeOrig['mensaje'])) . "</em>
            </div>
            <div style='background-color: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;'>
                <strong>Nuestra respuesta:</strong><br>
                " . nl2br(htmlspecialchars($data['respuesta'])) . "
            </div>
            <p>Gracias por contactarnos. Si tiene más dudas, puede responder a este correo.</p>
            <p>Atentamente,<br>El equipo de soporte.</p>
        ";

        $mailSent = $mailHelper->sendEmail($mensajeOrig['email'], $asunto, $cuerpo);

        echo json_encode([
            "success" => true, 
            "message" => "Respuesta enviada y registrada",
            "mail_sent" => $mailSent
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al procesar la respuesta: " . $e->getMessage()]);
    }
}
?>
