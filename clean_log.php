<?php
$logFile = 'backend/auth_debug.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    $last_lines = array_slice($lines, -20);
    foreach ($last_lines as $line) {
        $clean = trim($line);
        if (empty($clean)) continue;
        // Truncate very long lines like tokens for display
        if (strlen($clean) > 150) {
            $clean = substr($clean, 0, 150) . " ... [TRUNCATED]";
        }
        echo $clean . "\n";
    }
} else {
    echo "Log file not found.";
}
?>
