<?php
// Script para probar notificarOferta manualmente
require_once __DIR__ . '/backend/api/descuentos.php';

echo "Probando notificarOferta para el descuento ID 15...\n";
notificarOferta($db, 15);
echo "Fin de la prueba.\n";
?>
