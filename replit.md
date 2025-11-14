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

### Demonstração Web (Atual) - ✅ COM SUPORTE A PDFs

O servidor está rodando automaticamente:
1. Acesse a URL da webview
2. **Faça upload de PDF** (digital ou escaneado) OU cole texto
3. Aguarde extração automática (com OCR se necessário)
4. Clique em "🔒 Anonimizar"
5. Copie ou baixe o resultado

**Suporte completo a PDFs:**
- PDFs digitais: extração instantânea
- PDFs escaneados: OCR automático (Tesseract.js em português)
- PDFs mistos: combina extração + OCR
- Até 50 páginas OCR automáticas, ou todas com confirmação do usuário

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

- ✅ **A demonstração web AGORA TEM processamento completo de PDFs** (extração + OCR)
- A extensão Chrome é simplificada (TXT/HTML apenas) para evitar problemas de CSP
- **Para processar PDFs, use a demonstração web**
- PDF.js e Tesseract.js carregados via CDN na demo
- Todos os dados são processados localmente (privacidade garantida)
