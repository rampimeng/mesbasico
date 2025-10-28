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
  const getShifts = useRegistrationStore((state) => state.getShifts);
  const getStopReasons = useRegistrationStore((state) => state.getStopReasons);

  const operators = getOperators(company?.id || '');
  const shifts = getShifts(company?.id || '');
  const stopReasons = getStopReasons(company?.id || '');

  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    shiftId: group?.shiftId || '',
    cyclesPerShift: group?.cyclesPerShift || 0,
    operatorIds: group?.operatorIds || [],
    stopReasonIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingStopReasons, setLoadingStopReasons] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'operators' | 'stopReasons'>('basic');

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        shiftId: group.shiftId || '',
        cyclesPerShift: group.cyclesPerShift || 0,
        operatorIds: group.operatorIds || [],
        stopReasonIds: [],
      });

      // Carregar stop reasons vinculados ao grupo
      loadGroupStopReasons(group.id);
    }
  }, [group]);

  const loadGroupStopReasons = async (groupId: string) => {
    try {
      setLoadingStopReasons(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/groups/${groupId}/stop-reasons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, stopReasonIds: data.data || [] }));
      }
    } catch (error) {
      console.error('Error loading group stop reasons:', error);
    } finally {
      setLoadingStopReasons(false);
    }
  };

  const handleOperatorToggle = (operatorId: string) => {
    setFormData((prev) => ({
      ...prev,
      operatorIds: prev.operatorIds.includes(operatorId)
        ? prev.operatorIds.filter((id) => id !== operatorId)
        : [...prev.operatorIds, operatorId],
    }));
  };

  const handleStopReasonToggle = (stopReasonId: string) => {
    setFormData((prev) => ({
      ...prev,
      stopReasonIds: prev.stopReasonIds.includes(stopReasonId)
        ? prev.stopReasonIds.filter((id) => id !== stopReasonId)
        : [...prev.stopReasonIds, stopReasonId],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !company) return;

    try {
      let groupId: string;

      if (group) {
        await updateGroup(group.id, formData);
        groupId = group.id;
      } else {
        const newGroup = await addGroup({
          companyId: company.id,
          ...formData,
        });
        groupId = newGroup.id;
      }

      // Salvar stop reasons vinculados ao grupo
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/groups/${groupId}/stop-reasons`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stopReasonIds: formData.stopReasonIds }),
      });

      // Só fecha o modal após a operação completar com sucesso
      onClose();
    } catch (error: any) {
      // Exibir erro para o usuário
      setErrors({ submit: error.message || 'Erro ao salvar célula. Tente novamente.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dados Básicos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('operators')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'operators'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Operadores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stopReasons')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stopReasons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Motivos de Parada
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Aba: Dados Básicos */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
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

                {/* Turno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turno de Trabalho
                  </label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nenhum turno selecionado</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.totalHours} horas)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Vincule esta célula a um turno específico (opcional)
                  </p>
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
              </div>
            )}

            {/* Aba: Operadores */}
            {activeTab === 'operators' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operadores Vinculados
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
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
            )}

            {/* Aba: Motivos de Parada */}
            {activeTab === 'stopReasons' && (
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivos de Parada Permitidos
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {loadingStopReasons ? (
                <p className="text-sm text-gray-500 text-center py-4">Carregando motivos...</p>
              ) : stopReasons.filter(r => r.name !== 'Turno Encerrado').length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum motivo de parada cadastrado ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {stopReasons.filter(reason => reason.name !== 'Turno Encerrado').map((reason) => (
                    <label
                      key={reason.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.stopReasonIds.includes(reason.id)}
                        onChange={() => handleStopReasonToggle(reason.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reason.name}</p>
                        {reason.description && (
                          <p className="text-xs text-gray-500">{reason.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Selecione quais motivos de parada os operadores podem escolher nesta célula.
              Se nenhum for selecionado, todos os motivos estarão disponíveis.
            </p>
          </div>
            )}
          </div>

          {/* Actions - Fixed Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white">
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
