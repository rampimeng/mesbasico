import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Machine } from '@/types';
import MachineFormModal from './MachineFormModal';

const MachinesList = () => {
  const company = useAuthStore((state) => state.company);
  const machines = useRegistrationStore((state) => state.getMachines(company?.id || ''));
  const groups = useRegistrationStore((state) => state.getGroups(company?.id || ''));
  const operators = useRegistrationStore((state) => state.getOperators(company?.id || ''));
  const deleteMachine = useRegistrationStore((state) => state.deleteMachine);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'Nenhuma';
    return groups.find((g) => g.id === groupId)?.name || 'N/A';
  };

  const getOperatorNamesForMachine = (groupId?: string) => {
    if (!groupId) return 'Nenhum (máquina sem célula)';
    const group = groups.find((g) => g.id === groupId);
    if (!group || !group.operatorIds || group.operatorIds.length === 0) return 'Nenhum';
    return group.operatorIds
      .map((id) => operators.find((op) => op.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Filter machines by selected group
  const filteredMachines = useMemo(() => {
    if (selectedGroupFilter === 'all') {
      return machines;
    }
    if (selectedGroupFilter === 'none') {
      return machines.filter((m) => !m.groupId);
    }
    return machines.filter((m) => m.groupId === selectedGroupFilter);
  }, [machines, selectedGroupFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Máquinas</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredMachines.length} de {machines.length} {machines.length === 1 ? 'máquina' : 'máquinas'}
          </p>
        </div>
        <button
          onClick={() => { setSelectedMachine(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nova Máquina
        </button>
      </div>

      {/* Filter by Group/Cell */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Filter className="w-4 h-4" />
          Filtrar por Célula/Grupo
        </label>
        <select
          value={selectedGroupFilter}
          onChange={(e) => setSelectedGroupFilter(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todas as Células</option>
          <option value="none">Sem Célula</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredMachines.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">
              {machines.length === 0
                ? 'Nenhuma máquina cadastrada'
                : 'Nenhuma máquina encontrada neste filtro'}
            </p>
          </div>
        ) : (
          filteredMachines.map((machine) => (
            <div key={machine.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {machine.code}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Célula: </span>
                      <span className="font-medium text-gray-700">{getGroupName(machine.groupId)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Matrizes: </span>
                      <span className="font-medium text-gray-700">{machine.numberOfMatrices}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ciclo Padrão: </span>
                      <span className="font-medium text-gray-700">{machine.standardCycleTime}s</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Operadores (via célula): </span>
                      <span className="font-medium text-gray-700">{getOperatorNamesForMachine(machine.groupId)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => { setSelectedMachine(machine); setIsModalOpen(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {deleteConfirm === machine.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { deleteMachine(machine.id); setDeleteConfirm(null); }}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                        Confirmar
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(machine.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <MachineFormModal
          machine={selectedMachine}
          onClose={() => { setIsModalOpen(false); setSelectedMachine(null); }}
        />
      )}
    </div>
  );
};

export default MachinesList;
