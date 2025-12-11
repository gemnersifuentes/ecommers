<?php
// Mock REQUEST_METHOD for CLI
$_SERVER['REQUEST_METHOD'] = 'GET';

require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "=== MIGRACIÓN DE ATRIBUTOS V2 (REINTENTO) ===\n\n";

try {
    // 1. Ejecutar SQL de estructura (ignorar errores si ya existen)
    echo "1. Creando tablas...\n";
    $sql = file_get_contents(__DIR__ . '/../sql/migracion_atributos_v2.sql');
    try {
        $db->exec($sql);
        echo "   ✅ Tablas creadas/verificadas\n";
    } catch (PDOException $e) {
        echo "   ℹ️ Tablas ya existían o error menor: " . $e->getMessage() . "\n";
    }

    $db->beginTransaction();

    // Obtener IDs de atributos base
    $stmt = $db->query("SELECT id FROM atributos WHERE nombre = 'Color'");
    $colorAttrId = $stmt->fetchColumn();
    
    $stmt = $db->query("SELECT id FROM atributos WHERE nombre = 'Almacenamiento'");
    $storageAttrId = $stmt->fetchColumn();
    
    // Si no existen, insertarlos
    if (!$colorAttrId) {
        $db->exec("INSERT INTO atributos (nombre) VALUES ('Color')");
        $colorAttrId = $db->lastInsertId();
    }
    if (!$storageAttrId) {
        $db->exec("INSERT INTO atributos (nombre) VALUES ('Almacenamiento')");
        $storageAttrId = $db->lastInsertId();
    }


    // 2. Migrar Colores (producto_atributos)
    echo "\n2. Migrando Colores...\n";
    $stmt = $db->query("SELECT * FROM producto_atributos WHERE tipo = 'color'");
    $colores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($colores as $c) {
        // Buscar o crear valor
        $stmt = $db->prepare("SELECT id FROM atributo_valores WHERE atributo_id = ? AND valor = ?");
        $stmt->execute([$colorAttrId, $c['valor']]);
        $valId = $stmt->fetchColumn();

        if (!$valId) {
            $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor) VALUES (?, ?)");
            $stmt->execute([$colorAttrId, $c['valor']]);
            $valId = $db->lastInsertId();
            echo "   + Nuevo valor creado: {$c['valor']}\n";
        }

        // Crear variante
        $stmt = $db->prepare("INSERT INTO producto_variantes (producto_id, stock, precio) VALUES (?, ?, NULL)");
        $stmt->execute([$c['producto_id'], $c['stock']]);
        $varianteId = $db->lastInsertId();

        // Relacionar variante con valor
        $stmt = $db->prepare("INSERT INTO variante_valores (variante_id, atributo_valor_id) VALUES (?, ?)");
        $stmt->execute([$varianteId, $valId]);
    }
    echo "   ✅ " . count($colores) . " colores migrados\n";

    // 3. Migrar Variaciones (asumimos Almacenamiento por ahora, o genérico)
    echo "\n3. Migrando Variaciones (Discos/Otros)...\n";
    // Verificar si existe la tabla variaciones antes de intentar leerla
    $tables = $db->query("SHOW TABLES LIKE 'variaciones'")->fetchAll();
    if (count($tables) > 0) {
        $stmt = $db->query("SELECT * FROM variaciones");
        $variaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($variaciones as $v) {
            // Determinar atributo (simple heurística o default a Almacenamiento)
            // Si el valor contiene GB o TB, es almacenamiento. Si no, podría ser otro.
            $attrId = $storageAttrId; 
            
            // Buscar o crear valor
            $stmt = $db->prepare("SELECT id FROM atributo_valores WHERE atributo_id = ? AND valor = ?");
            $stmt->execute([$attrId, $v['atributo']]);
            $valId = $stmt->fetchColumn();

            if (!$valId) {
                $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor) VALUES (?, ?)");
                $stmt->execute([$attrId, $v['atributo']]);
                $valId = $db->lastInsertId();
                echo "   + Nuevo valor creado: {$v['atributo']}\n";
            }

            // Crear variante
            $stmt = $db->prepare("INSERT INTO producto_variantes (producto_id, stock, precio) VALUES (?, ?, ?)");
            $stmt->execute([$v['producto_id'], $v['stock'], $v['precio']]);
            $varianteId = $db->lastInsertId();

            // Relacionar variante con valor
            $stmt = $db->prepare("INSERT INTO variante_valores (variante_id, atributo_valor_id) VALUES (?, ?)");
            $stmt->execute([$varianteId, $valId]);
        }
        echo "   ✅ " . count($variaciones) . " variaciones migradas\n";
    } else {
        echo "   ℹ️ Tabla 'variaciones' no existe, saltando...\n";
    }

    $db->commit();
    echo "\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE\n";

} catch (Exception $e) {
    $db->rollBack();
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
