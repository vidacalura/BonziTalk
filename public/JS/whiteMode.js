var icon = document.getElementById("icon");

icon.onclick = function(){
    document.body.classList.toggle("white-theme");
    if(document.body.classList.contains("white-theme")){
        icon.src="./img/sun.png"
    }
    else{
        icon.src="./img/moon-icon.png"
    }
}