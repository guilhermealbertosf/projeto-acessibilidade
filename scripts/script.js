function aviso(){
   alert("Função em desenvolvimento!")
}

let form = document.getElementById("formulario");

form.addEventListener("submit", function (evento) {
   evento.preventDefault();
   let nome = document;getElementById("nome").value
   alert(`obrigado, ${nome}!`);
})