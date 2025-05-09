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
            let resultado = null;

            // Itera sobre cada linha para encontrar o código
            for (let linha of linhas) {
                const partes = linha.split(';'); // Divide a linha em partes
                const codigo = partes[4] ? partes[4].trim() : ''; // Verifica se partes[4] existe

                if (codigo.toLowerCase() === codigoBuscado.trim().toLowerCase()) {
                    resultado = {
                        codigo: partes[4] ? partes[4].trim() : '', // Código
                        descricao: partes[5] ? partes[5].trim() : '', // Descrição
                        sala: partes[7] ? partes[7].trim() : '', // Sala
                        destino: partes[8] ? partes[8].trim() : '',
                        CAE: partes[18] ? partes[18].trim() : '',
                        equipamento: partes[19] ? partes[19].trim() : '',
                    };
                    break; // Para a busca se o código for encontrado
                }
            }

            // Exibe o resultado
            if (resultado) {
                console.log("Código encontrado: ", resultado.codigo);
                console.log("Descrição: ", resultado.descricao);
                console.log("Sala: ", resultado.sala);
                console.log("Destino: ", resultado.destino);
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