import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Settings, Package, Calendar, ClipboardList, Truck, Plus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { maintenanceService, MaintenanceEquipment, MaintenanceComponent, MaintenancePlan, WorkOrder, Supplier } from '@/services/maintenanceService';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'equipment' | 'components' | 'plans' | 'workOrders' | 'suppliers'>('equipment');
  
  const [equipment, setEquipment] = useState<MaintenanceEquipment[]>([]);
  const [components, setComponents] = useState<MaintenanceComponent[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      switch (activeTab) {
        case 'equipment':
          const equipmentData = await maintenanceService.getAllEquipment();
          setEquipment(equipmentData);
          break;
        case 'components':
          const componentsData = await maintenanceService.getAllComponents();
          setComponents(componentsData);
          break;
        case 'plans':
          const plansData = await maintenanceService.getAllMaintenancePlans();
          setPlans(plansData);
          break;
        case 'workOrders':
          const workOrdersData = await maintenanceService.getAllWorkOrders();
          setWorkOrders(workOrdersData);
          break;
        case 'suppliers':
          const suppliersData = await maintenanceService.getAllSuppliers();
          setSuppliers(suppliersData);
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'FINISHED':
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'OPEN':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
      case 'INACTIVE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em Andamento',
      FINISHED: 'Finalizada',
      CANCELLED: 'Cancelada',
      APPROVED: 'Aprovada',
      PENDING_APPROVAL: 'Aguardando Aprovação',
    };
    return labels[status] || status;
  };

  const tabs = [
    { id: 'equipment', label: 'Equipamentos', icon: Settings, count: equipment.length },
    { id: 'components', label: 'Componentes', icon: Package, count: components.length },
    { id: 'plans', label: 'Planos', icon: Calendar, count: plans.length },
    { id: 'workOrders', label: 'Ordens de Serviço', icon: ClipboardList, count: workOrders.length },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck, count: suppliers.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Módulo de Manutenção</h1>
          </div>
          <p className="text-gray-600">
            Gestão completa de manutenção industrial
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'equipment' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Equipamentos</h2>
                  <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Equipamento
                  </button>
                </div>
                {equipment.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum equipamento cadastrado</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {equipment.map((eq) => (
                      <div key={eq.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{eq.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(eq.status)}`}>
                                {getStatusLabel(eq.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Código: {eq.code}</p>
                            {eq.manufacturer && <p className="text-sm text-gray-600">Fabricante: {eq.manufacturer}</p>}
                            {eq.model && <p className="text-sm text-gray-600">Modelo: {eq.model}</p>}
                            {eq.mtbf && <p className="text-sm text-gray-600">MTBF: {eq.mtbf.toFixed(2)}h</p>}
                            {eq.mttr && <p className="text-sm text-gray-600">MTTR: {eq.mttr.toFixed(2)}h</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'components' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Componentes / Peças</h2>
                  <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Componente
                  </button>
                </div>
                {components.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum componente cadastrado</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {components.map((comp) => (
                      <div key={comp.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{comp.description}</h3>
                            <p className="text-sm text-gray-600">Código: {comp.code}</p>
                            <p className="text-sm text-gray-600">Estoque: {comp.currentStock} {comp.unitOfMeasure}</p>
                            <p className="text-sm text-gray-600">Mínimo: {comp.minimumStock} {comp.unitOfMeasure}</p>
                            {comp.currentStock < comp.minimumStock && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 mt-2 bg-red-100 text-red-700 rounded text-xs">
                                <AlertCircle className="w-3 h-3" />
                                Estoque baixo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Planos de Manutenção</h2>
                  <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Plano
                  </button>
                </div>
                {plans.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum plano cadastrado</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{plan.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {plan.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Tipo: {plan.type}</p>
                            <p className="text-sm text-gray-600">Frequência: A cada {plan.frequencyValue} {plan.frequencyType.toLowerCase()}</p>
                            {plan.nextExecutionDate && (
                              <p className="text-sm text-gray-600">
                                Próxima execução: {new Date(plan.nextExecutionDate).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'workOrders' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Ordens de Serviço</h2>
                  <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nova OS
                  </button>
                </div>
                {workOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma ordem de serviço cadastrada</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {workOrders.map((wo) => (
                      <div key={wo.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">OS: {wo.workOrderNumber}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(wo.status)}`}>
                                {getStatusLabel(wo.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Tipo: {wo.type}</p>
                            {wo.equipment && (
                              <p className="text-sm text-gray-600">Equipamento: {wo.equipment.name}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              Aberta em: {new Date(wo.openedDate).toLocaleDateString('pt-BR')}
                            </p>
                            {wo.executionTime && (
                              <p className="text-sm text-gray-600">Tempo de execução: {wo.executionTime} min</p>
                            )}
                            {wo.totalCost > 0 && (
                              <p className="text-sm text-gray-600">Custo total: R$ {wo.totalCost.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Fornecedores</h2>
                  <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Fornecedor
                  </button>
                </div>
                {suppliers.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum fornecedor cadastrado</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {suppliers.map((supplier) => (
                      <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{supplier.corporateName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${supplier.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {supplier.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            {supplier.tradeName && (
                              <p className="text-sm text-gray-600">Nome fantasia: {supplier.tradeName}</p>
                            )}
                            {supplier.email && (
                              <p className="text-sm text-gray-600">E-mail: {supplier.email}</p>
                            )}
                            {supplier.phone && (
                              <p className="text-sm text-gray-600">Telefone: {supplier.phone}</p>
                            )}
                            {supplier.sla && (
                              <p className="text-sm text-gray-600">SLA: {supplier.sla}h</p>
                            )}
                          </div>
                        </div>
                      </div>
                ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;

