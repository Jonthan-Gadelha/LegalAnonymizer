
// anonymizer.js — LexMind (v4)
// Escopo: Nome PF, Nome PJ (empresas/órgãos/associações/partidos), CPF, CNPJ, RG,
// Título de Eleitor, Endereços, Partidos (extenso + siglas).
// Conserva números de processo, datas, valores etc.
// Saída com placeholders específicos por categoria.

class Anonymizer {
  constructor() {
    this.resetStats();

    // Conectivos em nomes
    this.nameJoiners = ["da","de","do","das","dos","e","d'","di","du"];

    // Pistas de PJ (termos que caracterizam pessoa jurídica / órgão)
    this.pjHints = [
      "LTDA","Ltda","S/A","S.A.","EIRELI","ME","MEI","SA","SAS","LLC","L.L.C","S/A.",
      "Associação","Fundação","Sindicato","Partido","Prefeitura","Tribunal","Ministério",
      "Secretaria","Procuradoria","Câmara","Assembleia","Universidade","Empresa","Companhia",
      "República","União","Estado","Município","Distrito Federal","Justiça","Defensoria",
      "Autarquia","Agência","Agencia","Superintendência","Superintendencia","Conselho",
      "Comissão","Comitê","Comite","Banco","Igreja","Instituto","Cooperativa","ONG","Organização"
    ];

    // Prefixos de logradouro
    this.addrPrefixes = "(Rua|Av\\.?|Avenida|Travessa|Praça|Pra\\.|Alameda|Al\\.|Rodovia|Estrada|R\\.|AV\\.|Tv\\.|Pça\\.|Rod\\.|BR-?\\d+)";

    // Siglas partidárias
    this.partySiglas = [
      "PT","PL","PSDB","MDB","PSD","PSB","PDT","PCDOB","PCdoB","PSOL","NOVO","REDE","UB","UNIÃO","UNIAO",
      "PODE","PATRIOTA","SOLIDARIEDADE","AVANTE","CIDADANIA","DC","DEM","REPUBLICANOS","PRB","PSC",
      "PV","PP","PROS","PRP","PPL","PMN","PMB","PTC","PRTB","PSL","PHS","PSTU","PCB","PCO","UP","AGIR"
    ];

    // Documentos normativos (não são PJ)
    this.lawHints = ["Lei","Código","Constituição","Resolução","Portaria","Instrução","Súmula","Enunciado","Norma"];
  }

  resetStats() {
    this.stats = { cpf:0, cnpj:0, rg:0, titulo:0, address:0, email:0, cep:0, telefone:0, namePF:0, namePJ:0, party:0, partySigla:0, oab:0, processo:0 };
  }

  // ================= PREVIEW =================
  getPreview(text, maxPerType=3) {
    const prev = {};
    const collect = (key, re) => {
      const arr = [];
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) && arr.length < maxPerType) arr.push(m[0]);
      if (arr.length) prev[key] = arr;
    };

    collect("cpfCnpj",
      /\b(?:\d{3}\.?\d{3}\.?\d{3}[- ]?\d{2}|\d{2}\.?\d{3}\.?\d{3}[\/ ]?\d{4}[- ]?\d{2})\b/g
    );
    collect("rg", /\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]\b/g);
    collect("titulo", /(?:t[ií]tulo(?:\s+de)?\s+eleitor)[^.\n\r]{0,40}?\b\d{12}\b/gi);
    collect("email", /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    collect("cep", /\b(?:CEP|cep)[\s:nº]*\d{5}[-\s]?\d{3}\b/gi);
    collect("telefone", /\(?\d{2}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}/g);
    collect("address", new RegExp(`\\b${this.addrPrefixes}\\s+[\\wÀ-ÿ.,º°/-]{3,}`, "gi"));
    collect("party", /\bPartido\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+(?:\s+(?:dos?|das?|de|do|da|e)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){0,6}\b/gi);
    collect("partySigla", this._partySiglaRegex("gi"));
    collect("namePF", this._nameRegex("g")); // prévia leve
    // prévia de PJ: palavras-chave + capitalizadas
    collect("oab", /\b[A-Z]{2}\d{3,6}(?:-[A-Z])?\b/g);
    collect("namePJ", /\b(?:Tribunal|Minist[eé]rio|Procuradoria|Prefeitura|Justi[cç]a|Defensoria|Secretaria|Universidade|Fundação|Instituto|Associa[cç][aã]o|Companhia|Banco|Igreja|Conselho|Comiss[aã]o|Comit[eê]|Autarquia|Ag[eê]ncia|Superintend[eê]ncia|Partido)\b(?:\s+(?:dos?|das?|de|do|da|e))?(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){1,10}\b/gi);
    return prev;
  }

  formatStats() {
    const s = this.stats;
    const parts = [];
    if (s.processo) parts.push(`Processos: ${s.processo}`);
    if (s.cpf) parts.push(`CPF: ${s.cpf}`);
    if (s.cnpj) parts.push(`CNPJ: ${s.cnpj}`);
    if (s.rg) parts.push(`RG: ${s.rg}`);
    if (s.titulo) parts.push(`Título: ${s.titulo}`);
    if (s.email) parts.push(`E-mails: ${s.email}`);
    if (s.cep) parts.push(`CEP: ${s.cep}`);
    if (s.telefone) parts.push(`Telefones: ${s.telefone}`);
    if (s.address) parts.push(`Endereço: ${s.address}`);
    if (s.namePF) parts.push(`Nome PF: ${s.namePF}`);
    if (s.namePJ) parts.push(`Nome PJ: ${s.namePJ}`);
    if (s.party) parts.push(`Partido: ${s.party}`);
    if (s.partySigla) parts.push(`Sigla partidária: ${s.partySigla}`);
    if (s.oab) parts.push(`OAB: ${s.oab}`);
    return parts.length ? parts.join(" | ") : "Nenhum dado sensível detectado.";
  }

  // ================ REGEX BASE =================
  _nameRegex(flags="g") {
    const join = this.nameJoiners.join("|");
    const capToken = "(?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zà-úâêôãõç']+|[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,})";
    const joiner = `(?:\\s+(?:${join}))?`;
    // Requer pelo menos 2 tokens (nome + sobrenome) para evitar falsos positivos
    const pattern = `\\b${capToken}(?:${joiner}\\s+${capToken}){1,4}\\b`;
    return new RegExp(pattern, flags);
  }

  _partySiglaRegex(flags="gi") {
    const body = this.partySiglas.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    return new RegExp(`\\b(?:${body})\\b`, flags);
  }

  _startsWithLawWord(s) {
    return this.lawHints.some(h => s.startsWith(h + " "));
  }

  _looksLikePJ(s) {
    // PJ se contém pistas de organização OU sufixo empresarial
    if (this.pjHints.some(h => s.includes(h))) return true;
    // Começa com palavra-chave institucional + capitalizada depois
    if (/\b(?:Tribunal|Minist[eé]rio|Procuradoria|Prefeitura|Justi[cç]a|Defensoria|Secretaria|Universidade|Fundação|Instituto|Associa[cç][aã]o|Companhia|Banco|Igreja|Conselho|Comiss[aã]o|Comit[eê]|Autarquia|Ag[eê]ncia|Superintend[eê]ncia|Partido)\b/.test(s)) {
      if (/[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+/.test(s.replace(/^(.*?\b(?:de|da|do|das|dos|e)\b\s*)/i,''))) return true;
    }
    return false;
  }

  // ================ ANONIMIZAÇÃO ==============
  anonymize(text) {
    this.resetStats();
    let out = text;

    // 0.1) OAB - Nível 1: Com prefixo explícito (sempre captura)
    // Aceita separadores múltiplos: espaço, :, /, nº, n.º
    out = out.replace(/\b(?:OAB|oab)(?:[\s:\/]*(?:n(?:\.?º|º))?[\s:\/]*)([A-Z]{2})(?:[\s\-:\/]*(?:n(?:\.?º|º))?[\s\-:\/]*)(\d{3,6})(?:[\s\-]?([A-Z]))?\b/gi, () => { 
      this.stats.oab++; 
      return "[OAB PROTEGIDA]"; 
    });
    
    // 0.2) OAB - Nível 2: Sem prefixo (context-aware para UFs válidas)
    // Captura UF+números com separadores: espaço, -, :, /
    out = out.replace(/(?<![A-Z0-9])(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)[\s\-:\/]*(\d{3,6})(?:[\s\-]?([A-Z]))?/g, (match, uf, digits, suffix, offset) => {
      // Para 3 dígitos, 5-6 dígitos, ou com sufixo letra: sempre anonimizar
      if (digits.length !== 4 || parseInt(digits) < 1900 || parseInt(digits) > 2099 || suffix) {
        this.stats.oab++;
        return "[OAB PROTEGIDA]";
      }
      
      // Para 4 dígitos no range 1900-2099: ANONIMIZAR por padrão EXCETO se tem contexto claro de ano
      const ctx = out.slice(Math.max(0, offset - 50), Math.min(out.length, offset + 50)).toLowerCase();
      
      // NÃO anonimizar APENAS se tem contexto CLARO de calendário/ano E não tem marcadores estruturais/legais
      const hasYearContext = /\b(calendário|calend|agenda|ano|eleitoral|eleição|eleições|pleito|edital)\b/.test(ctx);
      const hasStructuralMarkers = /[\(\)\[\]:;,]|–|—/.test(match) || /[\(\)\[\]:;,]|–|—/.test(ctx.slice(ctx.length / 2 - 10, ctx.length / 2 + 10));
      const hasLegalContext = /\b(oab|adv|advogado|advogada|inscri|inscrito|proc|procurador|doutor|doutora|dr\.|dra\.|patrono|causídico)\b/.test(ctx);
      
      if (hasYearContext && !hasStructuralMarkers && !hasLegalContext) {
        return match; // NÃO anonimizar (claramente um ano)
      }
      
      // Caso padrão: ANONIMIZAR (é OAB)
      this.stats.oab++;
      return "[OAB PROTEGIDA]";
    });

    // 0.3) PROCESSOS JUDICIAIS - Formato CNJ (MÁXIMA PROTEÇÃO)
    // Formato: NNNNNNN-NN.AAAA.J.TT.OOOO (ex: 0600014-74.2022.6.17.0003)
    // Aceita variações de separadores (ponto, espaço, hífen)
    out = out.replace(/\b\d{7}[-\s]\d{2}[.\s]\d{4}[.\s]\d{1,2}[.\s]\d{2}[.\s]\d{4}\b/g, () => {
      this.stats.processo = (this.stats.processo || 0) + 1;
      return "[PROCESSO Nº PROTEGIDO]";
    });

    // 0) Proteções para não confundir com processo/documento
    const isProcessContext = (src, i, len=20) => {
      const ctx = src.slice(Math.max(0, i-len), Math.min(src.length, i+len)).toLowerCase();
      return /(processo|process|documento|doc\.?|num\.?|número|nº|acórdão|sentença|movimentação)/.test(ctx);
    };

    // 1) CPF - COM PREFIXO OU FORMATADO (MÁXIMA PRIORIDADE)
    // CPF com prefixo explícito - ACEITA ESPAÇOS ENTRE DÍGITOS
    out = out.replace(/\b(?:CPF|cpf)(?:\/MF)?[\s:nº]*(\d[\s]*\d[\s]*\d[\s.]*\d[\s]*\d[\s]*\d[\s.]*\d[\s]*\d[\s]*\d[\s\-]*\d[\s]*\d)\b/gi, () => { 
      this.stats.cpf++; 
      return "[CPF PROTEGIDO]"; 
    });
    // CPF parcialmente mascarado (051.***.***-80, 051 . *** . *** - 80)
    out = out.replace(/\b\d[\s]*\d[\s]*\d[\s.]*\*{3}[\s.]*\*{3}[\s\-]*\d[\s]*\d\b/g, () => { 
      this.stats.cpf++; 
      return "[CPF PROTEGIDO]"; 
    });
    // CPF formatado - ACEITA ESPAÇOS ENTRE CADA DÍGITO (051.711.434-80, 051 . 7 11 . 434 - 80)
    // EXIGE pelo menos UM separador (ponto, hífen OU espaço)
    out = out.replace(/\b\d[\s]*\d[\s]*\d[\s.]+\d[\s]*\d[\s]*\d[\s.]+\d[\s]*\d[\s]*\d[\s\-]+\d[\s]*\d\b/g, () => { 
      this.stats.cpf++; 
      return "[CPF PROTEGIDO]"; 
    });

    // 2) TELEFONES - COM FORMATAÇÃO OU PREFIXO
    // Telefone com prefixo explícito (Telefone:, Tel:, Fone:, Celular:, etc.) - ACEITA ESPAÇOS ENTRE DÍGITOS
    out = out.replace(/\b(?:Telefone|Telefones|Tel\.|Tel|Fone|Celular|Cel\.|Cel|Contato)[\s:]*(\(?\d{2}\)?[\s\-]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d?[\s\-]*\d[\s]*\d[\s]*\d[\s]*\d|\d{8,11})/gi, () => {
      this.stats.telefone++;
      return "[TELEFONE PROTEGIDO]";
    });
    // Telefone formatado com DDD E SEPARADORES - ACEITA ESPAÇOS ENTRE DÍGITOS: (61) 98333 - 5315, (81) 3231-1212
    out = out.replace(/(?<![0-9])\(?\d{2}\)[\s\-]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d?[\s\-]+\d[\s]*\d[\s]*\d[\s]*\d(?![0-9])/g, () => {
      this.stats.telefone++;
      return "[TELEFONE PROTEGIDO]";
    });

    // 3) CNPJ - COM PREFIXO OU FORMATADO
   
    // CNPJ com prefixo explícito - ACEITA ESPAÇOS ENTRE DÍGITOS, separadores OPCIONAIS
    out = out.replace(/\b(?:CNPJ|cnpj)[\s:nº]*(\d[\s]*\d[\s.]*\d[\s]*\d[\s]*\d[\s.]*\d[\s]*\d[\s]*\d[\s\/]*\d[\s]*\d[\s]*\d[\s]*\d[\s\-]*\d[\s]*\d)\b/gi, () => { 
      this.stats.cnpj++; 
      return "[CNPJ PROTEGIDO]"; 
    });
    // CNPJ formatado - PADRÃO UNIVERSAL: 14 dígitos com QUALQUER separador (ponto, barra, hífen, espaço)
    // Lookahead garante que há pelo menos um caractere não-dígito
    out = out.replace(/\b(?=[\d\s.\/\-]*[.\s\/\-])(?=[\d\s.\/\-]*\d)(\d[\s.\/\-]*){14}\b/g, (match) => {
      // Remove todos os separadores e verifica se tem exatamente 14 dígitos
      const digits = match.replace(/[^\d]/g, '');
      if (digits.length === 14) {
        this.stats.cnpj++;
        return "[CNPJ PROTEGIDO]";
      }
      return match;
    });
    // CNPJ sem formatação (12345678000190)
    out = out.replace(/\b\d{14}\b/g, (m, idx, src) => {
      const i = src.indexOf(m);
      if (isProcessContext(src, i)) return m;
      return (this.stats.cnpj++, "[CNPJ PROTEGIDO]");
    });

    // 3.5) CPF E TELEFONES SEM FORMATAÇÃO - COM DISTINÇÃO INTELIGENTE
    // Processa 11 dígitos, 8 dígitos e 9 dígitos
    
    // Telefone fixo brasileiro (8 dígitos começando com [2-5]: 32267433)
    out = out.replace(/\b[2-5]\d{7}\b/g, () => {
      this.stats.telefone++;
      return "[TELEFONE PROTEGIDO]";
    });
    
    // Telefone celular sem DDD (9 dígitos começando com 9: 981252689)
    out = out.replace(/\b9\d{8}\b/g, () => {
      this.stats.telefone++;
      return "[TELEFONE PROTEGIDO]";
    });
    
    // 11 DÍGITOS: Pode ser CPF OU Telefone - ORDEM CRÍTICA
    out = out.replace(/\b\d{11}\b/g, (m, idx, src) => {
      const i = src.indexOf(m);
      
      // Se contexto de processo, não anonimizar
      if (isProcessContext(src, i)) return m;
      
      // 1º: CONTEXTO EXPLÍCITO DE TELEFONE (máxima prioridade)
      const ctx = src.slice(Math.max(0, i-50), Math.min(src.length, i+50)).toLowerCase();
      const hasPhoneContext = /(telefone|tel\.|fone|celular|cel\.|contato|whatsapp|whats|zap|mobile|wpp|ligação|ligacao|ramal|ddd)/i.test(ctx);
      
      if (hasPhoneContext) {
        this.stats.telefone++;
        return "[TELEFONE PROTEGIDO]";
      }
      
      // 2º: ESTRUTURA DDD BRASILEIRA (ANTES de checksum CPF)
      // Prioriza telefones sem contexto (comum em documentos)
      const ddd = m.substring(0, 2);
      const thirdDigit = m.charAt(2);
      
      if (/^[1-9][1-9]$/.test(ddd) && (thirdDigit === '9' || thirdDigit === '8')) {
        this.stats.telefone++;
        return "[TELEFONE PROTEGIDO]";
      }
      
      // 3º: VALIDAÇÃO CHECKSUM CPF (CPFs sem formatação que não são telefones)
      const isValidCPF = (cpf) => {
        // CPF não pode ter todos os dígitos iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        let remainder;
        
        // Calcula primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
          sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        // Calcula segundo dígito verificador
        for (let i = 1; i <= 10; i++) {
          sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
      };
      
      if (isValidCPF(m)) {
        this.stats.cpf++;
        return "[CPF PROTEGIDO]";
      }
      
      // 4º: FALLBACK - CPF inválido mas dados sensíveis
      this.stats.cpf++;
      return "[CPF PROTEGIDO]";
    });

    // 4) RG - TODAS AS VARIAÇÕES (PERFEIÇÃO ABSOLUTA)
    // RG com órgão emissor - ACEITA 5-9 DÍGITOS com ou sem formatação
    // Exemplos: 6421425 SDS/PE, 8.469.789 SDS/PE, 1234567 SSP/SP, 12345 SDS-PE, 1234567 SSP-SP
    out = out.replace(/\b(?:\d[.\s]?){5,9}\d?[-\s]?[0-9Xx]?\s+(?:SDS|SSP|IFP|DETRAN|SESP|PC|PM|DIC|IIRGD|DGPC|IPF|ITEP|SESDC|EST|POF|MEX|CGPI|CTPS|DPF|MAER|MME|SECC|CBM|CRM|CREA|OAB)[\s\/\-]*[A-Z]{2}\b/gi, () => { 
      this.stats.rg++; 
      return "[RG PROTEGIDO]"; 
    });
    // RG com prefixo explícito (RG:, RG nº, IE/RG:, Identidade nº, etc.)
    out = out.replace(/\b(?:RG|rg|IE\/RG|Identidade)[\s:nº]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?[0-9Xx]?)\b/gi, () => { 
      this.stats.rg++; 
      return "[RG PROTEGIDO]"; 
    });
    // RG formatado - QUALQUER COMBINAÇÃO DE SEPARADORES (1.234.567-8, 12.345.678-9, 1234567-8, 12 345 678 9)
    out = out.replace(/\b\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?[0-9Xx]\b/g, () => { 
      this.stats.rg++; 
      return "[RG PROTEGIDO]"; 
    });
    // RG sem formatação (5-9 dígitos) - contexto IE/RG
    out = out.replace(/\b(?:IE|ie|RG|rg)[\s:\/nº]*(\d{5,9})\b/gi, () => { 
      this.stats.rg++; 
      return "[RG PROTEGIDO]"; 
    });

    // 5) Título de Eleitor — com rótulo próximo
    out = out.replace(/((?:t[ií]tulo(?:\s+de)?\s+eleitor)[^.\n\r]{0,40}?)(\b\d{12}\b)/gi,
      (m, p1) => { this.stats.titulo++; return `${p1}[TÍTULO DE ELEITOR PROTEGIDO]`; });
    // Fallback (12 dígitos isolados, não em contexto de processo)
    out = out.replace(/\b\d{12}\b/g, (m, idx, src) => {
      const i = src.indexOf(m);
      if (isProcessContext(src, i)) return m;
      this.stats.titulo++; return "[TÍTULO DE ELEITOR PROTEGIDO]";
    });

    // 6) E-MAILS (exemplo: mariana.silva.costa@exemplo.com)
    out = out.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, () => {
      this.stats.email++;
      return "[E-MAIL PROTEGIDO]";
    });

    // 7) CEP - APENAS com prefixo explícito (evita falsos positivos)
    // CEP com prefixo explícito - ACEITA ESPAÇOS AO REDOR DO HÍFEN (CEP: 72308 - 429, CEP 50770-610)
    out = out.replace(/\b(?:CEP|cep)[\s:nº]*(\d[\s]*\d[\s]*\d[\s]*\d[\s]*\d[\s]*[-\s][\s]*\d[\s]*\d[\s]*\d)\b/gi, () => {
      this.stats.cep++;
      return "[CEP PROTEGIDO]";
    });

    // 8) Endereços Completos (MÁXIMA PROTEÇÃO - TODAS AS VARIAÇÕES)
    
    // 8.1) Endereços de Brasília/DF: QR 401, Conjunto 29, Lote 16 / QS 410, Conjunto D, Lote 05
    out = out.replace(
      /\b(Q[RSNELIMCFAB]|SQ[NSM]?|CL[NSR]?|SH[CINRS]?|SHIN|SHIS|SHLN|SHLS|EQ[NSM]?|AOS|AON)\s*\d+[\s,]*(?:Conjunto|Conj\.?|Cj\.?)[\s,]*[\dA-Za-z]+[\s,]*(?:Lote|Lt\.?|Loja|Bloco|Bl\.?)[\s,]*[\dA-Za-z]+(?:[\s,]*(?:Loja|Apto?\.?|Apart\.?|Sala|Casa)[\s,]*[\dA-Za-z]+)?(?:[\s,]*[-–]?[\s,]*[\wÀ-ÿ\s]+)?(?:[\s,]*[-–][\s,]*DF)?/gi,
      (m) => {
        this.stats.address++;
        return "[ENDEREÇO PROTEGIDO]";
      }
    );
    
    // 8.2) Endereço completo tradicional: "Rua Comendador Franco Ferreira, 327 Loja 10 - San Martin"
    out = out.replace(
      /\b(Rua|Av\.|Avenida|Travessa|Praça|Pra\.|Alameda|Al\.|Rodovia|Estrada|R\.|AV\.|Tv\.|Pça\.|Rod\.|BR-?\d+)\s+[\wÀ-ÿ\s,]+(?:,?\s*n?[°º]?\s*\d+)?(?:\s+(?:Loja|Apto?\.?|Apart\.?|Bloco|Sala|Lote|Quadra|Casa)\s*[\dA-Z]+)?(?:\s*[-–]\s*[\wÀ-ÿ\s]+)?/gi,
      (m) => {
        this.stats.address++;
        return "[ENDEREÇO PROTEGIDO]";
      }
    );
    // Endereços simples (prefixo + nome de rua)
    const addrRe = new RegExp(`\\b${this.addrPrefixes}\\s+[\\wÀ-ÿ.,º°/-]{3,}`, "gi");
    out = out.replace(addrRe, (m) => { this.stats.address++; return "[LOCALIZAÇÃO]"; });

    // 9) Partidos (nome por extenso)
    out = out.replace(/\bPartido\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+(?:\s+(?:dos?|das?|de|do|da|e)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){0,6}\b/gi,
      (m) => { this.stats.party++; return "[PARTIDO POLÍTICO PROTEGIDO]"; });

    // 10) Partidos — SIGLAS
    out = out.replace(this._partySiglaRegex("gi"),
      (m) => { this.stats.partySigla++; return "[SIGLA PARTIDÁRIA PROTEGIDA]"; });

    // 11) PJ com sufixo empresarial (e.g., Banco do Brasil S/A, LexMind Ltda)
    out = out.replace(
      /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+(?:\s+(?:da|de|do|das|dos|e)\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){0,8})\s+(LTDA|Ltda\.?|S\/A|S\.A\.|EIRELI|MEI?|SS|SA|SAS)\b/gi,
      (m) => { this.stats.namePJ++; return "[PJ PROTEGIDA]"; }
    );

    // 12) PJ por palavra-chave institucional + nomes capitalizados
    out = out.replace(
      /\b(Tribunal|Minist[eé]rio|Procuradoria|Prefeitura|Justi[cç]a|Defensoria|Secretaria|Universidade|Fundação|Instituto|Associa[cç][aã]o|Companhia|Banco|Igreja|Conselho|Comiss[aã]o|Comit[eê]|Autarquia|Ag[eê]ncia|Superintend[eê]ncia)\b(?:\s+(?:dos?|das?|de|do|da|e))?(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){1,12}\b/gi,
      (m) => { this.stats.namePJ++; return "[PJ PROTEGIDA]"; }
    );

    // 13) Nome PF — restante (2 a 5 tokens capitalizados)


    const nameRe = this._nameRegex("g");
    out = out.replace(nameRe, (m) => {
      // Evitar confundir com documentos normativos (Lei, Código, ...)
      if (this._startsWithLawWord(m)) return m;
      // Se parece PJ, conta como PJ
      if (this._looksLikePJ(m)) { this.stats.namePJ++; return "[PJ PROTEGIDA]"; }
      // Caso contrário, PF
      this.stats.namePF++; return "[NOME PROTEGIDO]";
    });

    const totalRemoved = Object.values(this.stats).reduce((a,b)=>a+b,0);
    return { anonymizedText: out, totalRemoved, stats: this.stats };
  }
}

if (typeof window !== "undefined") {
  window.Anonymizer = Anonymizer;
}
