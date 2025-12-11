# 🎉 Sistema de Descuentos - Guía Rápida

## 📋 Descripción

El sistema de descuentos permite aplicar reducciones de precio a productos individuales, categorías completas o marcas específicas.

## 🗄️ Estructura de Base de Datos

### Tabla `descuentos`

```sql
- nombre: Nombre del descuento
- descripcion: Descripción detallada
- tipo: 'porcentaje' o 'monto_fijo'
- valor: Valor del descuento (% o monto en dólares)
- fecha_inicio: Fecha de inicio
- fecha_fin: Fecha de finalización
- aplica_a: 'producto', 'categoria' o 'marca'
- producto_id, categoria_id, marca_id: Referencias según aplica_a
```

### Vista `vista_productos_con_descuento`

Esta vista combina productos con sus descuentos activos y calcula automáticamente:
- `precio_base`: Precio original
- `descuento_aplicado`: Monto del descuento
- `precio_final`: Precio con descuento
- `tiene_descuento`: 1 si tiene descuento activo, 0 si no

## 🚀 Cómo Usar

### 1. Crear un Descuento

Puedes crear descuentos de 3 tipos:

#### A. Descuento por Producto Específico
```sql
INSERT INTO descuentos (nombre, tipo, valor, fecha_inicio, fecha_fin, aplica_a, producto_id)
VALUES ('15% OFF RTX 4060', 'porcentaje', 15.00, '2024-11-01', '2024-12-31', 'producto', 10);
```

#### B. Descuento por Categoría
```sql
INSERT INTO descuentos (nombre, tipo, valor, fecha_inicio, fecha_fin, aplica_a, categoria_id)
VALUES ('Black Friday RAM', 'porcentaje', 20.00, '2024-11-24', '2024-11-30', 'categoria', 1);
```

#### C. Descuento por Marca
```sql
INSERT INTO descuentos (nombre, tipo, valor, fecha_inicio, fecha_fin, aplica_a, marca_id)
VALUES ('Promoción AMD', 'porcentaje', 10.00, '2024-11-15', '2024-12-15', 'marca', 6);
```

### 2. API Response

Cuando consultas productos, automáticamente recibes:

```json
{
  "id": 10,
  "nombre": "NVIDIA RTX 4060",
  "precio_base": 350.00,
  "precio_final": 297.50,
  "descuento_aplicado": 52.50,
  "tiene_descuento": 1,
  "descuento_nombre": "15% OFF RTX 4060",
  "descuento_tipo": "porcentaje",
  "descuento_valor": 15.00
}
```

### 3. Filtrar Productos con Descuento

```javascript
// Obtener solo productos con descuento activo
GET /productos?con_descuento=1
```

## ⚙️ Backend (productos.php)

El endpoint `/productos` usa la vista `vista_productos_con_descuento` que:
1. Busca descuentos activos para cada producto
2. Verifica que estén dentro del rango de fechas
3. Calcula automáticamente el precio con descuento
4. Ordena mostrando primero los productos con descuento

## 🎨 Frontend

Para mostrar el descuento en la interfaz:

```jsx
{producto.tiene_descuento === 1 && (
  <div>
    <span className="line-through">${producto.precio_base}</span>
    <span className="text-red-600">${producto.precio_final}</span>
    <span className="badge">-{producto.descuento_valor}%</span>
  </div>
)}
```

## 🔧 Mantenimiento

### Activar/Desactivar Descuento
```sql
UPDATE descuentos SET activo = 0 WHERE id = 1;  -- Desactivar
UPDATE descuentos SET activo = 1 WHERE id = 1;  -- Activar
```

### Ver Descuentos Activos
```sql
SELECT * FROM descuentos 
WHERE activo = 1 
AND CURDATE() BETWEEN fecha_inicio AND fecha_fin;
```

### Ver Productos con Descuento
```sql
SELECT * FROM vista_productos_con_descuento 
WHERE tiene_descuento = 1;
```

## 📌 Notas Importantes

1. **Prioridad**: Si un producto tiene múltiples descuentos (ej: por producto Y por categoría), se aplica solo uno (el primero encontrado).
2. **Fechas**: Los descuentos solo se aplican si la fecha actual está entre `fecha_inicio` y `fecha_fin`.
3. **Activo**: El campo `activo` debe ser 1 para que el descuento funcione.
4. **Monto Fijo**: Los descuentos en monto fijo restan directamente del precio base.

## ✅ Archivos Relacionados

- `add_descuentos_table.sql` - Crear tabla de descuentos
- `fix_vista_descuentos.sql` - Crear vista con descuentos
- `backend/api/productos.php` - Endpoint que usa la vista
- `consultas_descuentos.sql` - Consultas útiles para probar
