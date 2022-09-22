const express = require("express");

const app = express();

const port = process.env.PORT || 5000;

//HTTPS ==========================================
var fs = require('fs');
var https_options = {
	key: fs.readFileSync("/home/ubuntu/BonziTalk/certificados/private.key", 'utf8'),
	cert: fs.readFileSync("/home/ubuntu/BonziTalk/certificados/certificate.crt", 'utf8'),
	ca: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/ca_bundle.crt', 'utf8'),
};

/*
	const { PeerServer } = require('peer');

	const peer = PeerServer({
		path: "/peerjs",
		port: 3399,
    		ssl: {
    			key: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/private.key'),
    			cert: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/certificate.crt')
		}
	});


app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
	debug: true,
        port: 3399,
        ssl: {
        	key: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/private.key'),
                cert: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/certificate.crt')
	}
}))
*/

const server = require("https").Server(https_options, app);


/* Express.js */
app.set("view engine", "ejs");
app.use(express.static("./public/"));
//app.use(express.static("/home/ubuntu/BonziTalk/public/"));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", (req, res) => {
    res.status(200).sendFile("index.html", { root: __dirname });
});

//app.get("/peerjs", (req, res) => {
//});

app.get("/.well-known/pki-validation/0643E246AE4E9614D391EBF1752264A2.txt", (req, res) => {
    res.status(200).sendFile("0643E246AE4E9614D391EBF1752264A2.txt", { root: __dirname });
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
        "participantes": [[]]
    };

    salas[i] = sala;
    salasLivres[i] = i;
}
salas[24].salaId = ":22";

/* Socket.io */
const io = require("socket.io")(server);

io.on("connection", (socket) => {

    socket.on("conectarSala", (data) => {
        const userId = data.userId;
        
	if (data.salaId != undefined)
            salaId = (typeof(data.salaId) == "string" ? data.salaId.toUpperCase() : data.salaId);
        else
            salaId = ":" + (typeof(data.cod) == "string" ? data.cod.toUpperCase() : data.cod);

        let salaExiste = false;

        // verificação de existência da sala
        for (let  i = 0; i < 25; i++){
            if (salaId == salas[i].salaId){
                // Verificar se já há alguém com este nome
                    socket.join(salaId);
                    socket.to(salaId).emit("usuarioConectado", userId);
                    salas[i].conexoesSala++;
                    salaExiste = true;
            }
        }

        if (!salaExiste)
            io.sockets.emit("salaInexistente", socket.id);

        socket.on("disconnect", () => {
            socket.to(salaId).emit("usuarioDesconectado", userId);

        });
    });

    socket.on("criarSala", (data) => {
        const participantes = data;

        // Criar sala
        const salaNum = salasLivres[0];

        const codeAleRes = codeAle();
        salas[salaNum].salaId = ":" + codeAleRes;

        if (Number(participantes) <= 10 && Number(participantes) >= 2)
            salas[salaNum].participantesMax = Number(participantes);

        salasLivres.shift();

        // Update participantes - Backend
        salas[salaNum].conexoesSala++;

        io.sockets.emit("receberCodigo", codeAleRes);

    });

    socket.on("usuarioConectadoSemCam", (data) => {
        const { salaId, pfp } = data;

        socket.to(salaId).emit("usuarioConectadoSemCam", pfp);
    });

    socket.on("updateParticipantes", (data) => {
        const { username, imgPath, salaId, videoOn } = data;

        const userInfo = [username, imgPath, socket.id, videoOn];

        for (let  i = 0; i < 25; i++){
            if (salaId == salas[i].salaId){
                salas[i].participantes.push(userInfo);
                const participantes = salas[i].participantes;

                io.sockets.emit("updateAbaParticipantes", { participantes, salaId });
            }
        }

    });

    socket.on("enviarMensagem", (data) => {
        const { salaId, texto, pfp } = data;

        socket.to(salaId).emit("registrarMensagem", { texto, pfp });
    });

    socket.on("getParticipantes", (data) => {
        const salaId = data;
        let salaIndex;

        for (let i = 0; i < 25; i++){
            if (salaId == salas[i].salaId){
                salaIndex = i;
            }
        }

        io.sockets.emit("receiveParticipantes", { participantes: salas[salaIndex].participantes, id: socket.id});
    });

    socket.on("disconnect", () => {
        for (let  i = 0; i < 25; i++){
            for (let j = 1; j < 9; j++){
                if (salas[i].participantes[j] != undefined){
                    if (socket.id == salas[i].participantes[j][2]){
                        if (!salas[i].participantes[j][3]){
                            io.sockets.emit("removerDivUsuario", { salaId: salas[i].salaId, pfp: salas[i].participantes[j][1] });
                        }

                        salas[i].participantes.splice(j, 1);

                        salas[i].conexoesSala--;

                        const participantes = salas[i].participantes;
                        io.sockets.emit("updateAbaParticipantes", { participantes, salaId: salas[i].salaId });

                        // Checar se a sala está vazia
                        if (salas[i].conexoesSala == 0){
                            limparSala(i);
                        }
                    }
                }
            }
        }
    })

});

function limparSala(index){

    salas[index].salaId = null;
    salas[index].participantesMax = null;
    salas[index].participantes = [[]]

    salasLivres.push(index);

}

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

srv = server.listen(port);

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
        debug: true,
        port: 3399,
        ssl: {
                key: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/private.key'),
                cert: fs.readFileSync('/home/ubuntu/BonziTalk/certificados/certificate.crt')
        }
}))


// Apenas áudio = 2 cams
