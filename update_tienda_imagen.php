<?php
// Script para agregar campo imagen en la API de tienda

$file = 'backend/api/tienda/productos.php';
$content = file_get_contents($file);

// Buscar y reemplazar en SELECT
$search1 = "SELECT v.id, v.precio, v.stock, v.sku,";
$replace1 = "SELECT v.id, v.precio, v.stock, v.sku, v.imagen,";

// Buscar y reemplazar en array de variante
$search2 = "'stock' => intval(\$var['stock']),";
$replace2 = "'stock' => intval(\$var['stock']),\r\n                    'imagen' => \$var['imagen'],";

$newContent = str_replace($search1, $replace1, $content);
$newContent = str_replace($search2, $replace2, $newContent);

if ($newContent !== $content) {
    file_put_contents($file, $newContent);
    echo "✓ Agregado campo imagen en API de tienda\n";
} else {
    echo "⚠ No se encontró el patrón o ya existe\n";
}
