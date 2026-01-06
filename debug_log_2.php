<?php
$logFile = 'backend/auth_debug.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    foreach ($lines as $line) {
        if (strpos($line, 'GOOGLE-LOGIN') !== false || strpos($line, 'Faltan credenciales') !== false || strpos($line, 'Solici') !== false) {
            echo $line;
        }
    }
} else {
    echo "Log file not found.";
}
?>
