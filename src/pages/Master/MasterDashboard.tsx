import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Company } from '@/types';
import { Building2, Plus, Edit, Power, Key, Shield, LogIn, Image, Save } from 'lucide-react';
import CompanyFormModal from '@/components/Master/CompanyFormModal';
import ChangePasswordModal from '@/components/Master/ChangePasswordModal';

// Extended Company type with extra fields
interface ExtendedCompany extends Company {
  email?: string;
  contactName?: string;
  contactPhone?: string;
  adminPassword?: string;
}

const MasterDashboard = () => {
  const { user, logout, appLogoUrl, setAppLogoUrl } = useAuthStore();

  const [appLogo, setAppLogo] = useState(appLogoUrl);

  // Mock companies with extended data
  const [companies, setCompanies] = useState<ExtendedCompany[]>([
    {
      id: '1',
      name: 'Empresa Demo LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'contato@empresademo.com',
      contactName: 'João Silva',
      contactPhone: '(11) 98765-4321',
      active: true,
      adminPassword: 'admin123',
      dashboardToken: 'dash_1234567890_abc123def456',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Indústria ABC S.A.',
      cnpj: '98.765.432/0001-10',
      email: 'contato@industriaabc.com',
      contactName: 'Maria Santos',
      contactPhone: '(21) 91234-5678',
      active: true,
      adminPassword: 'abc123',
      dashboardToken: 'dash_9876543210_xyz789ghi012',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
    },
    {
      id: '3',
      name: 'Fábrica XYZ LTDA',
      cnpj: '11.222.333/0001-44',
      email: 'contato@fabricaxyz.com',
      contactName: 'Pedro Oliveira',
      contactPhone: '(31) 99876-5432',
      active: false,
      adminPassword: 'xyz123',
      dashboardToken: 'dash_1122334455_jkl345mno678',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05'),
    },
  ]);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ExtendedCompany | null>(null);

  const handleNewCompany = () => {
    setSelectedCompany(null);
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company: ExtendedCompany) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const generateDashboardToken = () => {
    // Gerar token único e seguro
    return `dash_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleSaveCompany = (companyData: Partial<ExtendedCompany>) => {
    if (selectedCompany) {
      // Edit existing
      setCompanies(
        companies.map((c) =>
          c.id === selectedCompany.id ? { ...c, ...companyData } : c
        )
      );
    } else {
      // Add new - gerar token do dashboard automaticamente
      const newCompany = {
        ...companyData,
        adminPassword: 'admin123',
        dashboardToken: generateDashboardToken(),
      } as ExtendedCompany;
      setCompanies([...companies, newCompany]);
    }
    setShowCompanyModal(false);
    setSelectedCompany(null);
  };

  const handleChangePassword = (company: ExtendedCompany) => {
    setSelectedCompany(company);
    setShowPasswordModal(true);
  };

  const handleSavePassword = (newPassword: string) => {
    if (selectedCompany) {
      setCompanies(
        companies.map((c) =>
          c.id === selectedCompany.id
            ? { ...c, adminPassword: newPassword, updatedAt: new Date() }
            : c
        )
      );
    }
    setShowPasswordModal(false);
    setSelectedCompany(null);
  };

  const handleToggleActive = (companyId: string) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId ? { ...c, active: !c.active, updatedAt: new Date() } : c
      )
    );
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

  const handleSaveAppLogo = () => {
    setAppLogoUrl(appLogo);
    alert('Logotipo do aplicativo salvo com sucesso!');
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
        {/* App Logo Configuration */}
        <div className="card bg-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Logotipo do Aplicativo</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Configure o logotipo que aparecerá na tela de login e no header do painel Master
          </p>

          <div className="space-y-4">
            <div>
              <label className="label">URL do Logotipo do Aplicativo</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={appLogo}
                  onChange={(e) => setAppLogo(e.target.value)}
                  className="input flex-1"
                  placeholder="https://exemplo.com/logo-app.png"
                />
                <button
                  onClick={handleSaveAppLogo}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Este logotipo será exibido na tela de login de todas as empresas e no header do Master
              </p>
            </div>

            {appLogo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Preview do Logotipo:</p>
                <img
                  src={appLogo}
                  alt="Logo preview"
                  className="h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

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
            <button onClick={handleNewCompany} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Empresa
            </button>
          </div>

          <div className="space-y-4">
            {companies.map((company) => (
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
                        <p>Criada em: {company.createdAt.toLocaleDateString('pt-BR')}</p>
                        <p>Última atualização: {company.updatedAt.toLocaleDateString('pt-BR')}</p>
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

          {companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma empresa cadastrada</p>
              <p className="text-gray-400 mt-2">Clique em "Nova Empresa" para começar</p>
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
