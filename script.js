const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const resultDisplay = document.getElementById('resultDisplay');

let measurementsData = []; // Variável para armazenar os dados das medições

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result; // Armazena o conteúdo do arquivo
            preview.textContent = fileContent; // Exibe o conteúdo do arquivo
            measurementsData = extractMeasurements(fileContent); // Extrai os dados das medições
            displayResults(measurementsData); // Exibe os resultados
        }
        reader.readAsText(file); // Lê o arquivo como texto
    } else {
        preview.textContent = "Nenhum arquivo selecionado.";
    }
});

// Função para extrair os dados das medições
function extractMeasurements(content) {
    const lines = content.split('\n');
    const measurements = [];
    let currentMeasurement = null;

    lines.forEach(line => {
        line = line.trim(); // Remove espaços em branco
        if (line === '') return; // Ignora linhas vazias

        // Verifica se a linha é um cabeçalho de medição
        if (line.endsWith('Sum]')) {
            if (currentMeasurement) {
                measurements.push(currentMeasurement); // Adiciona a medição anterior
            }
            currentMeasurement = { TanDeltaSTD: null, TanDeltaMean: null, DeltaTanDelta: null }; // Inicializa nova medição
        }

        // Captura os valores de TanDeltaSTD, TanDeltaMean e DeltaTanDelta
        if (line.startsWith('TanDeltaSTD=')) {
            currentMeasurement.TanDeltaSTD = parseFloat(line.split('=')[1].trim());
        } else if (line.startsWith('TanDeltaMean=')) {
            currentMeasurement.TanDeltaMean = parseFloat(line.split('=')[1].trim());
        } else if (line.startsWith('DeltaTanDelta=')) {
            currentMeasurement.DeltaTanDelta = parseFloat(line.split('=')[1].trim());
        }
    });

    // Adiciona a última medição se existir
    if (currentMeasurement) {
        measurements.push(currentMeasurement);
    }

    return measurements;
}

// Função para exibir os resultados
function displayResults(measurements) {
    let resultText = 'Resultados das Medições:\n\n';
    
    measurements.forEach((measurement, index) => {
        resultText += `Medição ${index + 1}:\n`;
        resultText += `TanDeltaSTD: ${measurement.TanDeltaSTD}\n`;
        resultText += `TanDeltaMean: ${measurement.TanDeltaMean}\n`;
        resultText += `DeltaTanDelta: ${measurement.DeltaTanDelta}\n\n`;
    });

    resultDisplay.textContent = resultText; // Exibe os resultados
}