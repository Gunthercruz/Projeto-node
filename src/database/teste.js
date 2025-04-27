const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.resolve(__dirname, '../database/database.sqlite');

let db = null; // Inicialize db como null
let dbReadyPromise = null; // Vamos armazenar a Promise aqui

const connectDb = () => {
    // Se a Promise já existe, retorne-a (evita reconectar)
    if (dbReadyPromise) {
        return dbReadyPromise;
    }

    // Crie uma nova Promise para a conexão e setup
    dbReadyPromise = new Promise((resolve, reject) => {
        // sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE garante que o arquivo será criado se não existir
        db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error("Erro ao abrir o banco de dados:", err.message);
                dbReadyPromise = null; // Reseta a promise em caso de erro para tentar novamente se necessário
                reject(err); // Rejeita a Promise com o erro
            } else {
                console.log('Conectado ao banco de dados SQLite.');

                // Execute as operações de setup (criar tabelas, etc.) DENTRO do callback de conexão
                db.serialize(() => { // serialize garante que as operações dentro dele rodem em sequência
                    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        cpf TEXT NOT NULL UNIQUE,
                        email TEXT NOT NULL,
                        password TEXT NOT NULL,
                        role TEXT NOT NULL CHECK(role IN ('ADMIN', 'CLIENTE')),
                        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
                    );`, (err) => {
                        if (err) {
                            console.error("Erro ao criar tabela usuarios:", err.message);
                            dbReadyPromise = null; // Reseta a promise em caso de erro
                            reject(err); // Rejeita a Promise se a criação da tabela falhar
                        } else {
                            console.log("Tabela usuarios verificada/criada com sucesso.");
                            resolve(db); // Resolve a Promise com o objeto db quando tudo estiver pronto
                        }
                    });
                    // ADICIONE OUTRAS CRIAÇÕES DE TABELAS AQUI DENTRO DE serialize()
                });
            }
        });
    });

    return dbReadyPromise; // Retorna a Promise
};

// Inicie o processo de conexão imediatamente quando o módulo é carregado
connectDb();

// Exporte a função que retorna a Promise (ou a Promise diretamente)
// Exportar a Promise diretamente é mais comum para módulos que representam um recurso único
module.exports = dbReadyPromise;

// OU, se preferir exportar uma função para obter a Promise:
// module.exports = connectDb; // Nesse caso, quem importar precisará chamar connectDb() para obter a Promise

// Vamos seguir exportando a Promise diretamente por simplicidade no uso do DAO