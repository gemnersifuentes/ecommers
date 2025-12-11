<?php
$url = 'http://localhost:8000/productos?page=1&limit=32';
$context = stream_context_create([
    'http' => [
        'ignore_errors' => true
    ]
]);
$response = file_get_contents($url, false, $context);
echo "Response headers:\n";
print_r($http_response_header);
echo "\nResponse body:\n";
echo substr($response, 0, 500); // Print first 500 chars to check for success
