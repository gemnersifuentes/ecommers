<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code( 405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

try {
    if (!isset($_FILES['imagen'])) {
        throw new Exception('No se recibió ninguna imagen');
    }

    $file = $_FILES['imagen'];
    
    // Validar errores
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir el archivo: ' . $file['error']);
    }

    // Validar tamaño (500MB máximo)
    if ($file['size'] > 500 * 1024 * 1024) {
        throw new Exception('El archivo es demasiado grande. Máximo 500MB');
    }

    // Validar tipo de archivo
    $allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Tipo de archivo no permitido. Solo se aceptan imágenes y videos (MP4, WEBM)');
    }

    // Crear directorio si no existe
    // Guardamos en backend/uploads/ del proyecto
    // Guardar en public/uploads para que sea accesible vía web
    $uploadDir = __DIR__ . '/uploads/';
    
    // Si no existe, intentar crear
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception('No se pudo crear el directorio de uploads');
        }
    }

    // Generar nombre único
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Mover archivo
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Error al guardar el archivo en el servidor');
    }

    // Retornar URL - Accesible desde el servidor local PHP con router
    // El router servirá las imágenes desde http://localhost:8000/public/uploads/filename.jpg
    $url = 'http://localhost:8000/public/uploads/' . $filename;
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename,
        'message' => 'Imagen subida exitosamente'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
