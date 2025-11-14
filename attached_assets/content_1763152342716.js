// Content script para a extensão de anonimização
// Este script roda no contexto das páginas web visitadas pelo usuário

// Função para anonimizar texto na página atual
function anonymizePageContent() {
    // Esta função será implementada se necessário
    // Por enquanto, a funcionalidade principal está no popup
    console.log('Content script carregado - Anonimizador de Processos');
}

// Inicialização do content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', anonymizePageContent);
} else {
    anonymizePageContent();
}

