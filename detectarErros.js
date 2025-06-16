function prepararAnalise() {
    const botao = document.getElementById("analyze");
    botao.addEventListener("click", analisarImagem);
  }
  
function analisarImagem() {
  const resultado = document.getElementById("result");
  resultado.innerHTML = "Analisando...";

 const img = document.getElementById("imagemPreview");

if (!img || !img.complete) {
  resultado.innerHTML = "Nenhuma imagem foi carregada corretamente.";
  return;
}
}


  let imagemOriginal = cv.imread("imagemPreview");
  let imagemHSV = new cv.Mat();
  cv.cvtColor(imagemOriginal, imagemHSV, cv.COLOR_RGBA2RGB);
  cv.cvtColor(imagemHSV, imagemHSV, cv.COLOR_RGB2HSV);

  let mascara1 = new cv.Mat();
  let mascara2 = new cv.Mat();
  let vermelhoClaro = new cv.Mat(imagemHSV.rows, imagemHSV.cols, imagemHSV.type(), [0, 100, 100, 0]);
  let vermelhoEscuro = new cv.Mat(imagemHSV.rows, imagemHSV.cols, imagemHSV.type(), [10, 255, 255, 255]);
  cv.inRange(imagemHSV, vermelhoClaro, vermelhoEscuro, mascara1);

  let vermelhoClaro2 = new cv.Mat(imagemHSV.rows, imagemHSV.cols, imagemHSV.type(), [160, 100, 100, 0]);
  let vermelhoEscuro2 = new cv.Mat(imagemHSV.rows, imagemHSV.cols, imagemHSV.type(), [180, 255, 255, 255]);
  cv.inRange(imagemHSV, vermelhoClaro2, vermelhoEscuro2, mascara2);

  let mascaraFinal = new cv.Mat();
  cv.add(mascara1, mascara2, mascaraFinal);

  let contornos = new cv.MatVector();
  let hierarquia = new cv.Mat();
  cv.findContours(mascaraFinal, contornos, hierarquia, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let errosPorLinha = {};
  let errosPorColuna = {
    "Origem": 0,
    "ICMS": 0,
    "Número": 0
  };

  for (let i = 0; i < contornos.size(); i++) {
    let ret = cv.boundingRect(contornos.get(i));
    let y = ret.y;
    let x = ret.x;

    // Simula a nota com base na posição vertical
    let numeroNota = 14493 + Math.floor(y / 30);
    let tipo = x < 200 ? "Origem" : x < 400 ? "ICMS" : "Número";

    if (!errosPorLinha[numeroNota]) errosPorLinha[numeroNota] = [];
    errosPorLinha[numeroNota].push(tipo);

    if (errosPorColuna[tipo] !== undefined) {
      errosPorColuna[tipo]++;
    }
  }

  // Gera o texto formatado com base no formato escolhido
  const mensagemFinal = gerarMensagemFormatada(errosPorLinha, errosPorColuna);
  resultado.innerText = mensagemFinal;

  // Liberação de memória
  imagemOriginal.delete(); imagemHSV.delete(); mascara1.delete(); mascara2.delete();
  vermelhoClaro.delete(); vermelhoEscuro.delete(); vermelhoClaro2.delete(); vermelhoEscuro2.delete();
  mascaraFinal.delete(); contornos.delete(); hierarquia.delete();


  //--------------------------------------------------------------------------------------

  function gerarMensagemFormatada(errosPorLinha, errosPorColuna) {
  const formato1Selecionado = document.getElementById("formato1").checked;

  if (formato1Selecionado) {
    // Formato 1 - Resumo geral
    let linhas = ["Prezados, bom dia."];
    linhas.push("Identificamos os seguintes erros nas notas fiscais processadas:");
    for (const tipo in errosPorColuna) {
      const total = errosPorColuna[tipo];
      if (total > 0) {
        linhas.push(`- ${total} erro(s) em ${tipo}`);
      }
    }
    linhas.push("Gentileza revisar os dados enviados.");
    return linhas.join("\n");
  } else {
    // Formato 2 - Detalhado por nota
    let linhas = ["Prezados, bom dia."];
    linhas.push("Segue detalhamento das notas com inconsistências:");
    for (const nota in errosPorLinha) {
      const erros = errosPorLinha[nota];
      linhas.push(`- Nota ${nota}:`);
      const contagem = {};
      erros.forEach(tipo => {
        contagem[tipo] = (contagem[tipo] || 0) + 1;
      });
      for (const tipo in contagem) {
        linhas.push(`    • ${contagem[tipo]} erro(s) em ${tipo}`);
      }
    }
    linhas.push("Favor providenciar as correções necessárias.");
    return linhas.join("\n");
  }
}
