import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Group } from '@/types';

interface GroupFormModalProps {
  group: Group | null;
  onClose: () => void;
}

const GroupFormModal = ({ group, onClose }: GroupFormModalProps) => {
  const company = useAuthStore((state) => state.company);
  const addGroup = useRegistrationStore((state) => state.addGroup);
  const updateGroup = useRegistrationStore((state) => state.updateGroup);
  const getOperators = useRegistrationStore((state) => state.getOperators);

  const operators = getOperators(company?.id || '');

  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    cyclesPerShift: group?.cyclesPerShift || 0,
    operatorIds: group?.operatorIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        cyclesPerShift: group.cyclesPerShift || 0,
        operatorIds: group.operatorIds || [],
      });
    }
  }, [group]);

  const handleOperatorToggle = (operatorId: string) => {
    setFormData((prev) => ({
      ...prev,
      operatorIds: prev.operatorIds.includes(operatorId)
        ? prev.operatorIds.filter((id) => id !== operatorId)
        : [...prev.operatorIds, operatorId],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da célula é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !company) return;

    if (group) {
      updateGroup(group.id, formData);
    } else {
      addGroup({
        companyId: company.id,
        ...formData,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {group ? 'Editar Célula' : 'Nova Célula'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Célula *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Célula de Injeção"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição opcional da célula"
              rows={3}
            />
          </div>

          {/* Giros por Turno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giros Esperados por Turno
            </label>
            <input
              type="number"
              value={formData.cyclesPerShift}
              onChange={(e) => setFormData({ ...formData, cyclesPerShift: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 480"
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Meta de giros que devem ser realizados por turno nesta célula
            </p>
          </div>

          {/* Operadores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operadores Vinculados
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {operators.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum operador cadastrado ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {operators.map((operator) => (
                    <label
                      key={operator.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.operatorIds.includes(operator.id)}
                        onChange={() => handleOperatorToggle(operator.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{operator.name}</p>
                        <p className="text-xs text-gray-500">{operator.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Selecione os operadores que fazem parte desta célula
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {group ? 'Salvar Alterações' : 'Cadastrar Célula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupFormModal;
