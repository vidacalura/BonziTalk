const express = require("express");

const app = express();
const server = require("http").Server(app);

const port = process.env.PORT || 5000;

/* Express.js */
app.set("view engine", "ejs");
app.use(express.static("./public/"));

app.get("/", (req, res) => {
    res.status(200).sendFile("index.html", { root: __dirname });
});

app.get("/:sala", (req, res) => {
    res.render("chat", { salaId: req.params.sala });
});

app.use((req, res) => {
    res.status(404).sendFile("404.html", { root: __dirname });
});

/* Express session

"participante": {
    "sala": null,
    "id": null,
    "nome": null,
    "pfp": null
}
*/

let salas = [];
let salasLivres = [];
for (let i = 0; i < 25; i++){
    const sala = {
        "salaId": null,
        "conexoesSala": 0,
        "participantesMax": null,
        "participantes": []
    };

    salas[i] = sala;
    salasLivres[i] = i;
}
salas[24].salaId = ":22";

/* Socket.io */
const io = require("socket.io")(server);

io.on("connection", (socket) => {

    socket.on("entrarSala", (data) => {
        const { salaId, userId } = data;

        // verificação de existência da sala
        for (let  i = 0; i < 25; i++){
            if (salaId == salas[i].salaId){
                socket.join(salaId);
                socket.to(salaId).emit("usuarioConectado", userId);
                salas[i].conexoesSala++;
            }
            else{
                // Sala não existe
            }
        }

        socket.on("disconnect", () => {
            socket.to(salaId).emit("usuarioDesconectado", userId);

            for (let  i = 0; i < 25; i++){
                if (salaId == salas[i].salaId){
                    salas[i].conexoesSala--;
                }
            }
        });
    });

    socket.on("criarSala", (data) => {
        const participantes = data;

        // Criar sala
        const salaNum = salasLivres[0];

        salas[salaNum].salaId = codeAle();

        if (Number(participantes) <= 10 && Number(participantes) >= 2)
            salas[salaNum].participantesMax = Number(participantes);

        salasLivres.shift();

        // Update participantes - Backend
        salas[salaNum].conexoesSala++;
        // salas[salaNum].participantes.push(username);

        // Update participantes - Frontend


        io.sockets.emit("receberCodigo", salas[salaNum].salaId);

    });

    socket.on("entrarSala", (data) => {
        const cod = data;

        // Procurar sala
            // Se achar -> conectar

        // Update participantes
    });

    socket.on("enviarMensagem", (data) => {
        const { salaId, texto } = data;

        socket.to(salaId).emit("registrarMensagem", texto);
    });

});

function codeAle(){
    var length = 5;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

server.listen(port);