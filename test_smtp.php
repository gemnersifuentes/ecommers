require_once __DIR__ . '/backend/helpers/PHPMailer/src/Exception.php';
require_once __DIR__ . '/backend/helpers/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/backend/helpers/PHPMailer/src/SMTP.php';
require_once __DIR__ . '/backend/helpers/MailHelper.php';
require_once __DIR__ . '/backend/config/conexion.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Habilitar salida de depuración detallada
$mail = new PHPMailer(true);
try {
    $config = MailHelper::getMailConfig();
    if (!$config) {
        die("Error: No se pudo cargar la configuración de correo.");
    }

    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host       = $config['smtp_host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp_user'];
    $mail->Password   = $config['smtp_pass'];
    $mail->SMTPSecure = ($config['smtp_port'] == 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $config['smtp_port'];

    $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
    $mail->addAddress($config['correo_contacto']); // Enviarse a sí mismo para probar

    $mail->isHTML(true);
    $mail->Subject = 'Prueba de Conexión SMTP - TiendaTEC';
    $mail->Body    = 'Si estás viendo esto, la configuración SMTP es correcta y el correo se envió.';

    echo "--- Iniciando prueba de envío SMTP ---\n";
    $mail->send();
    echo "\n--- ¡Éxito! El correo se envió correctamente ---\n";
} catch (Exception $e) {
    echo "\n--- ERROR: No se pudo enviar el correo ---\n";
    echo "Mensaje de PHPMailer: " . $mail->ErrorInfo . "\n";
    echo "Detalle de la excepción: " . $e->getMessage() . "\n";
}
?>
