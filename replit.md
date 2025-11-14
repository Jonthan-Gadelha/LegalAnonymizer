# Anonimizador LexMind - Extensão Chrome

## Visão Geral

Este é o **Anonimizador LexMind**, uma extensão Chrome profissional desenvolvida por Jonathan Gadelha para anonimização automática de processos judiciais sigilosos e em segredo de justiça, em conformidade com a Resolução CNJ nº 615/2025.

## Estado Atual do Projeto

✅ **Projeto completo e funcional**

### Estrutura Principal

- **Extensão Chrome**: Localizada em `anonimizador-extensao/`
- **Demonstração Web**: `demo.html` + `server.js` (rodando na porta 5000)
- **Documentação**: `README.md` completo

### Correções Realizadas (Versão Final)

- ✅ Erro de sintaxe corrigido no `popup.js` (linha 314 - token `);` extra removido)
- ✅ Todos os arquivos criados e organizados
- ✅ Estrutura completa da extensão
- ✅ Demonstração web funcional com processamento completo de PDFs
- ✅ **Anonimização de números de processos judiciais** (formato CNJ)
- ✅ **Rastreamento robusto de páginas processadas** usando Set
- ✅ **Regex de nomes seguro** (evita capturar palavras comuns)
- ✅ **OCR automático** para PDFs escaneados (Tesseract.js)
- ✅ **Feedback transparente** ao usuário sobre páginas processadas/ignoradas
- ✅ **Padrões de regex inteligentes e SEGUROS** - Captura variações de CPF, CNPJ, OAB e RG:
  - CPF: formatado, sem formatação, com prefixo, parcialmente mascarado (051.***.***-80)
  - CNPJ: formatado, sem formatação, com "nº" (CNPJ nº 10.882.771/0001-03)
  - OAB: com prefixo explícito, múltiplos separadores (OAB: PE29561, OAB/SP nº 123456, OAB PE-49456-A)
  - OAB sem prefixo: context-aware com UFs brasileiras (PE29561, PE:2001, etc.)
  - RG: formatado, com prefixo, diferentes tamanhos (RG: 1.234.567-8)
  - **Nota**: Padrões inteligentes evitam falsos positivos ("PE 2024" em contexto de calendário não é capturado)

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

- **Números de processos judiciais** (formato CNJ: 0600025-51.2024.6.17.0127) → `[PROCESSO Nº PROTEGIDO]`
- **CPF** (todas variações: formatado, sem formatação, parcialmente mascarado) → `[CPF PROTEGIDO]`
- **CNPJ** (todas variações: formatado, sem formatação, com "nº") → `[CNPJ PROTEGIDO]`
- **RG** (todas variações: formatado, com prefixo) → `[RG PROTEGIDO]`
- **OAB** (com/sem prefixo, múltiplos separadores) → `[OAB PROTEGIDA]`
- **E-mails** (exemplo: mariana.silva.costa@exemplo.com) → `[E-MAIL PROTEGIDO]`
- **CEP** (com prefixo explícito: CEP: 50770-610, CEP nº 50770610) → `[CEP PROTEGIDO]`
- **Telefones** (fixos e celulares: (81) 3231-1212, (81) 99962-9192) → `[TELEFONE PROTEGIDO]`
- **Endereços completos** (Rua X nº 123, Apto 304, Bairro) → `[ENDEREÇO PROTEGIDO]` ou `[LOCALIZAÇÃO]`
- **Nomes de pessoas físicas** (2+ palavras capitalizadas) → `[NOME PROTEGIDO]`
- **Nomes de pessoas jurídicas** (empresas, órgãos) → `[PJ PROTEGIDA]`
- **Partidos políticos** → `[PARTIDO POLÍTICO PROTEGIDO]` ou `[SIGLA PARTIDÁRIA PROTEGIDA]`

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
2. **Veja o banner promocional da Plataforma LexMind completa** (topo da página)
3. **Faça upload de PDF** (digital ou escaneado) OU cole texto
4. Aguarde extração automática (com OCR se necessário)
5. Clique em "🔒 Anonimizar"
6. Copie ou baixe o resultado

**Banner Promocional:**
- Link para plataforma completa: https://lexmind-lelwjv.manus.space/
- Design em destaque com gradiente azul metálico
- Call-to-action: "Acessar Plataforma Completa"

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

- [ ] Testes automatizados para números de processos CNJ
- [ ] Testes de regressão para PDFs mistos (digital + OCR)
- [ ] Suporte a nomes únicos com heurísticas mais robustas (opcional)
- [ ] Publicação na Chrome Web Store (opcional)

## Notas Técnicas

- ✅ **A demonstração web AGORA TEM processamento completo de PDFs** (extração + OCR)
- A extensão Chrome é simplificada (TXT/HTML apenas) para evitar problemas de CSP
- **Para processar PDFs, use a demonstração web**
- PDF.js e Tesseract.js carregados via CDN na demo
- Todos os dados são processados localmente (privacidade garantida)
