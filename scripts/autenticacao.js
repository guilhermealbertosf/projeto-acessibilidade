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
