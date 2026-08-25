const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARES
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // pasta onde ficam index.html e style.css

// ======================
// BANCO DE DADOS (SQLite)
// ======================
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar no banco:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite');
    }
});

// Cria a tabela de contatos (se não existir)
db.run(`
    CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT,
        assunto TEXT,
        mensagem TEXT NOT NULL,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
        lido INTEGER DEFAULT 0
    )
`);

// ======================
// ROTAS
// ======================

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Receber formulário de contato
app.post('/api/contato', (req, res) => {
    const { nome, email, telefone, assunto, mensagem } = req.body;

    // Validação básica
    if (!nome || !email || !mensagem) {
        return res.status(400).json({ 
            sucesso: false, 
            erro: 'Nome, e-mail e mensagem são obrigatórios.' 
        });
    }

    const sql = `
        INSERT INTO contatos (nome, email, telefone, assunto, mensagem)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [nome, email, telefone || null, assunto || null, mensagem], function(err) {
        if (err) {
            console.error('Erro ao salvar contato:', err.message);
            return res.status(500).json({ 
                sucesso: false, 
                erro: 'Erro interno ao salvar a mensagem.' 
            });
        }

        console.log(`📩 Novo contato recebido (ID: ${this.lastID}) - ${nome}`);
        
        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
            id: this.lastID
        });
    });
});

// Listar todos os contatos (área administrativa simples)
app.get('/api/contatos', (req, res) => {
    const sql = `SELECT * FROM contatos ORDER BY data_envio DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

// Marcar mensagem como lida
app.patch('/api/contatos/:id/lido', (req, res) => {
    const { id } = req.params;

    db.run(`UPDATE contatos SET lido = 1 WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json({ sucesso: true, alterados: this.changes });
    });
});

// Rota de saúde (útil no Codespaces)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', mensagem: 'Servidor de Advocacia Criminal rodando' });
});

// ======================
// INICIAR SERVIDOR
// ======================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📂 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
