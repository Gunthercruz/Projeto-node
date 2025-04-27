const sqlite3 = require('sqlite3').verbose();
const path = require('path');                 // Importe o módulo 'path'
const DB_PATH = path.resolve(__dirname, '../database.sqlite');

let db = null;
let dbReadyPromise = null;

const connectDb = () => {
    if (dbReadyPromise) {
        return dbReadyPromise;
    }
    
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
                    db.run(`CREATE TABLE IF NOT EXISTS users (
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
                    db.run(`
                        CREATE TABLE IF NOT EXISTS telefones (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            numero TEXT NOT NULL,
                            is_principal INTEGER NOT NULL DEFAULT 0 CHECK(is_principal IN (0, 1)),
                            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
                        )
                    `, (err) => {
                        if (err) {
                            console.error("Erro ao criar tabela telefones:", err.message);
                            dbReadyPromise = null; 
                            reject(err); 
                        } else {
                            console.log("Tabela telefones verificada/criada com sucesso.");
                            resolve(db);
                        }
                    });
                    db.run(`
                        CREATE TABLE IF NOT EXISTS emails (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            endereco TEXT NOT NULL,
                            is_principal INTEGER NOT NULL DEFAULT 0 CHECK(is_principal IN (0, 1)),
                            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
                        )
                    `, (err) => {
                        if (err) {
                            console.error("Erro ao criar tabela emails:", err.message);
                            dbReadyPromise = null; 
                            reject(err); 
                        } else {
                            console.log("Tabela emails verificada/criada com sucesso.");
                            resolve(db);
                        }
                    });
                });
            }
        });
    });

    return dbReadyPromise; // Retorna a Promise
};
connectDb();

module.exports = dbReadyPromise;


// new sqlite3.Database(DB_PATH, (err) => {
//     if (err) {
//         console.error("Erro ao abrir o banco de dados", err.message);
//         throw err; // Encerra se não conseguir conectar
//     }
//     console.log('Conectado ao banco de dados SQLite.');
// });

// db.serialize(() =>{
//     db.run(`
//         CREATE TABLE IF NOT EXISTS usuarios (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             nome TEXT NOT NULL,
//             cpf TEXT NOT NULL UNIQUE,
//             senha TEXT NOT NULL,
//             perfil TEXT NOT NULL CHECK(perfil IN ('ADMIN', 'CLIENTE')),
//             data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
//         )
//     `, (err) => {
//         if (err) {
//             console.error("Erro ao criar tabela usuarios:", err.message);
//         } else {
//             console.log("Tabela usuarios verificada/criada com sucesso.");
//         }
//     });
//     // Cria a tabela de telefones
//     db.run(`
//         CREATE TABLE IF NOT EXISTS telefones (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             user_id INTEGER NOT NULL,
//             numero TEXT NOT NULL,
//             is_principal INTEGER NOT NULL DEFAULT 0 CHECK(is_principal IN (0, 1)),
//             FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
//         )
//     `, (err) => {
//         if (err) {
//             console.error("Erro ao criar tabela telefones:", err.message);
//         } else {
//             console.log("Tabela telefones verificada/criada com sucesso.");
//         }
//     });

//     // Cria a tabela de emails
//     db.run(`
//         CREATE TABLE IF NOT EXISTS emails (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             user_id INTEGER NOT NULL,
//             endereco TEXT NOT NULL,
//             is_principal INTEGER NOT NULL DEFAULT 0 CHECK(is_principal IN (0, 1)),
//             FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
//         )
//     `, (err) => {
//         if (err) {
//             console.error("Erro ao criar tabela emails:", err.message);
//         } else {
//             console.log("Tabela emails verificada/criada com sucesso.");
//         }
//     });

//     console.log("Configuração do banco de dados finalizada.");

//     // Fecha a conexão com o banco DEPOIS que todos os comandos terminarem
//     db.close((err) => {
//         if (err) {
//             console.error("Erro ao fechar o banco de dados", err.message);
//         } else {
//             console.log('Conexão com o banco de dados fechada.');
//         }
//     });
// })
