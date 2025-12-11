# Formulario AdminProductos - Nuevos Campos E-commerce

## Instrucciones

Agrega estos campos al formulario modal de AdminProductos.jsx. Los campos están organizados en secciones para mejor usabilidad.

---

## 1. SEO & Marketing Section

```jsx
{/* SEO & Marketing */}
<div className="mb-4">
  <h3 className="text-lg font-semibold mb-3 text-primary border-b pb-2">
    SEO & Marketing
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Meta Título */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Meta Título (SEO)
      </label>
      <input
        type="text"
        name="meta_titulo"
        value={formData.meta_titulo}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="Título optimizado para SEO"
        maxLength="255"
      />
    </div>

    {/* Slug */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Slug (URL amigable)
      </label>
      <input
        type="text"
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="producto-ejemplo"
      />
      <small className="text-gray-500">Auto-generado si se deja vacío</small>
    </div>

    {/* Meta Descripción */}
    <div className="md:col-span-2">
      <label className="block mb-2 font-medium text-gray-700">
        Meta Descripción (SEO)
      </label>
      <textarea
        name="meta_descripcion"
        value={formData.meta_descripcion}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        rows="2"
        placeholder="Descripción para motores de búsqueda (160 caracteres max)"
        maxLength="160"
      />
    </div>

    {/* Palabras Clave */}
    <div className="md:col-span-2">
      <label className="block mb-2 font-medium text-gray-700">
        Palabras Clave
      </label>
      <input
        type="text"
        name="palabras_clave"
        value={formData.palabras_clave}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="laptop, gaming, asus, rgb"
      />
    </div>

    {/* Etiquetas */}
    <div className="md:col-span-2">
      <label className="block mb-2 font-medium text-gray-700">
        Etiquetas
      </label>
      <input
        type="text"
        name="etiquetas"
        value={formData.etiquetas}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="oferta, premium, exclusivo"
      />
    </div>

    {/* Destacado y Nuevo */}
    <div className="flex gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="destacado"
          checked={formData.destacado}
          onChange={(e) => handleChange({ target: { name: 'destacado', value: e.target.checked } })}
          className="w-5 h-5"
        />
        <span className="font-medium text-gray-700">Producto Destacado</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="nuevo"
          checked={formData.nuevo}
          onChange={(e) => handleChange({ target: { name: 'nuevo', value: e.target.checked } })}
          className="w-5 h-5"
        />
        <span className="font-medium text-gray-700">Producto Nuevo</span>
      </label>
    </div>
  </div>
</div>
```

---

## 2. Logística & Envío Section

```jsx
{/* Logística & Envío */}
<div className="mb-4">
  <h3 className="text-lg font-semibold mb-3 text-primary border-b pb-2">
    Logística & Envío
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* SKU */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        SKU
      </label>
      <input
        type="text"
        name="sku"
        value={formData.sku}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="PROD-000001"
      />
      <small className="text-gray-500">Auto-generado si se deja vacío</small>
    </div>

    {/* Peso */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Peso (kg)
      </label>
      <input
        type="number"
        step="0.01"
        name="peso"
        value={formData.peso}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="2.5"
      />
    </div>

    {/* Stock Mínimo */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Stock Mínimo (alerta)
      </label>
      <input
        type="number"
        name="stock_minimo"
        value={formData.stock_minimo}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="5"
      />
    </div>

    {/* Dimensiones */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Largo (cm)
      </label>
      <input
        type="number"
        step="0.01"
        name="largo"
        value={formData.largo}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="35.5"
      />
    </div>

    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Ancho (cm)
      </label>
      <input
        type="number"
        step="0.01"
        name="ancho"
        value={formData.ancho}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="24.0"
      />
    </div>

    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Alto (cm)
      </label>
      <input
        type="number"
        step="0.01"
        name="alto"
        value={formData.alto}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="2.0"
      />
    </div>

    {/* Envío Gratis */}
    <div className="md:col-span-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="envio_gratis"
          checked={formData.envio_gratis}
          onChange={(e) => handleChange({ target: { name: 'envio_gratis', value: e.target.checked } })}
          className="w-5 h-5"
        />
        <span className="font-medium text-gray-700">Envío Gratis</span>
      </label>
    </div>
  </div>
</div>
```

---

## 3. Información del Producto Section

```jsx
{/* Información del Producto */}
<div className="mb-4">
  <h3 className="text-lg font-semibold mb-3 text-primary border-b pb-2">
    Información del Producto
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Condición */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Condición
      </label>
      <select
        name="condicion"
        value={formData.condicion}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
      >
        <option value="nuevo">Nuevo</option>
        <option value="usado">Usado</option>
        <option value="reacondicionado">Reacondicionado</option>
      </select>
    </div>

    {/* Garantía */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Garantía (meses)
      </label>
      <input
        type="number"
        name="garantia_meses"
        value={formData.garantia_meses}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="12"
      />
    </div>

    {/* Marca Fabricante */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Marca Fabricante
      </label>
      <input
        type="text"
        name="marca_fabricante"
        value={formData.marca_fabricante}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="Intel, AMD, etc."
      />
    </div>

    {/* Modelo */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Modelo
      </label>
      <input
        type="text"
        name="modelo"
        value={formData.modelo}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="ROG Strix G15"
      />
    </div>

    {/* Video URL */}
    <div className="md:col-span-2">
      <label className="block mb-2 font-medium text-gray-700">
        Video URL (YouTube, Vimeo, etc.)
      </label>
      <input
        type="url"
        name="video_url"
        value={formData.video_url}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="https://www.youtube.com/watch?v=..."
      />
    </div>

    {/* Política de Devolución */}
    <div>
      <label className="block mb-2 font-medium text-gray-700">
        Política de Devolución (días)
      </label>
      <input
        type="number"
        name="politica_devolucion_dias"
        value={formData.politica_devolucion_dias}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus-primary"
        placeholder="30"
      />
    </div>
  </div>
</div>
```

---

## Dónde agregarlos

Busca en AdminProductos.jsx el formulario actual (donde está el input de "nombre", "descripcion", etc.) y agrega estas secciones **después de los campos básicos existentes** y **antes del botón de guardar**.

El orden sugerido es:
1. Campos Básicos (nombre, descripción, precio, stock) - **Ya existen**
2. SEO & Marketing - **Nuevo**
3. Logística & Envío - **Nuevo**
4. Información del Producto - **Nuevo**
5. Botón Guardar - **Ya existe**

---

## Notas Importantes

- Los campos `sku` y `slug` se auto-generan en el backend si se dejan vacíos
- Los checkboxes (`destacado`, `nuevo`, `envio_gratis`) requieren el onChange especial con `e.target.checked`
- Todos los nuevos campos son **opcionales** excepto los que tienen defaults
- El backend ya está preparado para recibir estos campos
