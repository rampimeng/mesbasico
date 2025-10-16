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
  const operators = useRegistrationStore((state) => state.getOperators(company?.id || ''));
  const addMachine = useRegistrationStore((state) => state.addMachine);
  const updateMachine = useRegistrationStore((state) => state.updateMachine);

  const [formData, setFormData] = useState({
    name: machine?.name || '',
    code: machine?.code || '',
    groupId: machine?.groupId || '',
    numberOfMatrices: machine?.numberOfMatrices || 0,
    standardCycleTime: machine?.standardCycleTime || 60,
    operatorIds: machine?.operatorIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name,
        code: machine.code,
        groupId: machine.groupId || '',
        numberOfMatrices: machine.numberOfMatrices,
        standardCycleTime: machine.standardCycleTime,
        operatorIds: machine.operatorIds,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !company) return;

    const data = {
      ...formData,
      groupId: formData.groupId || undefined,
    };

    if (machine) {
      updateMachine(machine.id, data);
    } else {
      addMachine({
        ...data,
        companyId: company.id,
      });
    }
    onClose();
  };

  const handleOperatorToggle = (opId: string) => {
    setFormData((prev) => ({
      ...prev,
      operatorIds: prev.operatorIds.includes(opId)
        ? prev.operatorIds.filter((id) => id !== opId)
        : [...prev.operatorIds, opId],
    }));
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operadores Vinculados</label>
            <div className="space-y-2 border border-gray-300 rounded-lg p-4">
              {operators.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum operador cadastrado</p>
              ) : (
                operators.map((op) => (
                  <label key={op.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.operatorIds.includes(op.id)}
                      onChange={() => handleOperatorToggle(op.id)}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm">{op.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {machine ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineFormModal;
