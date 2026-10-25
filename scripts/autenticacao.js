async function autenticar(email, senha, nome) {
   const response = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha, name: nome })
   });

   return capturarErro(response);
}

async function fazerLogin(email, senha) {
   const response = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha })
   });
   const erro = await capturarErro(response);

   if (erro) {
      return erro;
   }

   const dados = await response.json();

   if (typeof dados.access_token !== "string" || !dados.access_token) {
      return "Não foi possível obter o token de autenticação.";
   }

   localStorage.setItem("token", dados.access_token);
   return null;
}

async function carregarUsuarioAutenticado() {
   const botaoEntrar = document.querySelector(".botao-entrar");

   if (!botaoEntrar) {
      return;
   }

   let usuarioAutenticado = false;
   botaoEntrar.addEventListener("click", function () {
      if (!usuarioAutenticado) {
         window.location.href = "paginas/login.html";
      }
   });

   const token = localStorage.getItem("token");

   if (!token) {
      return;
   }

   botaoEntrar.disabled = true;

   try {
      const response = await apiFetch("/auth/whoami");
      const erro = await capturarErro(response);

      if (erro) {
         throw new Error(erro);
      }

      const usuario = await response.json();

      if (typeof usuario.name !== "string" || !usuario.name.trim()) {
         throw new Error("A resposta do usuário não contém um nome válido.");
      }

      usuarioAutenticado = true;
      botaoEntrar.textContent = usuario.name;
      botaoEntrar.disabled = true;
      botaoEntrar.setAttribute("aria-label", `Usuário autenticado: ${usuario.name}`);
   } catch (erro) {
      botaoEntrar.disabled = false;
      console.error("Não foi possível carregar o usuário autenticado:", erro);
   }
}

carregarUsuarioAutenticado();
