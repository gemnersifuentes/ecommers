<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VERIFICANDO ESTRUCTURA DE USUARIOS ===\n\n";
    
    // Ver estructura de la tabla usuarios
    $stmt = $pdo->query("DESCRIBE usuarios");
    echo "Columnas de la tabla usuarios:\n";
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']} ({$row['Type']})\n";
    }
    
    echo "\n=== USUARIOS EXISTENTES ===\n";
    $stmt = $pdo->query("SELECT * FROM usuarios LIMIT 3");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($users) > 0) {
        foreach ($users as $user) {
            echo "\nID: {$user['id']}\n";
            foreach ($user as $key => $value) {
                if ($key !== 'password') {
                    echo "  $key: $value\n";
                }
            }
        }
        
        // Crear token para el primer usuario
        $userId = $users[0]['id'];
        $token = bin2hex(random_bytes(32));
        $expira = date('Y-m-d H:i:s', strtotime('+1 day'));
        
        $stmt = $pdo->prepare("INSERT INTO tokens (usuario_id, token, expira) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $token, $expira]);
        
        echo "\n\n=== TOKEN CREADO ===\n";
        echo "Usuario ID: $userId\n";
        echo "Token: $token\n";
        echo "Expira: $expira\n\n";
        
        echo "INSTRUCCIONES:\n";
        echo "1. Abre la consola del navegador (F12)\n";
        echo "2. Ejecuta este comando:\n";
        echo "   localStorage.setItem('token', '$token')\n";
        echo "3. Recarga la página (F5)\n";
        echo "4. Ahora puedes agregar productos al carrito\n";
    } else {
        echo "No hay usuarios. Debes crear uno primero.\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
