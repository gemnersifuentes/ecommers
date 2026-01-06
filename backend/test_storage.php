<?php
// backend/test_storage.php
header('Content-Type: text/plain');

$target_dir = __DIR__ . "/uploads/servicios/";
echo "Target Dir: " . $target_dir . "\n";

if (!file_exists($target_dir)) {
    echo "Directory does not exist. Attempting to create...\n";
    if (mkdir($target_dir, 0777, true)) {
        echo "Directory created successfully.\n";
    } else {
        echo "FAILED to create directory. Check permissions.\n";
        echo "Last error: " . print_r(error_get_last(), true) . "\n";
        exit;
    }
} else {
    echo "Directory exists.\n";
}

if (is_writable($target_dir)) {
    echo "Directory is writable.\n";
} else {
    echo "Directory is NOT writable.\n";
}

$test_file = $target_dir . "test_image_" . time() . ".txt";
echo "Attempting to write test file: " . $test_file . "\n";

if (file_put_contents($test_file, "Test content")) {
    echo "File written successfully.\n";
    echo "File URL path would be: /backend/uploads/servicios/" . basename($test_file) . "\n";
} else {
    echo "FAILED to write file.\n";
}
?>
