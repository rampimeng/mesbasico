import { useState } from 'react';
import { Calendar, Filter, TrendingUp, BarChart3, Activity, AlertCircle } from 'lucide-react';
import { DashboardFilters as FilterType } from '@/types';
import DashboardFilters from './DashboardFilters';

const DashboardHome = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    groupIds: [],
    machineIds: [],
    operatorIds: [],
  });

  // No data available - empty state
  const hasData = false;

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Filtros Globais</h2>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>

        {showFilters && (
          <DashboardFilters
            filters={filters}
            onChange={setFilters}
          />
        )}

        {/* Active Filters Summary */}
        <div className="flex items-center gap-4 text-sm mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Período: {filters.startDate.toLocaleDateString()} - {filters.endDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="space-y-6">
          {/* KPI Cards - Empty State */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tempo em Produção</p>
                  <p className="text-3xl font-bold mt-2">0h 0m</p>
                </div>
                <Activity className="w-12 h-12 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Sem dados registrados</span>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Tempo Parado</p>
                  <p className="text-3xl font-bold mt-2">0h 0m</p>
                </div>
                <Activity className="w-12 h-12 text-red-200" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Sem dados registrados</span>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Eficiência</p>
                  <p className="text-3xl font-bold mt-2">0%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Sem dados registrados</span>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Ciclos Realizados</p>
                  <p className="text-3xl font-bold mt-2">0/0</p>
                </div>
                <Activity className="w-12 h-12 text-purple-200" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Sem dados registrados</span>
              </div>
            </div>
          </div>

          {/* Pareto Chart - Empty State */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Análise de Pareto - Motivos de Parada</h2>
                <p className="text-gray-600 mt-1">Principais causas de tempo parado (ordenadas por impacto)</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <BarChart3 className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">Nenhum dado disponível</p>
              <p className="text-gray-400 mt-2 text-center max-w-md">
                Configure máquinas, grupos e operadores nas <strong>Configurações</strong> e inicie a produção para visualizar os dados do Pareto.
              </p>
            </div>
          </div>

          {/* Cycles vs Target - Empty State */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ciclos: Previstos vs Realizados</h2>

            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <Activity className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">Nenhum dado disponível</p>
              <p className="text-gray-400 mt-2 text-center max-w-md">
                Configure as metas de ciclos nas <strong>Configurações</strong> e inicie a produção para visualizar o desempenho.
              </p>
            </div>
          </div>

          {/* Helpful Info Card */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Como começar?</h3>
                <ol className="text-blue-800 space-y-2 text-sm">
                  <li><strong>1.</strong> Acesse <strong>Configurações</strong> no menu lateral</li>
                  <li><strong>2.</strong> Cadastre Grupos/Células, Máquinas, Motivos de Parada e Operadores</li>
                  <li><strong>3.</strong> Vincule operadores aos grupos de máquinas</li>
                  <li><strong>4.</strong> Os operadores poderão iniciar a produção e os dados aparecerão aqui!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
