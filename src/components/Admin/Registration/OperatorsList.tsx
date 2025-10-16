import { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { User } from '@/types';
import OperatorFormModal from './OperatorFormModal';

const OperatorsList = () => {
  const company = useAuthStore((state) => state.company);
  const operators = useRegistrationStore((state) => state.getOperators(company?.id || ''));
  const groups = useRegistrationStore((state) => state.getGroups(company?.id || ''));
  const deleteOperator = useRegistrationStore((state) => state.deleteOperator);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleNew = () => {
    setSelectedOperator(null);
    setIsModalOpen(true);
  };

  const handleEdit = (operator: User) => {
    setSelectedOperator(operator);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteOperator(id);
    setDeleteConfirm(null);
  };

  const getGroupNames = (groupIds?: string[]) => {
    if (!groupIds || groupIds.length === 0) return 'Nenhuma';
    return groupIds
      .map((id) => groups.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Operadores</h2>
          <p className="text-sm text-gray-600 mt-1">
            {operators.length} {operators.length === 1 ? 'operador cadastrado' : 'operadores cadastrados'}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Operador
        </button>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {operators.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum operador cadastrado</p>
            <button
              onClick={handleNew}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Cadastrar primeiro operador
            </button>
          </div>
        ) : (
          operators.map((operator) => (
            <div
              key={operator.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{operator.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        operator.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {operator.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {operator.email}
                    </div>
                    {operator.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {operator.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Células: </span>
                      <span className="font-medium text-gray-700">{getGroupNames(operator.groupIds)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(operator)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {deleteConfirm === operator.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(operator.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(operator.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <OperatorFormModal
          operator={selectedOperator}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOperator(null);
          }}
        />
      )}
    </div>
  );
};

export default OperatorsList;
