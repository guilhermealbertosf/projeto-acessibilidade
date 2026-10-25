const listaEscolas = document.getElementById("lista-escolas");
const totalEscolas = document.getElementById("total-escolas");
const semResultado = document.getElementById("sem-resultado");
const erroEscolas = document.getElementById("erro-escolas");
const erroBairros = document.getElementById("erro-bairros");
const seletorBairro = document.getElementById("bairro");
const campoBuscaEscola = document.getElementById("busca-escola");
const filtrosGrupo = document.querySelectorAll('input[name="necessidade"]');
let escolasEncontradas = [];
let requisicaoAtual = 0;

function escaparHtmlEscola(valor) {
   return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
      return {
         "&": "&amp;",
         "<": "&lt;",
         ">": "&gt;",
         '"': "&quot;",
         "'": "&#39;"
      }[caractere];
   });
}

function simplificarNomeEscola(texto) {
   return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function carregarBairros() {
   try {
      const response = await apiFetch("/neighborhoods");
      const erro = await capturarErro(response);

      if (erro) {
         throw new Error(erro);
      }

      const dados = await response.json();
      const bairros = Array.isArray(dados) ? dados : dados.items;

      if (!Array.isArray(bairros)) {
         throw new Error("A resposta de bairros não está no formato esperado.");
      }

      bairros.forEach(function (bairro) {
         if (bairro.id === undefined || typeof bairro.name !== "string") {
            return;
         }

         const opcao = document.createElement("option");
         opcao.value = bairro.id;
         opcao.textContent = bairro.name;
         seletorBairro.append(opcao);
      });
   } catch (erro) {
      erroBairros.textContent = erro.message;
      erroBairros.hidden = false;
   }
}

function criarCardListaEscola(escola) {
   const nome = escaparHtmlEscola(escola.name);
   const endereco = escaparHtmlEscola(escola.address);
   const pontuacao = Number(escola.ranking_score);
   const selo = Number.isFinite(pontuacao)
      ? `<span class="selo" aria-label="Pontuação ${pontuacao.toFixed(1)}">${pontuacao.toFixed(1)}</span>`
      : "";

   return `
      <article class="cartao destaque">
         <div class="arte">
            <svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#arte-escola" width="300" height="120"/></svg>
            ${selo}
         </div>
         <h3>${nome}</h3>
         <p class="suave">${endereco}</p>
         <a class="botao" href="#escola" data-school-id="${escaparHtmlEscola(escola.id)}">Ver escola</a>
      </article>
   `;
}

function aplicarFiltrosEscola() {
   const busca = simplificarNomeEscola(campoBuscaEscola.value.trim());
   const filtradas = escolasEncontradas.filter(function (escola) {
      const nome = simplificarNomeEscola(String(escola.name ?? ""));
      return nome.includes(busca);
   });

   listaEscolas.innerHTML = filtradas.map(criarCardListaEscola).join("");
   totalEscolas.textContent = `${filtradas.length} ${filtradas.length === 1 ? "escola" : "escolas"}`;
   semResultado.hidden = filtradas.length > 0;
}

async function buscarEscolasDoGrupo(grupo) {
   const idRequisicao = ++requisicaoAtual;
   const parametros = new URLSearchParams({
      groups: grupo
   });
   if (seletorBairro.value) {
      parametros.set("neighborhood_id", seletorBairro.value);
   }

   listaEscolas.textContent = "Carregando escolas...";
   totalEscolas.textContent = "Carregando escolas...";
   semResultado.hidden = true;
   erroEscolas.hidden = true;

   try {
      const response = await apiFetch(`/schools?${parametros}`);
      const erro = await capturarErro(response);

      if (erro) {
         throw new Error(erro);
      }

      const dados = await response.json();
      const escolas = Array.isArray(dados) ? dados : dados.items;

      if (!Array.isArray(escolas)) {
         throw new Error("A resposta de escolas não está no formato esperado.");
      }

      if (idRequisicao !== requisicaoAtual) {
         return;
      }

      escolasEncontradas = escolas;
      aplicarFiltrosEscola();
   } catch (erro) {
      if (idRequisicao !== requisicaoAtual) {
         return;
      }

      escolasEncontradas = [];
      listaEscolas.textContent = "";
      totalEscolas.textContent = "0 escolas";
      erroEscolas.textContent = erro.message;
      erroEscolas.hidden = false;
   }
}

filtrosGrupo.forEach(function (filtro) {
   filtro.addEventListener("change", function () {
      if (filtro.checked) {
         buscarEscolasDoGrupo(filtro.value);
      }
   });
});

seletorBairro.addEventListener("change", function () {
   const grupoSelecionado = document.querySelector('input[name="necessidade"]:checked');

   if (grupoSelecionado) {
      buscarEscolasDoGrupo(grupoSelecionado.value);
   }
});
campoBuscaEscola.addEventListener("input", aplicarFiltrosEscola);

const grupoInicial = document.querySelector('input[name="necessidade"]:checked');

carregarBairros();

if (grupoInicial) {
   buscarEscolasDoGrupo(grupoInicial.value);
}
