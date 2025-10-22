import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { StopReason } from '@/types';
import StopReasonFormModal from './StopReasonFormModal';

const StopReasonsList = () => {
  const company = useAuthStore((state) => state.company);
  const allStopReasons = useRegistrationStore((state) => state.getStopReasons(company?.id || ''));
  const deleteStopReason = useRegistrationStore((state) => state.deleteStopReason);

  // Filtrar motivos do sistema (como "Turno Encerrado") que não devem aparecer na interface de cadastro
  const stopReasons = allStopReasons.filter(reason => reason.name !== 'Turno Encerrado');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<StopReason | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Motivos de Parada</h2>
          <p className="text-sm text-gray-600 mt-1">
            {stopReasons.length} {stopReasons.length === 1 ? 'motivo cadastrado' : 'motivos cadastrados'}
          </p>
        </div>
        <button
          onClick={() => { setSelectedReason(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Novo Motivo
        </button>
      </div>

      <div className="grid gap-4">
        {stopReasons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum motivo de parada cadastrado</p>
          </div>
        ) : (
          stopReasons.map((reason) => (
            <div key={reason.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{reason.name}</h3>
                    {reason.category && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        <Tag className="w-3 h-3" />
                        {reason.category}
                      </span>
                    )}
                  </div>
                  {reason.description && (
                    <p className="mt-1 text-sm text-gray-600">{reason.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => { setSelectedReason(reason); setIsModalOpen(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {deleteConfirm === reason.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { deleteStopReason(reason.id); setDeleteConfirm(null); }}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                        Confirmar
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(reason.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <StopReasonFormModal
          reason={selectedReason}
          onClose={() => { setIsModalOpen(false); setSelectedReason(null); }}
        />
      )}
    </div>
  );
};

export default StopReasonsList;
