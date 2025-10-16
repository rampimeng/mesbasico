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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reason) {
      setFormData({
        name: reason.name,
        description: reason.description || '',
        category: reason.category || '',
      });
    }
  }, [reason]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !company) return;

    if (reason) {
      updateStopReason(reason.id, formData);
    } else {
      addStopReason({ companyId: company.id, ...formData });
    }
    onClose();
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {reason ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StopReasonFormModal;
