<?php
// Script independiente para crear tabla
class Database {
    private $host = "localhost";
    private $db_name = "db_tienda_redhard";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }
        return $this->conn;
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("No se pudo conectar a la base de datos.");
    }

    // Eliminar tabla si existe para asegurar estructura limpia
    $db->exec("DROP TABLE IF EXISTS especificaciones");

    // Crear tabla especificaciones
    $sql = "CREATE TABLE IF NOT EXISTS especificaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        valor TEXT NOT NULL,
        orden INT DEFAULT 0,
        INDEX (producto_id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "Tabla 'especificaciones' creada exitosamente.\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
