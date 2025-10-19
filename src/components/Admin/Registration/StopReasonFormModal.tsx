import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { StopReason } from '@/types';

interface StopReasonFormModalProps {
  reason: StopReason | null;
  onClose: () => void;
}

const StopReasonFormModal = ({ reason, onClose }: StopReasonFormModalProps) => {
  const company = useAuthStore((state) => state.company);
  const addStopReason = useRegistrationStore((state) => state.addStopReason);
  const updateStopReason = useRegistrationStore((state) => state.updateStopReason);

  const [formData, setFormData] = useState({
    name: reason?.name || '',
    description: reason?.description || '',
    category: reason?.category || '',
    ignoreInPareto: reason?.ignoreInPareto || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reason) {
      setFormData({
        name: reason.name,
        description: reason.description || '',
        category: reason.category || '',
        ignoreInPareto: reason.ignoreInPareto || false,
      });
    }
  }, [reason]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !company) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      console.log('🔍 Submitting stop reason data:', formData);

      if (reason) {
        await updateStopReason(reason.id, formData);
      } else {
        await addStopReason({ companyId: company.id, ...formData });
      }
      console.log('✅ Stop reason saved successfully');
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving stop reason:', error);
      setApiError(error.message || 'Erro ao salvar motivo de parada');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{reason ? 'Editar Motivo' : 'Novo Motivo de Parada'}</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Motivo *</label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ex: Falta de Material" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <input type="text" value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: Material, Manutenção, Qualidade" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Descrição detalhada do motivo"
              rows={3} />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="ignoreInPareto"
              type="checkbox"
              checked={formData.ignoreInPareto}
              onChange={(e) => setFormData({ ...formData, ignoreInPareto: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div>
              <label htmlFor="ignoreInPareto" className="block text-sm font-medium text-gray-700 cursor-pointer">
                Ignorar no Gráfico de Pareto
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Se marcado, este motivo será registrado mas não aparecerá no gráfico de Pareto de análise
              </p>
            </div>
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
              {isSubmitting ? 'Salvando...' : (reason ? 'Salvar' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StopReasonFormModal;
