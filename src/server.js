const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = 3000;

app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: 'seusegredoaqui', // troque por uma string forte em produção
    resave: false,
    saveUninitialized: false,
    //cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
// PERMITE ACESSO ESTATICO (DIRETO) AOS ARQUIVOS QUE ESTAO NA PASTA PUBLIC
app.use(express.static(path.join(__dirname, '..', 'public')));    // ../public

const usersRouter = require('./routes/users.routes');
app.use('/', usersRouter);


// RENDERIZAÇÃO POR TEMPLATE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});