// Popup JavaScript - Versão Simplificada (apenas TXT e HTML)

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const fileInput = document.getElementById('file-input');
    const textInput = document.getElementById('text-input');
    const anonymizeBtn = document.getElementById('anonymize-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultSection = document.getElementById('result-section');
    const resultText = document.getElementById('result-text');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const statsSection = document.getElementById('stats');
    const statsCount = document.getElementById('stats-count');
    
    // Instância do anonimizador
    const anonymizer = new Anonymizer();
    
    // Estado da aplicação
    let currentResult = null;
    let currentFilename = null;
    
    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    anonymizeBtn.addEventListener('click', handleAnonymize);
    clearBtn.addEventListener('click', handleClear);
    copyBtn.addEventListener('click', handleCopy);
    downloadBtn.addEventListener('click', handleDownload);
    
    // Função para lidar com seleção de arquivo
    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        currentFilename = file.name;
        
        // Verificar tipo de arquivo
        if (!isValidFileType(file)) {
            showError('Tipo de arquivo não suportado. Use arquivos .txt ou .html');
            return;
        }
        
        try {
            await handleTextFile(file);
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            showError('Erro ao processar o arquivo: ' + error.message);
        }
    }
    
    // Função para processar arquivos de texto
    async function handleTextFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            textInput.value = content;
            showPreview(content);
        };
        
        reader.onerror = function() {
            showError('Erro ao ler o arquivo');
        };
        
        reader.readAsText(file, 'UTF-8');
    }
    
    // Função para mostrar preview dos dados que serão anonimizados
    function showPreview(text) {
        if (!text.trim()) return;
        
        const preview = anonymizer.getPreview(text, 3);
        const hasData = Object.keys(preview).length > 0;
        
        if (hasData) {
            let previewText = 'Dados encontrados: ';
            const items = [];
            
            for (const [type, matches] of Object.entries(preview)) {
                if (matches.length > 0) {
                    const typeLabel = getTypeLabel(type);
                    items.push(`${typeLabel} (${matches.length})`);
                }
            }
            
            previewText += items.join(', ');
            showInfo(previewText);
        } else {
            showInfo('Nenhum dado sensível detectado no arquivo');
        }
    }
    
    // Função principal de anonimização
    function handleAnonymize() {
        const text = textInput.value.trim();
        
        if (!text) {
            showError('Por favor, insira um texto ou selecione um arquivo');
            return;
        }
        
        setLoadingState(true);
        
        setTimeout(() => {
            try {
                currentResult = anonymizer.anonymize(text);
                displayResult(currentResult);
                updateStats(currentResult);
                setLoadingState(false);
                showSuccess('Texto anonimizado com sucesso!');
            } catch (error) {
                console.error('Erro na anonimização:', error);
                showError('Erro ao processar o texto');
                setLoadingState(false);
            }
        }, 300);
    }
    
    // Função para exibir o resultado
    function displayResult(result) {
        resultText.value = result.anonymizedText;
        currentResult = result;
        
        resultSection.style.display = 'block';
        resultSection.classList.add('fade-in');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Função para atualizar estatísticas
    function updateStats(result) {
        const total = result.totalRemoved || 0;
        statsCount.textContent = total;
        
        if (total > 0) {
            statsSection.style.display = 'block';
            statsSection.classList.add('fade-in');
            const details = anonymizer.formatStats();
            statsSection.title = details;
        } else {
            statsSection.style.display = 'none';
        }
    }
    
    // Função para limpar tudo
    function handleClear() {
        textInput.value = '';
        fileInput.value = '';
        resultSection.style.display = 'none';
        statsSection.style.display = 'none';
        currentResult = null;
        currentFilename = null;
        hideMessages();
    }
    
    // Função para copiar resultado
    async function handleCopy() {
        if (!currentResult || !currentResult.anonymizedText) {
            showError('Nenhum texto para copiar');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(currentResult.anonymizedText);
            showSuccess('Texto copiado para a área de transferência!');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = currentResult.anonymizedText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccess('Texto copiado para a área de transferência!');
        }
    }
    
    // Função para baixar resultado
    function handleDownload() {
        if (!currentResult || !currentResult.anonymizedText) {
            showError('Nenhum texto para baixar');
            return;
        }
        
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
        
        const filename = currentFilename 
            ? currentFilename.replace(/\.([^.]+)$/, `_anonimizado_${timestamp}.txt`)
            : `texto_anonimizado_${timestamp}.txt`;
        
        const blob = new Blob([currentResult.anonymizedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccess(`Arquivo baixado: ${filename}`);
    }
    
    // Função para mostrar estado de carregamento
    function setLoadingState(loading) {
        anonymizeBtn.disabled = loading;
        
        if (loading) {
            anonymizeBtn.textContent = '🔄 Processando...';
            anonymizeBtn.classList.add('loading');
        } else {
            anonymizeBtn.textContent = '🔒 Anonimizar';
            anonymizeBtn.classList.remove('loading');
        }
    }
    
    // Funções auxiliares
    function isValidFileType(file) {
        const allowedTypes = ['text/plain', 'text/html', 'application/html'];
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const allowedExtensions = ['txt', 'html', 'htm'];
        
        return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    }
    
    function getTypeLabel(type) {
        const labels = {
            cpfCnpj: 'CPF/CNPJ',
            titulo: 'Títulos',
            rg: 'RG',
            oab: 'OAB',
            namePF: 'Nomes PF',
            namePJ: 'Nomes PJ',
            address: 'Endereços',
            party: 'Partidos',
            partySigla: 'Siglas Partidárias'
        };
        return labels[type] || type;
    }
    
    // Funções para mostrar mensagens
    function showError(message) {
        showMessage(message, 'error');
    }
    
    function showSuccess(message) {
        showMessage(message, 'success');
    }
    
    function showInfo(message) {
        showMessage(message, 'info');
    }
    
    function showMessage(message, type) {
        hideMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', messageDiv);
        } else {
            document.body.insertBefore(messageDiv, document.body.firstChild);
        }
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    function hideMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
    }
    
    // Adicionar estilos para mensagens dinamicamente
    const messageStyles = `
        .message {
            padding: 10px 20px;
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        }
        
        .message-error {
            background: #e74c3c;
            color: white;
        }
        
        .message-success {
            background: #27ae60;
            color: white;
        }
        
        .message-info {
            background: #3498db;
            color: white;
        }
        
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = messageStyles;
    document.head.appendChild(styleSheet);
});
