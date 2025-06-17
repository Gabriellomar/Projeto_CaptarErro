// detectarErrosTexto.js

function prepararAnaliseTexto() {
  const textarea = document.getElementById("campoTexto");
  const resultado = document.getElementById("result");
  const botao = document.getElementById("analyze");

  botao.addEventListener("click", () => {
    const textoBruto = textarea.value;
    if (!textoBruto.trim()) {
      resultado.innerText = "Por favor, cole os dados da tabela no campo de texto.";
      return;
    }

    // Quebra em linhas não vazias
    const rawLines = textoBruto
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (rawLines.length < 2) {
      resultado.innerText = "Formato de dados muito curto. Verifique o texto colado.";
      return;
    }

    // Detecta separador: tabulação ou múltiplos espaços
    const headerLine = rawLines[0];
    const sep = headerLine.includes("\t") ? /\t/ : /\s{2,}/;

    // Extrai cabeçalhos
    const headers = rawLines[0].split(sep).map(h => h.trim());
    if (headers.length < 2) {
      resultado.innerText = "Não foi possível identificar cabeçalhos adequados.";
      return;
    }

    // Monta linhas de dados, preenchendo células faltantes
    const rows = rawLines.slice(1).map(line => {
      const vals = line.split(sep).map(v => v.trim());
      while (vals.length < headers.length) vals.push("");
      return vals;
    });

    if (rows.length === 0) {
      resultado.innerText = "Não foram encontradas linhas de dados suficientes.";
      return;
    }

    // Detectar erros: valor numérico = 1, X, ✖ ou #N/A
    const errosPorLinha = {};
    const errosPorColuna = {};
    const formato2 = document.getElementById("formato2").checked;

    rows.forEach(values => {
      const nota = values[0];
      const itemVal = values[2];
      for (let idx = 1; idx < values.length; idx++) {
        const raw = values[idx];
        const digits = raw.replace(/\D/g, '');
        const num = digits ? parseInt(digits, 10) : NaN;
        const isError = (
          (!isNaN(num) && num === 1) ||
          raw.toUpperCase() === 'X' ||
          raw === '✖' ||
          /^#N\/?A$/i.test(raw)
        );
        if (isError) {
          const baseName = headers[idx] || `Col${idx}`;
          const colName = formato2
            ? `${baseName} do item ${itemVal}`
            : baseName;
          if (!errosPorLinha[nota]) errosPorLinha[nota] = [];
          errosPorLinha[nota].push(colName);
          errosPorColuna[colName] = (errosPorColuna[colName] || 0) + 1;
        }
      }
      // Remove se sem erros
      if (errosPorLinha[nota] && errosPorLinha[nota].length === 0) {
        delete errosPorLinha[nota];
      }
    });

    // Gera mensagem de saída
    const mensagem = gerarMensagemFormatada(errosPorLinha, errosPorColuna);
    resultado.innerText = mensagem;
    resultado.className = 'email-preview';
  });
}

// Inicializa ao carregar
prepararAnaliseTexto();



//---------------------------------------------------------------------------------

let limpa = document.getElementById("botaoLimpar");
limpa.addEventListener("click", () => {
  document.getElementById("campoTexto").value = "";
  document.getElementById("result").innerText = "";
  document.getElementById("result").className = "";
});