<?php
/**
 * API para subir imágenes de productos
 */

header('Content-Type: application/json');

// Directorio donde se guardan las imágenes
$uploadDir = __DIR__ . '/../uploads/productos/';

// Crear directorio si no existe
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Verificar si se recibió un archivo
    if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No se recibió ninguna imagen o hubo un error en la subida',
            'details' => isset($_FILES['imagen']) ? $_FILES['imagen']['error'] : 'No file'
        ]);
        exit;
    }

    $file = $_FILES['imagen'];
    
    // Validar tipo de archivo
    $allowedTypes = [
        // Imágenes
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        // Videos
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Tipo de archivo no permitido. Solo se aceptan imágenes y videos (MP4, WEBM)',
            'received_type' => $fileType
        ]);
        exit;
    }
    
    // Validar tamaño (máximo 500MB)
    $maxSize = 500 * 1024 * 1024; // 500MB
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El archivo es demasiado grande. Máximo 500MB',
            'size' => $file['size']
        ]);
        exit;
    }
    
    // Generar nombre único
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('prod_') . '_' . time() . '.' . $extension;
    $targetPath = $uploadDir . $filename;
    
    // Mover archivo
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // URL pública de la imagen
        $imageUrl = '/uploads/productos/' . $filename;
        
        echo json_encode([
            'success' => true,
            'message' => 'Imagen subida exitosamente',
            'filename' => $filename,
            'url' => $imageUrl,
            'fullPath' => $targetPath
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al guardar la imagen en el servidor'
        ]);
    }
    
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Use POST'
    ]);
}
?>
