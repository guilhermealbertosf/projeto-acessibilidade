const formularioLogin = document.querySelector("form[data-destino]");
const campoEmailLogin = document.getElementById("email");
const campoSenhaLogin = document.getElementById("senha");
const errosLogin = document.getElementById("errosLogin");

async function enviarFormulario(evento) {
   evento.preventDefault();
   errosLogin.textContent = "";

   const erro = await fazerLogin(campoEmailLogin.value, campoSenhaLogin.value);

   if (erro) {
      errosLogin.textContent = erro;
      return;
   }

   window.location.href = formularioLogin.dataset.destino;
}

formularioLogin.addEventListener("submit", enviarFormulario);
