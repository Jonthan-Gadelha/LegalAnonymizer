// Módulo de processamento de PDF usando PDF.js

class PDFProcessor {
    constructor() {
        this.isInitialized = false;
    }
    
    async init() {
        try {
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
                console.log('PDF.js carregado com sucesso');
                this.isInitialized = true;
                return true;
            } else {
                console.error('PDF.js não foi carregado');
                return false;
            }
        } catch (error) {
            console.error('Erro ao inicializar PDF.js:', error);
            return false;
        }
    }
    
    async extractTextFromPDF(file, progressCallback = null) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            const numPages = pdf.numPages;
            let fullText = '';
            let pagesWithText = 0;
            let pagesWithoutText = 0;
            
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                if (progressCallback) {
                    progressCallback({
                        page: pageNum,
                        total: numPages,
                        message: `Extraindo texto da página ${pageNum}/${numPages}...`
                    });
                }
                
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                
                if (pageText.trim().length > 0) {
                    fullText += `--- Página ${pageNum} ---\n${pageText}\n\n`;
                    pagesWithText++;
                } else {
                    pagesWithoutText++;
                }
            }
            
            return {
                success: true,
                fullText: fullText.trim(),
                totalPages: numPages,
                pagesWithText,
                pagesWithoutText
            };
        } catch (error) {
            console.error('Erro ao extrair texto do PDF:', error);
            return {
                success: false,
                error: error.message,
                fullText: '',
                totalPages: 0,
                pagesWithText: 0,
                pagesWithoutText: 0
            };
        }
    }
    
    async identifyOCRPages(file) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            const numPages = pdf.numPages;
            const pagesNeedingOCR = [];
            let textExtracted = '';
            
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                
                if (pageText.trim().length < 50) {
                    pagesNeedingOCR.push(pageNum);
                } else {
                    textExtracted += `--- Página ${pageNum} ---\n${pageText}\n\n`;
                }
            }
            
            return {
                success: true,
                pagesNeedingOCR,
                textExtracted: textExtracted.trim(),
                totalPages: numPages
            };
        } catch (error) {
            console.error('Erro ao identificar páginas para OCR:', error);
            return {
                success: false,
                error: error.message,
                pagesNeedingOCR: [],
                textExtracted: ''
            };
        }
    }
    
    async renderPageAsImage(file, pageNumber, scale = 2.0) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(pageNumber);
            
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            return {
                success: true,
                imageData: canvas.toDataURL('image/png'),
                width: canvas.width,
                height: canvas.height
            };
        } catch (error) {
            console.error('Erro ao renderizar página como imagem:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFProcessor;
} else {
    window.PDFProcessor = PDFProcessor;
}
