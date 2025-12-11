<?php
// Script para agregar soporte de imagen en PUT operation de variantes.php

$file = 'backend/api/variantes.php';
$content = file_get_contents($file);

// Buscar la línea donde se define el campo sku en el PUT
$search = "if (isset(\$input['sku'])) { \$fields[] = \"sku = ?\"; \$params[] = \$input['sku']; }";
$replace = "if (isset(\$input['sku'])) { \$fields[] = \"sku = ?\"; \$params[] = \$input['sku']; }\r\n            if (isset(\$input['imagen'])) { \$fields[] = \"imagen = ?\"; \$params[] = \$input['imagen']; }";

$newContent = str_replace($search, $replace, $content);

if ($newContent !== $content) {
    file_put_contents($file, $newContent);
    echo "✓ Agregado soporte de imagen en PUT operation\n";
} else {
    echo "⚠ No se encontró el patrón o ya existe\n";
}

echo "\nVerificando cambios...\n";
$lines = file($file);
foreach ($lines as $num => $line) {
    if (strpos($line, "imagen") !== false && $num > 140 && $num < 160) {
        echo "Línea " . ($num + 1) . ": " . trim($line) . "\n";
    }
}
