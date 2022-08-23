let socket = io();

const criarSalaBtn = document.getElementById("criar-sala-btn");
const entrarSalaBtn = document.getElementById("entrar-sala-btn");
const menuCriarSalaBtn = document.getElementById("menu-criar-sala-btn");
const menuEntrarSalaBtn = document.getElementById("menu-entrar-sala-btn");
const menuPrincipal = document.getElementById("menu-principal");
const menuCriarSala = document.getElementById("menu-criar-sala");
const menuEntrarSala = document.getElementById("menu-entrar-sala");
const menuBg = document.getElementById("menu-bg");

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

    socket.emit("criarSala", { username, participantes });

});

entrarSalaBtn.addEventListener("click", () => {

    const username = document.getElementById("username-entrar-sala").value;
    const cod = document.getElementById("codigo-entrar-sala").value;

    socket.emit("entrarSala", { username, cod });

});