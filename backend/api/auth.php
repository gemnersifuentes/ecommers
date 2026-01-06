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
    require_once __DIR__ . '/../config/conexion.php';
    require_once __DIR__ . '/../helpers/MailHelper.php';
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
if (!isset($path)) {
    if (isset($_GET['action'])) $path = $_GET['action'];
    else $path = $_SERVER['REQUEST_URI'];
}

auth_log("AUTH API: Solicitud recibida: " . $method . " " . $_SERVER['REQUEST_URI']);
auth_log("AUTH API: Final Path: " . $path);

$rawInput = file_get_contents('php://input');
auth_log("AUTH API: Raw input: " . substr($rawInput, 0, 200));

$input = json_decode($rawInput, true);

auth_log("AUTH API: Checking method: " . $method);
auth_log("AUTH API: Checking path: " . $path);

if ($method === 'POST') {
    // Google Login (Sencible a strpos, debe ir antes de 'login' genérico)
    if (strpos($path, 'google-login') !== false) {
        auth_log("AUTH API: Procesando GOOGLE-LOGIN");

        if (!isset($input['credential'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Token de Google requerido']);
            exit;
        }

        try {
            if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
                require_once __DIR__ . '/../vendor/autoload.php';
            }
            
            // Client ID de Google de las columnas de ajustes
            auth_log("AUTH API: Obteniendo Client ID de la BD...");
            $stmtAjustes = $pdo->prepare("SELECT google_client_id FROM ajustes LIMIT 1");
            $stmtAjustes->execute();
            $resAjustes = $stmtAjustes->fetch(PDO::FETCH_ASSOC);
            $clientId = ($resAjustes && !empty($resAjustes['google_client_id'])) 
                ? $resAjustes['google_client_id'] 
                : "REEMPLAZAR_CON_TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
            
            auth_log("AUTH API: Usando Client ID: " . substr($clientId, 0, 20) . "...");
            
            auth_log("AUTH API: Inicializando Google Client...");
            $client = new Google\Client(['client_id' => $clientId]);
            
            auth_log("AUTH API: Verificando IdToken...");
            $payload = $client->verifyIdToken($input['credential']);
            auth_log("AUTH API: Resultado verificación: " . ($payload ? "EXITO" : "FALLO"));

            if ($payload) {
                auth_log("AUTH API: Google Token verificado para: " . $payload['email']);
                
                $email = $payload['email'];
                $nombre = $payload['name'];
                
                // Buscar usuario por correo
                $stmt = $pdo->prepare("SELECT id, nombre, correo, rol FROM usuarios WHERE correo = ? AND activo = 1");
                $stmt->execute([$email]);
                $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$usuario) {
                    auth_log("AUTH API: Usuario Google no existe, creando...");
                    $stmtIns = $pdo->prepare("INSERT INTO usuarios (nombre, correo, clave, rol) VALUES (?, ?, ?, ?)");
                    $claveDummy = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
                    $rol = 'cliente';
                    
                    if ($stmtIns->execute([$nombre, $email, $claveDummy, $rol])) {
                        $usuarioId = $pdo->lastInsertId();
                        $usuario = [
                            'id' => $usuarioId,
                            'nombre' => $nombre,
                            'correo' => $email,
                            'rol' => $rol
                        ];
                        auth_log("AUTH API: Usuario creado exitosamente");
                    } else {
                        throw new Exception("Error al registrar nuevo usuario de Google");
                    }
                }

                $token = bin2hex(random_bytes(32));
                $expira = date('Y-m-d H:i:s', strtotime('+7 days'));
                
                $stmtToken = $pdo->prepare("INSERT INTO tokens (usuario_id, token, expira) VALUES (?, ?, ?)");
                if ($stmtToken->execute([$usuario['id'], $token, $expira])) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login Google exitoso',
                        'token' => $token,
                        'usuario' => $usuario
                    ]);
                    exit;
                } else {
                    throw new Exception("Error al generar sesión para Google Login");
                }
            } else {
                auth_log("AUTH API ERROR: Token de Google inválido");
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Token de Google inválido']);
                exit;
            }
        } catch (Exception $e) {
            auth_log("AUTH API EXCEPTION Google: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error en Google Login: ' . $e->getMessage()]);
            exit;
        }
    }
    // Login estándar
    elseif (strpos($path, 'login') !== false) {
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
                
                // Enviar correo de bienvenida
                try {
                    MailHelper::sendWelcomeEmail($input['correo'], $input['nombre']);
                    auth_log("AUTH API: Correo de bienvenida enviado a " . $input['correo']);
                } catch (Exception $e) {
                    auth_log("AUTH API ERROR: No se pudo enviar correo de bienvenida: " . $e->getMessage());
                }

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
    // Olvidó contraseña
    elseif (strpos($path, 'forgot-password') !== false) {
        auth_log("AUTH API: Procesando FORGOT-PASSWORD");
        
        if (!isset($input['correo'])) {
            http_response_code(400);
            echo json_encode(['message' => 'El correo es requerido']);
            exit;
        }

        try {
            // Verificar si el usuario existe
            $stmt = $pdo->prepare("SELECT id, nombre FROM usuarios WHERE correo = ? AND activo = 1");
            $stmt->execute([$input['correo']]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                // Generar token único
                $token = bin2hex(random_bytes(32));
                $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

                // Limpiar tokens anteriores
                $stmtDel = $pdo->prepare("DELETE FROM password_resets WHERE correo = ?");
                $stmtDel->execute([$input['correo']]);

                // Guardar nuevo token
                $stmtIns = $pdo->prepare("INSERT INTO password_resets (correo, token, expira) VALUES (?, ?, ?)");
                if ($stmtIns->execute([$input['correo'], $token, $expira])) {
                    // Enviar correo
                    $mailResult = MailHelper::sendPasswordResetEmail($input['correo'], $usuario['nombre'], $token);
                    
                    if ($mailResult['success']) {
                        echo json_encode(['success' => true, 'message' => 'Se ha enviado un enlace de recuperación a tu correo']);
                    } else {
                        auth_log("AUTH API ERROR: Falló el envío de correo: " . $mailResult['message']);
                        echo json_encode(['success' => true, 'message' => 'Solicitud procesada (si el correo existe, recibirá el enlace)']);
                    }
                } else {
                    throw new Exception("Error al guardar el token de recuperación");
                }
            } else {
                // Por seguridad, siempre responder éxito aunque no exista
                echo json_encode(['success' => true, 'message' => 'Se ha enviado un enlace de recuperación a tu correo']);
            }
        } catch (Exception $e) {
            auth_log("AUTH API EXCEPTION: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al procesar solicitud: ' . $e->getMessage()]);
        }
    }
    // Resetear contraseña
    elseif (strpos($path, 'reset-password') !== false) {
        auth_log("AUTH API: Procesando RESET-PASSWORD");
        
        if (!isset($input['token']) || !isset($input['clave'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Token y nueva clave son requeridos']);
            exit;
        }

        try {
            // Validar token
            $stmt = $pdo->prepare("SELECT correo FROM password_resets WHERE token = ? AND expira > NOW()");
            $stmt->execute([$input['token']]);
            $reset = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($reset) {
                $claveHash = password_hash($input['clave'], PASSWORD_BCRYPT);
                
                // Actualizar contraseña
                $stmtUpd = $pdo->prepare("UPDATE usuarios SET clave = ? WHERE correo = ?");
                if ($stmtUpd->execute([$claveHash, $reset['correo']])) {
                    // Eliminar token usado
                    $stmtDel = $pdo->prepare("DELETE FROM password_resets WHERE token = ?");
                    $stmtDel->execute([$input['token']]);
                    
                    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada exitosamente']);
                } else {
                    http_response_code(500);
                    echo json_encode(['message' => 'Error al actualizar la contraseña']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El enlace de recuperación es inválido o ha expirado']);
            }
        } catch (Exception $e) {
            auth_log("AUTH API EXCEPTION: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al resetear contraseña: ' . $e->getMessage()]);
        }
    }
}
