import { MapPin, Trash2, Edit2, Star } from 'lucide-react';

export const DireccionCard = ({ direccion, onEdit, onDelete, onSetDefault, isDefault }) => {
    return (
        <div className={`bg-white rounded-lg border-2 p-4 transition-all ${direccion.es_predeterminada ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="flex items-start justify-between gap-4">
                {/* Left side - Address info */}
                <div className="flex-1">
                    {/* Badge + Name */}
                    <div className="flex items-center gap-2 mb-2">
                        {direccion.es_predeterminada && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                                <Star size={12} className="fill-current" />
                                Predeterminada
                            </span>
                        )}
                        <h4 className="font-semibold text-gray-900">{direccion.nombre_destinatario}</h4>
                    </div>

                    {/* Address details */}
                    <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-start gap-2">
                            <MapPin size={16} className="flex-shrink-0 mt-0.5 text-gray-400" />
                            <span>{direccion.direccion}</span>
                        </p>
                        <p className="ml-6">
                            {direccion.distrito}, {direccion.provincia}, {direccion.departamento}
                            {direccion.codigo_postal && ` - ${direccion.codigo_postal}`}
                        </p>
                        {direccion.referencia && (
                            <p className="ml-6 text-gray-500 italic">
                                Ref: {direccion.referencia}
                            </p>
                        )}
                        <p className="ml-6 text-gray-700 font-medium">
                            Tel: {direccion.telefono}
                        </p>
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-col gap-2">
                    {!direccion.es_predeterminada && (
                        <button
                            onClick={() => onSetDefault(direccion.id)}
                            className="px-3 py-1.5 text-xs text-orange-600 border border-orange-600 rounded hover:bg-orange-50 transition-colors"
                            title="Marcar como predeterminada"
                        >
                            Predeterminada
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(direccion)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar dirección"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(direccion.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar dirección"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
