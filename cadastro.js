const inputArquivo = document.getElementById('inputArquivo');
    const editor = document.getElementById('editor');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnSalvarDirect = document.getElementById('btnSalvarDirect');
    const infoStatus = document.getElementById('infoStatus');

    let arquivoHandle = null; // para File System Access API
    let arquivoNome = '';
    let arquivoConteudoOriginal = '';

    // Função para ler o arquivo selecionado e carregar no textarea
    inputArquivo.addEventListener('change', async (event) => {
      const arquivo = event.target.files[0];
      if (!arquivo) {
        infoStatus.textContent = 'Nenhum arquivo selecionado.';
        editor.value = '';
        editor.disabled = true;
        btnSalvar.disabled = true;
        btnSalvarDirect.disabled = true;
        arquivoHandle = null;
        arquivoNome = '';
        return;
      }

      arquivoNome = arquivo.name;
      arquivoConteudoOriginal = '';

      // Se suportar File System Access API para abrir arquivo com handle:
      if ('getAsFileSystemHandle' in arquivo) {
        try {
          arquivoHandle = await arquivo.getAsFileSystemHandle();
        } catch {
          arquivoHandle = null;
        }
      } else {
        arquivoHandle = null;
      }

      const texto = await arquivo.text();
      arquivoConteudoOriginal = texto;
      editor.value = texto;
      editor.disabled = false;
      btnSalvar.disabled = false;

      // Habilitar botão salvar direto só se File System Access API suportada
      btnSalvarDirect.disabled = !window.showSaveFilePicker;

      infoStatus.textContent = `Arquivo aberto: ${arquivoNome} (${formatBytes(arquivo.size)})`;
    });

    // Botão salvar alterações baixando arquivo
    btnSalvar.addEventListener('click', () => {
      const novoConteudo = editor.value;
      baixarArquivo(arquivoNome, novoConteudo);
    });

    // Botão salvar alterações diretamente no mesmo arquivo (File System Access API)
    btnSalvarDirect.addEventListener('click', async () => {
      if (!window.showSaveFilePicker) {
        alert('Seu navegador não suporta salvar diretamente em arquivos.');
        return;
      }
      try {
        if (!arquivoHandle) {
          // Se não tivermos handle, abrir prompt para escolher arquivo para salvar
          arquivoHandle = await window.showSaveFilePicker({
            suggestedName: arquivoNome,
            types: [{
              description: 'Arquivo de Texto',
              accept: {'text/plain': ['.txt']}
            }]
          });
        }
        const writable = await arquivoHandle.createWritable();
        await writable.write(editor.value);
        await writable.close();
        alert('Arquivo salvo com sucesso!');
        infoStatus.textContent = `Arquivo salvo: ${arquivoNome}`;
      } catch (e) {
        alert('Erro ao salvar arquivo: ' + e.message);
      }
    });

    // Função para disparar download do arquivo com conteúdo
    function baixarArquivo(nomeArquivo, conteudo) {
      const blob = new Blob([conteudo], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo || 'arquivo.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      infoStatus.textContent = `Arquivo gerado para download: ${a.download}`;
    }

    // Função para formatar bytes para KB, MB etc
    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }