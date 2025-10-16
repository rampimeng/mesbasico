import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { User, UserRole } from '@/types';

interface OperatorFormModalProps {
  operator: User | null;
  onClose: () => void;
}

const OperatorFormModal = ({ operator, onClose }: OperatorFormModalProps) => {
  const company = useAuthStore((state) => state.company);
  const groups = useRegistrationStore((state) => state.getGroups(company?.id || ''));
  const addOperator = useRegistrationStore((state) => state.addOperator);
  const updateOperator = useRegistrationStore((state) => state.updateOperator);

  const [formData, setFormData] = useState({
    name: operator?.name || '',
    email: operator?.email || '',
    phone: operator?.phone || '',
    password: operator?.password || '',
    active: operator?.active ?? true,
    groupIds: operator?.groupIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (operator) {
      setFormData({
        name: operator.name,
        email: operator.email,
        phone: operator.phone || '',
        password: operator.password,
        active: operator.active,
        groupIds: operator.groupIds || [],
      });
    }
  }, [operator]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!operator && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (formData.groupIds.length === 0) {
      newErrors.groupIds = 'Selecione pelo menos uma célula';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !company) return;

    if (operator) {
      // Atualizar
      updateOperator(operator.id, {
        ...formData,
        password: formData.password || operator.password,
      });
    } else {
      // Adicionar novo
      addOperator({
        companyId: company.id,
        role: UserRole.OPERATOR,
        mfaEnabled: false,
        ...formData,
      });
    }

    onClose();
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData((prev) => {
      const groupIds = prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId];
      return { ...prev, groupIds };
    });
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {operator ? 'Editar Operador' : 'Novo Operador'}
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
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="João da Silva"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="joao@empresa.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(11) 98765-4321"
              maxLength={15}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha {!operator && '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={operator ? 'Deixe em branco para não alterar' : 'Mínimo 6 caracteres'}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Células */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Células *
            </label>
            <div className="space-y-2 border border-gray-300 rounded-lg p-4">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma célula cadastrada. Cadastre células primeiro.
                </p>
              ) : (
                groups.map((group) => (
                  <label key={group.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.groupIds.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{group.name}</span>
                  </label>
                ))
              )}
            </div>
            {errors.groupIds && <p className="mt-1 text-sm text-red-600">{errors.groupIds}</p>}
          </div>

          {/* Status Ativo */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Operador ativo</span>
            </label>
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
              {operator ? 'Salvar Alterações' : 'Cadastrar Operador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorFormModal;
