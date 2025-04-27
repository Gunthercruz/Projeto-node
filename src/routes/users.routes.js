const { Router } = require('express');
const usersRouter = Router();
const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const isAuth = require('../middlewares/isAuth');

//ROTA DE LOGIN
usersRouter.get('/login', authController.showLoginPage);
usersRouter.post('/auth',  authController.login);
usersRouter.get('/logoff',  authController.logoff);

// Formulário de adicionar novo usuário
usersRouter.get('/addUser', usersController.showAddUserForm);
usersRouter.post('/addUser', usersController.addUser);

// Todas rotas abaixo precisam estar autenticadas
//usersRouter.use(isAuth);

// Listar usuários com paginação e filtro
usersRouter.get('/users', isAuth, usersController.listUsers);
//usersRouter.get('/users', isAuth, usersController.getAll);


// Visualizar detalhes do usuário
usersRouter.get('/user/:id', isAuth, usersController.viewUser);

// Atualizar dados do usuário
usersRouter.get('/updateUser/:id', isAuth, usersController.showUpdateUserForm);
usersRouter.post('/updateUser/:id',isAuth, usersController.updateUser);

// Excluir usuário
usersRouter.post('/deleteUser/:id', isAuth, usersController.deleteUser);

module.exports = usersRouter;
