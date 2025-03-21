const cableGroupsSelect = document.getElementById('cableGroups');
        const uploadSection = document.getElementById('uploadSection');
        const resultDisplay = document.getElementById('resultDisplay');

        cableGroupsSelect.addEventListener('change', function() {
            const numberOfGroups = parseInt(this.value);
            uploadSection.innerHTML = ''; // Limpa a seção de upload anterior

            for (let i = 0; i < numberOfGroups; i++) {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('group');

                const label = document.createElement('label');
                label.textContent = `Grupo ${i + 1} (3 cabos):`;
                groupDiv.appendChild(label);

                for (let j = 0; j < 3; j++) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.'; // Tipos de arquivos permitidos
                    input.id = `cable-${i + 1}-cable-${j + 1}`;
                    input.addEventListener('change', handleFileUpload); // Adiciona o listener para cada input
                    groupDiv.appendChild(input);
                }

                uploadSection.appendChild(groupDiv);
            }
        });

        // Função para lidar com o upload de arquivos
        function handleFileUpload(event) {
            const files = event.target.files; // Obtém todos os arquivos selecionados
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileContent = e.target.result;
                    processFile(fileContent, file.name); // Processa o conteúdo do arquivo
                }
                reader.readAsText(file); // Lê o arquivo como texto
            }
        }

        // Função para processar cada arquivo
        function processFile(fileContent, fileName) {
            const lines = fileContent.split('\n');
            let maxTanDeltaSTD = -Infinity; // Inicializa com o menor valor possível
            let tanDeltaMeans = []; // Array para armazenar os valores de TanDeltaMean

            lines.forEach(line => {
                line = line.trim(); // Remove espaços em branco
                if (line === '') return; // Ignora linhas vazias

                // Extração de dados
                if (line.startsWith('TanDeltaSTD=')) {
                    const tanDeltaSTD = parseFloat(line.split('=')[1].trim());
                    if (tanDeltaSTD > maxTanDeltaSTD) {
                        maxTanDeltaSTD = tanDeltaSTD; // Atualiza o maior valor
                    }
                } else if (line.startsWith('TanDeltaMean=')) {
                    const tanDeltaMean = parseFloat(line.split('=')[1].trim());
                    tanDeltaMeans.push(tanDeltaMean); // Adiciona o TanDeltaMean ao array
                }
            });

            // Exibe o maior TanDeltaSTD e os valores de TanDeltaMean encontrados
            displayMaxTanDeltaSTD(fileName, maxTanDeltaSTD, tanDeltaMeans);
        }

        // Função para exibir o maior TanDeltaSTD e os valores de TanDeltaMean
        function displayMaxTanDeltaSTD(fileName, maxTanDeltaSTD, tanDeltaMeans) {
            const resultDiv = document.createElement('div');
            resultDiv.textContent = `Maior TanDeltaSTD do arquivo ${fileName}: ${maxTanDeltaSTD.toFixed(4)}, TanDeltaMeans correspondentes: ${tanDeltaMeans.length > 0 ? tanDeltaMeans.map(mean => mean.toFixed(4)).join(',     ') : 'N/A'}`; // Formata para 4 casas decimais
            resultDisplay.appendChild(resultDiv);
        }