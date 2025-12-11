<?php
// API de categorías para la tienda (frontend)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/conexion.php';

try {
    $db = $database->getConnection();
    
    // Solo GET para listar categorías activas
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Obtener todas las categorías activas con su imagen
        $sql = "SELECT id, nombre, descripcion, imagen 
                FROM categorias 
                WHERE activo = 1 
                ORDER BY nombre ASC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Asegurar que las imágenes tengan la ruta completa
        foreach ($categorias as &$categoria) {
            if (!empty($categoria['imagen'])) {
                // Si la imagen no tiene http:// o https://, agregarle la ruta del backend
                if (!preg_match('/^https?:\/\//', $categoria['imagen'])) {
                    $categoria['imagen'] = 'http://localhost:8000/' . ltrim($categoria['imagen'], '/');
                }
            }
        }
        
        echo json_encode($categorias);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al cargar categorías: ' . $e->getMessage()]);
}
?>
