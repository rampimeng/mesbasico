import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Machine } from '@/types';

interface MachineFormModalProps {
  machine: Machine | null;
  onClose: () => void;
}

const MachineFormModal = ({ machine, onClose }: MachineFormModalProps) => {
  const company = useAuthStore((state) => state.company);
  const groups = useRegistrationStore((state) => state.getGroups(company?.id || ''));
  const addMachine = useRegistrationStore((state) => state.addMachine);
  const updateMachine = useRegistrationStore((state) => state.updateMachine);

  const [formData, setFormData] = useState({
    name: machine?.name || '',
    code: machine?.code || '',
    groupId: machine?.groupId || '',
    numberOfMatrices: machine?.numberOfMatrices || 0,
    standardCycleTime: machine?.standardCycleTime || 60,
    active: machine?.active !== undefined ? machine.active : true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name,
        code: machine.code,
        groupId: machine.groupId || '',
        numberOfMatrices: machine.numberOfMatrices,
        standardCycleTime: machine.standardCycleTime,
        active: machine.active !== undefined ? machine.active : true,
      });
    }
  }, [machine]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (formData.numberOfMatrices < 0) newErrors.numberOfMatrices = 'Valor inválido';
    if (formData.standardCycleTime <= 0) newErrors.standardCycleTime = 'Tempo deve ser maior que 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !company) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const data = {
        ...formData,
        groupId: formData.groupId || undefined,
      };

      console.log('🔍 Submitting machine data:', data);

      if (machine) {
        await updateMachine(machine.id, data);
      } else {
        await addMachine({
          ...data,
          companyId: company.id,
        });
      }
      console.log('✅ Machine saved successfully');
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving machine:', error);
      setApiError(error.message || 'Erro ao salvar máquina');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{machine ? 'Editar Máquina' : 'Nova Máquina'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Injetora 01" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
              <input type="text" value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="INJ-001" />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Célula</label>
            <select value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Nenhuma</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nº de Matrizes *</label>
              <input type="number" value={formData.numberOfMatrices}
                onChange={(e) => setFormData({ ...formData, numberOfMatrices: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg ${errors.numberOfMatrices ? 'border-red-500' : 'border-gray-300'}`}
                min="0" />
              {errors.numberOfMatrices && <p className="mt-1 text-sm text-red-600">{errors.numberOfMatrices}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Ciclo (seg) *</label>
              <input type="number" value={formData.standardCycleTime}
                onChange={(e) => setFormData({ ...formData, standardCycleTime: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg ${errors.standardCycleTime ? 'border-red-500' : 'border-gray-300'}`}
                min="1" />
              {errors.standardCycleTime && <p className="mt-1 text-sm text-red-600">{errors.standardCycleTime}</p>}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Máquina Ativa</span>
                <p className="text-sm text-gray-500 mt-1">
                  Máquinas inativas não aparecem para operadores e não são contabilizadas em relatórios
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </div>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> Os operadores terão acesso a esta máquina quando forem vinculados à célula <strong>{formData.groupId ? groups.find(g => g.id === formData.groupId)?.name : 'selecionada'}</strong>.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (machine ? 'Salvar' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineFormModal;
