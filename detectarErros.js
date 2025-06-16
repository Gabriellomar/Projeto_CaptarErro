function prepararAnalise() {
    const botao = document.getElementById("analyze");
    botao.addEventListener("click", analisarImagem);
  }
  
  function analisarImagem() {
    const imgTag = document.querySelector("#preview img");
    const resultado = document.getElementById("result");
    resultado.innerHTML = "Analisando...";
  
    if (!imgTag) {
      resultado.innerHTML = "Nenhuma imagem foi carregada.";
      return;
    }
  
    let imagemOriginal = cv.imread(imgTag);
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
    let errosPorColuna = { "Origem": 0, "ICMS": 0, "Número": 0 };
  
    for (let i = 0; i < contornos.size(); i++) {
      let ret = cv.boundingRect(contornos.get(i));
      let y = ret.y;
      let x = ret.x;
  
      let nota = "NF" + Math.floor(y / 30);
      let tipo = x < 200 ? "Origem" : x < 400 ? "ICMS" : "Número";
  
      if (!errosPorLinha[nota]) errosPorLinha[nota] = [];
      errosPorLinha[nota].push(tipo);
  
      if (errosPorColuna[tipo] !== undefined) {
        errosPorColuna[tipo]++;
      }
    }
  
    const formato1 = document.getElementById("formato1").checked;
    let saida = "";
  
    if (formato1) {
      for (let nota in errosPorLinha) {
        errosPorLinha[nota].forEach(tipo => {
          saida += `<p>${nota}: erro em ${tipo}</p>`;
        });
      }
    } else {
      for (let tipo in errosPorColuna) {
        saida += `<p>Erro em ${tipo}: ${errosPorColuna[tipo]}</p>`;
      }
    }
  
    resultado.innerHTML = saida || "Nenhum erro detectado.";
  
    imagemOriginal.delete(); imagemHSV.delete(); mascara1.delete(); mascara2.delete();
    vermelhoClaro.delete(); vermelhoEscuro.delete(); vermelhoClaro2.delete(); vermelhoEscuro2.delete();
    mascaraFinal.delete(); contornos.delete(); hierarquia.delete();
  }