import { DashboardFilters as FilterType } from '@/types';

interface DashboardFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

const DashboardFilters = ({ filters, onChange }: DashboardFiltersProps) => {
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
        <select className="input">
          <option value="">Todos</option>
          <option value="g1">Grupo Injetoras</option>
          <option value="g2">Grupo Sopradores</option>
        </select>
      </div>

      <div>
        <label className="label">Máquina</label>
        <select className="input">
          <option value="">Todas</option>
          <option value="m1">Injetora 01</option>
          <option value="m2">Injetora 02</option>
          <option value="m3">Soprador 01</option>
        </select>
      </div>
    </div>
  );
};

export default DashboardFilters;
