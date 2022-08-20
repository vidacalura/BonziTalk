const express = require("express");
const socket = require("socket.io");

const app = express();
const server = require("http").Server(app);

const port = process.env.PORT || 5000;

/* Express.js */
app.set("view engine", "ejs");
app.use(express.static("./public/"));

app.get("/", (req, res) => {
    // res.sendFile("index.html", { root: __dirname });
});

app.get("/:sala", (req, res) => {
    res.render("chat", { salaId: req.params.sala });
});


const salas = {};
let conexoes = 0;

/* Socket.io */
const io = require("socket.io")(server);

io.on("connection", (socket) => {

    socket.on("entrarSala", (data) => {
        const { salaId, userId } = data;

        // verificação de existência da sala
            socket.join(salaId);
            socket.to(salaId).emit("usuarioConectado", userId);

        socket.on("disconnect", () => {
            socket.to(salaId).emit("usuarioDesconectado", userId);
        });
    });

    socket.on("enviarMensagem", (data) => {
        const { salaId, texto } = data;

        socket.to(salaId).emit("registrarMensagem", texto);
    });

});

server.listen(port);


/* todo

- Firebase
- Permitir criação de salas na home
- Criar dados de salas (objetos)
- Bug tela preta
- Fazer que cam é compartilhada apenas quando botão é apertado
- Captcha para criar sala
- limite de 250 conexões

*/