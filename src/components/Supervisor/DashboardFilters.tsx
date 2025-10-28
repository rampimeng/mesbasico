import { useState, useEffect, useMemo } from 'react';
import { DashboardFilters as FilterType } from '@/types';
import { filtersService } from '@/services/filtersService';

interface DashboardFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

const DashboardFilters = ({ filters, onChange }: DashboardFiltersProps) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      const [groupsData, machinesData, operatorsData] = await Promise.all([
        filtersService.getGroups(),
        filtersService.getMachines(),
        filtersService.getOperators(),
      ]);

      setGroups(groupsData || []);
      setMachines(machinesData || []);
      setOperators(operatorsData || []);
    } catch (error) {
      console.error('❌ Error loading filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar máquinas baseado no grupo selecionado
  const filteredMachines = useMemo(() => {
    const selectedGroupId = filters.groupIds?.[0];
    if (!selectedGroupId) {
      return machines; // Se nenhum grupo selecionado, mostrar todas
    }
    return machines.filter(machine => machine.groupId === selectedGroupId);
  }, [machines, filters.groupIds]);

  // Filtrar operadores baseado no grupo selecionado
  const filteredOperators = useMemo(() => {
    const selectedGroupId = filters.groupIds?.[0];
    if (!selectedGroupId) {
      return operators; // Se nenhum grupo selecionado, mostrar todos
    }
    return operators.filter(operator =>
      operator.groupIds && operator.groupIds.includes(selectedGroupId)
    );
  }, [operators, filters.groupIds]);

  // Quando o grupo muda, resetar máquina e operador se não estiverem mais disponíveis
  useEffect(() => {
    const selectedGroupId = filters.groupIds?.[0];
    const selectedMachineId = filters.machineIds?.[0];
    const selectedOperatorId = filters.operatorIds?.[0];

    // Se não há grupo selecionado, não precisa fazer nada
    if (!selectedGroupId) {
      return;
    }

    let needsUpdate = false;
    const newFilters = { ...filters };

    // Verificar se a máquina selecionada ainda está na lista filtrada
    if (selectedMachineId && !filteredMachines.find(m => m.id === selectedMachineId)) {
      newFilters.machineIds = [];
      needsUpdate = true;
    }

    // Verificar se o operador selecionado ainda está na lista filtrada
    if (selectedOperatorId && !filteredOperators.find(o => o.id === selectedOperatorId)) {
      newFilters.operatorIds = [];
      needsUpdate = true;
    }

    if (needsUpdate) {
      onChange(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.groupIds]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="label">Data Inicial</label>
        <input
          type="date"
          value={filters.startDate.toISOString().split('T')[0]}
          onChange={(e) =>
            onChange({ ...filters, startDate: new Date(e.target.value) })
          }
          className="input"
        />
      </div>

      <div>
        <label className="label">Data Final</label>
        <input
          type="date"
          value={filters.endDate.toISOString().split('T')[0]}
          onChange={(e) =>
            onChange({ ...filters, endDate: new Date(e.target.value) })
          }
          className="input"
        />
      </div>

      <div>
        <label className="label">Grupo/Célula</label>
        <select
          className="input"
          value={(filters.groupIds || []).join(',')}
          onChange={(e) =>
            onChange({
              ...filters,
              groupIds: e.target.value ? [e.target.value] : [],
            })
          }
          disabled={loading}
        >
          <option value="">Todos</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Máquina</label>
        <select
          className="input"
          value={(filters.machineIds || []).join(',')}
          onChange={(e) =>
            onChange({
              ...filters,
              machineIds: e.target.value ? [e.target.value] : [],
            })
          }
          disabled={loading}
        >
          <option value="">Todas</option>
          {filteredMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.name} ({machine.code})
            </option>
          ))}
        </select>
        {filters.groupIds && filters.groupIds.length > 0 && filteredMachines.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">Nenhuma máquina vinculada a esta célula</p>
        )}
      </div>

      <div>
        <label className="label">Operador</label>
        <select
          className="input"
          value={(filters.operatorIds || []).join(',')}
          onChange={(e) =>
            onChange({
              ...filters,
              operatorIds: e.target.value ? [e.target.value] : [],
            })
          }
          disabled={loading}
        >
          <option value="">Todos</option>
          {filteredOperators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.name}
            </option>
          ))}
        </select>
        {filters.groupIds && filters.groupIds.length > 0 && filteredOperators.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">Nenhum operador vinculado a esta célula</p>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;
