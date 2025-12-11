<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $db->beginTransaction();

    echo "Iniciando migración de unificación de usuarios y clientes...\n";

    // 1. Agregar columnas a usuarios si no existen
    echo "1. Agregando columnas a tabla usuarios...\n";
    $columns = $db->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('telefono', $columns)) {
        $db->exec("ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) AFTER correo");
        echo "- Columna telefono agregada.\n";
    }
    
    if (!in_array('direccion', $columns)) {
        $db->exec("ALTER TABLE usuarios ADD COLUMN direccion TEXT AFTER telefono");
        echo "- Columna direccion agregada.\n";
    }

    // 2. Migrar clientes a usuarios
    echo "2. Migrando clientes a usuarios...\n";
    $clientes = $db->query("SELECT * FROM clientes")->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($clientes as $cliente) {
        // Verificar si ya existe usuario con ese correo
        $stmt = $db->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$cliente['correo']]);
        $usuarioExistente = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $usuarioId = null;
        
        if ($usuarioExistente) {
            echo "- Cliente {$cliente['correo']} ya existe como usuario (ID: {$usuarioExistente['id']}). Actualizando datos...\n";
            $usuarioId = $usuarioExistente['id'];
            // Actualizar datos si faltan
            $stmtUpdate = $db->prepare("UPDATE usuarios SET telefono = COALESCE(telefono, ?), direccion = COALESCE(direccion, ?) WHERE id = ?");
            $stmtUpdate->execute([$cliente['telefono'], $cliente['direccion'], $usuarioId]);
        } else {
            echo "- Creando usuario para cliente {$cliente['correo']}...\n";
            // Crear usuario con contraseña temporal (o hash dummy)
            $claveDummy = password_hash('cliente123', PASSWORD_BCRYPT);
            $stmtInsert = $db->prepare("INSERT INTO usuarios (nombre, correo, clave, rol, telefono, direccion, fecha_registro) VALUES (?, ?, ?, 'cliente', ?, ?, ?)");
            $stmtInsert->execute([
                $cliente['nombre'],
                $cliente['correo'],
                $claveDummy,
                $cliente['telefono'],
                $cliente['direccion'],
                $cliente['fecha_registro']
            ]);
            $usuarioId = $db->lastInsertId();
        }
        
        // Guardar mapeo temporal para actualizar pedidos
        // No podemos actualizar pedidos todavía porque la FK apunta a clientes
        // Pero como vamos a cambiar la FK, necesitamos saber el nuevo ID
        
        // Actualizar pedidos de este cliente antiguo al nuevo usuario ID
        // Primero necesitamos relajar la FK de pedidos
    }

    // 3. Modificar tabla pedidos
    echo "3. Modificando tabla pedidos...\n";
    
    // Eliminar FK existente
    // Nota: El nombre de la FK puede variar, intentamos eliminarla por nombre estándar si existe
    try {
        $db->exec("ALTER TABLE pedidos DROP FOREIGN KEY pedidos_ibfk_1");
    } catch (Exception $e) {
        // Ignorar si no existe con ese nombre, intentar averiguar nombre o simplemente continuar si ya no está
        echo "Nota: No se pudo borrar FK pedidos_ibfk_1 (quizás tiene otro nombre o ya no existe).\n";
    }

    // Actualizar IDs en pedidos
    // Esto es delicado. Si borramos la tabla clientes antes de actualizar, perdemos la referencia.
    // Pero si actualizamos pedidos.cliente_id con usuarios.id, puede haber colisiones si los IDs se solapan?
    // No, porque cliente_id es solo un número.
    
    // Estrategia:
    // Recorrer clientes de nuevo y actualizar pedidos uno por uno
    foreach ($clientes as $cliente) {
        // Buscar el ID del usuario correspondiente (ya sea existente o recién creado)
        $stmt = $db->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$cliente['correo']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            $stmtUpdatePedidos = $db->prepare("UPDATE pedidos SET cliente_id = ? WHERE cliente_id = ?");
            // Aquí hay un riesgo: si actualizamos, y luego otro cliente tenía el mismo ID antiguo...
            // Espera, cliente_id en pedidos referenciaba a clientes.id.
            // Si clientes.id = 1, y usuarios.id = 5.
            // Debemos cambiar pedidos.cliente_id de 1 a 5.
            // PERO si ya cambiamos otro pedido a 5, no pasa nada.
            // EL PROBLEMA es si otro cliente tiene ID 5 en la tabla clientes, y aún no lo hemos procesado.
            // Entonces sus pedidos (que tienen cliente_id=5) se mezclarían con los que acabamos de actualizar a 5.
            
            // SOLUCIÓN: Agregar columna temporal a pedidos
        }
    }
    
    // Mejor estrategia para pedidos:
    // 1. Agregar columna usuario_id a pedidos
    $db->exec("ALTER TABLE pedidos ADD COLUMN usuario_id INT");
    
    // 2. Llenar usuario_id basándose en la relación pedidos.cliente_id -> clientes.id -> clientes.correo -> usuarios.correo -> usuarios.id
    $sqlUpdate = "
        UPDATE pedidos p
        JOIN clientes c ON p.cliente_id = c.id
        JOIN usuarios u ON c.correo = u.correo
        SET p.usuario_id = u.id
    ";
    $db->exec($sqlUpdate);
    
    // 3. Verificar si quedaron pedidos sin usuario_id (húerfanos)
    // Si hay, asignarles un usuario por defecto o dejarlos NULL? Mejor NULL por ahora.
    
    // 4. Eliminar columna cliente_id antigua y renombrar usuario_id o cambiar FK
    // Primero eliminamos la FK vieja si no se borró antes
    // Obtener nombre de la FK
    $stmtFK = $db->query("
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'pedidos' 
        AND COLUMN_NAME = 'cliente_id' 
        AND TABLE_SCHEMA = '{$db_name}'
    ");
    $fkName = $stmtFK->fetchColumn();
    if ($fkName) {
        $db->exec("ALTER TABLE pedidos DROP FOREIGN KEY `$fkName`");
    }
    
    // Ahora podemos modificar la estructura
    // Queremos que cliente_id sea la FK a usuarios
    // Ya tenemos usuario_id con los valores correctos.
    // Vamos a borrar la columna cliente_id vieja y renombrar usuario_id a cliente_id
    
    // OJO: index
    $db->exec("ALTER TABLE pedidos DROP COLUMN cliente_id");
    $db->exec("ALTER TABLE pedidos CHANGE COLUMN usuario_id cliente_id INT NOT NULL");
    
    // Agregar nueva FK
    $db->exec("ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_usuarios FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE");
    
    echo "- Tabla pedidos actualizada y vinculada a usuarios.\n";

    // 4. Eliminar tabla clientes
    echo "4. Eliminando tabla clientes...\n";
    $db->exec("DROP TABLE clientes");
    echo "- Tabla clientes eliminada.\n";

    $db->commit();
    echo "¡Migración completada exitosamente!\n";

} catch (Exception $e) {
    $db->rollBack();
    echo "Error crítico: " . $e->getMessage() . "\n";
    echo "Se han revertido los cambios.\n";
}
?>
