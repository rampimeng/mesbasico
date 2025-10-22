import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Shift } from '@/types';
import ShiftFormModal from './ShiftFormModal';

const ShiftsList = () => {
  const company = useAuthStore((state) => state.company);
  const shifts = useRegistrationStore((state) => state.getShifts(company?.id || ''));
  const deleteShift = useRegistrationStore((state) => state.deleteShift);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Turnos</h2>
          <p className="text-sm text-gray-600 mt-1">
            {shifts.length} {shifts.length === 1 ? 'turno cadastrado' : 'turnos cadastrados'}
          </p>
        </div>
        <button
          onClick={() => { setSelectedShift(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Novo Turno
        </button>
      </div>

      <div className="grid gap-4">
        {shifts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum turno cadastrado</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div key={shift.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{shift.name}</h3>
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      <Clock className="w-3 h-3" />
                      {shift.totalHours} horas/turno
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Início:</span> {shift.startTime}
                    </div>
                    <div>
                      <span className="font-medium">Almoço:</span> {shift.lunchTime}
                    </div>
                    <div>
                      <span className="font-medium">Fim:</span> {shift.endTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => { setSelectedShift(shift); setIsModalOpen(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {deleteConfirm === shift.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { deleteShift(shift.id); setDeleteConfirm(null); }}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                        Confirmar
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(shift.id)}
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
        <ShiftFormModal
          shift={selectedShift}
          onClose={() => { setIsModalOpen(false); setSelectedShift(null); }}
        />
      )}
    </div>
  );
};

export default ShiftsList;
