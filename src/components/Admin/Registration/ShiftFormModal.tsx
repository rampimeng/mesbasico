import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Shift } from '@/types';

interface ShiftFormModalProps {
  shift: Shift | null;
  onClose: () => void;
}

const ShiftFormModal = ({ shift, onClose }: ShiftFormModalProps) => {
  const company = useAuthStore((state) => state.company);
  const addShift = useRegistrationStore((state) => state.addShift);
  const updateShift = useRegistrationStore((state) => state.updateShift);

  const [name, setName] = useState(shift?.name || '');
  const [startTime, setStartTime] = useState(shift?.startTime || '');
  const [lunchTime, setLunchTime] = useState(shift?.lunchTime || '');
  const [endTime, setEndTime] = useState(shift?.endTime || '');
  const [totalHours, setTotalHours] = useState(shift?.totalHours || '00:00');

  // Função para converter HH:mm para minutos
  const timeToMinutes = (time: string): number => {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Função para converter minutos para HH:mm
  const minutesToTime = (minutes: number): string => {
    if (minutes < 0) minutes = 0;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Calcular Total de Horas automaticamente
  useEffect(() => {
    if (startTime && endTime) {
      const startMinutes = timeToMinutes(startTime);
      let endMinutes = timeToMinutes(endTime);
      const lunchMinutes = timeToMinutes(lunchTime);

      // Se o horário de término for menor que o de início, considerar que atravessa a meia-noite
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Adicionar 24 horas
      }

      // Calcular diferença e subtrair almoço
      const totalMinutes = endMinutes - startMinutes - lunchMinutes;
      setTotalHours(minutesToTime(totalMinutes));
    }
  }, [startTime, lunchTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company) return;

    const shiftData = {
      companyId: company.id,
      name,
      startTime,
      lunchTime,
      endTime,
      totalHours,
    };

    try {
      if (shift) {
        await updateShift(shift.id, shiftData);
      } else {
        await addShift(shiftData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {shift ? 'Editar Turno' : 'Novo Turno'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Turno *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Turno 1, Manhã, Noite"
                className="input"
                required
              />
            </div>

            {/* Hora Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Início *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Tempo de Almoço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Almoço *
              </label>
              <input
                type="time"
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                placeholder="HH:mm"
                className="input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: 01:00 para 1 hora de almoço
              </p>
            </div>

            {/* Hora Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Fim *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Total de Horas (Calculado automaticamente) */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-green-800 mb-1">
                Horas/Turno (Calculado)
              </label>
              <div className="text-2xl font-bold text-green-600">
                {totalHours}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Calculado automaticamente: Fim - Início - Almoço
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary flex-1">
              {shift ? 'Salvar' : 'Criar'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftFormModal;
