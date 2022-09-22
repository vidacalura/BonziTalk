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
const chatSection = document.getElementById("chat-section");
const chatHamburger = document.getElementById("chat-hamburger");
let userDivArr = [];

verificarLocalStorage();

/* Convite */
const menuWrapper = document.getElementById("menu-convite-wrapper");
const menuConvite = document.getElementById("menu-convite");
const textboxConvite = document.getElementById("convite-textbox");
const menuConviteBtn = document.getElementById("menu-convite-btn");
textboxConvite.value = window.location.pathname.slice(2);

menuWrapper.addEventListener("click", (e) => {
    if (e.target.id == "menu-convite-wrapper"){
        menuConvite.classList.add("hidden");
        menuWrapper.classList.add("hidden");
    }
});

menuConviteBtn.addEventListener("click", () => {
    textboxConvite.select();
    textboxConvite.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textboxConvite.value);
});

chatHamburger.addEventListener("click", () => {
    if (chatSection.className.includes("hidden"))
        chatSection.classList.remove("hidden");
    else if (!chatSection.className.includes("hidden"))
        chatSection.classList.add("hidden");
});

const meuVideo = document.createElement("video");
meuVideo.muted = true;

var peer = new Peer();
const peers = {  };

const videoOn = (localStorage.getItem("videoOn") == "on");
const audioOn = (localStorage.getItem("audioOn") == "on");

socket.emit("updateParticipantes", { 
    username: localStorage.getItem("username"), 
    imgPath: localStorage.getItem("pfp"), 
    salaId,
    videoOn
});

renderCallRequest();

if (videoOn || audioOn) {
    navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: audioOn
    })
    .then((stream) => {
        // if (videoOn)
            adicionarVideoStream(meuVideo, stream);
        /* else {
            socket.emit("usuarioConectadoSemCam", { salaId, pfp: localStorage.getItem("pfp") });
            conectarNovoUsuarioSemCam(localStorage.getItem("pfp"));
        } */

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
else {
    socket.emit("usuarioConectadoSemCam", { salaId, pfp: localStorage.getItem("pfp") });
    conectarNovoUsuarioSemCam(localStorage.getItem("pfp"));
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

function renderCallRequest(){

    const idSala = salaId

    socket.emit("getParticipantes", idSala);

}

function renderCall(participantes, id){

    if (socket.id == id){
        for (const participante of participantes){
            if (participante[1] != undefined){
                if (participante[2] != socket.id){
                    if (!participante[3])
                        conectarNovoUsuarioSemCam(participante[1]);
                }
            }
        }
    }

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
    
    if (video.parentElement != null)
        video.parentElement.remove();

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

    userDivArr.push(videoDiv);

}

function atualizarMenuParticipantes(data){

    while (participantesContainer.hasChildNodes()){
        participantesContainer.removeChild(participantesContainer.firstChild);
    }
        

    for (let i = data.length - 1; i > 0; i--){
        const divParticipante = document.createElement("div");
        const pfpParticipante = document.createElement("img");
        const pfpDiv = document.createElement("div");
        const nomeParticipante = document.createElement("p");

        pfpDiv.style.width = "30%";
        pfpParticipante.src = data[i][1];
        pfpParticipante.className = "w-12 h-12 rounded-full";
        nomeParticipante.textContent = data[i][0];
        nomeParticipante.className = "text-lg font-bold";

        divParticipante.className = "flex gap-2 items-center px-8 pt-8";
        pfpDiv.appendChild(pfpParticipante)
        divParticipante.appendChild(pfpDiv);
        divParticipante.appendChild(nomeParticipante);

        participantesContainer.appendChild(divParticipante);
    }

}

/* Chat de texto */
function enviarMensagem(){

    if (chatTextbox.value != "" /* && não é texto em branco */){
        socket.emit("enviarMensagem", { salaId, texto: chatTextbox.value, pfp: localStorage.getItem("pfp") });
        registrarMensagem(chatTextbox.value, localStorage.getItem("pfp"));
        chatTextbox.value = "";
    }

}

function registrarMensagem(texto, pfp){

    const mensagemDiv = document.createElement("div");
    mensagemDiv.classList.add("flex");

    const pfpDiv = document.createElement("div");
    const pfpImagem = document.createElement("img");
    pfpImagem.className = "w-12 h-12 rounded-full object-cover shadow-md";
    pfpImagem.src = pfp;
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

    mensagensContainer.scrollTop = mensagensContainer.scrollHeight;

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
    const { texto, pfp } = data;

    registrarMensagem(texto, pfp);
});

socket.on("receiveParticipantes", (data) => {
    const { participantes, id } = data;

    renderCall(participantes, id);
});

socket.on("removerDivUsuario", (data) => {

    if (data.salaId == salaId){
        for (let i = 0; i < userDivArr.length - 1; i++){
            const imgDiv = userDivArr[i].firstChild.firstChild.src;
            const imgDivSrc = imgDiv.substring(imgDiv.indexOf("img"));

            if (imgDivSrc == data.pfp){
                userDivArr[i].remove();
                userDivArr.splice(i, 1);
                i = 100;
            }
        }
    }

});

socket.on("updateAbaParticipantes", (data) => {
    const { participantes } = data;

    if (salaId == data.salaId){
        atualizarMenuParticipantes(participantes);

        const participantesQuant = participantes.length - 1;
        if (participantesQuant <= 2)
            videoGrid.className = "md:flex md:gap-4";
        if (participantesQuant > 2 && participantesQuant <= 4)
            videoGrid.className = "md:grid md:grid-flow-col md:grid-rows-2 md:gap-4";
        if (participantesQuant > 4)
            videoGrid.className = "md:grid md:grid-flow-col md:grid-rows-3 md:gap-4";
    }

});
