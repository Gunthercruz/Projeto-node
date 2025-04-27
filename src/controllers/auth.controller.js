const { compareSync } = require("bcrypt");

// Linha 2 em auth.controller.js - CORRIGIDO
const usersDAO = require('../model/users.dao.js');
const authController = {
    showLoginPage(req, res) {
        res.render('login'); // Formulário de login
    },

    async login(req, res) {
        const { cpf, password } = req.body;

        try {
            const user = await usersDAO.findByCpf(cpf);

            // Verifique se o usuário NÃO foi encontrado
            if (!user) {
                console.log("Tentativa de login com CPF não encontrado:", cpf);
                return res.render('login', { error: 'CPF ou senha inválidos.' });
            }

            // --- ADICIONE ESTA VERIFICAÇÃO AQUI ---
            // Verifique se a propriedade password existe e é uma string no objeto user
            if (!user.password || typeof user.password !== 'string') {
                 console.error("Erro: Usuário encontrado, mas a senha no DB não é válida para o CPF:", cpf);
                 // Trate isso como uma falha de login (credenciais inválidas ou problema interno)
                 return res.render('login', { error: 'Ocorreu um problema com os dados do usuário.' });
                 // Ou se quiser ser mais genérico: return res.render('views/login', { error: 'CPF ou senha inválidos.' });
            }
            // --- FIM DA VERIFICAÇÃO ---


            // Agora compare as senhas - user.password tem certeza de ser uma string
            // Esta é a linha que era a 21 e causava o erro antes
            if (compareSync(password, user.password)) {
                // Senha correta!
                console.log("Login bem-sucedido para o CPF:", cpf);

                // Inicie a sessão
                req.session.isAuth = true;
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };

                // Redirecione
                return res.redirect('/users');
            } else {
                // Senha incorreta
                console.log("Tentativa de login com senha inválida para o CPF:", cpf);
                return res.render('login', { error: 'CPF ou senha inválidos.' });
            }

        } catch (error) {
            // Lida com erros durante a busca no DB
            console.error("Erro durante o processo de login:", error);
            res.status(500).render('login', { error: 'Ocorreu um erro no servidor durante o login.' });
        }
    },


    logoff(req, res) {
        req.session.destroy();
        res.redirect('/login');
    }
};

module.exports = authController;
