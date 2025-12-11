import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ubigeoPeru } from '../data/ubigeo_peru';

export const DireccionForm = ({ isOpen, onClose, onSubmit, direccion = null, usuarioId }) => {
    const [formData, setFormData] = useState({
        nombre_destinatario: '',
        telefono: '',
        direccion: '',
        departamento: '',
        provincia: '',
        distrito: '',
        codigo_postal: '',
        referencia: '',
        es_predeterminada: false
    });

    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

    // Cargar datos de dirección si es edición
    useEffect(() => {
        if (direccion) {
            setFormData({
                nombre_destinatario: direccion.nombre_destinatario || '',
                telefono: direccion.telefono || '',
                direccion: direccion.direccion || '',
                departamento: direccion.departamento || '',
                provincia: direccion.provincia || '',
                distrito: direccion.distrito || '',
                codigo_postal: direccion.codigo_postal || '',
                referencia: direccion.referencia || '',
                es_predeterminada: direccion.es_predeterminada || false
            });
            // Load provincias y distritos si ya hay departamento/provincia seleccionados
            if (direccion.departamento) {
                const dept = ubigeoPeru.departamentos.find(d => d.name === direccion.departamento);
                if (dept) {
                    setProvincias(ubigeoPeru.provincias[dept.id] || []);
                }
            }
            if (direccion.departamento && direccion.provincia) {
                const prov = Object.values(ubigeoPeru.provincias).flat()
                    .find(p => p.name === direccion.provincia);
                if (prov) {
                    setDistritos(ubigeoPeru.distritos[prov.id] || []);
                }
            }
        } else {
            // Reset form
            setFormData({
                nombre_destinatario: '',
                telefono: '',
                direccion: '',
                departamento: '',
                provincia: '',
                distrito: '',
                codigo_postal: '',
                referencia: '',
                es_predeterminada: false
            });
            setProvincias([]);
            setDistritos([]);
        }
    }, [direccion, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUbigeoChange = (e) => {
        const { name, value } = e.target;

        if (name === 'departamento') {
            const deptId = value;
            const dept = ubigeoPeru.departamentos.find(d => d.id === deptId);
            setFormData(prev => ({
                ...prev,
                departamento: dept?.name || '',
                provincia: '',
                distrito: ''
            }));
            setProvincias(ubigeoPeru.provincias[deptId] || []);
            setDistritos([]);
        } else if (name === 'provincia') {
            const provId = value;
            const prov = provincias.find(p => p.id === provId);
            setFormData(prev => ({
                ...prev,
                provincia: prov?.name || '',
                distrito: ''
            }));
            setDistritos(ubigeoPeru.distritos[provId] || []);
        } else if (name === 'distrito') {
            const distId = value;
            const dist = distritos.find(d => d.id === distId);
            setFormData(prev => ({
                ...prev,
                distrito: dist?.name || ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, usuario_id: usuarioId };
        console.log('Enviando dirección:', payload); // Debug

        if (!usuarioId) {
            alert('Error: No se identificó al usuario. Por favor recarga la página.');
            return;
        }

        onSubmit(payload, direccion?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h3 className="text-xl font-bold text-gray-900">
                        {direccion ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nombre destinatario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del destinatario *
                        </label>
                        <input
                            type="text"
                            name="nombre_destinatario"
                            value={formData.nombre_destinatario}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            placeholder="987654321"
                        />
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección completa *
                        </label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            placeholder="Av. Principal 123, Piso 3, Dpto. 301"
                        />
                    </div>

                    {/* Ubigeo - Grid 3 columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Departamento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Departamento *
                            </label>
                            <select
                                name="departamento"
                                value={ubigeoPeru.departamentos.find(d => d.name === formData.departamento)?.id || ''}
                                onChange={handleUbigeoChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            >
                                <option value="">Seleccionar</option>
                                {ubigeoPeru.departamentos.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Provincia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Provincia *
                            </label>
                            <select
                                name="provincia"
                                value={provincias.find(p => p.name === formData.provincia)?.id || ''}
                                onChange={handleUbigeoChange}
                                required
                                disabled={!provincias.length}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100"
                            >
                                <option value="">Seleccionar</option>
                                {provincias.map(prov => (
                                    <option key={prov.id} value={prov.id}>{prov.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Distrito */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Distrito *
                            </label>
                            <select
                                name="distrito"
                                value={distritos.find(d => d.name === formData.distrito)?.id || ''}
                                onChange={handleUbigeoChange}
                                required
                                disabled={!distritos.length}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100"
                            >
                                <option value="">Seleccionar</option>
                                {distritos.map(dist => (
                                    <option key={dist.id} value={dist.id}>{dist.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Código Postal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código Postal
                        </label>
                        <input
                            type="text"
                            name="codigo_postal"
                            value={formData.codigo_postal}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            placeholder="15074"
                        />
                    </div>

                    {/* Referencia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Referencia
                        </label>
                        <textarea
                            name="referencia"
                            value={formData.referencia}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                            placeholder="Ej: Edificio azul, frente al parque"
                        />
                    </div>

                    {/* Checkbox predeterminada */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="es_predeterminada"
                            name="es_predeterminada"
                            checked={formData.es_predeterminada}
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="es_predeterminada" className="text-sm text-gray-700">
                            Marcar como mi dirección predeterminada
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                        >
                            {direccion ? 'Guardar Cambios' : 'Agregar Dirección'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
