-- Modificar tabla detalle_pedido para incluir el color/atributo seleccionado

ALTER TABLE detalle_pedido 
ADD COLUMN atributo_id INT NULL AFTER variacion_id,
ADD CONSTRAINT fk_detalle_atributo 
    FOREIGN KEY (atributo_id) 
    REFERENCES producto_atributos(id) 
    ON DELETE SET NULL;

-- Índice para mejorar rendimiento
CREATE INDEX idx_detalle_atributo ON detalle_pedido(atributo_id);
