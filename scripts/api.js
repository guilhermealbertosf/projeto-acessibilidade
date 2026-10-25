const API_URL = "http://localhost:8000/v1";

async function apiFetch(path, options = {}) {
   const token = localStorage.getItem("token");
   const headers = new Headers(options.headers);

   if (token) {
      headers.set("authorization", `bearer ${token}`);
   }

   return fetch(`${API_URL}${path}`, {
      ...options,
      headers
   });
}

async function capturarErro(response) {
   if (response.ok) {
      return null;
   }

   const dados = await response.json();
   const detalhe = Array.isArray(dados.detail) ? dados.detail[0]?.msg : dados.detail;

   return typeof detalhe === "string" ? detalhe : "Não foi possível concluir a solicitação.";
}
