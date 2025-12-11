<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Test de conexión a base de datos
require_once __DIR__ . '/../config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Conexión a base de datos exitosa',
            'database' => 'db_tienda_redhard'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo conectar a la base de datos'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
