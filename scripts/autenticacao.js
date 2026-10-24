// ==========================================================
// Enlace Digital — scripts das telas de login e cadastro
// Ainda não existe um servidor, então o formulário só confere
// os campos (o navegador faz isso sozinho) e segue para a
// próxima tela, indicada em data-destino no <form>.
// ==========================================================

const formulario = document.querySelector("form[data-destino]");

formulario.addEventListener("submit", function (evento) {
   evento.preventDefault(); // impede o envio de verdade (a senha não vai para a barra de endereço)
   window.location.href = formulario.dataset.destino;
});


// ----------------------------------------------------------
// Máscara do CPF (só existe na tela de cadastro)
// Enquanto a pessoa digita, vira 000.000.000-00
// ----------------------------------------------------------
const campoCpf = document.getElementById("cpf");

if (campoCpf) {
   campoCpf.addEventListener("input", function () {
      const numeros = campoCpf.value.replace(/\D/g, "").slice(0, 11);

      campoCpf.value = numeros
         .replace(/^(\d{3})(\d)/, "$1.$2")
         .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
         .replace(/\.(\d{3})(\d)/, ".$1-$2");
   });
}
