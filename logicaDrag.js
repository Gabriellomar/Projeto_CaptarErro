// logicaDrag.js

/**
 * CARREGA E EXIBE A IMAGEM NO PREVIEW
 */
const entradaArquivo = document.getElementById("fileInput");
const areaPreview   = document.getElementById("preview");

function criarListaDeArquivos(arquivo) {
  const transferencia = new DataTransfer();
  transferencia.items.add(arquivo);
  return transferencia.files;
}

function carregarImagem(arquivo) {
  if (!arquivo.type.startsWith("image/")) return;
  const leitor = new FileReader();
  leitor.onload = evento => {
    const img = document.createElement("img");
    img.id = "imagemPreview";        // usado pelo OpenCV
    img.src = evento.target.result;
    img.alt = "Pré-visualização";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    areaPreview.innerHTML = "";
    areaPreview.appendChild(img);
  };
  leitor.readAsDataURL(arquivo);
  // sincroniza o input com o arquivo dropado
  entradaArquivo.files = criarListaDeArquivos(arquivo);
}

// Evento de seleção via diálogo
entradaArquivo.addEventListener("change", () => {
  if (entradaArquivo.files.length > 0) {
    carregarImagem(entradaArquivo.files[0]);
  }
});

// Drag & Drop na área de preview
areaPreview.addEventListener("dragover", evento => {
  evento.preventDefault();
  areaPreview.style.borderColor = "blue";
});
areaPreview.addEventListener("dragleave", () => {
  areaPreview.style.borderColor = "black";
});
areaPreview.addEventListener("drop", evento => {
  evento.preventDefault();
  areaPreview.style.borderColor = "black";
  const arquivo = evento.dataTransfer.files[0];
  if (arquivo) {
    carregarImagem(arquivo);
  }
});

/**
 * SETUP GENÉRICO PARA DRAG & DROP DE FILE INPUTS
 */
function setupDragAndDrop(inputId, dropId) {
  const input = document.getElementById(inputId);
  const drop  = document.getElementById(dropId);
  if (!input || !drop) return;
  const defaultText = drop.textContent.trim();

  // clique na área abre diálogo
  drop.addEventListener('click', () => input.click());

  // ao escolher via diálogo
  input.addEventListener('change', () => {
    // se for preview de imagem, já cai no carregarImagem acima
    if (dropId === 'preview' && input.files.length) return;
    drop.textContent = input.files[0]?.name || defaultText;
  });

  // drag events
  drop.addEventListener('dragover', e => {
    e.preventDefault();
    drop.classList.add('dragover');
  });
  drop.addEventListener('dragleave', e => {
    e.preventDefault();
    drop.classList.remove('dragover');
  });
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (!files.length) return;
    // se for preview de imagem, chama carregarImagem
    if (dropId === 'preview') {
      entradaArquivo.files = files;
      carregarImagem(files[0]);
    } else {
      // genérico: só mostra o nome
      input.files = files;
      drop.textContent = files[0].name;
    }
  });
}

// exporte ou deixe global
window.setupDragAndDrop = setupDragAndDrop;



//-------------------------------------------------------------------------------------------------

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.target === "_blank") return; 
    
    e.preventDefault();
    document.body.style.transition = "opacity 0.5s";
    document.body.style.opacity = 0;
    setTimeout(() => {
      window.location = this.href;
    }, 500);
  });
});