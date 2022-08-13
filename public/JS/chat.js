// let socket = io();

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