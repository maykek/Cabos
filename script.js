const cableGroupsSelect = document.getElementById('cableGroups');
const uploadSection = document.getElementById('uploadSection');
const chartsContainer = document.getElementById('chartsContainer');
const inputsPerGroup = 3; // Define quantos inputs de upload por grupo
let tipoCaboSelect = document.getElementById('tipoCabo');
let tipoCabo = tipoCaboSelect.value;
const maxEPRTD = 75;
const minEPRTD = 16;
const maxEPRDP = 0.8;
const minEPRDP = 0.1;
const maxEPRTU = 40;
const minEPRTU = 2;
const maxEPRTUTU = 25;
const minEPRTUTU = 1;
const maxXLPETD = 70;
const minXLPETD = 6;
const maxXLPEDP = 1;
const minXLPEDP = 0.1;
const maxXLPETU = 94;
const minXLPETU = 6.7;
const maxXLPETUTU = 50;
const minXLPETUTU = 2;

let tanDeltaMeansByGroup = []; // Array para armazenar os valores de TanDeltaMean por grupo
let tanDeltaCharts = []; // Array para armazenar as instâncias dos gráficos
let group = 0;
let fase = '';
let irTag = '';


cableGroupsSelect.addEventListener('change', function() {
    const numberOfGroups = parseInt(this.value); // Aqui é onde numberOfGroups é declarado
    uploadSection.innerHTML = ''; // Limpa a seção de upload anterior
    chartsContainer.innerHTML = ''; // Limpa os gráficos anteriores
    tanDeltaMeansByGroup = []; // Reseta os dados do grupo
    tanDeltaCharts = []; // Reseta os gráficos

    for (let i = 0; i < numberOfGroups; i++) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        const label = document.createElement('label');
        label.textContent = `Grupo ${i + 1} (${inputsPerGroup} cabos):`;
        groupDiv.appendChild(label);
        tanDeltaMeansByGroup[i] = []; // Inicializa o array para o grupo
        
        for (let j = 0; j < inputsPerGroup; j++) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.'; // Tipos de arquivos permitidos
            fileInput.id = `group-${i + 1}-cable-${j + 1}`;
            fileInput.addEventListener('change', handleFileUpload.bind(null, i)); // Passa o índice do grupo corretamente
            groupDiv.appendChild(fileInput);

            // Adiciona um input de texto para o grupo
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.placeholder = `Nome do Grupo ${i + 1}`;
            groupDiv.appendChild(textInput);
            textInput.id = `group-${i + 1}-cable-${j + 1}-${fase}`;
            irTag = textInput.id;
            
        }

        uploadSection.appendChild(groupDiv);

        // Cria um canvas para o gráfico do grupo
        const canvas = document.createElement('canvas');
        canvas.id = `tanDeltaChart-${i}`; // ID único para cada gráfico
        chartsContainer.appendChild(canvas);
    }
});

// Função para lidar com o upload de arquivos
function handleFileUpload(groupIndex, event) {
    const files = event.target.files; // Obtém todos os arquivos selecionados
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            processFile(fileContent, file.name, groupIndex); // Passa o groupIndex corretamente
        }
        reader.readAsText(file); // Lê o arquivo como texto
        group++;
        if(group > 3){group = 1}
    }
}

// Função para processar cada arquivo
function processFile(fileContent, fileName, groupIndex) {
    const lines = fileContent.split('\n');
    let tanDeltaMeans = []; // Array para armazenar os valores de TanDeltaMean

    lines.forEach(line => {
        line = line.trim(); // Remove espaços em branco
        if (line === '') return; // Ignora linhas vazias

        // Extração de dados
        if (line.startsWith('TanDeltaMean=')) {
            const tanDeltaMean = parseFloat(line.split('=')[1].trim());
            tanDeltaMeans.push(tanDeltaMean); // Adiciona o TanDeltaMean ao array
        }
    });

    // Armazena os valores de TanDeltaMean para o grupo
    tanDeltaMeansByGroup[groupIndex].push(...tanDeltaMeans);

    // Atualiza o gráfico após cada upload
    updateChart(groupIndex, tanDeltaMeans);
}

// Função para atualizar o gráfico
function updateChart(groupIndex, tanDeltaMeans) {
    const ctx = document.getElementById(`tanDeltaChart-${groupIndex}`).getContext('2d');

    // Se o gráfico não existir, cria um novo
    if (!tanDeltaCharts[groupIndex]) {
        if(tipoCabo == 1)
        {
            tanDeltaCharts[groupIndex] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({ length: inputsPerGroup }, (_, i) => `Passo ${(i * 0.5).toFixed(1)}`), // Labels para os passos
                    datasets: [
                        {
                            label: 'Crítico',
                            data: maxEPRTD,
                            borderColor: 'rgb(238, 40, 5)',
                            borderDash: [5, 5], // Linhas tracejadas
                            fill: false
                        },
                        {
                            label: 'Alerta',
                            data: minEPRTD,
                            borderColor: 'rgb(222, 246, 5)',
                            borderDash: [5, 5], // Linhas tracejadas
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        if(tipoCabo == 2)
            {
                tanDeltaCharts[groupIndex] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: inputsPerGroup }, (_, i) => `Passo ${(i * 0.5).toFixed(1)}`), // Labels para os passos
                        datasets: [
                            {
                                label: 'Crítico',
                                data: maxXLPETD,
                                borderColor: 'rgb(238, 40, 5)',
                                borderDash: [5, 5], // Linhas tracejadas
                                fill: false
                            },
                            {
                                label: 'Alerta',
                                data: minXLPETD,
                                borderColor: 'rgb(222, 246, 5)',
                                borderDash: [5, 5], // Linhas tracejadas
                                fill: false
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
    }
    if(group == 1){fase = 'Fase R'}
    if(group == 2){fase = 'Fase S'}
    if(group == 3){fase = 'Fase T'}
    // Adiciona um novo dataset para o grupo
    tanDeltaCharts[groupIndex].data.datasets.push({
        label: `${fase}`,
        data: tanDeltaMeans,
        borderColor: `hsl(${group * 245}, 100%, 50%)`, // Cores diferentes para cada grupo
        fill: false,
        tension: 0.1
    });

    // Atualiza o gráfico
    tanDeltaCharts[groupIndex].update();
}

function select(){
    tipoCaboSelect = document.getElementById('tipoCabo');
    tipoCabo = tipoCaboSelect.value;
}