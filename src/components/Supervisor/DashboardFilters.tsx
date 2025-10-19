import { useState, useEffect } from 'react';
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
          {machines.map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.name} ({machine.code})
            </option>
          ))}
        </select>
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
          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DashboardFilters;
