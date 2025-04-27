const { hashSync } = require("bcrypt");
const usersDAO = require("../model/users.dao.js"); // Verifique o caminho correto
const User = require("../model/users.model.js"); // Verifique o caminho correto
const Crypto = require("crypto");

const usersController = {
    showAddUserForm(req, res) {
        // Não precisa ser async pois não chama operações assíncronas (DAO)
        res.render('addUser'); // Nome do arquivo EJS para o formulário
    },

    // Função agora é async porque chama usersDAO.insert (que é async)
    async addUser(req, res) {
        console.log('Conteúdo de req.body:', req.body); // Log input body
    
        // Desestrutura os dados do corpo da requisição
        const { name, cpf, email, password, role } = req.body;
    
        // --- Validação básica server-side (Opcional, mas recomendado) ---
        if (!name || name.trim().length === 0) {
            return res.status(400).send("Nome é obrigatório.");
        }
        if (!cpf || cpf.trim().length === 0) {
            return res.status(400).send("CPF é obrigatório.");
        }
        // Adicione validações para email, password, role conforme necessário
        // --- Fim Validação ---
    
        const id = Crypto.randomUUID(); // Gera um UUID para o id do usuário
        const hashedPassword = hashSync(password, 10); // Hashea a senha
    
        // Logs para o hash gerado (correto aqui)
        console.log('>>> DEBUG: Hashed Password gerado (valor):', hashedPassword);
        console.log('>>> DEBUG: Hashed Password gerado (tipo):', typeof hashedPassword);
    
    
        try {
            // Cria uma instância do modelo User. A validação no construtor será executada.
            // Certifique-se que o construtor User aceita id, name, cpf, email, password, role
            const user = new User(id, name, cpf, email, hashedPassword, role); // Objeto User criado aqui
    
            // Logs para user.password (correto aqui, depois de criar o objeto user)
            console.log('>>> DEBUG: user.password antes de inserir (valor):', user.password);
            console.log('>>> DEBUG: user.password antes de inserir (tipo):', typeof user.password);
    
    
            // Use await para esperar a Promise retornada por usersDAO.insert
            await usersDAO.insert(user);
    
            console.log('Usuário inserido no DB:', cpf); // Log de sucesso
    
            // Redirecione após a inserção bem-sucedida
            res.redirect('/login'); // Redireciona para a página de login
        } catch (error) {
            // Captura erros que podem vir do usersDAO.insert ou da criação do User
            console.error("Erro ao adicionar usuário no controller:", error);
    
            // Trate o erro de forma amigável para o usuário
            res.status(500).send("Erro ao adicionar usuário. Detalhes no console do servidor.");
        }
    },

    // Função agora é async porque chama usersDAO.findAll (que é async)
    async listUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filter = req.query.filter || '';

            // Use await para esperar a Promise retornada por usersDAO.findAll
            const users = await usersDAO.findAll(page, limit, filter);

            // Renderiza a view de listagem, passando os usuários encontrados
            res.render('views/users', { users }); // Arquivo EJS para listar
        } catch (error) {
            console.error("Erro ao listar usuários no controller:", error);
            // Trate o erro
            res.status(500).send("Erro ao listar usuários.");
        }
    },

    // Função agora é async porque chama usersDAO.findById (que é async)
    async viewUser(req, res) {
        try {
            const { id } = req.params;

            // Use await para esperar a Promise retornada por usersDAO.findById
            const user = await usersDAO.findById(id);

            if (!user) {
                return res.status(404).send('Usuário não encontrado');
            }

            // Renderiza a view para visualizar um único usuário
            // Dependendo da sua estrutura, pode ser uma view dedicada ou a mesma de listagem
            res.render('views/userDetails', { user }); // Exemplo: views/userDetails.ejs
        } catch (error) {
            console.error("Erro ao visualizar usuário no controller:", error);
            // Trate o erro
            res.status(500).send("Erro ao visualizar usuário.");
        }
    },

    // Função agora é async porque chama usersDAO.findById (que é async)
    async showUpdateUserForm(req, res) {
        try {
            const { id } = req.params;

             // Use await para esperar a Promise retornada por usersDAO.findById
            const user = await usersDAO.findById(id);

            if (!user) {
                return res.status(404).send('Usuário não encontrado');
            }

            // Renderiza o formulário de atualização, passando os dados do usuário
            res.render('views/updateUser', { user }); // Exemplo: views/updateUser.ejs
        } catch (error) {
            console.error("Erro ao exibir formulário de atualização no controller:", error);
             res.status(500).send("Erro ao carregar dados para atualização.");
        }
    },

    // Função agora é async porque chama usersDAO.update (que é async)
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            // Certifique-se que o formulário envia nome, email e password no req.body
            const { name, email, password } = req.body;

            // Validação básica server-side
             if (!name || name.trim().length === 0 || !email || email.trim().length === 0 || !password || password.trim().length === 0) {
                return res.status(400).send("Nome, email e senha são obrigatórios para atualizar.");
             }

            const hashedPassword = hashSync(password, 10);

            // Use await para esperar a Promise retornada por usersDAO.update
            // Passe um objeto com os dados a serem atualizados
            await usersDAO.update(id, { name, email, password: hashedPassword }); // Assumindo que o DAO update espera { name, email, password }

            // Redireciona para a página de listagem de usuários ou detalhes do usuário
            res.redirect('/users');
        } catch (error) {
            console.error("Erro ao atualizar usuário no controller:", error);
            res.status(500).send("Erro ao atualizar usuário.");
        }
    },

    // Função agora é async porque chama usersDAO.findById e usersDAO.delete (que são async)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            // Assumindo que req.session.user contém o usuário logado
            const sessionUser = req.session.user;

            // Use await para esperar a busca pelo usuário a ser excluído
            const userToDelete = await usersDAO.findById(id);

            if (!userToDelete) {
                return res.status(404).send('Usuário não encontrado');
            }

            // --- Lógica de Autorização (Mantida do seu código original) ---
            // Se CLIENTE
            if (sessionUser.role === 'CLIENTE') {
                if (sessionUser.id != id) {
                    return res.status(403).send('Você só pode excluir sua própria conta.');
                }
            }

            // Se ADMIN
            if (sessionUser.role === 'ADMIN') {
                if (userToDelete.role === 'ADMIN' && sessionUser.id != id) {
                    return res.status(403).send('Você não pode excluir outro administrador.');
                }
            }
            // --- Fim Lógica de Autorização ---

            // Use await para esperar a exclusão terminar
            await usersDAO.delete(id);

            // Se deletou a si mesmo, encerra a sessão e redireciona para login
            if (sessionUser.id == id) {
                req.session.destroy();
                return res.redirect('/login');
            }

            // Se deletou outro usuário (como admin), redireciona para a lista
            res.redirect('/users');
        } catch (error) {
            console.error("Erro ao excluir usuário no controller:", error);
            res.status(500).send("Erro ao excluir usuário.");
        }
    }
};

module.exports = usersController;