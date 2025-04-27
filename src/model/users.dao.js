const dbPromise = require("../database/dbConnection");

const usersDAO = {
    async findAll(page = 1, limit = 10, filter = '') {
        try {
           const db = await dbPromise; // Espere a conexão ficar pronta
           let query = "SELECT * FROM users WHERE 1=1";
           const params = [];

           if (filter) {
               query += " AND (nome LIKE ? OR email LIKE ?)"; // Coluna nome
               params.push(`%${filter}%`, `%${filter}%`);
           }

           query += " LIMIT ? OFFSET ?";
           params.push(limit, (page - 1) * limit);

           // As operações prepare/all/run do sqlite3 são síncronas APÓS ter o objeto db
           return db.prepare(query).all(...params);
        } catch (error) {
           console.error("Error during findAll:", error);
           throw error; // Relance o erro para ser tratado no controller
        }
   },
     
   // users.dao.js - função findByCpf
// users.dao.js - função findByCpf (Usando .all() em vez de .get())
async findByCpf(cpf) {
    try {
        const db = await dbPromise; // Espere a Promise do DB
        const userQuery = "SELECT * FROM users u WHERE u.cpf = ? LIMIT 1;"; // Mantém LIMIT 1

        console.log('>>> DEBUG: **** VERIFICANDO EXECUÇÃO DE ALL(CPF) **** <<<'); // Log para .all()

        const statement = db.prepare(userQuery); // Prepare a declaração
        console.log('>>> DEBUG: Resultado de db.prepare(userQuery):', statement); // Logue o objeto Statement

        // --- Mude de .get() para .all() ---
        // .all() retorna um array de resultados
        const results = statement.all(cpf); // Execute .all() e capture o resultado (será um array)
        console.log('>>> DEBUG: Resultado de statement.all(cpf):', results); // Logue o array de resultados
        console.log('>>> DEBUG: Tipo do resultado de statement.all(cpf):', typeof results); // Logue o TIPO do resultado de .all()
        console.log('>>> DEBUG: É Array?', Array.isArray(results)); // Verifique se é um array
        // --- FIM DOS NOVOS LOGS COM .all() ---


        // Adapte para pegar o primeiro elemento do array, se ele existir
        // Se results for um array vazio [], user será undefined
        // Se results for um array com 1 elemento [userObject], user será userObject
        const user = results.length > 0 ? results[0] : undefined;

        console.log('>>> DEBUG: Usuário encontrado no findByCpf (objeto final após .all):', user); // Logue o valor final atribuído a 'user'
        console.log('>>> DEBUG: user.password no findByCpf (valor final):', user ? user.password : 'User not found ou sem password property');
        console.log('>>> DEBUG: user.password no findByCpf (tipo final):', user ? typeof user.password : 'N/A');


        return user; // Retorna o objeto user (ou undefined)

    } catch (error) {
        console.error("Error during findByCpf:", error);
        throw error;
    }
},
// try {
    
//     const db = await dbPromise;
//     const userQuery = "SELECT * FROM users u WHERE u.cpf = ? LIMIT 1;";
//     const user = db.prepare(userQuery).get(cpf); // Obtenha o objeto user

//     console.log('>>> DEBUG: Usuário encontrado no findByCpf (objeto completo):', user); // <-- PRECISAMOS VER ESTE LOG
//     console.log('>>> DEBUG: user.password no findByCpf (valor):', user ? user.password : 'Usuário não encontrado ou sem password property'); // <-- PRECISAMOS VER ESTE LOG
//     console.log('>>> DEBUG: user.password no findByCpf (tipo):', user ? typeof user.password : 'N/A'); // <-- PRECISAMOS VER ESTE LOG

//     return user;
// } catch (error) {
//      console.error("Error during findByCpf:", error);
//      throw error;
// }

async insert(user) {
    try {
        const db = await dbPromise; // Espere a conexão ficar pronta
        // Corrija para usar user.name (da propriedade do objeto User)
        // E note que a query usa a coluna 'nome' do banco de dados
        const query = "INSERT INTO users (nome, cpf, email, password, role) VALUES (?, ?, ?, ?, ?);"; // <-- Adicionado cpf e um ?
        return db.prepare(query).run(user.name, user.cpf, user.email, user.password, user.role); // <-- Adicionado user.cpf
    } catch (error) {
         console.error("Error during user insert:", error);
         throw error;
    }
},

async update(id, user) {
    try {
        const db = await dbPromise; // Espere a conexão ficar pronta
         // Corrija para usar user.name
        const query = "UPDATE users SET nome = ?, email = ?, password = ? WHERE id = ?;"; // Coluna nome
        return db.prepare(query).run(user.name, user.email, user.password, id); // Usando user.name, atualiza a coluna 'nome'
    } catch (error) {
         console.error("Error during update:", error);
         throw error;
    }
},

async delete(id) {
    try {
        const db = await dbPromise; // Espere a conexão ficar pronta
        const query = "DELETE FROM users WHERE id = ?;"; // Coluna id
        return db.prepare(query).run(id);
    } catch (error) {
         console.error("Error during delete:", error);
         throw error;
    }
}
}

module.exports = usersDAO;