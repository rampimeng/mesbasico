import { useState } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Line, ComposedChart } from 'recharts';
import { Calendar, Filter, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { DashboardFilters as FilterType } from '@/types';
import DashboardFilters from './DashboardFilters';

// Mock data
const paretoData = [
  { reason: 'Troca de Matriz', duration: 180, percentage: 35, cumulative: 35 },
  { reason: 'Falta de Material', duration: 120, percentage: 23, cumulative: 58 },
  { reason: 'Ajuste de Qualidade', duration: 90, percentage: 18, cumulative: 76 },
  { reason: 'Manutenção', duration: 60, percentage: 12, cumulative: 88 },
  { reason: 'Pausa Programada', duration: 40, percentage: 8, cumulative: 96 },
  { reason: 'Outros', duration: 20, percentage: 4, cumulative: 100 },
];

const cycleData = {
  target: 500,
  completed: 423,
  percentage: 84.6,
};

const timeMetrics = {
  totalProductionTime: 420, // minutos
  totalStopTime: 510, // minutos
  efficiency: 45.2, // %
};

const DashboardHome = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    groupIds: [],
    machineIds: [],
    operatorIds: [],
  });

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4'];

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tempo em Produção</p>
              <p className="text-3xl font-bold mt-2">
                {Math.floor(timeMetrics.totalProductionTime / 60)}h {timeMetrics.totalProductionTime % 60}m
              </p>
            </div>
            <Activity className="w-12 h-12 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12% vs semana anterior</span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Tempo Parado</p>
              <p className="text-3xl font-bold mt-2">
                {Math.floor(timeMetrics.totalStopTime / 60)}h {timeMetrics.totalStopTime % 60}m
              </p>
            </div>
            <Clock className="w-12 h-12 text-red-200" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">-8% vs semana anterior</span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Eficiência</p>
              <p className="text-3xl font-bold mt-2">{timeMetrics.efficiency}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+5% vs semana anterior</span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ciclos Realizados</p>
              <p className="text-3xl font-bold mt-2">
                {cycleData.completed}/{cycleData.target}
              </p>
            </div>
            <Activity className="w-12 h-12 text-purple-200" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-purple-400 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${cycleData.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">{cycleData.percentage}% da meta</p>
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

        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={paretoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="reason"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: '12px' }}
            />
            <YAxis yAxisId="left" label={{ value: 'Tempo (min)', angle: -90, position: 'insideLeft' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Acumulado (%)', angle: 90, position: 'insideRight' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="duration" name="Tempo (min)" radius={[8, 8, 0, 0]}>
              {paretoData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              name="Acumulado (%)"
              stroke="#1e40af"
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Insight:</strong> Os 3 principais motivos de parada representam 76% do tempo total parado.
            Foque em ações para reduzir "Troca de Matriz" e "Falta de Material" para maior impacto.
          </p>
        </div>
      </div>

      {/* Cycles vs Target */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ciclos: Previstos vs Realizados</h2>

        <div className="flex items-center justify-center gap-12 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">Meta de Ciclos</p>
            <div className="w-32 h-32 rounded-full border-8 border-gray-300 flex items-center justify-center">
              <p className="text-4xl font-bold text-gray-900">{cycleData.target}</p>
            </div>
          </div>

          <div className="text-6xl text-gray-400">→</div>

          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">Ciclos Realizados</p>
            <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center bg-green-50">
              <p className="text-4xl font-bold text-green-700">{cycleData.completed}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">Desempenho</p>
            <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center bg-purple-50">
              <p className="text-4xl font-bold text-purple-700">{cycleData.percentage}%</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-900">
            <strong>Status:</strong> Bom desempenho! Você está a {cycleData.target - cycleData.completed} ciclos
            de atingir a meta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
