<?php
// API de autenticación

// Configurar log para depuración
$logFile = __DIR__ . '/../auth_debug.log';
if (!function_exists('auth_log')) {
    function auth_log($message) {
        global $logFile;
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
    }
}

// Desactivar visualización de errores para no romper JSON
ini_set('display_errors', 0);
auth_log("AUTH API: Solicitud recibida en auth.php");

// Verificar que PDO esté disponible
if (!isset($pdo)) {
    // Si no viene del router, intentamos conectar nosotros mismos
    require_once __DIR__ . '/../config/conexion.php';
    $database = new Database();
    $pdo = $database->getConnection();
    auth_log("AUTH API: Conexión establecida localmente");
}

if (!$pdo) {
    auth_log("AUTH API CRITICAL: No se puede conectar a la base de datos");
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: Base de datos no disponible']);
    exit;
}

// Asegurar variables del router si faltan
if (!isset($method)) $method = $_SERVER['REQUEST_METHOD'];
if (!isset($path) && isset($_GET['action'])) $path = $_GET['action']; // Compatibilidad con ?action=login

$rawInput = file_get_contents('php://input');
auth_log("AUTH API: Raw input: " . substr($rawInput, 0, 200));

$input = json_decode($rawInput, true);

if ($method === 'POST') {
    // Login
    if (strpos($path, 'login') !== false) {
        auth_log("AUTH API: Procesando LOGIN");
        
        if (!isset($input['correo']) || !isset($input['clave'])) {
            auth_log("AUTH API: Faltan credenciales");
            http_response_code(400);
            echo json_encode(['message' => 'Correo y contraseña son requeridos']);
            exit;
        }

        auth_log("AUTH API: Intento de login para: " . $input['correo']);

        try {
            $stmt = $pdo->prepare("SELECT id, nombre, correo, clave, rol FROM usuarios WHERE correo = ? AND activo = 1");
            $stmt->execute([$input['correo']]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                auth_log("AUTH API: Usuario encontrado ID: " . $usuario['id']);
                
                if (password_verify($input['clave'], $usuario['clave'])) {
                    auth_log("AUTH API: Contraseña válida");
                    unset($usuario['clave']);
                    
                    // Generar token
                    $token = bin2hex(random_bytes(32));
                    $expira = date('Y-m-d H:i:s', strtotime('+7 days'));
                    
                    // Guardar token
                    $stmtToken = $pdo->prepare("INSERT INTO tokens (usuario_id, token, expira) VALUES (?, ?, ?)");
                    if ($stmtToken->execute([$usuario['id'], $token, $expira])) {
                        auth_log("AUTH API: Token generado y guardado");
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Login exitoso',
                            'token' => $token,
                            'usuario' => $usuario
                        ]);
                    } else {
                        auth_log("AUTH API ERROR: No se pudo guardar el token");
                        http_response_code(500);
                        echo json_encode(['error' => 'Error al iniciar sesión']);
                    }
                } else {
                    auth_log("AUTH API: Contraseña inválida");
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
                }
            } else {
                auth_log("AUTH API: Usuario no encontrado o inactivo");
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
            }
        } catch (Exception $e) {
            auth_log("AUTH API EXCEPTION: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error en el login: ' . $e->getMessage()]);
        }
    }
    // Registro
    elseif (strpos($path, 'register') !== false) {
        auth_log("AUTH API: Procesando REGISTER");
        
        if (!isset($input['nombre']) || !isset($input['correo']) || !isset($input['clave'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Todos los campos son requeridos']);
            exit;
        }

        try {
            // Verificar correo
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
            $stmt->execute([$input['correo']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
                exit;
            }

            $claveHash = password_hash($input['clave'], PASSWORD_BCRYPT);
            $rol = isset($input['rol']) ? $input['rol'] : 'cliente';

            // Insertar usuario
            // Nota: Si las columnas telefono/direccion no existen, esto fallará.
            // Se asume que la estructura de la tabla es correcta o que el usuario las agregó.
            // Si falla, se capturará en el catch.
            $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, clave, rol, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['correo'],
                $claveHash,
                $rol,
                $input['telefono'] ?? null,
                $input['direccion'] ?? null
            ])) {
                auth_log("AUTH API: Usuario registrado exitosamente");
                echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
            } else {
                $errorInfo = $stmt->errorInfo();
                auth_log("AUTH API ERROR: Falló la inserción del usuario: " . print_r($errorInfo, true));
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al registrar usuario']);
            }
        } catch (Exception $e) {
            auth_log("AUTH API EXCEPTION: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al registrar usuario: ' . $e->getMessage()]);
        }
    }
}
