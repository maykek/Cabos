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

<<<<<<< HEAD

let tagCad = null;
=======
>>>>>>> 5fc33e247c39d87d332984649db3d781cdddb9ad
let tag = null;
let tipoCabo = 0;
let limMax = 0;
let limMin = 0;
let tanDeltaMeansByGroup = []; // Array para armazenar os valores de TanDeltaMean por grupo
let tanDeltaCharts = []; // Array para armazenar as instâncias dos gráficos
let group = 0;
let fase = '';
let irTag = '';
let resultado = null;
let origem = null;
let destino = null;
let isol = '';

cableGroupsSelect.addEventListener('change', function () {
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

// Função para atulizar limites do gráfico
tipoCaboSelect.addEventListener('change', function () {
    tipoCabo = parseInt(this.value)

    if (tipoCabo == 1) {
        limMax = maxEPRTD;
        limMin = minEPRTD;
    }
    else if (tipoCabo == 2) {
        limMax = maxXLPETD;
        limMin = minXLPETD;
    } else {
        limMax = 0;
        limMin = 0;
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
                        iso: partes[22] ? partes[22].trim() : '',
                        metro: partes[23] ? partes[23].trim() : '',
                    };
                    break; // Para a busca se o código for encontrado
                }
            }
            // Exibe o resultado
            if (resultado) {
                console.log("Código encontrado: ", resultado.codigo);
                console.log("Descrição: ", resultado.descricao);
                console.log("Sala: ", resultado.sala);
                console.log("Destino: ", destino);
                console.log("CAE: ", resultado.CAE);
                console.log("Equipamento: ", resultado.equipamento);
                console.log("Tag: ", resultado.Tag);

                // Chama a função para criar a tabela com o resultado
                criarTabela(resultado);
            } else {
                console.log("Código não encontrado.");
            }
<<<<<<< HEAD
            if (resultado.Tag == '') {
                const tag1 = document.getElementById('tag').value;
                tag = `${resultado.CAE}-${tag1}-${Data}`;
                tagCad = `${resultado.Tag}`;
            } else {
                tag = `${resultado.CAE}_${resultado.Tag}_${Data}`;
                tagCad = `${resultado.Tag}`;
            }
=======

            const tag1 = document.getElementById('tag').value.toUpperCase();
            tag = `${resultado.CAE}-${tag1}-${data}`;

>>>>>>> 5fc33e247c39d87d332984649db3d781cdddb9ad
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

// Adiciona um evento de clique ao botão
document.getElementById('buscarButton').addEventListener('click', function () {
    const codigoBuscado = document.getElementById('codigoInput').value; // Lê o valor do input
    buscarCodigo(codigoBuscado); // Chama a função de busca com o valor do input
});


// Função para criar a tabela
function criarTabela(resultado) {
    // Limpa a tabela anterior, se houver
    if (tipoCabo == 1) {
        isol = 'EPR';
    } else if (tipoCabo == 2) {
        isol = 'XLPE';
    } else (Error)
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
            <td rowspan="2" valign="middle"><strong>Téc. Exec.:   </strong>ABC DEF </br><pre>        GHI JKL</pre></td>
        </tr>
        <tr>
            <td><strong>Destino: </strong>${destino}</td>
            <td><strong>C. Isol.: </strong>${resultado.iso}</td>
            <td><strong>Cabos/fase: </strong></td>    
        </tr>
        <th colspan="6">TESTE</th>
    `;

    tabela.appendChild(tbody);
    container.appendChild(tabela); // Adiciona a tabela ao container
}
///////////////////////////////////////////////////////////////////////Salvar em PDF//////////////////////////////////////////////////////////
document.getElementById('salvar-pdf').addEventListener('click', function () {
<<<<<<< HEAD
    const tag1 = document.getElementById('tag').value;
    if (tagCad || tag1) {
=======
    if (tag) {
>>>>>>> 5fc33e247c39d87d332984649db3d781cdddb9ad
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
<<<<<<< HEAD
            console.log('Tag:', tag);
        });
    } 
    else {
        window.alert('Insira um Tag para salvar o relatório');
        console.log('Tag:', tag);
        console.log('tagCad: ',tagCad);
        console.log('tag1: ',tag1);  
=======
            console.log(tag);
        });
    } else{window.alert('Insira um Tag para salvar o relatório');
>>>>>>> 5fc33e247c39d87d332984649db3d781cdddb9ad
    }
});