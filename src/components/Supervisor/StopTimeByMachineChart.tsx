import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { StopTimeByMachineData } from '../../services/analyticsService';

interface StopTimeByMachineChartProps {
  data: StopTimeByMachineData;
  title: string;
}

// Paleta de cores vibrantes para os motivos de parada
const COLORS = [
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
  '#a855f7', // purple-500
];

const StopTimeByMachineChart: React.FC<StopTimeByMachineChartProps> = ({ data, title }) => {
  const { chartData, reasons } = data;

  // Se não houver dados, mostrar mensagem
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Nenhum dado de parada encontrado para os filtros selecionados
        </div>
      </div>
    );
  }

  // Custom tooltip para mostrar os valores formatados
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalMinutes = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600 mb-2">
            Total: {hours}h {minutes}min
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const reasonName = reasons.find(r => r.id === entry.dataKey)?.name || entry.dataKey;
              const mins = entry.value;
              const h = Math.floor(mins / 60);
              const m = mins % 60;

              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700">
                    {reasonName}: {h}h {m}min
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label para o eixo Y (tempo em horas e minutos)
  const formatYAxisTick = (value: number) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${minutes}m`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="machineName"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Tempo de Parada', angle: -90, position: 'insideLeft' }}
            tickFormatter={formatYAxisTick}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const reason = reasons.find(r => r.id === value);
              return reason ? reason.name : value;
            }}
          />

          {/* Renderizar uma barra para cada motivo de parada */}
          {reasons.map((reason, index) => (
            <Bar
              key={reason.id}
              dataKey={reason.id}
              stackId="stopTime"
              fill={COLORS[index % COLORS.length]}
              name={reason.name}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Informação adicional sobre o número de máquinas */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {chartData.length} máquina(s) com {reasons.length} motivo(s) de parada
      </div>
    </div>
  );
};

export default StopTimeByMachineChart;
