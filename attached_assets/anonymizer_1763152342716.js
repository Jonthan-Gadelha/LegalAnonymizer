
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
    this.stats = { cpf:0, cnpj:0, rg:0, titulo:0, address:0, namePF:0, namePJ:0, party:0, partySigla:0, oab:0 };
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
    if (s.cpf) parts.push(`CPF: ${s.cpf}`);
    if (s.cnpj) parts.push(`CNPJ: ${s.cnpj}`);
    if (s.rg) parts.push(`RG: ${s.rg}`);
    if (s.titulo) parts.push(`Título: ${s.titulo}`);
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

    // 0.1) Proteção para números da OAB (Ex: PE29561, PE49456-A)
    out = out.replace(/\b[A-Z]{2}\d{3,6}(?:-[A-Z])?\b/g, () => { this.stats.oab++; return "[OAB PROTEGIDA]"; });

    // 0) Proteções para não confundir com processo/documento
    const isProcessContext = (src, i, len=20) => {
      const ctx = src.slice(Math.max(0, i-len), Math.min(src.length, i+len)).toLowerCase();
      return /(processo|process|documento|doc\.?|num\.?|número|nº|acórdão|sentença|movimentação)/.test(ctx);
    };

    // 1) CPF (formatado e sem pontuação)
    out = out.replace(/\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}\b/g, () => { this.stats.cpf++; return "[CPF PROTEGIDO]"; });
    out = out.replace(/\b\d{11}\b/g, (m, idx, src) => {
      const i = src.indexOf(m);
      if (isProcessContext(src, i)) return m;
      return (this.stats.cpf++, "[CPF PROTEGIDO]");
    });

    // 2) CNPJ (formatado e sem pontuação)
    out = out.replace(/\b\d{2}[.\s]?\d{3}[.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2}\b/g, () => { this.stats.cnpj++; return "[CNPJ PROTEGIDO]"; });
    out = out.replace(/\b\d{14}\b/g, (m, idx, src) => {
      const i = src.indexOf(m);
      if (isProcessContext(src, i)) return m;
      return (this.stats.cnpj++, "[CNPJ PROTEGIDO]");
    });

    // 3) RG
    out = out.replace(/\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]\b/g, () => { this.stats.rg++; return "[RG PROTEGIDO]"; });

    // 4) Título de Eleitor — com rótulo próximo
    out = out.replace(/((?:t[ií]tulo(?:\s+de)?\s+eleitor)[^.\n\r]{0,40}?)(\b\d{12}\b)/gi,
      (m, p1) => { this.stats.titulo++; return `${p1}[TÍTULO DE ELEITOR PROTEGIDO]`; });
    // Fallback (12 dígitos isolados, não em contexto de processo)
    out = out.replace(/\b\d{12}\b/g, (m, idx, src) => {
      const i = src.indexOf(m);
      if (isProcessContext(src, i)) return m;
      this.stats.titulo++; return "[TÍTULO DE ELEITOR PROTEGIDO]";
    });

    // 5) Endereços
    const addrRe = new RegExp(`\\b${this.addrPrefixes}\\s+[\\wÀ-ÿ.,º°/-]{3,}`, "gi");
    out = out.replace(addrRe, (m) => { this.stats.address++; return "[LOCALIZAÇÃO]"; });

    // 6) Partidos (nome por extenso)
    out = out.replace(/\bPartido\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+(?:\s+(?:dos?|das?|de|do|da|e)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){0,6}\b/gi,
      (m) => { this.stats.party++; return "[PARTIDO POLÍTICO PROTEGIDO]"; });

    // 7) Partidos — SIGLAS
    out = out.replace(this._partySiglaRegex("gi"),
      (m) => { this.stats.partySigla++; return "[SIGLA PARTIDÁRIA PROTEGIDA]"; });

    // 8) PJ com sufixo empresarial (e.g., Banco do Brasil S/A, LexMind Ltda)
    out = out.replace(
      /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+(?:\s+(?:da|de|do|das|dos|e)\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){0,8})\s+(LTDA|Ltda\.?|S\/A|S\.A\.|EIRELI|MEI?|SS|SA|SAS)\b/gi,
      (m) => { this.stats.namePJ++; return "[PJ PROTEGIDA]"; }
    );

    // 9) PJ por palavra-chave institucional + nomes capitalizados
    out = out.replace(
      /\b(Tribunal|Minist[eé]rio|Procuradoria|Prefeitura|Justi[cç]a|Defensoria|Secretaria|Universidade|Fundação|Instituto|Associa[cç][aã]o|Companhia|Banco|Igreja|Conselho|Comiss[aã]o|Comit[eê]|Autarquia|Ag[eê]ncia|Superintend[eê]ncia)\b(?:\s+(?:dos?|das?|de|do|da|e))?(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ']+){1,12}\b/gi,
      (m) => { this.stats.namePJ++; return "[PJ PROTEGIDA]"; }
    );

    // 10) Nome PF — restante (2 a 5 tokens capitalizados)


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
