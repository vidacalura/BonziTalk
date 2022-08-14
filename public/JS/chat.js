let socket = io();

const videoGrid = document.getElementById("video-grid-1");
const btnLigarCamera = document.getElementById("btn-camera");
btnLigarCamera.addEventListener("click", alterarEstadoCamera);
const btnLigarMicrofone = document.getElementById("btn-microfone");
btnLigarMicrofone.addEventListener("click", alterarEstadoMicrofone);
/*const btnCompartilharTela = document.getElementById("btn-compartilhar-tela");
btnCompartilharTela.addEventListener("click", compartilharTela);*/
const btnSairChamada = document.getElementById("btn-sair-chamada");
btnSairChamada.addEventListener("click", sairChamada);
const chatDiv = document.getElementById("chat-div");
const mensagensContainer = document.getElementById("mensagens-container");
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

/* Chat de texto */
function enviarMensagem(){

    if (chatTextbox.value != "" /* && não é texto em branco */){
        socket.emit("enviarMensagem", { salaId, texto: chatTextbox.value });
        registrarMensagem(chatTextbox.value);
        chatTextbox.value = "";
    }

}

function registrarMensagem(texto){

    const mensagemDiv = document.createElement("div");
    mensagemDiv.classList.add("flex");

    const pfpDiv = document.createElement("div");
    const pfpImagem = document.createElement("img");
    pfpImagem.className = "w-12 h-12 rounded-full object-cover shadow-md";
    pfpDiv.appendChild(pfpImagem);

    const textoDiv = document.createElement("div");
    textoDiv.className = "w-full p-2";
    const textoP = document.createElement("p");
    textoP.className = "bg-gray-300 rounded-lg w-full p-3 shadow-sm";
    textoP.textContent = texto;
    textoDiv.appendChild(textoP);

    mensagemDiv.appendChild(pfpDiv);
    mensagemDiv.appendChild(textoDiv);

    mensagensContainer.appendChild(mensagemDiv);

}

chatTextbox.addEventListener("keyup", (e) => {
    e.preventDefault();

    if (e.key == "Enter"){
        enviarMensagem();
    }
});


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

socket.on("registrarMensagem", (data) => {
    registrarMensagem(data);
});