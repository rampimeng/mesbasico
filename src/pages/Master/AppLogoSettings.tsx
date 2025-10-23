import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Image, Save, ArrowLeft, Shield } from 'lucide-react';

const AppLogoSettings = () => {
  const navigate = useNavigate();
  const { appLogoUrl, setAppLogoUrl } = useAuthStore();
  const [appLogo, setAppLogo] = useState(appLogoUrl);

  const handleSaveAppLogo = () => {
    setAppLogoUrl(appLogo);
    alert('Logotipo do aplicativo salvo com sucesso!');
  };

  const handleBack = () => {
    navigate('/master');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="flex items-center gap-4">
              {appLogoUrl ? (
                <img src={appLogoUrl} alt="Logo do App" className="h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuração de Logotipo</h1>
                <p className="text-gray-600">Gerenciar logotipo do aplicativo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* App Logo Configuration */}
        <div className="card bg-white">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Logotipo do Aplicativo</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Configure o logotipo que aparecerá na tela de login de todas as empresas e no header do painel Master.
            Este logotipo é global e será exibido para todos os usuários do sistema.
          </p>

          <div className="space-y-6">
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
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-4">Preview do Logotipo:</p>
                <div className="flex justify-center">
                  <img
                    src={appLogo}
                    alt="Logo preview"
                    className="h-24 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {!appLogo && (
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <Image className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900">Nenhum logotipo configurado</p>
                    <p className="text-blue-800 text-sm mt-1">
                      Insira a URL de uma imagem acima para configurar o logotipo do aplicativo.
                      Recomendamos usar imagens PNG ou SVG com fundo transparente para melhor aparência.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-900 mb-2">Importante:</p>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Use URLs públicas e acessíveis (https://)</li>
              <li>Recomendamos imagens com proporção horizontal ou quadrada</li>
              <li>Altura recomendada: 48-64 pixels para melhor visualização</li>
              <li>Formatos suportados: PNG, JPG, SVG</li>
              <li>Evite imagens muito pesadas para garantir carregamento rápido</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLogoSettings;
