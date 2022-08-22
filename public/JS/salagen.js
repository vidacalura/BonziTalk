let socket = io();

const criarSalaBtn = document.getElementById("criar-sala-btn");
const entrarSalaBtn = document.getElementById("entrar-sala-btn");

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
//var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
/*span.onclick = function() {
    modal.style.display = "none";
}*/

window.onclick = function(event) {

    if (event.target.id == "menu-bg") {
        modal.style.display = "none";
    }
    
}

criarSalaBtn.addEventListener("click", () => {

    const username = document.getElementById("username-criar-sala").value;
    const participantes = document.getElementById("participantes-criar-sala").value; // String

    socket.emit("criarSala", { username, participantes });

});

entrarSalaBtn.addEventListener("click", () => {

    const username = document.getElementById("username-entrar-sala").value;
    const cod = document.getElementById("inputCode").value;

    socket.emit("entrarSala", { username, cod });

});