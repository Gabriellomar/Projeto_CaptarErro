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

    // Detecta separador: tab ou múltiplos espaços
    const headerLine = rawLines[0];
    const sep = headerLine.includes("\t") ? /\t/ : /\s{2,}/;

    // Extrair cabeçalhos
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

    // Lista completa de todas as notas, mesmo sem erros
    const todasNotas = Array.from(new Set(rows.map(r => r[0])));

    // Detectar erros: valor numérico = 1, X, ✖, #N/A
    const errosPorLinha = {};
    const errosPorColuna = {};
    const formato2 = document.getElementById("formato2").checked;

    rows.forEach(values => {
      const nota = values[0];
      const itemVal = values[2];
      for (let idx = 1; idx < values.length; idx++) {
        const raw = values[idx];
        const num = parseInt((raw.match(/\d+/) || [NaN])[0], 10);
        const isError = (
          num === 1 ||
          raw.toUpperCase() === 'X' ||
          raw === '✖' ||
          /^#N\/?A$/i.test(raw)
        );
        if (isError) {
          const baseName = headers[idx] || `Col${idx}`;
          const colName = formato2 ? `${baseName} do item ${itemVal}` : baseName;
          errosPorLinha[nota] = errosPorLinha[nota] || [];
          errosPorLinha[nota].push(colName);
          errosPorColuna[colName] = (errosPorColuna[colName] || 0) + 1;
        }
      }
      if (errosPorLinha[nota] && errosPorLinha[nota].length === 0) delete errosPorLinha[nota];
    });

    // Gera mensagem de saída
    const mensagem = gerarMensagemFormatada(errosPorLinha, errosPorColuna, todasNotas);
    resultado.innerText = mensagem;
    resultado.className = 'email-preview';
  });
}

// Inicializa
prepararAnaliseTexto();

//--------------------------------------------------------------------------------------
// Determina saudação conforme hora
const dataAtual = new Date();
const horas = dataAtual.getHours();
let momentoDoDia = horas < 12 ? 'bom dia' : horas < 18 ? 'boa tarde' : 'boa noite';

//--------------------------------------------------------------------------------------
function gerarMensagemFormatada(errosPorLinha, errosPorColuna, todasNotas) {
  const formato1 = document.getElementById("formato1").checked;
  const greeting = `Prezados, ${momentoDoDia},\n\n`;

  if (formato1) {
    const totalErros = Object.values(errosPorColuna).reduce((a, b) => a + b, 0);
    if (totalErros === 0) {
      // Sem erros: usa todasNotas
      if (todasNotas.length === 1) {
        return `${greeting}A nota fiscal de número ${todasNotas[0]} foi verificada e liberada.`;
      }
      return `${greeting}As notas fiscais de número ${todasNotas.join(', ')} foram verificadas e liberadas.`;
    }
    // Com erros
    let lines = [greeting.trimEnd(),
      'Identificamos as seguintes divergências nas notas fiscais processadas:'];
    for (const tipo in errosPorColuna) {
      if (errosPorColuna[tipo] > 0) lines.push(`- ${errosPorColuna[tipo]} divergência(s) em ${tipo}`);
    }
    lines.push('Gentileza revisar os dados enviados.');
    return lines.join('\n');
  } else {
    // Formato 2
    const notasSemErro = [];
    let hasErro = false;
    for (const nota of todasNotas) {
      if (errosPorLinha[nota] && errosPorLinha[nota].length) hasErro = true;
      else notasSemErro.push(nota);
    }
    if (!hasErro) {
      if (notasSemErro.length === 1) {
        return `${greeting}A nota fiscal de número ${notasSemErro[0]} foi verificada e liberada.`;
      }
      return `${greeting}As notas fiscais de número ${notasSemErro.join(', ')} foram verificadas e liberadas.`;
    }
    let lines = [greeting.trimEnd(), 'Segue detalhamento das notas com inconsistências:'];
    for (const nota of todasNotas) {
      const erros = errosPorLinha[nota] || [];
      if (!erros.length) continue;
      lines.push(`- Nota ${nota}:`);
      const count = {};
      erros.forEach(e => count[e] = (count[e] || 0) + 1);
      for (const tipo in count) {
        lines.push(`    • ${count[tipo]} divergência(s) em ${tipo}`);
      }
    }
    lines.push('Favor providenciar as correções necessárias.');
    return lines.join('\n');
  }
}

//--------------------------------------------------------------------------------------
document.getElementById("copiarEmail").addEventListener("click", () => {
  const texto = document.getElementById("result").innerText;
  if (!texto || texto === 'Resultado' || texto === 'Analisando...') {
    alert('Nenhum texto disponível para copiar.');
    return;
  }
  navigator.clipboard.writeText(texto).then(() => alert('Texto copiado!'))
    .catch(err => alert('Erro ao copiar.'));
});
