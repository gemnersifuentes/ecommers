<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/backend/vendor/autoload.php';
// require_once __DIR__ . '/backend/vendor/google/apiclient/src/Client.php';

try {
    echo "Attempting to create Google\Client...\n";
    $client = new Google\Client();
    echo "✅ Success: Google\Client instantiated.\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
}
?>
