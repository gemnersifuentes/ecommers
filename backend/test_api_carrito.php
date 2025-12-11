<?php
// Test directo del API de carrito
$url = 'http://localhost:8000/api/carrito';

// Primero necesitamos un token válido
// Asumiendo que tienes un usuario de prueba

echo "=== Test API Carrito ===\n\n";

// Simular una petición GET sin token
echo "1. GET sin autenticación:\n";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Para probar con autenticación, necesitarías un token real
echo "Para probar con autenticación, necesitas:\n";
echo "1. Iniciar sesión en la aplicación\n";
echo "2. Copiar el token del localStorage\n";
echo "3. Usarlo en el header Authorization: Bearer TOKEN\n";
