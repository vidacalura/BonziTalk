let socket = io();

const criarSalaBtn = document.getElementById("criar-sala-btn");
const entrarSalaBtn = document.getElementById("entrar-sala-btn");
const menuCriarSalaBtn = document.getElementById("menu-criar-sala-btn");
const menuEntrarSalaBtn = document.getElementById("menu-entrar-sala-btn");
const menuPreChamada = document.getElementById("menu-opcoes-chamada");
const menuPrincipal = document.getElementById("menu-principal");
const menuCriarSala = document.getElementById("menu-criar-sala");
const menuEntrarSala = document.getElementById("menu-entrar-sala");
const videoCheckBox = document.getElementById("switch-video");
const audioCheckBox = document.getElementById("switch-audio");
const menuBg = document.getElementById("menu-bg");

localStorage.clear();

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
//var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    menuPrincipal.style.display = "block";
    menuCriarSala.style.display = "none";
    menuEntrarSala.style.display = "none";
    modal.style.display = "block";
    menuBg.style.display = "flex";
}

// When the user clicks on <span> (x), close the modal
/*span.onclick = function() {
    modal.style.display = "none";
}*/

window.onclick = function(event) {
    if (event.target.id == "menu-bg") {
        modal.style.display = "none";
        menuBg.style.display = "none";
        menuPreChamada.style.display = "none";
    }
}

menuCriarSalaBtn.addEventListener("click", () => {

    menuPrincipal.style.display = "none";
    menuCriarSala.style.display = "block";

});

menuEntrarSalaBtn.addEventListener("click", () => {

    menuPrincipal.style.display = "none";
    menuEntrarSala.style.display = "block";

});

criarSalaBtn.addEventListener("click", () => {

    const username = document.getElementById("username-criar-sala").value;
    const participantes = document.getElementById("participantes-criar-sala").value; // String

    if (participantes >= 2 && participantes <= 10 && username != null && username != ""){
        if (username.length <= 12){
            menuCriarSala.style.display = "none";

            socket.emit("criarSala", participantes);

            socket.on("receberCodigo", (data) => {
                mostrarMenuOpcoesChamada(username, data);
            });
        }
        else {
            alert("Username muito grande. Reescreva-o com até 12 caracteres");
        }
    }
    else{
        alert("Username ou número de participantes inválido.");
    }

});

entrarSalaBtn.addEventListener("click", () => {

    const userName = document.getElementById("username-entrar-sala").value;
    const cod = document.getElementById("codigo-entrar-sala").value.toUpperCase();

    // Validação
    if (userName != null && userName != "" && cod != null){
        if (userName.length <= 12){
            menuEntrarSala.style.display = "none";

            socket.emit("conectarSala", { cod, userId: userName });

            mostrarMenuOpcoesChamada(userName, cod);
        }
        else {
            alert("Username muito grande. Reescreva-o com até 12 caracteres");
        }
    }
});

function mostrarMenuOpcoesChamada(username, cod){

    menuPreChamada.style.display = "block";

    const efetuarConexaoChamada = document.getElementById("efetuar-conexao-chamada");
    efetuarConexaoChamada.addEventListener("click", () => {
        const switchVideo = document.getElementById("switch-video").value;
        const switchAudio = document.getElementById("switch-audio").value;
        salvarUsuarioLocal(username, cod, switchAudio, switchVideo);
    });

}

function salvarUsuarioLocal(username, cod, audio, video){

    // Salva dados locais
    localStorage.setItem("username", username);
    localStorage.setItem("videoOn", video);
    localStorage.setItem("audioOn", audio);

    const pfpsArr = ["bonzibuddy1.png", "peedy1", "genie1", "maxalert1", "merlin1"];
    const randN = Math.floor(Math.random() * 5);
    const img = pfpsArr[randN];

    // Recebe uma foto de perfil
    const imgPath = "img/pfps/" + img;

    localStorage.setItem("pfp", imgPath);

    window.location = "/:" + cod;

}

videoCheckBox.addEventListener("click", () => {
    if (videoCheckBox.value == "on")
        videoCheckBox.value = "off";
    else 
        videoCheckBox.value = "on";
});

audioCheckBox.addEventListener("click", () => {
    if (audioCheckBox.value == "on")
        audioCheckBox.value = "off";
    else 
        audioCheckBox.value = "on";

    console.log(audioCheckBox.value);
});

socket.on("salaInexistente", (id) => {
    if (socket.id == id)
        window.location = "/404.html";
});
