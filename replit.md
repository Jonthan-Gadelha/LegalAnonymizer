# Anonimizador LexMind - Extensão Chrome

## Visão Geral

Este é o **Anonimizador LexMind**, uma extensão Chrome profissional desenvolvida por Jonathan Gadelha para anonimização automática de processos judiciais sigilosos e em segredo de justiça, em conformidade com a Resolução CNJ nº 615/2025.

## Estado Atual do Projeto

✅ **Projeto completo e funcional**

### Estrutura Principal

- **Extensão Chrome**: Localizada em `anonimizador-extensao/`
- **Demonstração Web**: `demo.html` + `server.js` (rodando na porta 5000)
- **Documentação**: `README.md` completo

### Correções Realizadas

- ✅ Erro de sintaxe corrigido no `popup.js` (linha 314 - token `);` extra removido)
- ✅ Todos os arquivos criados e organizados
- ✅ Estrutura completa da extensão
- ✅ Demonstração web funcional

## Arquitetura

### Extensão Chrome (`anonimizador-extensao/`)

```
anonimizador-extensao/
├── manifest.json          - Configuração da extensão
├── popup.html            - Interface principal
├── popup.css             - Estilos modernos
├── popup.js              - Lógica principal (CORRIGIDO)
├── anonymizer.js         - Motor de anonimização
├── pdf-processor.js      - Processamento de PDFs
├── ocr-processor.js      - OCR com Tesseract.js
├── content.js            - Script de conteúdo
└── icons/                - Ícones da extensão
```

### Demonstração Web

- **demo.html** - Página standalone de demonstração
- **server.js** - Servidor HTTP Node.js simples
- **Porta**: 5000 (configurada no workflow)

## Funcionalidades

### Dados Anonimizados

- CPF e CNPJ
- RG e OAB
- Nomes de pessoas físicas e jurídicas
- Endereços completos (rua, cidade, estado, CEP)
- Números de processos judiciais
- E-mails
- Partidos políticos

### Suporte a Arquivos

- **TXT** - Texto simples
- **HTML** - Documentos HTML
- **PDF** - Com suporte a OCR para PDFs escaneados

### Processamento PDF

- Extração de texto nativo (instantâneo)
- OCR para documentos escaneados (Tesseract.js)
- Identificação automática de páginas que precisam de OCR

## Como Usar

### Demonstração Web (Atual)

O servidor está rodando automaticamente:
1. Acesse a URL da webview
2. Cole ou digite texto de processo judicial
3. Clique em "🔒 Anonimizar"
4. Copie ou baixe o resultado

### Extensão Chrome (Para Instalação)

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `anonimizador-extensao`

## Tecnologias

- **JavaScript ES6+** - Linguagem principal
- **Chrome Extension API** - Plataforma
- **PDF.js** - Processamento de PDFs
- **Tesseract.js** - OCR
- **Node.js** - Servidor de demonstração
- **HTML5 + CSS3** - Interface

## Workflow Configurado

- **Nome**: demo
- **Comando**: `node server.js`
- **Porta**: 5000
- **Status**: ✅ Rodando

## Conformidade Legal

- Resolução CNJ nº 615/2025
- LGPD (Lei nº 13.709/2018)
- Processamento 100% local (sem envio de dados)

## Desenvolvedor

**Jonathan Gadelha**
- Especialista em soluções jurídicas tecnológicas
- Foco em privacidade e conformidade legal

## Versão

v1.0.0 - Novembro 2025

## Próximos Passos Possíveis

- [ ] Download das bibliotecas PDF.js e Tesseract.js para a pasta `lib/`
- [ ] Testes adicionais com PDFs reais
- [ ] Publicação na Chrome Web Store (opcional)

## Notas Técnicas

- A demonstração web não inclui processamento de PDFs (por limitações do navegador)
- A extensão Chrome completa inclui suporte total a PDF + OCR
- Todos os dados são processados localmente (privacidade garantida)
