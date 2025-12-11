CREATE TABLE IF NOT EXISTS `carrito` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `variacion_id` INT NULL,
  `cantidad` INT NOT NULL DEFAULT 1,
  `fecha_agregado` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variacion_id`) REFERENCES `variaciones`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_carrito_usuario_producto_variacion` (`usuario_id`, `producto_id`, `variacion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
