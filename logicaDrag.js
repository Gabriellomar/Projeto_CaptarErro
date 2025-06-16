const entradaArquivo = document.getElementById("fileInput");
const areaPreview = document.getElementById("preview");

// Função para carregar e exibir a imagem
function carregarImagem(arquivo) {
  if (!arquivo.type.startsWith("image/")) return;

  const leitor = new FileReader();
  leitor.onload = (evento) => {
    areaPreview.innerHTML = `<img src="${evento.target.result}" alt="Pré-visualização" style="max-width: 100%; max-height: 100%;">`;
  };
  leitor.readAsDataURL(arquivo);

  entradaArquivo.files = criarListaDeArquivos(arquivo);
}

function criarListaDeArquivos(arquivo) {
  const transferencia = new DataTransfer();
  transferencia.items.add(arquivo);
  return transferencia.files;
}

entradaArquivo.addEventListener("change", () => {
  if (entradaArquivo.files.length > 0) {
    carregarImagem(entradaArquivo.files[0]);
  }
});

areaPreview.addEventListener("dragover", (evento) => {
  evento.preventDefault();
  areaPreview.style.borderColor = "blue";
  areaPreview.style.backgroundColor = "#f0f8ff";
});

areaPreview.addEventListener("dragleave", () => {
  areaPreview.style.borderColor = "black";
  areaPreview.style.backgroundColor = "";
});

areaPreview.addEventListener("drop", (evento) => {
  evento.preventDefault();
  areaPreview.style.borderColor = "black";
  areaPreview.style.backgroundColor = "";

  const arquivo = evento.dataTransfer.files[0];
  if (arquivo) {
    carregarImagem(arquivo);
  }
});
