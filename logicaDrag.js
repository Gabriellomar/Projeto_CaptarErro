const entradaArquivo = document.getElementById("fileInput");
const areaPreview = document.getElementById("preview");

// Função para carregar e exibir a imagem
function carregarImagem(arquivo) {
  if (!arquivo.type.startsWith("image/")) return;

  const leitor = new FileReader();
  leitor.onload = (evento) => {
    const img = document.createElement("img");
    img.id = "imagemPreview"; // ESSENCIAL para análise com OpenCV
    img.src = evento.target.result;
    img.alt = "Pré-visualização";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";

    areaPreview.innerHTML = "";
    areaPreview.appendChild(img);
  };
  leitor.readAsDataURL(arquivo);

  entradaArquivo.files = criarListaDeArquivos(arquivo);
}

// Cria uma lista de arquivos para simular envio no input
function criarListaDeArquivos(arquivo) {
  const transferencia = new DataTransfer();
  transferencia.items.add(arquivo);
  return transferencia.files;
}

// Quando o usuário escolhe uma imagem via botão
entradaArquivo.addEventListener("change", () => {
  if (entradaArquivo.files.length > 0) {
    carregarImagem(entradaArquivo.files[0]);
  }
});

// Quando o usuário arrasta a imagem sobre a área de preview
areaPreview.addEventListener("dragover", (evento) => {
  evento.preventDefault(); // Impede o comportamento padrão
  areaPreview.style.borderColor = "blue";
  areaPreview.style.backgroundColor = "#f0f8ff";
});

// Quando o usuário sai da área de preview sem soltar o arquivo
areaPreview.addEventListener("dragleave", () => {
  areaPreview.style.borderColor = "black";
  areaPreview.style.backgroundColor = "";
});

// Quando o usuário solta a imagem sobre a área de preview
areaPreview.addEventListener("drop", (evento) => {
  evento.preventDefault(); // Impede o comportamento padrão
  areaPreview.style.borderColor = "black";
  areaPreview.style.backgroundColor = "";

  const arquivo = evento.dataTransfer.files[0];
  if (arquivo) {
    carregarImagem(arquivo);
  }
});
