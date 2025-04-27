/seu-projeto
│
├── public/
│   ├── login.html
│   └── styles.css
│
├── src/
│   ├── config/
│   │   └── dbConnection.js       <- sua conexão com SQLite
│   │
│   ├── controllers/
│   │   ├── auth.controller.js    <- login, logout
│   │   └── users.controller.js   <- cadastro, edição, deleção
│   │
│   ├── models/
│   │   └── users.dao.js           <- consultas SQL (SELECT, INSERT, etc.)
│   │
│   ├── routes/
│   │   ├── auth.routes.js         <- rotas de login/logout
│   │   └── users.routes.js        <- rotas de usuário (CRUD)
│   │
│   ├── middlewares/
│   │   ├── isAuth.js              <- verifica se usuário está logado
│   │   └── isAdmin.js             <- verifica se é admin
│   │
│   └── views/
│       ├── includes/              <- pedaços reaproveitáveis (ex: navbar)
│       ├── login.ejs              <- página de login
│       └── outras páginas (index, addUser, etc.)
│
├── server.js
├── .env
├── package.json
└── dados.db                      <- banco de dados principal
