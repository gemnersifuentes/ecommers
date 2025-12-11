<?php
// Test the productos API directly
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['categoria'] = 9;

// Simulate the API request
$uri = '/api/productos';
$method = 'GET';
$id = null;

require_once __DIR__ . '/config/conexion.php';
require_once __DIR__ . '/api/productos.php';
