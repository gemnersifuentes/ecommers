import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import { descuentosService, productosService, categoriasService, marcasService } from '../../services'

export default function AdminDescuentos() {
    const [descuentos, setDescuentos] = useState([])
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [marcas, setMarcas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [mostrarModal, setMostrarModal] = useState(false)
    const [descuentoEdit, setDescuentoEdit] = useState(null)

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'porcentaje',
        valor: '',
        fecha_inicio: '',
        fecha_fin: '',
        activo: 1,
        aplica_a: 'producto',
        producto_id: '',
        categoria_id: '',
        marca_id: ''
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            setCargando(true)
            const [descuentosData, productosData, categoriasData, marcasData] = await Promise.all([
                descuentosService.getAll(),
                productosService.getAll(),
                categoriasService.getAll(),
                marcasService.getAll()
            ])

            setDescuentos(Array.isArray(descuentosData) ? descuentosData : [])
            setProductos(Array.isArray(productosData) ? productosData : [])
            setCategorias(Array.isArray(categoriasData) ? categoriasData : [])
            setMarcas(Array.isArray(marcasData) ? marcasData : [])
        } catch (error) {
            console.error('Error al cargar datos:', error)
            Swal.fire('Error', 'No se pudieron cargar los datos', 'error')
        } finally {
            setCargando(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            tipo: 'porcentaje',
            valor: '',
            fecha_inicio: '',
            fecha_fin: '',
            activo: 1,
            aplica_a: 'producto',
            producto_id: '',
            categoria_id: '',
            marca_id: ''
        })
        setDescuentoEdit(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Preparar datos
        const dataToSend = { ...formData }

        // Asegurar que las fechas incluyan hora para evitar problemas de zona horaria y vencimiento
        // fecha_inicio a las 00:00:00
        if (dataToSend.fecha_inicio && !dataToSend.fecha_inicio.includes(':')) {
            dataToSend.fecha_inicio = `${dataToSend.fecha_inicio} 00:00:00`
        }

        // fecha_fin a las 23:59:59
        if (dataToSend.fecha_fin && !dataToSend.fecha_fin.includes(':')) {
            dataToSend.fecha_fin = `${dataToSend.fecha_fin} 23:59:59`
        }

        // Limpiar IDs según el tipo de aplicación
        if (dataToSend.aplica_a === 'producto') {
            dataToSend.categoria_id = null
            dataToSend.marca_id = null
        } else if (dataToSend.aplica_a === 'categoria') {
            dataToSend.producto_id = null
            dataToSend.marca_id = null
        } else if (dataToSend.aplica_a === 'marca') {
            dataToSend.producto_id = null
            dataToSend.categoria_id = null
        }

        try {
            if (descuentoEdit) {
                await descuentosService.update(descuentoEdit.id, dataToSend)
                Swal.fire('¡Actualizado!', 'El descuento ha sido actualizado', 'success')
            } else {
                await descuentosService.create(dataToSend)
                Swal.fire('¡Creado!', 'El descuento ha sido creado', 'success')
            }

            setMostrarModal(false)
            resetForm()
            cargarDatos()
        } catch (error) {
            console.error('Error:', error)
            Swal.fire('Error', 'No se pudo guardar el descuento', 'error')
        }
    }

    const handleEditar = (descuento) => {
        setDescuentoEdit(descuento)
        setFormData({
            nombre: descuento.nombre || '',
            descripcion: descuento.descripcion || '',
            tipo: descuento.tipo || 'porcentaje',
            valor: descuento.valor || '',
            // Extract YYYY-MM-DD from datetime string for date inputs
            fecha_inicio: descuento.fecha_inicio ? descuento.fecha_inicio.split(' ')[0] : '',
            fecha_fin: descuento.fecha_fin ? descuento.fecha_fin.split(' ')[0] : '',
            activo: descuento.activo || 1,
            aplica_a: descuento.aplica_a || 'producto',
            producto_id: descuento.producto_id || '',
            categoria_id: descuento.categoria_id || '',
            marca_id: descuento.marca_id || ''
        })
        setMostrarModal(true)
    }

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esto desactivará el descuento',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await descuentosService.delete(id)
                Swal.fire('¡Desactivado!', 'El descuento ha sido desactivado', 'success')
                cargarDatos()
            } catch (error) {
                Swal.fire('Error', 'No se pudo desactivar el descuento', 'error')
            }
        }
    }

    const abrirModalNuevo = () => {
        resetForm()
        setMostrarModal(true)
    }

    const getEstadoBadge = (descuento) => {
        const hoy = new Date()

        // MySQL format "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS" for proper parsing
        const fechaInicioStr = descuento.fecha_inicio ? descuento.fecha_inicio.replace(' ', 'T') : null;
        const fechaFinStr = descuento.fecha_fin ? descuento.fecha_fin.replace(' ', 'T') : null;

        const inicio = fechaInicioStr ? new Date(fechaInicioStr) : new Date();
        const fin = fechaFinStr ? new Date(fechaFinStr) : new Date();

        if (!descuento.activo) {
            return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">Inactivo</span>
        }
        if (hoy < inicio) {
            return <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded text-xs">Próximo</span>
        }
        if (hoy > fin) {
            return <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">Vencido</span>
        }
        return <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">Activo</span>
    }

    return (
        <>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Descuentos</h1>
                    <p className="text-gray-600 text-sm">Gestiona los descuentos de tu tienda</p>
                </div>

                {/* Botón Nuevo */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={abrirModalNuevo}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i>
                        Nuevo Descuento
                    </button>
                </div>

                {/* Tabla */}
                {cargando ? (
                    <div className="text-center py-8">
                        <i className="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aplica a</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {descuentos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No hay descuentos creados
                                        </td>
                                    </tr>
                                ) : (
                                    descuentos.map((desc, index) => (
                                        <tr key={`${desc.id}-${index}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{desc.nombre}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{desc.tipo}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {desc.tipo === 'porcentaje' ? `${desc.valor}%` : `$${desc.valor}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="capitalize">{desc.aplica_a}</div>
                                                <div className="text-xs text-gray-400">{desc.afecta_nombre}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{desc.fecha_inicio}</div>
                                                <div className="text-xs text-gray-400">hasta {desc.fecha_fin}</div>
                                            </td>
                                            <td className="px-6 py-4">{getEstadoBadge(desc)}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => handleEditar(desc)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(desc.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {mostrarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        style={{
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {descuentoEdit ? 'Editar Descuento' : 'Nuevo Descuento'}
                                    </h2>
                                    <button
                                        onClick={() => setMostrarModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Descuento *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Ej: Black Friday 2024"
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Descripción del descuento"
                                        />
                                    </div>

                                    {/* Tipo y Valor */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo *
                                            </label>
                                            <select
                                                name="tipo"
                                                value={formData.tipo}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="porcentaje">Porcentaje</option>
                                                <option value="monto_fijo">Monto Fijo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valor *
                                            </label>
                                            <input
                                                type="number"
                                                name="valor"
                                                value={formData.valor}
                                                onChange={handleInputChange}
                                                required
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                placeholder={formData.tipo === 'porcentaje' ? '15' : '50'}
                                            />
                                        </div>
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha Inicio *
                                            </label>
                                            <input
                                                type="date"
                                                name="fecha_inicio"
                                                value={formData.fecha_inicio}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha Fin *
                                            </label>
                                            <input
                                                type="date"
                                                name="fecha_fin"
                                                value={formData.fecha_fin}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Aplica a */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Aplica a *
                                        </label>
                                        <select
                                            name="aplica_a"
                                            value={formData.aplica_a}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="producto">Producto</option>
                                            <option value="categoria">Categoría</option>
                                            <option value="marca">Marca</option>
                                        </select>
                                    </div>

                                    {/* Selector condicional */}
                                    {formData.aplica_a === 'producto' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Producto *
                                            </label>
                                            <select
                                                name="producto_id"
                                                value={formData.producto_id}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Seleccionar producto</option>
                                                {productos.map((p, index) => (
                                                    <option key={`${p.id}-${index}`} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.aplica_a === 'categoria' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría *
                                            </label>
                                            <select
                                                name="categoria_id"
                                                value={formData.categoria_id}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categorias.map((c, index) => (
                                                    <option key={`${c.id}-${index}`} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.aplica_a === 'marca' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Marca *
                                            </label>
                                            <select
                                                name="marca_id"
                                                value={formData.marca_id}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Seleccionar marca</option>
                                                {marcas.map((m, index) => (
                                                    <option key={`${m.id}-${index}`} value={m.id}>{m.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Botones */}
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setMostrarModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            {descuentoEdit ? 'Actualizar' : 'Guardar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
