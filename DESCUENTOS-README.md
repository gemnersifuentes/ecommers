# 🎉 Sistema de Descuentos - Instalación Rápida

## ✅ Archivos Modificados/Creados

### Backend
- ✨ `backend/api/productos.php` - Ahora usa vista con descuentos
- ✨ `backend/api/descuentos.php` - **NUEVO** API crudescuentos  
- ✨ `src/services/api.js` - Funciones para descuentos

### Frontend
- ✨ `src/pages/Productos.jsx` - Muestra descuentos dinámicos

### SQL
- 📄 `add_descuentos_table.sql` - Crea tabla descuentos
- 📄 `consultas_descuentos.sql` - Crea vista y consultas

---

## 🚀 PASOS PARA ACTIVAR

### 1. Ejecutar en phpMyAdmin (BASE DE DATOS)

```sql
-- Paso 1: Abrir phpMyAdmin
-- Paso 2: Seleccionar base de datos: db_tienda_redhard
-- Paso 3: Ir a pestaña SQL
-- Paso 4: Copiar y pegar contenido de add_descuentos_table.sql
-- Paso 5: Click en "Continuar"
-- Paso 6: Copiar y pegar contenido de consultas_descuentos.sql  
-- Paso 7: Click en "Continuar"
```

### 2. Verificar que funcione

1. **Verificar vista SQL:**
   ```sql
   SELECT * FROM vista_productos_con_descuento LIMIT 5;
   ```
   Debe mostrar productos con campos: `precio_final`, `tiene_descuento`, `descuento_aplicado`

2. **Probar API productos:**
   - Abrir: `http://localhost:8000/api/productos`
   - Debe retornar productos con descuento_info

3. **Ver en frontend:**
   - Ir a: `http://localhost:5173/productos`
   - Los productos con descuento mostrarán:
     - ✅ Badge rojo con `-20%` o `-$50`
     - ✅ Precio original tachado
     - ✅ Precio con descuento grande
     - ✅ Texto "Ahorro: $XX" en verde

---

## 🎯  Descuentos de Ejemplo

Ya se crearon 5 descuentos de ejemplo:
1. **15% en RTX 4060** (producto individual)
2. **20% en Memorias RAM** (categoría completa)
3. **10% en AMD** (marca completa)
4. **$50 en Monitor Samsung** (monto fijo)
5. **25% en Procesadores** (Cyber Monday)

---

## 🛠️ Cómo Crear Nuevos Descuentos

### Opción 1: Directamente en phpMyAdmin

```sql
INSERT INTO descuentos (
    nombre, 
    descripcion, 
    tipo, 
    valor, 
    fecha_inicio, 
    fecha_fin, 
    activo, 
    aplica_a, 
    producto_id, 
    categoria_id, 
    marca_id
) VALUES (
    'Black Friday 2024',          -- nombre
    'Descuento especial',          -- descripcion
    'porcentaje',                  -- tipo: 'porcentaje' o 'monto_fijo'
    30.00,                         -- valor: 30% o $30
    '2024-11-20',                  -- fecha_inicio
    '2024-12-31',                  -- fecha_fin
    1,                             -- activo: 1=si, 0=no
    'categoria',                   -- aplica_a: 'producto', 'categoria' o 'marca'
    NULL,                          -- producto_id (solo si aplica_a='producto')
    1,                             -- categoria_id (solo si aplica_a='categoria')
    NULL                           -- marca_id (solo si aplica_a='marca')
);
```

### Opción 2: Usando API (Postman/Fetch)

```javascript
fetch('http://localhost:8000/api/descuentos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Super Oferta',
    descripcion: 'Descuento temporal',
    tipo: 'porcentaje',
    valor: 25,
    fecha_inicio: '2024-11-20',
    fecha_fin: '2024-12-31',
    activo: 1,
    aplica_a: 'producto',
    producto_id: 10,
    categoria_id: null,
    marca_id: null
  })
})
```

---

## 📊 Consultas Útiles

```sql
-- Ver todos los descuentos activos HOY
SELECT * FROM descuentos 
WHERE activo = 1 
AND CURDATE() BETWEEN fecha_inicio AND fecha_fin;

-- Ver productos con descuento activo
SELECT * FROM vista_productos_con_descuento
WHERE tiene_descuento = 1;

-- Top 10 mejores descuentos
SELECT nombre, precio_base, descuento_aplicado, precio_final
FROM vista_productos_con_descuento
WHERE tiene_descuento = 1
ORDER BY descuento_aplicado DESC
LIMIT 10;
```

---

## 🐛 Solución de Problemas

### Error: "Table 'descuentos' doesn't exist"
**Solución:** Ejecuta `add_descuentos_table.sql` en phpMyAdmin

### Error: "View 'vista_productos_con_descuento' doesn't exist"
**Solución:** Ejecuta `consultas_descuentos.sql` en phpMyAdmin

### Los descuentos no se muestran en frontend
**Verificar:**
1. ¿La vista SQL existe? `SHOW TABLES LIKE 'vista_%';`
2. ¿El backend está corriendo? `http://localhost:8000/api/productos`
3. ¿El frontend está corriendo? `npm run dev`
4. ¿Los descuentos están activos? Verificar campo `activo=1` y fechas

### Badge no aparece
**Verificar:** Campo `tiene_descuento` debe ser `1` en la respuesta de la API

---

## ✅ TODO OK SI VES:

✅ Badge rojo en productos con descuento  
✅ Precio original tachado  
✅ Precio final más grande  
✅ Texto verde "Ahorro: $XX"  
✅ Badge muestra porcentaje o monto correcto  

---

## 🎨 Próximos Pasos (Opcional)

1. Crear página de administración de descuentos en `/admin/descuentos`
2. Agregar filtro "Solo con descuento" en catálogo
3. Mostrar descuentos destacados en página de inicio
4. Agregar contador de tiempo restante para descuentos

---

¿Todo funcionando? ¡Disfruta tu sistema de descuentos! 🎉
