<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Modificar la columna tipo para incluir 'category_grid'
    // Nota: Al modificar un ENUM, debemos listar TODOS los valores posibles, incluidos los viejos y el nuevo.
    $sql = "ALTER TABLE banners MODIFY COLUMN tipo ENUM('carousel', 'lateral', 'grid', 'category_grid') DEFAULT 'carousel'";
    
    $db->exec($sql);
    echo "Columna 'tipo' actualizada exitosamente para incluir 'category_grid'.\n";

    // 2. Insertar un banner de ejemplo para 'category_grid' (Opcional, pero útil para probar)
    // Asumimos que existe una categoría con ID 1 (ej. Laptops o similar)
    // Buscamos una categoría existente para usar su link
    $stmt = $db->query("SELECT id, nombre FROM categorias LIMIT 1");
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($cat) {
        $catId = $cat['id'];
        $catNombre = $cat['nombre'];
        
        $sqlInsert = "INSERT INTO banners (titulo, subtitulo, descripcion, imagen, link, texto_boton, orden, tipo, gradiente, activo) 
                      VALUES (:titulo, :subtitulo, :descripcion, :imagen, :link, :texto_boton, 10, 'category_grid', 'bg-slate-900', 1)";
        
        $stmtInsert = $db->prepare($sqlInsert);
        $stmtInsert->execute([
            ':titulo' => "Lo Mejor en $catNombre",
            ':subtitulo' => 'DESTACADO',
            ':descripcion' => "Descubre nuestra selección premium de $catNombre a precios increíbles.",
            ':imagen' => '', // Sin imagen por ahora, o usar una default
            ':link' => "?categoria=$catId", // Link interno que usará el frontend para saber qué cargar
            ':texto_boton' => 'Ver Todo'
        ]);
        
        echo "Banner de ejemplo 'category_grid' creado para la categoría: $catNombre.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
