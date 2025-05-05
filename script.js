const cableGroupsSelect = document.getElementById('cableGroups');
const uploadSection = document.getElementById('uploadSection');
const chartsContainer = document.getElementById('chartsContainer');
const tipoCaboSelect = document.getElementById('tipoCabo');
const inputsPerGroup = 3; // Define quantos inputs de upload por grupo
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
const date = new Date();
const dia = date.getDate();
const mes = date.getMonth() + 1; // Adiciona 1, pois os meses começam em 0
const ano = date.getFullYear();
const Data = `${dia}-${mes}-${ano}`;


let tagCad = null;
let tag = null;
let tipoCabo = 0;
let limMax = 0;
let limMin = 0;
let tanDeltaMeansByGroup = []; // Array para armazenar os valores de TanDeltaMean por grupo
let tanDeltaSTDByGroup = []; // Array para armazenar os valores de TanDeltaSTD por grupo
let tanDeltaCharts = []; // Array para armazenar as instâncias dos gráficos
let group = 0;
let fase = '';
let irTag = '';
let resultado = null;
let origem = null;
let destino = null;
let isol = '';
let isol1 = null;

cableGroupsSelect.addEventListener('change', function () {
    const numberOfGroups = parseInt(this.value); // Aqui é onde numberOfGroups é declarado
    uploadSection.innerHTML = ''; // Limpa a seção de upload anterior
    chartsContainer.innerHTML = ''; // Limpa os gráficos anteriores
    tanDeltaMeansByGroup = []; // Reseta os dados do grupo
    tanDeltaSTDByGroup = [];
    tanDeltaCharts = []; // Reseta os gráficos

    for (let i = 0; i < numberOfGroups; i++) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        const label = document.createElement('label');
        label.textContent = `Grupo ${i + 1} (${inputsPerGroup} cabos):`;
        groupDiv.appendChild(label);
        tanDeltaMeansByGroup[i] = []; // Inicializa o array para o grupo
        tanDeltaSTDByGroup[i] = [];

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
        reader.onload = function (e) {
            const fileContent = e.target.result;
            processFile(fileContent, file.name, groupIndex); // Passa o groupIndex corretamente
        }
        reader.readAsText(file); // Lê o arquivo como texto
        group++;
        if (group > 3) { group = 1 }

    }
}

// Função para processar cada arquivo
function processFile(fileContent, fileName, groupIndex) {
    const lines = fileContent.split('\n');
    let tanDeltaMeans = []; // Array para armazenar os valores de TanDeltaMean
    let tanDeltaSTDs = []
    lines.forEach(line => {
        line = line.trim(); // Remove espaços em branco
        if (line === '') return; // Ignora linhas vazias

        // Extração de dados
        if (line.startsWith('TanDeltaMean=')) {
            const tanDeltaMean = parseFloat(line.split('=')[1].trim());
            tanDeltaMeans.push(tanDeltaMean); // Adiciona o TanDeltaMean ao array
        }

        if (line.startsWith('TanDeltaSTD=')) {
            const tanDeltaSTD = parseFloat(line.split('=')[1].trim());
            tanDeltaSTDs.push(tanDeltaSTD); //Adiciona o TanDeltaSTD ao array
        }
    });

    // Armazena os valores de TanDeltaMean para o grupo
    tanDeltaMeansByGroup[groupIndex].push(tanDeltaMeans);

    // Armazena os valores de TanDeltaSTD para o grupo
    tanDeltaSTDByGroup[groupIndex].push(tanDeltaSTDs);

    // Atualiza o gráfico após cada upload
    updateChart(groupIndex, tanDeltaMeans);
}

// Função para atualizar limites do gráfico
tipoCaboSelect.addEventListener('change', function () {
    tipoCabo = parseInt(this.value)

    if (tipoCabo == 1) {
        limMax = maxEPRTD;
        limMin = minEPRTD;
    }
    if (tipoCabo == 2) {
        limMax = maxXLPETD;
        limMin = minXLPETD;
    }
    
})


/////////////////////////////////////////////////////// Função para atualizar o gráfico////////////////////////////////////////////////////////
function updateChart(groupIndex, tanDeltaMeans) {
    const ctx = document.getElementById(`tanDeltaChart-${groupIndex}`).getContext('2d');
    const labels = Array.from({ length: inputsPerGroup }, (_, i) => `MTD (${(i * 0.5).toFixed(1)} * U0) [E-3]`)

    // Se o gráfico não existir, cria um novo
    if (!tanDeltaCharts[groupIndex]) {
        tanDeltaCharts[groupIndex] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // Labels para os passos
                datasets: [
                    {
                        label: 'Crítico',
                        data: Array(labels.length).fill(limMax),
                        borderColor: 'rgb(238, 40, 5)',
                        backgroundColor: 'rgb(255, 255, 255)',
                        borderDash: [5, 5], // Linhas tracejadas
                        fill: false
                    },
                    {
                        label: 'Alerta',
                        data: Array(labels.length).fill(limMin),
                        borderColor: 'rgb(222, 246, 5)',
                        backgroundColor: 'rgb(255, 255, 255)',
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
                },
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    if (group == 1) { fase = 'Fase R' }
    if (group == 2) { fase = 'Fase S' }
    if (group == 3) { fase = 'Fase T' }

    // Adiciona um novo dataset para o grupo
    tanDeltaCharts[groupIndex].data.datasets.push({
        label: `${fase}`,
        data: tanDeltaMeans,
        borderColor: `hsl(${group * 245}, 100%, 50%)`, // Cores diferentes para cada grupo
        backgroundColor: `hsl(${group * 245}, 100%, 50%)`,
        fill: false,
        tension: 0.1
    });

    // Atualiza o gráfico
    tanDeltaCharts[groupIndex].update();
    tabelaDados();
    
}

///////////////////////////////////////////////////////////////// Relatório ///////////////////////////////////////////////////////////////////
// Função para buscar o código
function buscarCodigo(codigoBuscado) {
    // Verifica se codigoBuscado é uma string
    if (typeof codigoBuscado !== 'string') {
        console.error('O valor buscado não é uma string.');
        return;
    }

    fetch('Cabos-Elétricos.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo');
            }
            return response.text();
        })
        .then(data => {
            const linhas = data.split('\n'); // Divide o conteúdo em linhas


            // Itera sobre cada linha para encontrar o código
            for (let linha of linhas) {
                const partes = linha.split(';'); // Divide a linha em partes
                const codigo = partes[4] ? partes[4].trim() : ''; // Verifica se partes[4] existe
                const circuito = partes.find(info => info.includes('P/'));

                if (circuito) {
                    const [origemP, destinoP] = circuito.split('P/').map(str => str.trim())
                    origem = origemP;
                    destino = destinoP;
                }

                if (codigo.toLowerCase() === codigoBuscado.trim().toLowerCase()) {
                    resultado = {
                        codigo: partes[4] ? partes[4].trim() : '', // Código
                        descricao: partes[5] ? partes[5].trim() : '', // Descrição
                        sala: partes[7] ? partes[7].trim() : '', // Sala
                        Tag: partes[9] ? partes[9].trim() : '',
                        CAE: partes[18] ? partes[18].trim() : '',
                        equipamento: partes[19] ? partes[19].trim() : '',
                        matIsol: partes[20] ? partes[20].trim() : '',
                        iso: partes[23] ? partes[23].trim() : '',
                        metro: partes[24] ? partes[24].trim() : '',
                    };
                    break; // Para a busca se o código for encontrado
                }
            }
            // Exibe o resultado
            if (resultado) {
                isol1 = resultado.matIsol;
                console.log("Código encontrado: ", resultado.codigo);
                console.log("Descrição: ", resultado.descricao);
                console.log("Sala: ", resultado.sala);
                console.log("Destino: ", destino);
                console.log("CAE: ", resultado.CAE);
                console.log("Equipamento: ", resultado.equipamento);
                console.log("Tag: ", resultado.Tag);
                console.log('islo1: ', isol1);
                if (isol1 == '') {
                    document.getElementById('isolante').style.display = 'block';
                    if (tipoCabo == 1) {
                        isol = 'EPR';
                        criarTabela(resultado);
                    } else if (tipoCabo == 2) {
                        isol = 'XLPE';
                        criarTabela(resultado);
                    } else (Error)
                } else { isol = isol1; cabo() }
                // Chama a função para criar a tabela com o resultado

            } else {
                console.log("Código não encontrado.");
            }
            if (resultado.Tag == '') {
                const tag1 = document.getElementById('tag').value;
                tag = `${resultado.CAE}-${tag1}-${Data}`;
                tagCad = `${resultado.Tag}`;
            } else {
                tag = `${resultado.CAE}_${resultado.Tag}_${Data}`;
                tagCad = `${resultado.Tag}`;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
        });


}
function cabo() {
    if (isol1 == 'XLPE') {
        limMax = maxXLPETD;
        limMin = minXLPETD;
    }
    if (isol1 == 'EPR') {
        limMax = maxEPRTD;
        limMin = minEPRTD;
    }
    criarTabela(resultado);
}
// Adiciona um evento de clique ao botão
document.getElementById('buscarButton').addEventListener('click', function () {
    const codigoBuscado = document.getElementById('codigoInput').value; // Lê o valor do input
    buscarCodigo(codigoBuscado); // Chama a função de busca com o valor do input
});


// Função para criar a tabela
function criarTabela(resultado) {
    tec1 = document.getElementById('tecnicos1').value
    tec2 = document.getElementById('tecnicos2').value
    // Limpa a tabela anterior, se houver
    const container = document.getElementById('tabela-container');
    container.innerHTML = ''; // Limpa o conteúdo anterior

    // Cria um elemento de tabela
    const tabela = document.createElement('table');

    // Cria o cabeçalho da tabela
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th colspan="6" text-align = "center">Dados do Cabo</th>
        </tr>
    `;
    tabela.appendChild(thead);
    // Cria o corpo da tabela
    const tbody = document.createElement('tbody');
    tbody.innerHTML = `
        <tr>
            <td><strong>Unid. Ope.: </strong>${resultado.descricao}</td>
            <td colspan="2"><strong>Item Localização: </strong>${resultado.codigo}</td>
            <td><strong>Data Diag.: </strong></td>
        </tr>
        <tr>
            <td><strong>Localização: </strong>${resultado.sala}</td>
            <td colspan="2"><strong>Item Recirculação: </strong> ${resultado.CAE} (${resultado.equipamento})</td>                
            <td><strong>Prox. Diag.: </strong></td>
        </tr>
        <tr>
            <td><strong>Origem: </strong>${origem}</td>
            <td><strong>Comp.(m): </strong>${resultado.metro}</td>
            <td><strong>Mat. Isol.: </strong>${isol}</td>
            <td colspan="2" valign="middle"><strong>Téc. Exec.:   </strong></td>
            <td colspan="2" valign="middle">${tec1}</br>${tec2}</td>
            </tr>
            <tr>
            <td><strong>Destino: </strong>${destino}</td>
            <td><strong>C. Isol.: </strong>${resultado.iso}</td>
            <td><strong>Cabos/fase: </strong></td>    
        </tr>
        <th colspan="6">Resultado dos Testes</th>
    `;

    tabela.appendChild(tbody);
    if (tec1 && tec2 != '0') {
        container.appendChild(tabela); // Adiciona a tabela ao container
    } else { window.alert('Insira os nomes dos técnicos'); }

}
function tabelaDados() {
    const dadofase0 = document.getElementById('dadoFase0');
    const dadofase1 = document.getElementById('dadoFase1');
    const dadofase2 = document.getElementById('dadoFase2');
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            console.log('fase: ',tanDeltaMeansByGroup[i][j])
        }
    }


}

///////////////////////////////////////////////////////////////////////Salvar em PDF//////////////////////////////////////////////////////////
document.getElementById('salvar-pdf').addEventListener('click', function () {
    const tag1 = document.getElementById('tag').value;
    if (tagCad || tag1) {
        var element = document.getElementById('area-captura');
        html2canvas(element, { scale: 5 }).then(function (canvas) {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p', // Define a orientação como paisagem
                unit: 'cm', // Unidade de medida
                format: 'a4' // Formato do papel
            });
            pdf.addImage(imgData, 'JPEG', 0, 0, 21, 0);
            pdf.save(tag);
            console.log('Tag:', tag);
        });
    }
    else {
        window.alert('Insira um Tag para salvar o relatório');
        console.log('Tag:', tag);
        console.log('tagCad: ', tagCad);
        console.log('tag1: ', tag1);
    }
});