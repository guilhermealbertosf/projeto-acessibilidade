const formularioCadastro = document.querySelector("form[data-destino]");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const campoConfirmarSenha = document.getElementById("confirmar-senha");
const errosCadastro = document.getElementById("errosCadastro");

function checarSenhas() {
   if (campoSenha.value !== campoConfirmarSenha.value) {
      alert("As senhas não são iguais.");
      return false;
   }

   return true;
}

async function enviarFormulario(evento) {
   evento.preventDefault();
   errosCadastro.textContent = "";

   if (!checarSenhas()) {
      return;
   }

   const erroCadastro = await autenticar(campoEmail.value, campoSenha.value, campoNome.value);

   if (erroCadastro) {
      errosCadastro.textContent = erroCadastro;
      return;
   }

   const erroLogin = await fazerLogin(campoEmail.value, campoSenha.value);

   if (erroLogin) {
      errosCadastro.textContent = erroLogin;
      return;
   }

   window.location.href = formularioCadastro.dataset.destino;
}

formularioCadastro.addEventListener("submit", enviarFormulario);