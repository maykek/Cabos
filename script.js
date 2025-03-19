const cableGroupsSelect = document.getElementById('cableGroups');
const uploadSection = document.getElementById('uploadSection');
const dataName = [];
let fileMeasurements = {}; // Objeto para armazenar medições de cada arquivo
let allFilesData = []; // Para armazenar dados de todos os arquivos
let tanDeltaMeanValues = []; // Para armazenar os valores de TanDeltaMean
const measurements = [];

// Função para lidar com o upload de arquivos
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
    const files = event.target.files; // Pega todos os arquivos selecionados
    const groupId = event.target.id.split('-')[1]; // Ex: "cable-1-cable-1" → groupId = "1"
    const cableId = event.target.id.split('-')[3]; // Ex: "cable-1-cable-1" → cableId = "1"

    // Processa cada arquivo do input
    Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            const fileName = file.name;
            const measurements = extractMeasurements(fileContent, fileName, groupId, cableId);
            
            // Adiciona ao array global
            allFilesData.push({
                fileName,
                measurements
            });
            displayResults(measurements); // Exibe os resultados
        };
        reader.readAsText(file);
    });
}

// Função para extrair os dados das medições
function extractMeasurements(content, groupId, cableId) {
    const lines = content.split('\n');
    let currentStep = '';
    let tanDeltaMax = -Infinity; // Inicializa aqui para cada arquivo

    lines.forEach(line => {
        line = line.trim();
        if (line === '') return;

        if (line.startsWith('[Measurement Diagnose')) {
            currentStep = line;
        } else if (line.startsWith('TanDeltaSTD=')) {
            const tanDeltaSTD = parseFloat(line.split('=')[1].trim());
            // Atualiza tanDeltaMax se o novo valor for maior
            if (tanDeltaSTD > tanDeltaMax) {
                tanDeltaMax = tanDeltaSTD;
            }
        } else if (line.startsWith('TanDeltaMean=')) {
            const tanDeltaMean = parseFloat(line.split('=')[1].trim());
            if (measurements.length > 0) {
                measurements[measurements.length - 1].TanDeltaMean = tanDeltaMean;
                tanDeltaMeanValues.push(tanDeltaMean);
            }
        }
    });

    // Adiciona a medição final com o maior TanDeltaSTD encontrado
    if (currentStep) {
        measurements.push({ 
            step: currentStep,
            groupId: parseInt(groupId),
            cableId: parseInt(cableId),
            TanDeltaSTD: tanDeltaMax,
            TanDeltaMean: tanDeltaMeanValues
        });
    }

    return measurements;
}

// Função para exibir os resultados
function displayResults(measurements) {
    //resultDisplay.innerHTML = ''; // Limpa resultados anteriores

    // Cria a tabela
    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');

    // Cria o cabeçalho da tabela
    const header = table.createTHead();
    const headerRow = header.insertRow(0);
    const headers = ['Step', 'TanDeltaSTD', 'TanDeltaMean'];

    headers.forEach((headerText) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // Cria o corpo da tabela
    const tbody = table.createTBody();

    measurements.forEach(measurement => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = measurement.step;
        row.insertCell(1).textContent = measurement.TanDeltaSTD.toFixed(3); // Formata para 3 casas decimais
        row.insertCell(2).textContent = measurement.TanDeltaMean ? measurement.TanDeltaMean.toFixed(3) : 'N/A'; // Verifica se existe
        //row.insertCell(3).textContent = measurement.DeltaTanDelta ? measurement.DeltaTanDelta.toFixed(3) : 'N/A'; // Verifica se existe
    });

    // Adiciona a tabela ao display de resultados
    resultDisplay.appendChild(table);
   // console.log('Dados extraídos:', measurements);
   
}

console.log("tanDeltaM:",tanDeltaMeanValues)
console.log(allFilesData);
