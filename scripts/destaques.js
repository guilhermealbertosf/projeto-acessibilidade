const listaDestaques = document.getElementById("lista-destaques");
const erroDestaques = document.getElementById("erro-destaques");

function escaparHtml(valor) {
   return String(valor).replace(/[&<>"']/g, function (caractere) {
      return {
         "&": "&amp;",
         "<": "&lt;",
         ">": "&gt;",
         '"': "&quot;",
         "'": "&#39;"
      }[caractere];
   });
}

function criarCardDestaque(escola) {
   const nome = escaparHtml(escola.name);
   const endereco = escaparHtml(escola.address);
   const pontuacao = escaparHtml(Number(escola.ranking_score).toFixed(1));

   return `
      <article class="cartao destaque">
         <div class="arte">
            <svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#arte-escola" width="300" height="120"/></svg>
            <span class="selo" aria-label="Pontuação ${pontuacao}">${pontuacao}</span>
         </div>
         <h3>${nome}</h3>
         <p class="suave">${endereco}</p>
         <a class="botao" href="#escola" data-school-id="${escaparHtml(escola.id)}">Ver escola</a>
      </article>
   `;
}

async function listarBairros() {
   const response = await apiFetch("/neighborhoods?limit=3");
   const erro = await capturarErro(response);

   if (erro) {
      throw new Error(erro);
   }

   const bairros = await response.json();

   if (!Array.isArray(bairros)) {
      throw new Error("A resposta de bairros não está no formato esperado.");
   }

   return bairros;
}

async function buscarEscolaDoBairro(bairro) {
   const parametros = new URLSearchParams({
      limit: "1",
      neighborhood_id: bairro.id
   });
   const response = await apiFetch(`/schools?${parametros}`);
   const erro = await capturarErro(response);

   if (erro) {
      throw new Error(erro);
   }

   const escolas = await response.json();

   if (!Array.isArray(escolas.items)) {
      throw new Error("A resposta de escolas não está no formato esperado.");
   }

   return escolas.items[0] || null;
}

async function carregarDestaques() {
   try {
      const bairros = await listarBairros();
      const escolas = await Promise.all(bairros.map(buscarEscolaDoBairro));
      const cards = escolas.filter(Boolean).map(criarCardDestaque);

      listaDestaques.innerHTML = cards.length
         ? cards.join("")
         : "Nenhuma escola encontrada nos bairros consultados.";
   } catch (erro) {
      listaDestaques.textContent = "";
      erroDestaques.textContent = erro.message;
      erroDestaques.hidden = false;
   }
}

carregarDestaques();
