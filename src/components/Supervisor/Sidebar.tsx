import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Monitor,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Tv,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, company } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/supervisor' },
    { icon: Monitor, label: 'Monitoramento', path: '/supervisor/monitoring' },
  ];

  // Admin tem acesso adicional
  if (user?.role === 'ADMIN') {
    menuItems.push(
      { icon: Settings, label: 'Cadastros', path: '/admin/settings' },
      { icon: TrendingUp, label: 'PDCA', path: '/admin/pdca' },
      { icon: ClipboardList, label: 'Auditoria', path: '/admin/audit' }
    );
  }

  const isActive = (path: string) => {
    if (path === '/supervisor') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary-800 text-white transition-all duration-300 z-20 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-primary-700">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div>
                <h2 className="text-xl font-bold">MES SaaS</h2>
                <p className="text-primary-200 text-xs">Sistema de Produção</p>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            >
              {isOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-100 hover:bg-primary-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-primary-700">
          {isOpen && (
            <div className="mb-3 px-2">
              <p className="text-sm text-primary-200">Logado como</p>
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-primary-300">{user?.role}</p>
            </div>
          )}

          {/* Dashboard de Controle Link - apenas para Admin */}
          {user?.role === 'ADMIN' && company?.dashboardToken && (
            <a
              href={`${window.location.origin}/control/${company.dashboardToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors"
            >
              <Tv className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">Dashboard Controle</span>}
            </a>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-700 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
