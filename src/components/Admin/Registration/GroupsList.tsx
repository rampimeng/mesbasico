import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Group } from '@/types';
import GroupFormModal from './GroupFormModal';

const GroupsList = () => {
  const company = useAuthStore((state) => state.company);
  const groups = useRegistrationStore((state) => state.getGroups(company?.id || ''));
  const deleteGroup = useRegistrationStore((state) => state.deleteGroup);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleNew = () => {
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGroup(id);
    setDeleteConfirm(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Células / Grupos</h2>
          <p className="text-sm text-gray-600 mt-1">
            {groups.length} {groups.length === 1 ? 'célula cadastrada' : 'células cadastradas'}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Célula
        </button>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nenhuma célula cadastrada</p>
            <button
              onClick={handleNew}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Cadastrar primeira célula
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    {group.shift && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        <Clock className="w-3 h-3" />
                        {group.shift.name} ({group.shift.totalHours}h)
                      </span>
                    )}
                    {group.cyclesPerShift && group.cyclesPerShift > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        {group.cyclesPerShift} giros/turno
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600">{group.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {deleteConfirm === group.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(group.id)}
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
                      onClick={() => setDeleteConfirm(group.id)}
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
        <GroupFormModal
          group={selectedGroup}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupsList;
