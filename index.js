const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bcrypt = require('bcrypt');
const conn = require('./db/conn');
const Cliente = require('./models/Cliente');
const Relogio = require('./models/Relogio');
const PORT = 3000;
const hostname = 'localhost';

let log = false;
let usuario = '';
let tipoUsuario = '';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.post('/comprar', async (req, res) => {
    const dados_carrinho = req.body;

    const atualiza_promise = [];

    for (const item of dados_carrinho) {
        const relogio = await Relogio.findByPk(item.cod_prod, { raw: true });

        if (!relogio || relogio.quantidadeEstoque < item.qtde) {
            return res.status(400).json({ message: "Produto insuficiente ou não disponível" });
        }

        const novaQuantidadeEstoque = relogio.quantidadeEstoque - item.qtde;

        const atualiza_promessa = await relogio.update(
            { quantidadeEstoque: novaQuantidadeEstoque },
            { where: { id: item.cod_prod } }
        );

        atualiza_promise.push(atualiza_promessa);
    }

    try {
        await Promise.all(atualiza_promise);
        res.status(200).json({ message: "Compra realizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar os dados" + error);
        res.status(500).json({ message: "Erro ao processar a compra" });
    }
});

app.get('/carrinho', (req, res) => {
    res.render('carrinho', { log, usuario, tipoUsuario });
});

app.get('/feminino', (req, res) => {
    res.render('feminino', { log, usuario, tipoUsuario });
});

app.get('/masculino', (req, res) => {
    res.render('masculino', { log, usuario, tipoUsuario });
});

app.get('/listarRelogio', async (req, res) => {
    const dados = await Relogio.findAll({ raw: true });
    res.render('listarRelogio', { log, usuario, tipoUsuario, valores: dados });
});

app.post('/cadastrarRelogio', async (req, res) => {
    const { nome, tamanho, tipo, quantidadeEstoque, precoUnitario, descricao } = req.body;

    try {
        await Relogio.create({
            nome,
            tamanho,
            tipo,
            quantidadeEstoque,
            precoUnitario,
            descricao
        });

        let msg = 'Dados Cadastrados';
        res.render('cadastrarRelogio', { log, usuario, tipoUsuario, msg });
    } catch (error) {
        console.error("Erro ao cadastrar o relógio" + error);
        res.render('cadastrarRelogio', { log, usuario, tipoUsuario, error });
    }
});

app.get('/cadastrarRelogio', (req, res) => {
    res.render('cadastrarRelogio', { log, usuario, tipoUsuario });
});

app.post("/cadastrarCliente", async (req, res) => {
    const { usuario, email, telefone, cpf, senha, tipo } = req.body;
    const msg = "Preencha todos os dados!!";

    if (!usuario || !email || !cpf || !telefone || !senha || !tipo) {
        res.render("cadastrarCliente", { log, msg, usuario, tipoUsuario });
    } else {
        bcrypt.hash(senha, 10, async (err, hash) => {
            if (err) {
                console.error("Erro ao criar o hash da senha" + err);
                res.render("home", { log });
                return;
            }

            try {
                const novoCliente = await Cliente.create({
                    usuario,
                    email,
                    telefone,
                    cpf,
                    senha: hash,
                    tipo
                });

                log = true;
                usuario = novoCliente.usuario;
                tipoUsuario = novoCliente.tipo;
                res.render('home', { log, usuario, tipoUsuario });
            } catch (error) {
                console.error("Erro ao criar a senha" + error);
                res.render('home', { log, usuario, tipoUsuario });
            }
        });
    }
});

app.get('/cadastrarCliente', (req, res) => {
    res.render('cadastrarCliente', { log, usuario, tipoUsuario });
});

app.post('/editarRelogio', async (req, res) => {
    const { nome, tamanho, tipo, quantidadeEstoque, precoUnitario, descricao } = req.body;

    try {
        const [numRowsUpdated, updatedRows] = await Relogio.update(
            {
                tamanho,
                tipo,
                quantidadeEstoque,
                precoUnitario,
                descricao
            },
            {
                where: { nome },
                returning: true
            }
        );

        if (numRowsUpdated > 0) {
            const updatedRelogio = updatedRows[0].get();
            console.log("Relogio atualizada com sucesso:", updatedRelogio);
            res.redirect('/editarRelogio');
        } else {
            console.log("Relogio não encontrado para atualizar.");
            res.status(404).send("Relogio não encontrado para atualizar.");
        }
    } catch (error) {
        console.error("Erro ao atualizar os dados", error);
        res.status(500).send("Erro ao processar a atualização do Relogio.");
    }
});

app.post('/consultaRelogio', async (req, res) => {
    const nome_Relogio = req.body.nome;
    console.log(nome_Relogio);

    try {
        const dados = await Relogio.findOne({ raw: true, where: { nome: nome_Relogio } });
        console.log(dados);
        res.render('editarRelogio', { log, usuario, tipoUsuario, valor: dados });
    } catch (error) {
        console.error("Erro ao consultar o relógio", error);
        res.render('editarRelogio', { log, usuario, tipoUsuario, error });
    }
});

app.get('/editarRelogio', (req, res) => {
    res.render('editarRelogio', { log, usuario, tipoUsuario });
});

app.post('/excluirRelogio', async (req, res) => {
    const nome = req.body.nome;

    try {
        const pesq = await Relogio.findOne({ where: { nome } });

        if (pesq == null) {
            res.render('excluirRelogio', { log, usuario, tipoUsuario, msg2: 'Relogio não encontrado' });
        } else {
            await Relogio.destroy({ where: { nome } });
            res.render('excluirRelogio', { log, usuario, tipoUsuario, msg: 'Relogio excluído' });
        }
    } catch (error) {
        console.error("Erro ao excluir o relógio", error);
        res.render('excluirRelogio', { log, usuario, tipoUsuario, error });
    }
});

app.get('/excluirRelogio', (req, res) => {
    res.render('excluirRelogio', { log, usuario, tipoUsuario });
});

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    try {
        const pesq = await Cliente.findOne({ raw: true, where: { email, senha } });

        if (pesq == null) {
            res.render('home', { msg: 'Usuário não Cadastrado' });
        } else if (email == pesq.email && senha == pesq.senha && pesq.tipo === 'admin') {
            log = true;
            usuario = pesq.usuario;
            tipoUsuario = pesq.tipo;
            res.render('gerenciador', { log, usuario, tipoUsuario });
        } else if (email == pesq.email && senha == pesq.senha && pesq.tipo === 'cliente') {
            log = true;
            usuario = pesq.usuario;
            tipoUsuario = pesq.tipo;
            res.render('home', { log, usuario, tipoUsuario });
        } else {
            res.render('home', { msg: 'Usuário não Cadastrado' });
        }
    } catch (error) {
        console.error("Erro ao realizar o login", error);
        res.render('home', { log, usuario, tipoUsuario, error });
    }
});

app.get('/login', (req, res) => {
    log = false;
    usuario = '';
    res.render('login', { log, usuario });
});

app.get('/logout', (req, res) => {
    log = false;
    usuario = '';
    res.render('home', { log, usuario, tipoUsuario });
});

app.get('/', (req, res) => {
    usuario = '';
    res.render('home', { log, usuario, tipoUsuario });
});

conn.sync().then(() => {
    app.listen(PORT, hostname, () => {
        console.log(`Servidor Rodando em ${hostname}:${PORT}`);
    });
}).catch((error) => {
    console.error('Erro de conexão com o banco de dados!' + error);
});
