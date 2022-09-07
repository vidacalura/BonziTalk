let socket = io();

const videoGrid = document.getElementById("video-grid-1");
const btnSairChamada = document.getElementById("btn-sair-chamada");
btnSairChamada.addEventListener("click", sairChamada);
const chatDiv = document.getElementById("chat-div");
const mensagensContainer = document.getElementById("mensagens-container");
//const btnMinimizarChat = document.getElementById("btn-min-chat");
//btnMinimizarChat.addEventListener("click", minimizarChat);
const btnMenuParticipantes = document.getElementById("btn-participantes-menu");
btnMenuParticipantes.addEventListener("click", mostrarMenuParticipantes);
const btnChat = document.getElementById("btn-chat");
btnChat.addEventListener("click", mostrarChat);
const chatTextbox = document.getElementById("chat-textbox"); 
const btnChatEnviarMsg = document.getElementById("btn-chat-env");
btnChatEnviarMsg.addEventListener("click", enviarMensagem);
const menuParticipantesDiv = document.getElementById("menu-participantes");
const participantesContainer = document.querySelector(".div-participantes-container");

verificarLocalStorage();

const meuVideo = document.createElement("video");
meuVideo.muted = true;

var peer = new Peer();

const videoOn = (localStorage.getItem("videoOn") == "on");
const audioOn = (localStorage.getItem("audioOn") == "on");

socket.emit("updateParticipantes", { 
    username: localStorage.getItem("username"), 
    imgPath: localStorage.getItem("pfp"), 
    salaId
});

if (videoOn == false){
    socket.emit("usuarioConectadoSemCam", { salaId, pfp: localStorage.getItem("pfp") });
    conectarNovoUsuarioSemCam(localStorage.getItem("pfp"));
}
if (videoOn || audioOn) {
    navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: audioOn
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
}

function verificarLocalStorage(){

    if (localStorage.length != 4){
        alert("Para evitar problemas no sistema, pedimos que você não entre diretamente pelo link, mas sim, através da inserção do código da sala na página principal.");

        window.location = "/";
    }

}

function sairChamada(){

    window.location = "/";

}

function renderCall(){

    // Atualizar cams

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

    socket.emit("conectarSala", { salaId, userId: id });

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

function conectarNovoUsuarioSemCam(pfp){

    const videoDiv = document.createElement("div");
    videoDiv.classList.add("cam-div");
    videoDiv.classList.add("h-96");

    const div = document.createElement("div");
    div.className = "w-full h-full flex justify-center";
    div.style.alignItems = "center";
    
    const pfpImg = document.createElement("img");
    pfpImg.style.width = "auto";
    pfpImg.style.height = "30%";
    pfpImg.classList.add("rounded-full");
    pfpImg.classList.add("shadow-md");
    pfpImg.style.backgroundColor = "#333";
    pfpImg.src = pfp;

    div.appendChild(pfpImg);
    videoDiv.appendChild(div);
    videoGrid.appendChild(videoDiv);

}

function atualizarMenuParticipantes(data){

    while (participantesContainer.hasChildNodes()){
        participantesContainer.removeChild(participantesContainer.firstChild);
    }
        

    for (let i = data.length - 1; i > 0; i--){
        const divParticipante = document.createElement("div");
        const pfpParticipante = document.createElement("img");
        const nomeParticipante = document.createElement("p");

        pfpParticipante.src = data[i][1];
        pfpParticipante.className = "w-16 h-16 rounded-full";
        nomeParticipante.textContent = data[i][0];
        nomeParticipante.className = "text-lg pt-1 font-bold";

        divParticipante.className = "flex gap-4 items-center px-2";
        divParticipante.appendChild(pfpParticipante);
        divParticipante.appendChild(nomeParticipante);

        participantesContainer.appendChild(divParticipante);
    }

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
    pfpImagem.src = localStorage.getItem("pfp");
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
peer.on("open", (id) => {
    entrarSala(id);
});


/* Server listeners */
socket.on("usuarioConectadoSemCam", (data) => {
    conectarNovoUsuarioSemCam(data);
});

socket.on("usuarioDesconectado", (data) => {
    if (peers[data])
        peers[data].close();
});

socket.on("registrarMensagem", (data) => {
    registrarMensagem(data);
});

socket.on("updateAbaParticipantes", (data) => {
    const { participantes } = data;

    if (salaId == data.salaId)
        atualizarMenuParticipantes(participantes);
});
