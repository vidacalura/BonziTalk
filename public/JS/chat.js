let socket = io();

const videoGrid = document.getElementById("video-grid-1");
const btnLigarCamera = document.getElementById("btn-camera");
btnLigarCamera.addEventListener("click", alterarEstadoCamera);
const btnLigarMicrofone = document.getElementById("btn-microfone");
btnLigarMicrofone.addEventListener("click", alterarEstadoMicrofone);
const btnCompartilharTela = document.getElementById("btn-compartilhar-tela");
btnCompartilharTela.addEventListener("click", compartilharTela);
const btnSairChamada = document.getElementById("btn-sair-chamada");
btnSairChamada.addEventListener("click", sairChamada);
const chatDiv = document.getElementById("chat-div");
const btnMinimizarChat = document.getElementById("btn-min-chat");
btnMinimizarChat.addEventListener("click", minimizarChat);
const btnMenuParticipantes = document.getElementById("btn-participantes-menu");
btnMenuParticipantes.addEventListener("click", mostrarMenuParticipantes);
const btnChat = document.getElementById("btn-chat");
btnChat.addEventListener("click", mostrarChat);
const chatTextbox = document.getElementById("chat-textbox"); 
const btnChatEnviarMsg = document.getElementById("btn-chat-env");
btnChatEnviarMsg.addEventListener("click", enviarMensagem);
const menuParticipantesDiv = document.getElementById("menu-participantes");

const meuVideo = document.createElement("video");
meuVideo.muted = true;

const peers = { };

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
.then((stream) => {
    adicionarVideoStream(meuVideo, stream);

    peer.on("call", (call) => {
        call.answer(stream);

        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            adicionarVideoStream(video, userVideoStream);
        }); 
    });

    socket.on("usuarioConectado", (userId) => {
        conectarNovoUsuario(userId, stream);
    });
});


function alterarEstadoCamera(){



}

function alterarEstadoMicrofone(){



}

function compartilharTela(){



}

function sairChamada(){



}

function minimizarChat(){



}

function mostrarMenuParticipantes(){

    if (menuParticipantesDiv.className.includes("hidden")){
        menuParticipantesDiv.classList.remove("hidden");
        chatDiv.classList.add("hidden");
    }

}

function mostrarChat(){

    if (!menuParticipantesDiv.className.includes("hidden")){
        menuParticipantesDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
    }

}

function enviarMensagem(){



}

function adicionarVideoStream(video, stream){

    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });

    const videoDiv = document.createElement("div");
    videoDiv.classList.add("cam-div");
    videoDiv.appendChild(video);

    video.classList.add("object-cover");

    videoGrid.appendChild(videoDiv);

}

function entrarSala(id){

    socket.emit("entrarSala", { salaId, userId: id });

}

function conectarNovoUsuario(id, stream){

    const call = peer.call(id, stream);
    
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        adicionarVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.parentElement.remove();
    });

    peers[id] = call;

}

/* PeerJS */
const peer = new Peer(undefined, { host: "/", port: 3001 });

peer.on("open", (id) => {
    entrarSala(id);
});

/* Server listeners */
socket.on("usuarioDesconectado", (data) => {
    if (peers[data])
        peers[data].close();
});