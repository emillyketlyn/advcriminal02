const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conecta ou cria o arquivo do banco de dados SQLite
const db = new sqlite3.Database('./banco.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Cria a tabela de mensagens/contatos se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Rota para receber dados do formulário do site
app.post('/api/contato', (req, res) => {
    const { nome, telefone, mensagem } = req.body;

    if (!nome || !telefone || !mensagem) {
        return res.status(400).json({ erro: 'Por favor, preencha todos os campos.' });
    }

    const sql = `INSERT INTO contatos (nome, telefone, mensagem) VALUES (?, ?, ?)`;
    db.run(sql, [nome, telefone, mensagem], function(err) {
        if (err) {
            console.error('Erro ao salvar no banco:', err.message);
            return res.status(500).json({ erro: 'Erro ao salvar no banco de dados.' });
        }
        res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!', id: this.lastID });
    });
});

// Inicializa o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
