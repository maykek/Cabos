 // Função para buscar o código
 function buscarCodigo(codigoBuscado) {
    fetch('Cabos-Elétricos.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo');
            }
            return response.text();
        })
        .then(data => {
            const linhas = data.split('\n'); // Divide o conteúdo em linhas
            let resultado = null;

            // Itera sobre cada linha para encontrar o código
            for (let linha of linhas) {
                const partes = linha.split(';'); // Divide a linha em partes
                const codigo = partes[4].trim(); 

                if (codigo.toLowerCase() === codigoBuscado.trim().toLowerCase()) {
                    resultado = {
                        codigo: partes[4].trim(), // Código
                        descricao: partes[5] ? partes[5].trim() : '', // Descrição
                        sala: partes[7] ? partes[7].trim() : '', // Sala
                        destino: partes[8] ? partes[8].trim(): '',
                        CAE: partes[18] ? partes [18].trim():'',
                        equipamento: partes[19] ? partes [19].trim(): '',
                    };
                    break; // Para a busca se o código for encontrado
                }
            }

            // Exibe o resultado
            if (resultado) {
                console.log("Código encontrado: ", resultado.codigo);
                console.log("Descrição: ", resultado.descricao);
                console.log("Sala: ", resultado.sala);
                console.log("destino: ", resultado.destino);
                console.log("CAE: ", resultado.CAE);
                console.log("Equipamento: ", resultado.equipamento);
            } else {
                console.log("Código não encontrado.");
            }
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

// Adiciona um evento de clique ao botão
document.getElementById('buscarButton').addEventListener('click', function() {
    const codigoBuscado = document.getElementById('codigoInput').value; // Lê o valor do input
    buscarCodigo(codigoBuscado); // Chama a função de busca com o valor do input
});

// Função para criar a tabela
function criarTabela() {
    // Cria um elemento de tabela
    const tabela = document.createElement('table');

    // Cria o cabeçalho da tabela
    const thead = document.createElement('thead');
    const cabecalho = document.createElement('tr');
    const colunas = ['Circuito', 'Dados do Cabo', 'Informações', 'Condição'];
    colunas.forEach(coluna => {
        const th = document.createElement('th');
        th.textContent = coluna;
        cabecalho.appendChild(th);
    });
    thead.appendChild(cabecalho);
    tabela.appendChild(thead);

    // Cria o corpo da tabela
    const tbody = document.createElement('tbody');

    // Adiciona a primeira linha
    const linha1 = document.createElement('tr');
    linha1.innerHTML = `
<td>Unid. Ope.</td>
<td>Item Localização:</td>
<td>Data Diag.:</td>
<td></td>
`;
    tbody.appendChild(linha1);

    // Adiciona a segunda linha
    const linha2 = document.createElement('tr');
    linha2.innerHTML = `
<td>Localização: </td>
<td>Item Recirculação: </td>
<td>Próx. Diag.: </td>
<td></td>
`;
    tbody.appendChild(linha2);

    // Adiciona a terceira
    const linha3 = document.createElement('tr');
    const tdCompMatIsol = document.createElement('td');
    linha3.innerHTML = `
<td>Origem: </td>
`;
    tdCompMatIsol.innerHTML += `
<table style="width: 100%; border: none;">
        <td style="width: 50%; border: none;">Comp. (m): </td>
        <td style="width: 50%; border: none;">mat. Isol.: </td>
</table>
`;
    linha3.appendChild(tdCompMatIsol);
    tbody.appendChild(linha3);

    tabela.appendChild(tbody);
    return tabela;
}

// Adiciona a tabela ao container
const container = document.getElementById('tabela-container');
container.appendChild(criarTabela());