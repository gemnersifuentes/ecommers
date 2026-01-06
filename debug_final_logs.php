<?php
$logFile = 'backend/auth_debug.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    foreach ($lines as $line) {
        $clean = trim($line);
        if (strpos($clean, 'EXCEPTION') !== false || strpos($clean, 'ERROR') !== false || strpos($clean, 'GOOGLE-LOGIN') !== false) {
             // Truncate long lines but keep error info
             if (strlen($clean) > 200) {
                 echo substr($clean, 0, 200) . " ... [LONG LINE]\n";
             } else {
                 echo $clean . "\n";
             }
        }
    }
} else {
    echo "Log file not found.";
}
?>
