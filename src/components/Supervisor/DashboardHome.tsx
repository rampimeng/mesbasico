import { useState, useEffect } from 'react';
import { Calendar, Filter, TrendingUp, BarChart3, Activity, AlertCircle } from 'lucide-react';
import { DashboardFilters as FilterType } from '@/types';
import DashboardFilters from './DashboardFilters';
import { analyticsService, ParetoDataItem, TimeMetrics, CycleMetrics } from '@/services/analyticsService';

const DashboardHome = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    groupIds: [],
    machineIds: [],
    operatorIds: [],
  });

  const [paretoData, setParetoData] = useState<ParetoDataItem[]>([]);
  const [timeMetrics, setTimeMetrics] = useState<TimeMetrics | null>(null);
  const [cycleMetrics, setCycleMetrics] = useState<CycleMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsFilters = {
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        groupIds: filters.groupIds,
        machineIds: filters.machineIds,
        operatorIds: filters.operatorIds,
      };

      console.log('📊 Loading analytics data with filters:', analyticsFilters);

      // Load all data in parallel
      const [pareto, time, cycles] = await Promise.all([
        analyticsService.getParetoData(analyticsFilters),
        analyticsService.getTimeMetrics(analyticsFilters),
        analyticsService.getCycleMetrics(analyticsFilters),
      ]);

      setParetoData(pareto);
      setTimeMetrics(time);
      setCycleMetrics(cycles);

      console.log('✅ Analytics data loaded successfully');
    } catch (err: any) {
      console.error('❌ Error loading analytics:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const hasData = paretoData.length > 0 || (timeMetrics && timeMetrics.totalTime > 0);

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

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar dados</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-500 mt-4">Carregando dados...</p>
          </div>
        </div>
      )}

      {/* Data Display */}
      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-semibold">Disponibilidade Efetiva (OEE)</p>
                  <p className="text-3xl font-bold mt-2">
                    {timeMetrics ? `${timeMetrics.efficiency.toFixed(1)}%` : '0%'}
                  </p>
                  <p className="text-green-100 text-xs mt-1">Ponderado por matrizes</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tempo em Produção</p>
                  <p className="text-3xl font-bold mt-2">
                    {timeMetrics ? formatTime(timeMetrics.totalProductionTime) : '0h 0m'}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">Ponderado por matrizes</p>
                </div>
                <Activity className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Tempo Parado</p>
                  <p className="text-3xl font-bold mt-2">
                    {timeMetrics ? formatTime(timeMetrics.totalStopTime) : '0h 0m'}
                  </p>
                  <p className="text-red-100 text-xs mt-1">Ponderado por matrizes</p>
                </div>
                <Activity className="w-12 h-12 text-red-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Ciclos Realizados</p>
                  <p className="text-3xl font-bold mt-2">
                    {cycleMetrics ? `${cycleMetrics.completedCycles}/${cycleMetrics.targetCycles || '?'}` : '0/0'}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Pareto Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Análise de Pareto - Motivos de Parada</h2>
                <p className="text-gray-600 mt-1">Principais causas de tempo parado (ordenadas por impacto)</p>
              </div>
            </div>

            {paretoData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                <BarChart3 className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-semibold">Nenhum dado de parada registrado</p>
                <p className="text-gray-400 mt-2 text-center max-w-md">
                  Quando houver paradas registradas, o gráfico de Pareto aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paretoData.map((item, index) => (
                  <div key={item.reasonId} className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold text-gray-600">{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{item.reasonName}</span>
                        <span className="text-sm text-gray-600">
                          {formatTime(item.duration)} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-red-500 h-4 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm text-gray-500">
                      Acum: {item.cumulativePercentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cycles vs Target */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ciclos: Previstos vs Realizados</h2>

            {cycleMetrics && cycleMetrics.completedCycles > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700">Ciclos Realizados:</span>
                  <span className="font-bold text-purple-600">{cycleMetrics.completedCycles}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700">Meta de Ciclos:</span>
                  <span className="font-bold text-gray-900">{cycleMetrics.targetCycles || 'Não definida'}</span>
                </div>
                {cycleMetrics.targetCycles > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Progresso:</span>
                      <span className="font-bold text-green-600">{cycleMetrics.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-purple-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(cycleMetrics.percentage, 100)}%` }}
                      >
                        <span className="text-white text-sm font-semibold">
                          {cycleMetrics.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                <Activity className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-semibold">Nenhum ciclo registrado</p>
                <p className="text-gray-400 mt-2 text-center max-w-md">
                  Os operadores podem registrar ciclos usando o botão "Adicionar Giro".
                </p>
              </div>
            )}
          </div>

          {/* Empty State if no data at all */}
          {!hasData && (
            <div className="card bg-blue-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Nenhum dado de produção encontrado</h3>
                  <p className="text-blue-800 mb-2">Para começar a ver dados:</p>
                  <ol className="text-blue-800 space-y-2 text-sm">
                    <li><strong>1.</strong> Certifique-se de que operadores estão vinculados a células</li>
                    <li><strong>2.</strong> Operadores devem fazer login e clicar em "Iniciar Turno"</li>
                    <li><strong>3.</strong> Registrar paradas e giros durante a produção</li>
                    <li><strong>4.</strong> Os dados aparecerão aqui em tempo real!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardHome;
