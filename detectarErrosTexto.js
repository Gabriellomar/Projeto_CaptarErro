function prepararAnaliseTexto() {
  const textarea = document.getElementById("campoTexto");
  const resultado = document.getElementById("result");

  document.getElementById("analyze").addEventListener("click", () => {
    const texto = textarea.value.trim();
    if (!texto) {
      resultado.innerText = "Por favor, cole os dados da tabela no campo de texto.";
      return;
    }

    const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== "");

    // Cabeçalhos separados por múltiplos espaços ou tabulação
    const cabecalhos = linhas[0].split(/\s{2,}|\t/).map(c => c.trim());

    const errosPorColuna = {};
    const errosPorLinha = {};

    for (let i = 1; i < linhas.length; i++) {
      const valores = linhas[i].split(/\s{2,}|\t/).map(v => v.trim());
      const numeroNota = valores[0];

      for (let j = 1; j < valores.length; j++) {
        // Remove zeros à esquerda
        const valorNormalizado = valores[j].replace(/^0+/, "") || "0";
        const nomeColuna = cabecalhos[j] || `Coluna ${j}`;

        if (valorNormalizado === "1") {
          if (!errosPorLinha[numeroNota]) errosPorLinha[numeroNota] = [];
          errosPorLinha[numeroNota].push(nomeColuna);

          if (!errosPorColuna[nomeColuna]) errosPorColuna[nomeColuna] = 0;
          errosPorColuna[nomeColuna]++;
        }
      }
    }

    const mensagemFinal = gerarMensagemFormatada(errosPorLinha, errosPorColuna);
    resultado.innerText = mensagemFinal;
    resultado.className = "email-preview";
  });
}
