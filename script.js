document.getElementById('contatoForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const mensagem = document.getElementById('mensagem').value;
    const status = document.getElementById('statusMensagem');

    status.innerText = "Enviando...";

    try {
        const response = await fetch('http://localhost:3000/api/contato', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, telefone, mensagem })
        });

        const data = await response.json();

        if (response.ok) {
            status.innerText = "Mensagem registrada com sucesso!";
            document.getElementById('contatoForm').reset();
        } else {
            status.innerText = "Erro: " + data.erro;
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        status.innerText = "Erro ao conectar com o servidor.";
    }
});
