const cableGroupsSelect = document.getElementById('cableGroups');
const uploadSection = document.getElementById('uploadSection');

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
            input.accept = "."; // Tipos de arquivos permitidos
            input.id = `cable-${i + 1}-cable-${j + 1}`;
            groupDiv.appendChild(input);
        }

        uploadSection.appendChild(groupDiv);
    }
});


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
            input.addEventListener('change', handleFileUpload);
            groupDiv.appendChild(input);
        }

        uploadSection.appendChild(groupDiv);
    }
});

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
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            const measurements = extractMeasurements(fileContent); // Extrai os dados das medições
            displayResults(measurements, file.name); // Passa o nome do arquivo para a função
        }
        reader.readAsText(file); // Lê o arquivo como texto
    }
}

// Função para extrair os dados das medições
function extractMeasurements(content) {
    const lines = content.split('\n');
    const measurements = [];
    let currentStep = '';

    lines.forEach(line => {
        line = line.trim(); // Remove espaços em branco
        if (line === '') return; // Ignora linhas vazias

        // Verifica se a linha é um nome de Step
        if (line.endsWith('Sum]')) {
            currentStep = line; // Atualiza o Step atual
        } else if (line.startsWith('TanDeltaSTD=')) {
            const tanDeltaSTD = parseFloat(line.split('=')[1].trim());
            measurements.push({ step: currentStep, TanDeltaSTD: tanDeltaSTD });
        } else if (line.startsWith('TanDeltaMean=')) {
            const tanDeltaMean = parseFloat(line.split('=')[1].trim());
            measurements[measurements.length - 1].TanDeltaMean = tanDeltaMean; // Adiciona ao último item
        } else if (line.startsWith('DeltaTanDelta=')) {
            const deltaTanDelta = parseFloat(line.split('=')[1].trim());
            measurements[measurements.length - 1].DeltaTanDelta = deltaTanDelta; // Adiciona ao último item
        }
    });

    return measurements; // Retorna as medições extraídas
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
    const headers = ['Step', 'TanDeltaSTD', 'TanDeltaMean', 'DeltaTanDelta'];

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
        row.insertCell(1).textContent = measurement.TanDeltaSTD.toFixed(4); // Formata para 4 casas decimais
        row.insertCell(2).textContent = measurement.TanDeltaMean ? measurement.TanDeltaMean.toFixed(4) : 'N/A'; // Verifica se existe
        row.insertCell(3).textContent = measurement.DeltaTanDelta ? measurement.DeltaTanDelta.toFixed(4) : 'N/A'; // Verifica se existe
    });

    // Adiciona a tabela ao display de resultados
    resultDisplay.appendChild(table);
}
