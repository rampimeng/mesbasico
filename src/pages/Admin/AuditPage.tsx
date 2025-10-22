import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Trash2, AlertCircle, CheckCircle, Download, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

type TabType = 'cycles' | 'stops';

const AuditPage = () => {
  const company = useAuthStore((state) => state.company);
  const { getCycleLogs, getTimeLogs, deleteCycleLog, deleteTimeLog, loadCycleLogs, loadTimeLogs, loading } = useAuditStore();
  const machines = useRegistrationStore((state) => state.getMachines(company?.id || ''));
  const operators = useRegistrationStore((state) => state.getOperators(company?.id || ''));

  const [activeTab, setActiveTab] = useState<TabType>('cycles');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');

  const allCycleLogs = getCycleLogs(company?.id || '');
  const allTimeLogs = getTimeLogs(company?.id || '');

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadCycleLogs();
    loadTimeLogs();
  }, [loadCycleLogs, loadTimeLogs]);

  // Aplicar filtros
  const cycleLogs = useMemo(() => {
    let filtered = allCycleLogs;

    if (startDate) {
      const filterDate = new Date(startDate);
      filtered = filtered.filter(log => new Date(log.cycleCompletedAt) >= filterDate);
    }
    if (machineFilter) {
      filtered = filtered.filter(log => log.machineId === machineFilter);
    }
    if (operatorFilter) {
      filtered = filtered.filter(log => log.operatorId === operatorFilter);
    }

    return filtered;
  }, [allCycleLogs, startDate, machineFilter, operatorFilter]);

  const timeLogs = useMemo(() => {
    let filtered = allTimeLogs;

    if (startDate) {
      const filterDate = new Date(startDate);
      filtered = filtered.filter(log => new Date(log.startedAt) >= filterDate);
    }
    if (machineFilter) {
      filtered = filtered.filter(log => log.machineId === machineFilter);
    }
    if (operatorFilter) {
      filtered = filtered.filter(log => log.operatorId === operatorFilter);
    }

    return filtered;
  }, [allTimeLogs, startDate, machineFilter, operatorFilter]);

  const handleDeleteCycle = async (id: string) => {
    try {
      await deleteCycleLog(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting cycle log:', error);
    }
  };

  const handleDeleteStop = async (id: string) => {
    try {
      await deleteTimeLog(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting time log:', error);
    }
  };

  const exportCyclesToExcel = () => {
    const data = cycleLogs.map(log => ({
      'Máquina': log.machineName || log.machineId,
      'Operador': log.operatorName || log.operatorId,
      'Data': format(new Date(log.cycleCompletedAt), 'dd/MM/yyyy'),
      'Hora': format(new Date(log.cycleCompletedAt), 'HH:mm:ss'),
      'Ciclos': log.cyclesCount || 1,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registro de Giros');

    const fileName = `Registro_Giros_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xls`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportStopsToExcel = () => {
    const data = timeLogs.map(log => ({
      'Máquina': log.machineName || log.machineId,
      'Matriz': log.matrixNumber || '-',
      'Operador': log.operatorName || log.operatorId,
      'Motivo de Parada': log.stopReasonName || 'Desconhecido',
      'Data Início': format(new Date(log.startedAt), 'dd/MM/yyyy'),
      'Hora Início': format(new Date(log.startedAt), 'HH:mm:ss'),
      'Duração (min)': log.durationSeconds ? Math.round(log.durationSeconds / 60) : 'Em andamento',
      'Status': log.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registro de Paradas');

    const fileName = `Registro_Paradas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xls`;
    XLSX.writeFile(workbook, fileName);
  };

  const clearFilters = () => {
    setStartDate('');
    setMachineFilter('');
    setOperatorFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Auditoria de Lançamentos</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie os registros de giros e paradas
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máquina
              </label>
              <select
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as máquinas</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operador
              </label>
              <select
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os operadores</option>
                {operators.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={activeTab === 'cycles' ? exportCyclesToExcel : exportStopsToExcel}
                disabled={activeTab === 'cycles' ? cycleLogs.length === 0 : timeLogs.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('cycles')}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'cycles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Registro de Giros ({cycleLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('stops')}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'stops'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                Registro de Paradas ({timeLogs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando registros...</p>
          </div>
        ) : activeTab === 'cycles' ? (
          <div className="space-y-4">
            {cycleLogs.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum registro de giro encontrado</p>
              </div>
            ) : (
              cycleLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Giro Registrado</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                        <div>
                          <span className="text-gray-500">Máquina:</span>
                          <p className="font-medium text-gray-900">{log.machineName || log.machineId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Operador:</span>
                          <p className="font-medium text-gray-900">{log.operatorName || log.operatorId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(log.cycleCompletedAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Hora:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(log.cycleCompletedAt), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {deleteConfirm === log.id ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleDeleteCycle(log.id)}
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
                          onClick={() => setDeleteConfirm(log.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir lançamento"
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
        ) : (
          <div className="space-y-4">
            {timeLogs.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum registro de parada encontrado</p>
              </div>
            ) : (
              timeLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Parada Registrada</h3>
                        {log.stopReasonName && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {log.stopReasonName}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mt-4">
                        <div>
                          <span className="text-gray-500">Máquina:</span>
                          <p className="font-medium text-gray-900">{log.machineName || log.machineId}</p>
                        </div>
                        {log.matrixNumber && (
                          <div>
                            <span className="text-gray-500">Matriz:</span>
                            <p className="font-medium text-gray-900">#{log.matrixNumber}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Operador:</span>
                          <p className="font-medium text-gray-900">{log.operatorName || log.operatorId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Início:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(log.startedAt), 'dd/MM HH:mm')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duração:</span>
                          <p className="font-medium text-gray-900">
                            {log.durationSeconds ? `${Math.round(log.durationSeconds / 60)} min` : 'Em andamento'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {deleteConfirm === log.id ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleDeleteStop(log.id)}
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
                          onClick={() => setDeleteConfirm(log.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir lançamento"
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
        )}
      </div>
    </div>
  );
};

export default AuditPage;
