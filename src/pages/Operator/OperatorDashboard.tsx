import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMachineStore } from '@/store/machineStore';
import { useAuditStore } from '@/store/auditStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { MachineStatus } from '@/types';
import MachineCard from '@/components/Operator/MachineCard';
import EmergencyModal from '@/components/Operator/EmergencyModal';
import ConfirmEndShiftModal from '@/components/Operator/ConfirmEndShiftModal';
import HelpChainModal from '@/components/Operator/HelpChainModal';
import FilesViewerModal from '@/components/Operator/FilesViewerModal';
import { AlertTriangle, LogOut, Play, RefreshCw, Clock, Maximize, Minimize, LifeBuoy } from 'lucide-react';
import { productionService } from '@/services/productionService';

const OperatorDashboard = () => {
  const { user, company, logout } = useAuthStore();
  const { machines, loadMyMachines, updateMachineStatus, startSession, isMachineInUse } = useMachineStore();
  const { getTodayCycles, loadCycleLogs, cycleLogs } = useAuditStore();
  const { loadStopReasons, stopReasons } = useRegistrationStore();

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showConfirmEndShiftModal, setShowConfirmEndShiftModal] = useState(false);
  const [showHelpChainModal, setShowHelpChainModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [todayCycles, setTodayCycles] = useState(getTodayCycles(company?.id || '', user?.id));

  // General pause state
  const [generalPause, setGeneralPause] = useState<{
    reasonId: string;
    reasonName: string;
    startTime: Date;
  } | null>(null);

  // Session timer states (time since screen opened)
  const [sessionStartTime] = useState<Date>(new Date()); // Fixed at mount time
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState('00:00:00');

  // Wake Lock state
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toast notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  // Show notification that auto-dismisses after 3 seconds
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
  };

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load machines and stop reasons on mount
  useEffect(() => {
    console.log('🔄 OperatorDashboard mounted, loading data...');
    loadMyMachines();
    loadStopReasons();

    // Load today's cycle logs with date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    loadCycleLogs({
      startDate: today.toISOString()
    });

    // Enable fullscreen on mount
    enableFullscreen();

    // Prevent device sleep
    requestWakeLock();

    // Set up polling to refresh data every 1 second for real-time sync
    const machineInterval = setInterval(() => {
      loadMyMachines();
    }, 1000);

    // Poll cycle logs every 5 seconds
    const cycleInterval = setInterval(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      loadCycleLogs({
        startDate: today.toISOString()
      });
    }, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(machineInterval);
      clearInterval(cycleInterval);
      releaseWakeLock();
    };
  }, [loadMyMachines, loadStopReasons, loadCycleLogs]);

  // Update today's cycles count when cycleLogs change
  useEffect(() => {
    setTodayCycles(getTodayCycles(company?.id || '', user?.id));
  }, [cycleLogs, user, company, getTodayCycles]);

  // Fullscreen functions
  const enableFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
        console.log('✅ Fullscreen enabled');
      } else if ((elem as any).webkitRequestFullscreen) {
        // Safari
        await (elem as any).webkitRequestFullscreen();
        setIsFullscreen(true);
        console.log('✅ Fullscreen enabled (webkit)');
      } else if ((elem as any).mozRequestFullScreen) {
        // Firefox
        await (elem as any).mozRequestFullScreen();
        setIsFullscreen(true);
        console.log('✅ Fullscreen enabled (moz)');
      } else if ((elem as any).msRequestFullscreen) {
        // IE/Edge
        await (elem as any).msRequestFullscreen();
        setIsFullscreen(true);
        console.log('✅ Fullscreen enabled (ms)');
      }
    } catch (error) {
      console.warn('⚠️ Fullscreen not supported or denied:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        console.log('✅ Fullscreen disabled');
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
        setIsFullscreen(false);
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('⚠️ Error exiting fullscreen:', error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enableFullscreen();
    }
  };

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Wake Lock functions (prevent sleep)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        console.log('✅ Wake Lock enabled - device will not sleep');

        // Re-request wake lock if it's released (e.g., when tab becomes inactive)
        lock.addEventListener('release', () => {
          console.log('⚠️ Wake Lock released');
        });
      } else {
        console.warn('⚠️ Wake Lock API not supported on this device');
      }
    } catch (error) {
      console.warn('⚠️ Wake Lock request failed:', error);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock !== null) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        console.log('✅ Wake Lock released');
      } catch (error) {
        console.error('❌ Error releasing wake lock:', error);
      }
    }
  };

  // Re-request wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLock === null) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLock]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate session duration (time since screen opened)
  useEffect(() => {
    const now = currentTime.getTime();
    const start = sessionStartTime.getTime();
    const diffSeconds = Math.floor((now - start) / 1000);

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    setSessionDuration(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
  }, [sessionStartTime, currentTime]);

  // Format current time for São Paulo timezone
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Calculate general pause duration
  const formatPauseDuration = () => {
    if (!generalPause) return '00:00:00';

    const now = currentTime.getTime();
    const start = generalPause.startTime.getTime();
    const diffSeconds = Math.floor((now - start) / 1000);

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartShift = async () => {
    try {
      if (!user) {
        console.warn('⚠️ No user found');
        showNotification('Erro: Usuário não encontrado. Faça login novamente.', 'error');
        return;
      }

      console.log('🎬 Starting shift for operator:', user.name);
      console.log('📋 Machines available:', machines);
      console.log('📋 Machine statuses:', machines.map(m => ({ id: m.id, name: m.name, status: m.status })));

      if (machines.length === 0) {
        console.warn('⚠️ No machines available');
        showNotification('Erro: Nenhuma máquina disponível. Entre em contato com o administrador.', 'error');
        return;
      }

      // Verificar se alguma máquina já está em uso por outro operador
      const machineInUse = machines.find((m) => {
        const inUse = isMachineInUse(m.id);
        return inUse && m.currentOperatorId !== user?.id;
      });

      if (machineInUse) {
        console.warn('⚠️ Machine in use:', machineInUse);
        setBlockedMessage(
          'O grupo de máquina que você está alocado já está em produção, procure o supervisor.'
        );
        return;
      }

      // Iniciar todas as máquinas (IDLE ou STOPPED)
      console.log('🚀 Starting all machines...');
      let successCount = 0;
      let errorCount = 0;

      for (const machine of machines) {
        console.log(`🔍 Checking machine ${machine.name}, status: ${machine.status}`);

        // Pode iniciar máquinas IDLE ou STOPPED
        const canStart = machine.status === MachineStatus.IDLE || machine.status === MachineStatus.STOPPED;

        if (canStart) {
          console.log(`✅ Starting machine ${machine.name}`);
          try {
            await startSession(machine.id, user.id);
            successCount++;
            console.log(`✅ Machine ${machine.name} started successfully`);
          } catch (error: any) {
            errorCount++;
            console.error(`❌ Error starting machine ${machine.name}:`, error);
            showNotification(`Erro ao iniciar máquina ${machine.name}: ${error.message}`, 'error');
          }
        } else {
          console.log(`⏭️ Skipping machine ${machine.name}, already running (status: ${machine.status})`);
        }
      }

      console.log(`✅ Shift started! Success: ${successCount}, Errors: ${errorCount}`);

      if (successCount > 0) {
        showNotification(`Turno iniciado! ${successCount} máquina(s) em produção.`, 'success');
      }

      if (errorCount > 0) {
        showNotification(`${errorCount} máquina(s) falharam ao iniciar.`, 'error');
      }

      // Clear general pause when starting shift
      setGeneralPause(null);

      // No need to reload - session time is independent

      // Force immediate refresh for real-time sync
      await loadMyMachines();
    } catch (error: any) {
      console.error('❌ Error in handleStartShift:', error);
      showNotification(`Erro ao iniciar turno: ${error.message}`, 'error');
    }
  };

  const handleEndShift = async () => {
    try {
      if (!user) {
        console.warn('⚠️ No user found');
        showNotification('Erro: Usuário não encontrado. Faça login novamente.', 'error');
        return;
      }

      console.log('🏁 Ending shift for operator:', user.name);

      // Buscar ou criar o motivo de parada "Turno Encerrado" via API
      const shiftEndReasonId = await productionService.getShiftEndReasonId();
      console.log('📋 Using shift end reason ID:', shiftEndReasonId);

      // Encerrar sessões de produção de todas as máquinas ativas
      let successCount = 0;
      let errorCount = 0;

      for (const machine of machines) {
        if (machine.status !== MachineStatus.IDLE) {
          console.log(`🛑 Ending session for machine ${machine.name}`);
          try {
            // End the production session with shift end reason
            // This will close all time logs, update machine to IDLE, and stop all matrices
            await productionService.endSession(machine.id, user.id, shiftEndReasonId);
            successCount++;
            console.log(`✅ Session for machine ${machine.name} ended successfully`);
          } catch (error: any) {
            errorCount++;
            console.error(`❌ Error ending session for machine ${machine.name}:`, error);
            showNotification(`Erro ao encerrar sessão da máquina ${machine.name}: ${error.message}`, 'error');
          }
        }
      }

      console.log(`✅ Shift ended! Success: ${successCount}, Errors: ${errorCount}`);

      if (successCount > 0) {
        showNotification(`Turno encerrado! ${successCount} máquina(s) parada(s).`, 'success');
      }

      if (errorCount > 0) {
        showNotification(`${errorCount} máquina(s) falharam ao parar.`, 'error');
      }

      // Session time continues running (doesn't reset on shift end)

      // Force immediate refresh for real-time sync
      await loadMyMachines();
    } catch (error: any) {
      console.error('❌ Error in handleEndShift:', error);
      showNotification(`Erro ao encerrar turno: ${error.message}`, 'error');
    }
  };

  const handlePauseAll = () => {
    setShowEmergencyModal(true);
  };

  const handlePauseAllConfirm = async (reasonId: string) => {
    if (!user) return;

    console.log('⏸️ Pause all confirmed with reason:', reasonId);

    // Find reason name
    const reason = stopReasons.find(r => r.id === reasonId);
    const reasonName = reason?.name || 'Motivo desconhecido';

    // Set general pause state
    setGeneralPause({
      reasonId,
      reasonName,
      startTime: new Date(),
    });

    // Parar todas as máquinas com status STOPPED
    for (const machine of machines) {
      if (machine.status !== MachineStatus.IDLE && machine.status !== MachineStatus.STOPPED) {
        console.log(`🛑 Stopping machine ${machine.name} (ID: ${machine.id}) with reason ${reasonId}`);
        await updateMachineStatus(machine.id, MachineStatus.STOPPED, user.id, reasonId);
      }
    }

    showNotification('Pausa geral registrada! Todas as máquinas foram paradas.', 'warning');
    setShowEmergencyModal(false);

    // Force immediate refresh for real-time sync
    await loadMyMachines();
  };

  const handleAddCycle = async () => {
    // Registrar giro no backend
    const activeMachine = machines.find(m => m.status === MachineStatus.NORMAL_RUNNING);

    if (activeMachine && user && company) {
      try {
        await productionService.recordCycle(activeMachine.id);

        console.log('✅ Cycle recorded successfully');

        // Reload cycle logs to update the counter
        await loadCycleLogs();

        // Force immediate refresh for real-time sync
        await loadMyMachines();
      } catch (error) {
        console.error('❌ Error recording cycle:', error);
      }
    }
  };

  const handleHelpChainSelect = (option: string) => {
    console.log('🆘 Help chain option selected:', option);

    switch (option) {
      case 'supervisor':
        showNotification('Chamando supervisor...', 'warning');
        // TODO: Implementar lógica de notificação ao supervisor
        break;
      case 'quality':
        showNotification('Solicitação de qualidade registrada', 'warning');
        // TODO: Implementar lógica de notificação de qualidade
        break;
      case 'files':
        setShowFilesModal(true);
        break;
      default:
        break;
    }
  };

  // Lógica para lidar com o logout
  const handleLogoutClick = () => {
    // Se o turno está ativo, mostrar modal de confirmação
    if (shiftIsActive) {
      setShowConfirmEndShiftModal(true);
    } else {
      // Se não há turno ativo, fazer logout direto
      logout();
    }
  };

  // Logout direto sem encerrar turno
  const handleLogoutWithoutEndShift = () => {
    setShowConfirmEndShiftModal(false);
    logout();
  };

  // Encerrar turno e fazer logout
  const handleEndShiftAndLogout = async () => {
    setShowConfirmEndShiftModal(false);
    await handleEndShift();
    logout();
  };

  // Alguma máquina está ativa (não IDLE e não STOPPED)?
  const anyMachineActive = machines.some(
    (m) => m.status !== MachineStatus.IDLE && m.status !== MachineStatus.STOPPED
  );

  // Turno está ativo se houver máquinas ativas
  const shiftIsActive = anyMachineActive;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-full mx-auto px-3 py-3 sm:px-6 lg:px-8 sm:py-4">
          {/* Mobile Layout - Stack vertically */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Top row: Logo, Title, and Essential Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {company?.logoUrl && (
                  <img
                    src={company.logoUrl}
                    alt="Logo da Empresa"
                    className="h-8 sm:h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    Painel do Operador
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {user?.name}
                  </p>
                </div>
              </div>

              {/* Essential mobile actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHelpChainModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors"
                  title="Cadeia de Ajuda"
                >
                  <LifeBuoy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="btn-secondary p-2"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Second row: Compact Timer Cards */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {/* Session Timer - Compact */}
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-300 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-[10px] text-blue-600 font-semibold">Tempo Ativo</p>
                    <p className="text-sm font-bold text-blue-700 tabular-nums">{sessionDuration}</p>
                  </div>
                </div>
              </div>

              {/* General Pause - Compact */}
              {generalPause && (
                <div className="bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-400 animate-pulse flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-[10px] text-orange-600 font-semibold">Pausa Geral</p>
                      <p className="text-[10px] font-semibold text-orange-800 truncate max-w-[80px]">{generalPause.reasonName}</p>
                      <p className="text-sm font-bold text-orange-700 tabular-nums">{formatPauseDuration()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Time - Compact */}
              <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-300 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-[10px] text-green-600 font-semibold">Hora Atual</p>
                    <p className="text-sm font-bold text-green-700 tabular-nums">{formatCurrentTime()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Original horizontal layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company?.logoUrl && (
                <img
                  src={company.logoUrl}
                  alt="Logo da Empresa"
                  className="h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">
                  Painel do Operador
                </h1>
                <p className="text-gray-600 mt-1">
                  Olá, <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>

            {/* Timer and Clock Section */}
            <div className="flex items-center gap-4">
              {/* Session Timer */}
              <div className="bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-semibold">Tempo Ativo</p>
                    <p className="text-xl font-bold text-blue-700 tabular-nums">{sessionDuration}</p>
                  </div>
                </div>
              </div>

              {/* General Pause Card - Only shows when there's an active general pause */}
              {generalPause && (
                <div className="bg-orange-50 px-4 py-2 rounded-lg border-2 border-orange-400 animate-pulse">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-orange-600 font-semibold">Pausa Geral</p>
                      <p className="text-sm font-bold text-orange-800">{generalPause.reasonName}</p>
                      <p className="text-lg font-bold text-orange-700 tabular-nums">{formatPauseDuration()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Time */}
              <div className="bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-semibold">Hora Atual</p>
                    <p className="text-xl font-bold text-green-700 tabular-nums">{formatCurrentTime()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-6">
              <button
                onClick={() => setShowHelpChainModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                title="Cadeia de Ajuda"
              >
                <LifeBuoy className="w-5 h-5" />
                <span>Cadeia de Ajuda</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="btn-secondary flex items-center gap-2"
                title={isFullscreen ? 'Sair do modo tela cheia' : 'Entrar em modo tela cheia'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
                <span>
                  {isFullscreen ? 'Tela Normal' : 'Tela Cheia'}
                </span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Atualizar</span>
              </button>
              <button
                onClick={handleLogoutClick}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="max-w-full mx-auto px-3 py-4 sm:px-6 lg:px-8 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {!shiftIsActive ? (
            <button
              onClick={handleStartShift}
              className="btn-success btn-lg flex items-center justify-center gap-2 sm:gap-3 min-h-[56px] sm:min-h-[64px] text-base sm:text-lg"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="font-bold">Iniciar Turno</span>
            </button>
          ) : (
            <button
              onClick={handleEndShift}
              className="btn-danger btn-lg flex items-center justify-center gap-2 sm:gap-3 min-h-[56px] sm:min-h-[64px] text-base sm:text-lg"
            >
              <LogOut className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="font-bold">Encerrar Turno</span>
            </button>
          )}

          <button
            onClick={handlePauseAll}
            disabled={!anyMachineActive}
            className="btn-warning btn-lg flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] sm:min-h-[64px] text-base sm:text-lg"
          >
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="font-bold">PAUSA GERAL</span>
          </button>

          <button
            onClick={handleAddCycle}
            disabled={!anyMachineActive}
            className="btn-primary btn-lg flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] sm:min-h-[64px]"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{todayCycles}</div>
              <div className="text-xs sm:text-sm font-semibold">Adicionar Giro</div>
            </div>
          </button>
        </div>

        {/* Blocked Message */}
        {blockedMessage && (
          <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 px-4 py-3 sm:px-6 sm:py-4 rounded-xl mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base sm:text-lg">Acesso Bloqueado</p>
              <p className="mt-1 text-sm sm:text-base">{blockedMessage}</p>
              <button
                onClick={() => setBlockedMessage('')}
                className="mt-3 btn-secondary text-sm sm:text-base px-3 py-2"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* Machines Grid - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhuma máquina vinculada ao seu usuário.
            </p>
            <p className="text-gray-400 mt-2">
              Entre em contato com o administrador para configurar suas máquinas.
            </p>
          </div>
        )}
      </div>

      {/* Pause All Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          onClose={() => setShowEmergencyModal(false)}
          onConfirm={handlePauseAllConfirm}
        />
      )}

      {/* Confirm End Shift Modal */}
      {showConfirmEndShiftModal && (
        <ConfirmEndShiftModal
          onClose={() => setShowConfirmEndShiftModal(false)}
          onConfirmEndShift={handleEndShiftAndLogout}
          onLogoutWithoutEndShift={handleLogoutWithoutEndShift}
        />
      )}

      {/* Help Chain Modal */}
      {showHelpChainModal && (
        <HelpChainModal
          onClose={() => setShowHelpChainModal(false)}
          onSelect={handleHelpChainSelect}
        />
      )}

      {/* Files Viewer Modal */}
      {showFilesModal && (
        <FilesViewerModal
          onClose={() => setShowFilesModal(false)}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-50 animate-fade-in">
          <div
            className={`px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-2xl border-2 flex items-center gap-2 sm:gap-3 sm:min-w-[300px] max-w-md mx-auto sm:mx-0 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-800'
                : 'bg-yellow-50 border-yellow-400 text-yellow-800'
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base lg:text-lg">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
