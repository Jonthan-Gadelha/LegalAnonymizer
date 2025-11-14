// Módulo de processamento de OCR usando Tesseract.js

class OCRProcessor {
    constructor() {
        this.isInitialized = false;
        this.worker = null;
        this.isWorkerBusy = false;
    }
    
    async init() {
        try {
            if (typeof Tesseract !== 'undefined') {
                console.log('Tesseract.js carregado com sucesso');
                this.isInitialized = true;
                return true;
            } else {
                console.error('Tesseract.js não foi carregado');
                return false;
            }
        } catch (error) {
            console.error('Erro ao inicializar Tesseract.js:', error);
            return false;
        }
    }
    
    async createWorker() {
        if (!this.isInitialized) {
            throw new Error('OCR não foi inicializado');
        }
        
        if (this.worker && !this.isWorkerBusy) {
            return this.worker;
        }
        
        try {
            this.worker = await Tesseract.createWorker('por', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        // Callback de progresso será tratado externamente
                    }
                }
            });
            
            console.log('Worker OCR criado com sucesso');
            return this.worker;
        } catch (error) {
            console.error('Erro ao criar worker OCR:', error);
            throw error;
        }
    }
    
    async processImage(imageData, progressCallback = null) {
        if (!this.isInitialized) {
            throw new Error('OCR não foi inicializado');
        }
        
        try {
            this.isWorkerBusy = true;
            
            const worker = await this.createWorker();
            
            if (progressCallback) {
                progressCallback({
                    type: 'ocr_progress',
                    message: 'Iniciando reconhecimento de texto...',
                    progress: 0
                });
            }
            
            const { data } = await worker.recognize(imageData, {
                logger: m => {
                    if (progressCallback && m.status === 'recognizing text') {
                        progressCallback({
                            type: 'ocr_progress',
                            message: `Reconhecendo texto... ${Math.round(m.progress * 100)}%`,
                            progress: m.progress * 100
                        });
                    }
                }
            });
            
            this.isWorkerBusy = false;
            
            return {
                success: true,
                text: data.text.trim(),
                confidence: data.confidence,
                words: data.words ? data.words.length : 0
            };
            
        } catch (error) {
            this.isWorkerBusy = false;
            console.error('Erro no processamento OCR:', error);
            return {
                success: false,
                error: error.message,
                text: '',
                confidence: 0
            };
        }
    }
    
    async processMultipleImages(images, progressCallback = null) {
        const results = [];
        const totalImages = images.length;
        
        for (let i = 0; i < totalImages; i++) {
            const image = images[i];
            
            if (progressCallback) {
                progressCallback({
                    type: 'batch_progress',
                    message: `Processando imagem ${i + 1} de ${totalImages}...`,
                    current: i + 1,
                    total: totalImages,
                    progress: ((i + 1) / totalImages) * 100
                });
            }
            
            const result = await this.processImage(image.data, (ocrProgress) => {
                if (progressCallback) {
                    progressCallback({
                        type: 'ocr_progress',
                        message: `Imagem ${i + 1}/${totalImages}: ${ocrProgress.message}`,
                        progress: ocrProgress.progress,
                        current: i + 1,
                        total: totalImages
                    });
                }
            });
            
            results.push({
                pageNumber: image.pageNumber,
                result: result
            });
            
            // Pequena pausa para não sobrecarregar o navegador
            await this.sleep(100);
        }
        
        return results;
    }
    
    async processPDFPages(file, pageNumbers, pdfProcessor, progressCallback = null) {
        if (!this.isInitialized) {
            throw new Error('OCR não foi inicializado');
        }
        
        try {
            const images = [];
            const totalPages = pageNumbers.length;
            
            // Renderizar páginas como imagens
            for (let i = 0; i < totalPages; i++) {
                const pageNum = pageNumbers[i];
                
                if (progressCallback) {
                    progressCallback({
                        type: 'render_progress',
                        message: `Renderizando página ${pageNum} (${i + 1}/${totalPages})...`,
                        current: i + 1,
                        total: totalPages,
                        progress: ((i + 1) / totalPages) * 50 // 50% para renderização
                    });
                }
                
                const renderResult = await pdfProcessor.renderPageAsImage(file, pageNum, 2.0);
                
                if (renderResult.success) {
                    images.push({
                        pageNumber: pageNum,
                        data: renderResult.imageData
                    });
                } else {
                    console.error(`Erro ao renderizar página ${pageNum}:`, renderResult.error);
                }
            }
            
            // Processar OCR nas imagens
            const ocrResults = await this.processMultipleImages(images, (ocrProgress) => {
                if (progressCallback) {
                    // Ajustar progresso para segunda metade (50-100%)
                    const adjustedProgress = 50 + (ocrProgress.progress * 0.5);
                    progressCallback({
                        ...ocrProgress,
                        progress: adjustedProgress
                    });
                }
            });
            
            return {
                success: true,
                results: ocrResults,
                totalProcessed: images.length
            };
            
        } catch (error) {
            console.error('Erro ao processar páginas PDF com OCR:', error);
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }
    
    async terminate() {
        if (this.worker) {
            try {
                await this.worker.terminate();
                this.worker = null;
                this.isWorkerBusy = false;
                console.log('Worker OCR terminado');
            } catch (error) {
                console.error('Erro ao terminar worker OCR:', error);
            }
        }
    }
    
    // Função para validar se uma imagem tem texto suficiente
    validateOCRResult(result, minConfidence = 30, minWords = 3) {
        if (!result.success) {
            return false;
        }
        
        return result.confidence >= minConfidence && 
               result.words >= minWords && 
               result.text.length > 10;
    }
    
    // Função para limpar texto OCR
    cleanOCRText(text) {
        if (!text) return '';
        
        return text
            .replace(/\n{3,}/g, '\n\n') // Reduzir múltiplas quebras de linha
            .replace(/\s{3,}/g, ' ')    // Reduzir múltiplos espaços
            .replace(/[^\w\s\-.,;:!?()[\]{}'"]/g, '') // Remover caracteres especiais problemáticos
            .trim();
    }
    
    // Função auxiliar para sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Função para estimar tempo de processamento
    estimateProcessingTime(pageCount) {
        // Estimativa baseada em testes: ~10-30 segundos por página
        const avgTimePerPage = 20; // segundos
        const totalSeconds = pageCount * avgTimePerPage;
        
        if (totalSeconds < 60) {
            return `${totalSeconds} segundos`;
        } else {
            const minutes = Math.round(totalSeconds / 60);
            return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
        }
    }
    
    // Função para verificar se o OCR é viável
    isOCRViable(pageCount, maxPages = 10) {
        return pageCount <= maxPages;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OCRProcessor;
} else {
    window.OCRProcessor = OCRProcessor;
}

