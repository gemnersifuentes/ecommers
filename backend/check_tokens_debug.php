<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $pdo = $database->getConnection();
    
    echo "=== VERIFICACIÓN DE TOKENS ===\n\n";
    
    // Contar tokens totales
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM tokens");
    $total = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total de tokens en la tabla: " . $total['total'] . "\n\n";
    
    // Contar tokens válidos (no expirados)
    $stmt = $pdo->query("SELECT COUNT(*) as validos FROM tokens WHERE expira > NOW()");
    $validos = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Tokens válidos (no expirados): " . $validos['validos'] . "\n\n";
    
    // Mostrar últimos 5 tokens
    $stmt = $pdo->query("SELECT id, usuario_id, LEFT(token, 20) as token_preview, expira, 
                         CASE WHEN expira > NOW() THEN 'VÁLIDO' ELSE 'EXPIRADO' END as estado
                         FROM tokens 
                         ORDER BY id DESC 
                         LIMIT 5");
    
    echo "Últimos 5 tokens:\n";
    echo str_repeat("-", 80) . "\n";
    printf("%-5s %-12s %-25s %-20s %-10s\n", "ID", "Usuario", "Token (preview)", "Expira", "Estado");
    echo str_repeat("-", 80) . "\n";
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        printf("%-5s %-12s %-25s %-20s %-10s\n", 
            $row['id'], 
            $row['usuario_id'], 
            $row['token_preview'] . '...', 
            $row['expira'], 
            $row['estado']
        );
    }
    
    echo "\n=== FIN ===\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
