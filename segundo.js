// segundo.js

// Função que liga input e área de drop
function setupFileField(inputId, dropId) {
  const input = document.getElementById(inputId);
  const drop  = document.getElementById(dropId);
  const defaultText = drop.textContent.trim();

  // Clique na área simula clique no input
  drop.addEventListener('click', () => input.click());

  // Quando o usuário escolhe pelo diálogo de arquivo
  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      drop.textContent = input.files[0].name;
    } else {
      drop.textContent = defaultText;
    }
  });

  // Drag & Drop
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
    if (files.length > 0) {
      // Atualiza o input e a label
      input.files = files;
      drop.textContent = files[0].name;
    }
  });
}

// Dispara depois que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  setupFileField('xmlEmitida',  'dropEmitida');
  setupFileField('xmlRecebida', 'dropRecebida');
});
