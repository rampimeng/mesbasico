import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { Lock, Mail, Shield } from 'lucide-react';

const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_EMAIL_KEY = 'savedEmail';
const SAVED_PASSWORD_KEY = 'savedPassword';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, user, appLogoUrl } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (savedRememberMe) {
      const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
      const savedPassword = localStorage.getItem(SAVED_PASSWORD_KEY);

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  // Se já está autenticado, redirecionar
  if (isAuthenticated && user) {
    switch (user.role) {
      case UserRole.MASTER:
        navigate('/master', { replace: true });
        break;
      case UserRole.ADMIN:
        navigate('/admin', { replace: true });
        break;
      case UserRole.SUPERVISOR:
        navigate('/supervisor', { replace: true });
        break;
      case UserRole.OPERATOR:
        navigate('/operator', { replace: true });
        break;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password, mfaCode: showMfa ? mfaCode : undefined });

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        localStorage.setItem(SAVED_EMAIL_KEY, email);
        localStorage.setItem(SAVED_PASSWORD_KEY, password);
      } else {
        // Clear saved credentials if not checked
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(SAVED_EMAIL_KEY);
        localStorage.removeItem(SAVED_PASSWORD_KEY);
      }

      // Navegar para a página apropriada
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        switch (currentUser.role) {
          case UserRole.MASTER:
            navigate('/master');
            break;
          case UserRole.ADMIN:
            navigate('/admin');
            break;
          case UserRole.SUPERVISOR:
            navigate('/supervisor');
            break;
          case UserRole.OPERATOR:
            navigate('/operator');
            break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('MFA')) {
          setShowMfa(true);
          setError('Por favor, insira o código MFA.');
        } else {
          setError(err.message);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {appLogoUrl ? (
              <div className="flex justify-center mb-4">
                <img
                  src={appLogoUrl}
                  alt="Logo do Aplicativo"
                  className="h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
            )}
            <p className="text-gray-600">Manufacturing Execution System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="usuario@empresa.com"
                required
                disabled={showMfa}
              />
            </div>

            <div>
              <label className="label">
                <Lock className="inline w-4 h-4 mr-2" />
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={showMfa}
              />
            </div>

            {showMfa && (
              <div className="animate-fade-in">
                <label className="label">
                  <Shield className="inline w-4 h-4 mr-2" />
                  Código MFA
                </label>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="input"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Para usuários Master, insira o código do seu autenticador. (Demo: use 123456)
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-4 rounded-lg shadow-lg animate-shake">
                <p className="text-center font-semibold text-base">{error}</p>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Lembre meus dados
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg py-3"
            >
              {isLoading ? 'Entrando...' : showMfa ? 'Verificar MFA' : 'Entrar'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          © 2025 RENGEMES. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
