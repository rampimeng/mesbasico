import { useState, useEffect } from 'react';
import { X, FileText, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { filesService } from '@/services/filesService';
import { File as FileType } from '@/types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FilesViewerModalProps {
  onClose: () => void;
}

const FilesViewerModal = ({ onClose }: FilesViewerModalProps) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await filesService.getOperatorFiles();
      setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: FileType) => {
    setSelectedFile(file);
    setLoadingPdf(true);
    setPageNumber(1);

    try {
      // Fetch PDF with authentication
      const response = await fetch(filesService.getFileUrl(file.fileUrl), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar arquivo');
      }

      // Get PDF as ArrayBuffer for react-pdf
      const arrayBuffer = await response.arrayBuffer();
      setPdfData(arrayBuffer);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Erro ao carregar o arquivo. Por favor, tente novamente.');
      setSelectedFile(null);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleBack = () => {
    setPdfData(null);
    setSelectedFile(null);
    setNumPages(null);
    setPageNumber(1);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages || 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col relative animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {selectedFile ? (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFile.name}</h2>
                  {selectedFile.description && (
                    <p className="text-gray-600 text-sm mt-1">{selectedFile.description}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Arquivos Disponíveis</h2>
              <p className="text-gray-600 text-sm mt-1">Selecione um arquivo para visualizar</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-8 h-8 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedFile ? (
            // PDF Viewer
            loadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4 text-lg">Carregando arquivo...</p>
                </div>
              </div>
            ) : pdfData ? (
              <>
                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
                  <Document
                    file={{ data: pdfData }}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    }
                    error={
                      <div className="text-center p-4">
                        <p className="text-red-600">Erro ao carregar PDF</p>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={Math.min(window.innerWidth - 100, 900)}
                    />
                  </Document>
                </div>

                {/* Navigation Controls */}
                {numPages && numPages > 1 && (
                  <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => changePage(-1)}
                      disabled={pageNumber <= 1}
                      className="p-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-semibold min-w-[120px] text-center">
                      Página {pageNumber} de {numPages}
                    </span>
                    <button
                      onClick={() => changePage(1)}
                      disabled={pageNumber >= numPages}
                      className="p-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </>
            ) : null
          ) : (
            // Files List
            <div className="p-6 h-full overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4 text-lg">Carregando arquivos...</p>
                  </div>
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-xl">Nenhum arquivo disponível</p>
                    <p className="text-gray-500 mt-2">
                      Os arquivos compartilhados pelo administrador aparecerão aqui
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-200 transition-colors">
                          <FileText className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                            {file.name}
                          </h3>
                          {file.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {file.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                            <Eye className="w-4 h-4" />
                            <span>Visualizar PDF</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesViewerModal;
