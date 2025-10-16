import { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, User, FileText, Image } from 'lucide-react';
import { Company } from '@/types';

interface CompanyFormModalProps {
  company?: Company | null;
  onClose: () => void;
  onSave: (company: Partial<Company>) => void;
}

const CompanyFormModal = ({ company, onClose, onSave }: CompanyFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    contactName: '',
    contactPhone: '',
    logoUrl: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        cnpj: company.cnpj,
        email: (company as any).email || '',
        contactName: (company as any).contactName || '',
        contactPhone: (company as any).contactPhone || '',
        logoUrl: company.logoUrl || '',
        active: company.active,
      });
    }
  }, [company]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Razão Social é obrigatória';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido. Use o formato: 12.345.678/0001-90';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Nome de Contato é obrigatório';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const companyData: Partial<Company> = {
      ...formData,
      updatedAt: new Date(),
    };

    if (!company) {
      companyData.id = `company-${Date.now()}`;
      companyData.createdAt = new Date();
    } else {
      companyData.id = company.id;
      companyData.createdAt = company.createdAt;
    }

    onSave(companyData as Company);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-primary-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">
              {company ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Razão Social */}
          <div>
            <label className="label">
              <FileText className="inline w-4 h-4 mr-2" />
              Razão Social *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nome da Empresa LTDA"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* CNPJ */}
          <div>
            <label className="label">
              <FileText className="inline w-4 h-4 mr-2" />
              CNPJ *
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) =>
                setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })
              }
              className={`input ${errors.cnpj ? 'border-red-500' : ''}`}
              placeholder="12.345.678/0001-90"
              maxLength={18}
            />
            {errors.cnpj && (
              <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="label">
              <Mail className="inline w-4 h-4 mr-2" />
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="contato@empresa.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Nome de Contato */}
          <div>
            <label className="label">
              <User className="inline w-4 h-4 mr-2" />
              Nome de Contato *
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
              className={`input ${errors.contactName ? 'border-red-500' : ''}`}
              placeholder="João da Silva"
            />
            {errors.contactName && (
              <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="label">
              <Phone className="inline w-4 h-4 mr-2" />
              Telefone Contato *
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: formatPhone(e.target.value) })
              }
              className={`input ${errors.contactPhone ? 'border-red-500' : ''}`}
              placeholder="(11) 98765-4321"
              maxLength={15}
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
            )}
          </div>

          {/* URL do Logotipo da Empresa */}
          <div>
            <label className="label">
              <Image className="inline w-4 h-4 mr-2" />
              URL do Logotipo da Empresa
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="input"
              placeholder="https://exemplo.com/logo-empresa.png"
            />
            <p className="text-gray-500 text-xs mt-1">
              Este logotipo aparecerá no header para todos os usuários da empresa
            </p>
            {formData.logoUrl && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="active" className="font-medium text-gray-900 cursor-pointer">
              Empresa Ativa
            </label>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {company ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyFormModal;
