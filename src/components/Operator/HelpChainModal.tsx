import { X, Phone, ClipboardCheck, FileText } from 'lucide-react';

interface HelpChainModalProps {
  onClose: () => void;
  onSelect: (option: string) => void;
}

const HelpChainModal = ({ onClose, onSelect }: HelpChainModalProps) => {
  const helpOptions = [
    {
      id: 'supervisor',
      label: 'Chamar um Supervisor',
      icon: Phone,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Solicitar ajuda de um supervisor',
    },
    {
      id: 'quality',
      label: 'Qualidade',
      icon: ClipboardCheck,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Reportar problema de qualidade',
    },
    {
      id: 'files',
      label: 'Arquivos',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Acessar documentos e instruções',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Cadeia de Ajuda</h2>
          <p className="text-gray-600 text-lg">Selecione o tipo de ajuda necessária:</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {helpOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  onClose();
                }}
                className={`${option.color} text-white rounded-xl p-6 flex flex-col items-center gap-4 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                <Icon className="w-16 h-16" />
                <div className="text-center">
                  <p className="text-xl font-bold mb-1">{option.label}</p>
                  <p className="text-sm text-white text-opacity-90">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpChainModal;
