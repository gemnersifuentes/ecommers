<?php
/**
 * worker_correos.php
 * Procesa la cola de correos (cola_correos) de forma eficiente.
 * Puede ser llamado por un cron job cada minuto o de forma manual.
 */

// Aumentar tiempo límite y memoria
set_time_limit(300); // 5 minutos por lote
ini_set('memory_limit', '256M');

require_once __DIR__ . '/backend/config/conexion.php';
require_once __DIR__ . '/backend/helpers/MailHelper.php';

$database = new Database();
$db = $database->getConnection();

// Lote de correos a procesar por ejecución
$batchSize = 25; 

echo "--- Iniciando Worker de Correos: " . date('Y-m-d H:i:s') . " ---\n";

try {
    // 1. Obtener correos pendientes
    $stmt = $db->prepare("
        SELECT * FROM cola_correos 
        WHERE estado = 'pendiente' 
        OR (estado = 'fallido' AND reintentos < 3)
        ORDER BY fecha_creacion ASC 
        LIMIT ?
    ");
    $stmt->bindValue(1, $batchSize, PDO::PARAM_INT);
    $stmt->execute();
    $emails = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($emails)) {
        echo "No hay correos pendientes por enviar.\n";
        exit;
    }

    echo "Procesando " . count($emails) . " correos...\n";

    $stmtUpdate = $db->prepare("
        UPDATE cola_correos 
        SET estado = ?, reintentos = reintentos + 1, mensaje_error = ?, fecha_creacion = NOW() 
        WHERE id = ?
    ");

    foreach ($emails as $email) {
        echo "Enviando a: {$email['destinatario']}... ";
        
        $res = MailHelper::sendEmail($email['destinatario'], $email['asunto'], $email['cuerpo']);
        
        if ($res['success']) {
            $stmtUpdate->execute(['enviado', null, $email['id']]);
            echo "EXITO\n";
        } else {
            $stmtUpdate->execute(['fallido', $res['message'], $email['id']]);
            echo "FALLO: " . $res['message'] . "\n";
        }
        
        // Pequeña pausa para no saturar el servidor SMTP
        usleep(100000); // 100ms
    }

    echo "--- Lote finalizado: " . date('Y-m-d H:i:s') . " ---\n";

} catch (Exception $e) {
    echo "Error crítico en el worker: " . $e->getMessage() . "\n";
}
