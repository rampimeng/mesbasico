/**
 * Master Dashboard - Gestão de Empresas e Módulos SaaS
 * Permite ao usuário Master gerenciar empresas e habilitar/desabilitar módulos
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Company } from '@/types';
import { Building2, Plus, Edit, Power, Key, Shield, LogIn, Image, CheckCircle, XCircle } from 'lucide-react';
import CompanyFormModal from '@/components/Master/CompanyFormModal';
import ChangePasswordModal from '@/components/Master/ChangePasswordModal';
import { companiesService } from '@/services/companiesService';

// Extended Company type with extra fields
interface ExtendedCompany extends Company {
  email?: string;
  contactName?: string;
  contactPhone?: string;
  adminPassword?: string;
}

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, appLogoUrl } = useAuthStore();

  const [companies, setCompanies] = useState<ExtendedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ExtendedCompany | null>(null);

  // Load companies from API
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getAll();
      setCompanies(data as ExtendedCompany[]);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCompany = () => {
    setSelectedCompany(null);
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company: ExtendedCompany) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (companyData: Partial<ExtendedCompany>) => {
    try {
      if (selectedCompany) {
        // Edit existing
        await companiesService.update(selectedCompany.id, {
          name: companyData.name,
          cnpj: companyData.cnpj,
          email: companyData.email,
          contactName: companyData.contactName,
          contactPhone: companyData.contactPhone,
          logoUrl: companyData.logoUrl,
          active: companyData.active,
        });
      } else {
        // Create new
        await companiesService.create({
          name: companyData.name!,
          cnpj: companyData.cnpj!,
          email: companyData.email!,
          contactName: companyData.contactName!,
          contactPhone: companyData.contactPhone!,
          logoUrl: companyData.logoUrl,
          adminName: (companyData as any).adminName,
          adminEmail: (companyData as any).adminEmail,
          adminPassword: (companyData as any).adminPassword,
        });
      }

      // Reload companies
      await loadCompanies();
      setShowCompanyModal(false);
      setSelectedCompany(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar empresa');
      alert(err.message || 'Erro ao salvar empresa');
    }
  };

  const handleChangePassword = (company: ExtendedCompany) => {
    setSelectedCompany(company);
    setShowPasswordModal(true);
  };

  const handleSavePassword = async (newPassword: string) => {
    if (!selectedCompany) return;

    try {
      await companiesService.changeAdminPassword(selectedCompany.id, { newPassword });
      setShowPasswordModal(false);
      setSelectedCompany(null);
      setError('');
      alert('Senha do administrador alterada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
      alert(err.message || 'Erro ao alterar senha');
    }
  };

  const handleToggleActive = async (companyId: string) => {
    try {
      await companiesService.toggleStatus(companyId);
      await loadCompanies();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status');
      alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleTogglePDCA = async (companyId: string) => {
    try {
      await companiesService.togglePDCA(companyId);
      await loadCompanies();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status do PDCA');
      alert(err.message || 'Erro ao alterar status do PDCA');
    }
  };

  const handleToggleModule = async (companyId: string, module: string) => {
    try {
      await companiesService.toggleModule(companyId, module);
      await loadCompanies();
      setError('');
    } catch (err: any) {
      setError(err.message || `Erro ao alterar status do módulo ${module}`);
      alert(err.message || `Erro ao alterar status do módulo ${module}`);
    }
  };

  const handleAccessCompany = (company: ExtendedCompany) => {
    // Master pode acessar qualquer empresa (ativa ou inativa)
    // Criar um usuário temporário admin para essa empresa
    const tempAdminUser = {
      id: 'temp-master-admin',
      companyId: company.id,
      name: user?.name || 'Master User',
      email: user?.email || 'master@mes.com',
      password: '',
      role: 'ADMIN' as const,
      active: true,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salvar estado atual do Master
    localStorage.setItem('masterOriginalUser', JSON.stringify(user));

    // Configurar contexto para a empresa e usuário admin temporário
    localStorage.setItem('user', JSON.stringify(tempAdminUser));
    localStorage.setItem('company', JSON.stringify(company));
    localStorage.setItem('isMasterAccess', 'true');

    // Recarregar a página para aplicar as mudanças
    window.location.href = '/admin';
  };

  // Filtrar empresas com base na seleção
  const filteredCompanies = showInactive
    ? companies
    : companies.filter((c) => c.active);

  const handleNavigateToAppLogo = () => {
    navigate('/master/app-logo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {appLogoUrl ? (
                <img src={appLogoUrl} alt="Logo do App" className="h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Master</h1>
                <p className="text-gray-600">Gestão de Empresas SaaS</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleNavigateToAppLogo}
                className="btn-secondary flex items-center gap-2"
              >
                <Image className="w-5 h-5" />
                Logotipo do App
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Logado como</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
              <button onClick={logout} className="btn-secondary">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Empresas</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{companies.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Empresas Ativas</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {companies.filter((c) => c.active).length}
                </p>
              </div>
              <Power className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Empresas Inativas</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {companies.filter((c) => !c.active).length}
                </p>
              </div>
              <Power className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Companies List */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Empresas Cadastradas</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Mostrar inativas:</label>
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <button onClick={handleNewCompany} className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Empresa
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Carregando empresas...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    company.active
                      ? 'bg-white border-green-200 hover:border-green-400'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          company.active ? 'bg-green-100' : 'bg-gray-200'
                        }`}
                      >
                        <Building2
                          className={`w-8 h-8 ${
                            company.active ? 'text-green-600' : 'text-gray-500'
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {company.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              company.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {company.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><strong>CNPJ:</strong> {company.cnpj}</p>
                          <p><strong>E-mail:</strong> {company.email}</p>
                          <p><strong>Contato:</strong> {company.contactName}</p>
                          <p><strong>Telefone:</strong> {company.contactPhone}</p>
                        </div>

                        {/* Módulos Habilitados */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Módulo MES:</span>
                            <button
                              onClick={() => handleToggleModule(company.id, 'MES')}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                company.enabledModules?.includes('MES')
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {company.enabledModules?.includes('MES') ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Habilitado
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Desabilitado
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">PDCA:</span>
                            <button
                              onClick={() => handleTogglePDCA(company.id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                company.pdcaEnabled
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {company.pdcaEnabled ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Habilitado
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Desabilitado
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {company.dashboardToken && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-800 font-semibold mb-1">
                              Dashboard de Controle:
                            </p>
                            <a
                              href={`${window.location.origin}/control/${company.dashboardToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {`${window.location.origin}/control/${company.dashboardToken}`}
                            </a>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-3">
                          <p>Criada em: {new Date(company.createdAt).toLocaleDateString('pt-BR')}</p>
                          <p>Última atualização: {new Date(company.updatedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleAccessCompany(company)}
                        className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        <LogIn className="w-4 h-4" />
                        Acessar
                      </button>
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleChangePassword(company)}
                        className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        <Key className="w-4 h-4" />
                        Trocar Senha
                      </button>
                      <button
                        onClick={() => handleToggleActive(company.id)}
                        className={`btn flex items-center gap-2 text-sm whitespace-nowrap ${
                          company.active
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                        {company.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {showInactive ? 'Nenhuma empresa cadastrada' : 'Nenhuma empresa ativa'}
              </p>
              <p className="text-gray-400 mt-2">
                {showInactive
                  ? 'Clique em "Nova Empresa" para começar'
                  : 'Marque "Mostrar inativas" para ver empresas desativadas'}
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="card bg-yellow-50 border-2 border-yellow-400 mt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-yellow-900">Aviso de Segurança</p>
              <p className="text-yellow-800 text-sm mt-1">
                Como usuário Master, você tem acesso total ao sistema. Use suas permissões com
                responsabilidade. MFA está ativo para proteger sua conta.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCompanyModal && (
        <CompanyFormModal
          company={selectedCompany}
          onClose={() => {
            setShowCompanyModal(false);
            setSelectedCompany(null);
          }}
          onSave={handleSaveCompany}
        />
      )}

      {showPasswordModal && selectedCompany && (
        <ChangePasswordModal
          companyName={selectedCompany.name}
          currentPassword={selectedCompany.adminPassword || ''}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedCompany(null);
          }}
          onSave={handleSavePassword}
        />
      )}
    </div>
  );
};

export default MasterDashboard;
