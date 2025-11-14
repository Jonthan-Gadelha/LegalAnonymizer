# 🔒 Anonimizador LexMind

**Extensão Chrome para Anonimização de Processos Judiciais**

Desenvolvido por **Jonathan Gadelha** | Em conformidade com a **Resolução CNJ nº 615/2025**

---

## 📋 Sobre

O **Anonimizador LexMind** é uma extensão Chrome profissional para anonimização automática de documentos jurídicos, especialmente processos sigilosos e em segredo de justiça. Remove automaticamente dados sensíveis como CPF, CNPJ, RG, nomes, endereços, números de processos e muito mais.

### ✨ Características

- ✅ Anonimização automática de dados sensíveis
- ✅ Suporte a arquivos TXT, HTML e PDF
- ✅ Processamento de PDFs com OCR (reconhecimento ótico de caracteres)
- ✅ Interface moderna e intuitiva
- ✅ Processamento 100% local (sem envio de dados para servidores)
- ✅ Estatísticas detalhadas de anonimização
- ✅ Download e cópia de resultados

### 🔐 Dados Removidos

A extensão remove automaticamente:

- **CPF** (Cadastro de Pessoa Física)
- **CNPJ** (Cadastro Nacional de Pessoa Jurídica)
- **RG** (Registro Geral)
- **OAB** (Número de inscrição na Ordem dos Advogados)
- **Números de Processos Judiciais**
- **Nomes Completos** (Pessoas Físicas e Jurídicas)
- **Endereços Completos** (Rua, número, bairro, cidade, estado, CEP)
- **CEP** (Código de Endereçamento Postal)
- **E-mails**
- **Partidos Políticos** (nomes e siglas)

---

## 🚀 Instalação

### Opção 1: Instalação como Extensão Chrome (Modo Desenvolvedor)

1. **Baixe ou clone este repositório**

2. **Abra o Chrome** e navegue até:
   ```
   chrome://extensions/
   ```

3. **Ative o "Modo do desenvolvedor"** (toggle no canto superior direito)

4. **Clique em "Carregar sem compactação"**

5. **Selecione a pasta** `anonimizador-extensao`

6. **Pronto!** A extensão estará instalada e pronta para uso

### Opção 2: Demonstração Web (sem instalação)

Para testar a funcionalidade sem instalar a extensão:

1. **Abra um terminal** na pasta do projeto

2. **Execute o servidor de demonstração:**
   ```bash
   node server.js
   ```

3. **Acesse no navegador:**
   ```
   http://localhost:5000
   ```

A demonstração web oferece todas as funcionalidades da extensão, exceto o processamento de PDFs com OCR.

---

## 📖 Como Usar

### Usando a Extensão Chrome

1. **Clique no ícone da extensão** na barra de ferramentas do Chrome

2. **Cole o texto** do processo judicial na área de texto OU **selecione um arquivo** (TXT, HTML, PDF)

3. **Clique em "🔒 Anonimizar"**

4. **Aguarde o processamento** (pode levar alguns segundos para PDFs grandes)

5. **Copie ou baixe** o resultado anonimizado

### Processamento de PDFs

A extensão suporta dois tipos de PDFs:

#### PDFs com Texto Extraível
- Processamento instantâneo
- Extração direta do texto

#### PDFs Escaneados (Imagens)
- Utiliza OCR (Tesseract.js)
- Tempo estimado: ~30-60 segundos por página
- Limite recomendado: 10 páginas
- Você será avisado antes do processamento

---

## 🛠️ Estrutura do Projeto

```
anonimizador-extensao/
├── manifest.json           # Configuração da extensão Chrome
├── popup.html             # Interface da extensão
├── popup.css              # Estilos da interface
├── popup.js               # Lógica principal da extensão
├── anonymizer.js          # Motor de anonimização
├── pdf-processor.js       # Processamento de PDFs
├── ocr-processor.js       # Processamento OCR
├── content.js             # Script de conteúdo
├── icons/                 # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── lib/                   # Bibliotecas externas
    ├── pdf.min.js         # PDF.js
    ├── pdf.worker.min.js  # Worker do PDF.js
    └── tesseract.min.js   # Tesseract OCR

Arquivos de Demonstração:
├── demo.html              # Página de demonstração web
├── server.js              # Servidor Node.js para demo
└── README.md              # Esta documentação
```

---

## 🔧 Tecnologias Utilizadas

- **JavaScript ES6+** - Linguagem principal
- **Chrome Extension API** - Plataforma de extensões
- **PDF.js** - Extração de texto de PDFs
- **Tesseract.js** - OCR (Reconhecimento Ótico de Caracteres)
- **Node.js** - Servidor de demonstração
- **HTML5 + CSS3** - Interface moderna

---

## 🐛 Correções Realizadas

### Erro de Sintaxe Corrigido

**Problema Original:** Linha 314 do arquivo `popup.js` continha um token inesperado `);` que causava erro de sintaxe.

**Solução:** O token extra foi removido e a estrutura do código foi corrigida, eliminando o erro e permitindo o funcionamento correto da extensão.

---

## 📊 Recursos Técnicos

### Privacidade e Segurança

- ✅ **Processamento 100% Local** - Nenhum dado é enviado para servidores externos
- ✅ **Sem Conexão com Internet Necessária** - Funciona offline após instalação
- ✅ **Código Auditável** - Todo o código-fonte está disponível para revisão
- ✅ **Sem Coleta de Dados** - Não armazena nem rastreia informações

### Desempenho

- ⚡ Processamento de texto: **Instantâneo**
- ⚡ PDFs pequenos (< 10 páginas): **< 5 segundos**
- ⚡ PDFs com OCR (por página): **~30-60 segundos**

---

## 📝 Exemplos de Uso

### Entrada (Antes da Anonimização)
```
Processo nº 1234567-12.2023.1.23.4567

Autor: João da Silva, CPF: 123.456.789-10, 
residente na Rua das Flores, 123, Jardim Paulista, 
São Paulo/SP, CEP: 01234-567.

Advogado: Dr. Carlos Santos, OAB/SP: 123456

Réu: Empresa ABC Ltda., CNPJ: 12.345.678/0001-90
```

### Saída (Após a Anonimização)
```
Processo nº [PROCESSO_ANONIMIZADO_001]

Autor: [NOME_PF_001], CPF: [CPF_001], 
residente na [ENDERECO_001], 
[CIDADE]/[UF], CEP: [CEP_001].

Advogado: [NOME_PF_002], OAB/[UF]: [OAB_001]

Réu: [NOME_PJ_001], CNPJ: [CNPJ_001]
```

---

## 🆘 Suporte e Problemas Comuns

### A extensão não aparece no Chrome
- Verifique se o "Modo do desenvolvedor" está ativado
- Tente recarregar a extensão em `chrome://extensions/`

### PDFs não estão sendo processados
- Certifique-se de que as bibliotecas PDF.js e Tesseract.js estão na pasta `lib/`
- Verifique se o arquivo PDF não está corrompido
- PDFs muito grandes podem demorar ou não processar

### OCR não funciona
- O OCR requer arquivos PDF válidos com imagens
- Limite recomendado: 10 páginas
- Certifique-se de que tem conexão de internet na primeira execução (para carregar modelos OCR)

---

## 📄 Licença e Conformidade

Este projeto foi desenvolvido em conformidade com:
- **Resolução CNJ nº 615/2025** - Normas sobre anonimização de processos sigilosos
- **LGPD (Lei Geral de Proteção de Dados)** - Lei nº 13.709/2018

---

## 👨‍💻 Desenvolvedor

**Jonathan Gadelha**

- Especialista em soluções tecnológicas para o setor jurídico
- Focado em privacidade, segurança e conformidade legal

---

## 🔄 Versão

**v1.0.0** - Novembro 2025

### Changelog
- ✅ Anonimização completa de dados sensíveis
- ✅ Suporte a PDFs com OCR
- ✅ Interface moderna e intuitiva
- ✅ Correção do erro de sintaxe (linha 314 do popup.js)
- ✅ Demonstração web standalone

---

## 🙏 Agradecimentos

- **PDF.js** - Mozilla Foundation
- **Tesseract.js** - Naptha
- **CNJ** - Conselho Nacional de Justiça

---

**© 2025 Jonathan Gadelha - Todos os direitos reservados**

Para questões, sugestões ou suporte, consulte a documentação ou entre em contato.
