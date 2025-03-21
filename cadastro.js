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
                        sala: partes[7] ? partes[7].trim() : '' // Sala
                    };
                    break; // Para a busca se o código for encontrado
                }
            }

            // Exibe o resultado
            if (resultado) {
                console.log("Código encontrado:", resultado.codigo);
                console.log("Descrição:", resultado.descricao);
                console.log("Sala:", resultado.sala);
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