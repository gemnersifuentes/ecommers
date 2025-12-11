<?php
// API de descuentos

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener un descuento específico
            try {
                $stmt = $db->prepare("
                    SELECT d.*,
                        CASE 
                            WHEN d.aplica_a = 'producto' THEN p.nombre
                            WHEN d.aplica_a = 'categoria' THEN c.nombre
                            WHEN d.aplica_a = 'marca' THEN m.nombre
                        END AS afecta_nombre,
                        DATEDIFF(d.fecha_fin, CURDATE()) AS dias_restantes
                    FROM descuentos d
                    LEFT JOIN productos p ON d.producto_id = p.id
                    LEFT JOIN categorias c ON d.categoria_id = c.id
                    LEFT JOIN marcas m ON d.marca_id = m.id
                    WHERE d.id = ?
                ");
                $stmt->execute([$id]);
                $descuento = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($descuento) {
                    echo json_encode($descuento);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Descuento no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener descuento: ' . $e->getMessage()]);
            }
        } else {
            // Obtener todos los descuentos o solo activos
            $soloActivos = isset($_GET['activos']) ? $_GET['activos'] : null;
            
            try {
                $sql = "
                    SELECT DISTINCT d.*,
                        CASE 
                            WHEN d.aplica_a = 'producto' THEN p.nombre
                            WHEN d.aplica_a = 'categoria' THEN c.nombre
                            WHEN d.aplica_a = 'marca' THEN m.nombre
                        END AS afecta_nombre,
                        DATEDIFF(d.fecha_fin, CURDATE()) AS dias_restantes
                    FROM descuentos d
                    LEFT JOIN productos p ON d.producto_id = p.id
                    LEFT JOIN categorias c ON d.categoria_id = c.id
                    LEFT JOIN marcas m ON d.marca_id = m.id
                    WHERE 1=1
                ";
                
                $params = [];
                
                // Filtrar solo descuentos activos vigentes
                if ($soloActivos === '1' || $soloActivos === 'true') {
                    $sql .= " AND d.activo = 1 AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin";
                }
                
                $sql .= " ORDER BY d.activo DESC, d.fecha_fin DESC";
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $descuentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($descuentos);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener descuentos: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        // Validar campos requeridos
        if (!isset($input['nombre']) || !isset($input['tipo']) || !isset($input['valor']) || 
            !isset($input['fecha_inicio']) || !isset($input['fecha_fin']) || !isset($input['aplica_a'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Faltan campos requeridos']);
            exit;
        }

        // Validar que se especifique el ID correcto según aplica_a
        if ($input['aplica_a'] === 'producto' && empty($input['producto_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Debe especificar producto_id']);
            exit;
        }
        if ($input['aplica_a'] === 'categoria' && empty($input['categoria_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Debe especificar categoria_id']);
            exit;
        }
        if ($input['aplica_a'] === 'marca' && empty($input['marca_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Debe especificar marca_id']);
            exit;
        }

        try {
            $stmt = $db->prepare("
                INSERT INTO descuentos 
                (nombre, descripcion, tipo, valor, fecha_inicio, fecha_fin, activo, aplica_a, producto_id, categoria_id, marca_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['descripcion'] ?? null,
                $input['tipo'],
                $input['valor'],
                $input['fecha_inicio'],
                $input['fecha_fin'],
                $input['activo'] ?? 1,
                $input['aplica_a'],
                $input['producto_id'] ?? null,
                $input['categoria_id'] ?? null,
                $input['marca_id'] ?? null
            ])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Descuento creado exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear descuento']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear descuento: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de descuento requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("
                UPDATE descuentos 
                SET nombre = ?, descripcion = ?, tipo = ?, valor = ?, fecha_inicio = ?, fecha_fin = ?, 
                    activo = ?, aplica_a = ?, producto_id = ?, categoria_id = ?, marca_id = ?
                WHERE id = ?
            ");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['descripcion'] ?? null,
                $input['tipo'],
                $input['valor'],
                $input['fecha_inicio'],
                $input['fecha_fin'],
                $input['activo'] ?? 1,
                $input['aplica_a'],
                $input['producto_id'] ?? null,
                $input['categoria_id'] ?? null,
                $input['marca_id'] ?? null,
                $id
            ])) {
                echo json_encode(['success' => true, 'message' => 'Descuento actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar descuento']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar descuento: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de descuento requerido']);
            exit;
        }

        try {
            // Desactivar en lugar de eliminar
            $stmt = $db->prepare("UPDATE descuentos SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Descuento desactivado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al desactivar descuento']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al desactivar descuento: ' . $e->getMessage()]);
        }
        break;
}
?>
