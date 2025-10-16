import { useState } from 'react';
import { ClipboardList, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import { format } from 'date-fns';

type TabType = 'cycles' | 'stops';

const AuditPage = () => {
  const company = useAuthStore((state) => state.company);
  const { getCycleLogs, getTimeLogs, deleteCycleLog, deleteTimeLog } = useAuditStore();

  const [activeTab, setActiveTab] = useState<TabType>('cycles');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const cycleLogs = getCycleLogs(company?.id || '');
  const timeLogs = getTimeLogs(company?.id || '');

  const handleDeleteCycle = (id: string) => {
    deleteCycleLog(id);
    setDeleteConfirm(null);
  };

  const handleDeleteStop = (id: string) => {
    deleteTimeLog(id);
    setDeleteConfirm(null);
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
        {activeTab === 'cycles' ? (
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
