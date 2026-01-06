<?php
$logFile = 'backend/auth_debug.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    foreach (array_slice($lines, -50) as $line) {
        echo (strlen($line) > 200) ? substr($line, 0, 200) . "...\n" : $line;
    }
} else {
    echo "Log file not found.";
}
?>
