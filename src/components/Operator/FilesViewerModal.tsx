import { useState, useEffect, useRef } from 'react';
import { X, FileText, Eye, ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { filesService } from '@/services/filesService';
import { File as FileType } from '@/types';

// Configure PDF.js worker - use local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

interface FilesViewerModalProps {
  onClose: () => void;
}

const FilesViewerModal = ({ onClose }: FilesViewerModalProps) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [autoScale, setAutoScale] = useState<number>(1.0); // Scale calculado automaticamente
  const [scale, setScale] = useState<number>(1.0); // Scale atual (pode ser ajustado pelo usuário)
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    // Cleanup blob URL when component unmounts or file changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    // Calculate optimal scale when PDF is selected
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48; // Subtract padding
        const containerHeight = containerRef.current.clientHeight - 48;

        // Tamanho padrão de página A4 em pixels (210mm x 297mm em 96 DPI)
        const defaultPdfWidth = 595; // aproximadamente 210mm
        const defaultPdfHeight = 842; // aproximadamente 297mm

        // Calcula scales necessários para caber horizontal e verticalmente
        const scaleForWidth = containerWidth / defaultPdfWidth;
        const scaleForHeight = containerHeight / defaultPdfHeight;

        // Usa o menor scale para garantir que a página inteira fique visível
        const optimalScale = Math.min(scaleForWidth, scaleForHeight, 1.5); // Max 1.5x

        console.log('📐 Container dimensions:', { width: containerWidth, height: containerHeight });
        console.log('📊 Calculated auto scale:', optimalScale);

        setAutoScale(optimalScale);
        setScale(optimalScale); // Inicia com o scale automático
      }
    };

    if (pdfUrl) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(calculateScale, 100);

      window.addEventListener('resize', calculateScale);
      return () => {
        window.removeEventListener('resize', calculateScale);
      };
    }
  }, [pdfUrl]);

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
      console.log('📄 Loading PDF:', file.name, file.fileUrl);
      const url = filesService.getFileUrl(file.fileUrl);
      console.log('🔗 PDF URL:', url);

      // Fetch PDF with authentication
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo: ${response.status} ${response.statusText}`);
      }

      // Create Blob URL (more stable than ArrayBuffer for react-pdf)
      const blob = await response.blob();
      console.log('✅ PDF loaded, size:', blob.size, 'bytes');
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('❌ Error loading PDF:', error);
      alert(`Erro ao carregar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setSelectedFile(null);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleBack = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setSelectedFile(null);
    setNumPages(null);
    setPageNumber(1);
    setScale(1.0);
    setAutoScale(1.0);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('✅ PDF document loaded successfully, pages:', numPages);
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ PDF.js error:', error);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages || 1));
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.3)); // Min 0.3x zoom
  };

  const handleResetZoom = () => {
    setScale(autoScale); // Volta ao scale automático
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
            ) : pdfUrl ? (
              <>
                <div
                  ref={containerRef}
                  className="flex-1 overflow-auto bg-gray-100 p-4"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Carregando PDF...</p>
                      </div>
                    }
                    error={
                      <div className="text-center p-4">
                        <p className="text-red-600 font-semibold text-lg">Erro ao carregar PDF</p>
                        <p className="text-gray-600 text-sm mt-2">Verifique o console para mais detalhes</p>
                        <button
                          onClick={handleBack}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Voltar
                        </button>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      scale={scale}
                      className="shadow-lg"
                    />
                  </Document>
                </div>

                {/* Controls Bar - Always visible when PDF is loaded */}
                <div className="bg-gray-50 border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleZoomOut}
                        disabled={scale <= 0.3}
                        className="p-2 rounded-lg bg-gray-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                        title="Diminuir Zoom"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        disabled={scale >= 3.0}
                        className="p-2 rounded-lg bg-gray-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                        title="Aumentar Zoom"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors ml-2"
                        title="Ajustar à Tela"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Page Navigation - Only show if multiple pages */}
                    {numPages && numPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changePage(-1)}
                          disabled={pageNumber <= 1}
                          className="p-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold min-w-[100px] text-center">
                          Página {pageNumber} de {numPages}
                        </span>
                        <button
                          onClick={() => changePage(1)}
                          disabled={pageNumber >= numPages}
                          className="p-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
