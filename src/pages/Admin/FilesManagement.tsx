import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { filesService } from '@/services/filesService';
import { File as FileType } from '@/types';
import { Upload, Trash2, Edit2, FileText, Eye } from 'lucide-react';

const FilesManagement = () => {
  const { company } = useAuthStore();
  const { groups, loadGroups } = useRegistrationStore();
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFile, setEditingFile] = useState<FileType | null>(null);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupIds: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (company) {
      loadGroups();
      loadFiles();
    }
  }, [company]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await filesService.getAll();
      setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }
      setSelectedFile(file);
      if (!formData.name) {
        setFormData({ ...formData, name: file.name.replace('.pdf', '') });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.name) {
      alert('Selecione um arquivo e informe o nome');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('name', formData.name);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('groupIds', JSON.stringify(formData.groupIds));

      await filesService.uploadFile(uploadFormData);

      setShowUploadModal(false);
      resetForm();
      loadFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingFile) return;

    try {
      setUploading(true);
      await filesService.updateFile(editingFile.id, {
        name: formData.name,
        description: formData.description,
        groupIds: formData.groupIds,
      });

      setEditingFile(null);
      resetForm();
      loadFiles();
    } catch (error: any) {
      console.error('Error updating file:', error);
      alert(error.message || 'Erro ao atualizar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      await filesService.deleteFile(id);
      loadFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      alert(error.message || 'Erro ao excluir arquivo');
    }
  };

  const openEditModal = (file: FileType) => {
    setEditingFile(file);
    setFormData({
      name: file.name,
      description: file.description || '',
      groupIds: file.groupIds || [],
    });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', groupIds: [] });
    setSelectedFile(null);
    setEditingFile(null);
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData({
      ...formData,
      groupIds: formData.groupIds.includes(groupId)
        ? formData.groupIds.filter(id => id !== groupId)
        : [...formData.groupIds, groupId],
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Arquivos</h1>
          <p className="text-gray-600 mt-1">Compartilhe arquivos PDF com os operadores</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Novo Arquivo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando arquivos...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Nenhum arquivo cadastrado</p>
          <p className="text-gray-500 mt-2">Clique em "Novo Arquivo" para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arquivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Células
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-xs text-gray-500">PDF</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{file.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {file.groupIds && file.groupIds.length > 0
                        ? `${file.groupIds.length} célula(s)`
                        : 'Todas'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatFileSize(file.fileSize)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => window.open(filesService.getFileUrl(file.fileUrl), '_blank')}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Visualizar"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(file)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {(showUploadModal || editingFile) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingFile ? 'Editar Arquivo' : 'Novo Arquivo'}
              </h2>

              <div className="space-y-4">
                {!editingFile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arquivo PDF *
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Arquivo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Manual de Operação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Descrição opcional do arquivo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Células com Acesso
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Selecione as células que poderão visualizar este arquivo
                  </p>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {groups.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhuma célula cadastrada</p>
                    ) : (
                      groups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.groupIds.includes(group.id)}
                            onChange={() => handleGroupToggle(group.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">{group.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.groupIds.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ Se nenhuma célula for selecionada, o arquivo será visível para todos os operadores
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setEditingFile(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  onClick={editingFile ? handleUpdate : handleUpload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploading || (!editingFile && !selectedFile) || !formData.name}
                >
                  {uploading ? 'Processando...' : editingFile ? 'Salvar' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesManagement;
