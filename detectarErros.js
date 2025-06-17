function prepararAnalise() {
  const botao = document.getElementById("analyze");
  botao.addEventListener("click", analisarImagem);
}

function analisarImagem() {
  const resultado = document.getElementById("result");
  resultado.innerHTML = "Analisando...";
  resultado.className = "";

  const img = document.getElementById("imagemPreview");
  if (!img || !img.complete) {
    resultado.innerHTML = "Nenhuma imagem foi carregada corretamente.";
    return;
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
  let errosPorColuna = {};

  const mapaErros = {
    "CNPJ/PLANTA": 100,
    "CNPJ FORN": 150,
    "PO CONFIRMADO": 200,
    "TAX CODE": 250,
    "MAT_TYPE": 300,
    "NCM": 350,
    "Origem": 400,
    "QTD": 450,
    "Vr Unitário": 500,
    "Vr Total": 550,
    "IPI": 600,
    "ICMS": 650,
    "BC ICMS": 700,
    "Red BC ICMS": 750,
    "DIFERIDO": 800,
    "BC ST": 850,
    "ST": 900
  };

  const toleranciaX = 30;
  const pontosJaContados = [];

  for (let i = 0; i < contornos.size(); i++) {
    let ret = cv.boundingRect(contornos.get(i));
    let y = ret.y;
    let x = ret.x;

    // Verifica se já existe um ponto muito próximo que foi contado
    let pontoProximo = pontosJaContados.some(p => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10);
    if (pontoProximo) continue;
    pontosJaContados.push({ x, y });

    let numeroNota = 14493 + Math.floor(y / 30);

    let tipo = null;
    for (const [nomeErro, posX] of Object.entries(mapaErros)) {
      if (Math.abs(x - posX) <= toleranciaX) {
        tipo = nomeErro;
        break;
      }
    }
    if (!tipo) continue; 
    if (!errosPorLinha[numeroNota]) errosPorLinha[numeroNota] = [];
    errosPorLinha[numeroNota].push(tipo);

    if (!errosPorColuna[tipo]) {
      errosPorColuna[tipo] = 0;
    }
    errosPorColuna[tipo]++;
  }

  const mensagemFinal = gerarMensagemFormatada(errosPorLinha, errosPorColuna);
  resultado.innerText = mensagemFinal;
  resultado.className = "email-preview";

  imagemOriginal.delete(); imagemHSV.delete(); mascara1.delete(); mascara2.delete();
  vermelhoClaro.delete(); vermelhoEscuro.delete(); vermelhoClaro2.delete(); vermelhoEscuro2.delete();
  mascaraFinal.delete(); contornos.delete(); hierarquia.delete();
}




//------------------------------------------------------------------------------------------------------

const dataAtual = new Date();
const horas = dataAtual.getHours();
let momentoDoDia;

if(horas > 0 && horas < 12){
  momentoDoDia = "bom dia."
} else if (horas > 12 && horas < 18){
  momentoDoDia= "boa tarde."
} else if (horas > 18 && horas < 24){
  momentoDoDia = "boa noite."
}

//------------------------------------------------------------------------------------------------------

function gerarMensagemFormatada(errosPorLinha, errosPorColuna) {
  const formato1Selecionado = document.getElementById("formato1").checked;

  if (formato1Selecionado) {
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
    let linhas = [`Prezados, ${momentoDoDia}`];
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

//----------------------------------------------------------------------------------------------

document.getElementById("copiarEmail").addEventListener("click", () => {
  const resultado = document.getElementById("result");
  const texto = resultado.innerText;

  if (!texto || texto === "Resultado" || texto === "Analisando...") {
    alert("Nenhum texto disponível para copiar.");
    return;
  }

  navigator.clipboard.writeText(texto)
    .then(() => {
      alert("Texto copiado para a área de transferência!");
    })
    .catch(err => {
      console.error("Erro ao copiar o texto:", err);
      alert("Erro ao copiar. Tente novamente.");
    });
});
