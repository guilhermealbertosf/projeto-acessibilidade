const secaoEscola = document.getElementById("escola");
const secaoAvaliacao = document.getElementById("avaliar");
const erroDetalheEscola = document.getElementById("erro-detalhe-escola");
const listaReviews = document.getElementById("lista-reviews");
const erroReviews = document.getElementById("erro-reviews");
const formularioAvaliacao = document.getElementById("formulario-avaliacao");
const erroAvaliacao = document.getElementById("erro-avaliacao");
const agradecimentoAvaliacao = document.getElementById("agradecimento");
let requisicaoDetalheAtual = 0;
let escolaSelecionada = false;
let escolaAtualId = null;

function exibirDetalheEscola(escola) {
   const nome = String(escola.name ?? "");
   const bairro = String(escola.neighborhood?.name ?? "");
   const municipio = String(escola.neighborhood?.municipality ?? "");

   document.getElementById("nome-escola-migalhas").textContent = nome;
   document.getElementById("nome-escola").textContent = nome;
   document.getElementById("localizacao-escola").textContent = [bairro, municipio].filter(Boolean).join(", ");
   document.getElementById("endereco-escola").textContent = String(escola.address ?? "");
   document.getElementById("nome-escola-voltar").textContent = nome;
   document.getElementById("nome-escola-avaliacao").textContent = nome;

   const pontuacoes = Array.isArray(escola.scores) ? escola.scores : [];
   const gruposAvaliados = pontuacoes.filter(function (pontuacao) {
      return Number(pontuacao.review_count) >= 1 && Number.isFinite(Number(pontuacao.average));
   });
   const somaMedias = gruposAvaliados.reduce(function (total, pontuacao) {
      const media = Number(pontuacao.average);
      return total + media;
   }, 0);

   const totalAvaliacoes = escola.total_reviews;

   const mediaGeral = gruposAvaliados.length
      ? (somaMedias / gruposAvaliados.length).toLocaleString("pt-BR", {
         minimumFractionDigits: 1,
         maximumFractionDigits: 1
      })
      : "-";

   document.getElementById("media-escola").textContent = mediaGeral;
   document.getElementById("total-avaliacoes-escola").textContent =
      `${totalAvaliacoes} ${totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`;

   exibirPontuacoesPorGrupo(nome, pontuacoes);
   escolaSelecionada = true;
}

function exibirPontuacoesPorGrupo(nomeEscola, pontuacoes) {
   const nomesGrupos = {
      visual: "Visual",
      motora: "Motora",
      intelectual: "Intelectual",
      auditiva: "Auditiva",
      psicossocial: "Psicossocial"
   };
   const pontuacoesPorGrupo = new Map(pontuacoes.map(function (pontuacao) {
      return [pontuacao.group, pontuacao];
   }));

   document.getElementById("titulo-avaliacoes-escola").textContent = nomeEscola;
   document.getElementById("avaliacoes-grupos-escola").innerHTML = Object.entries(nomesGrupos).map(function ([grupo, nome]) {
      const pontuacao = pontuacoesPorGrupo.get(grupo);
      const media = pontuacao?.average === null || pontuacao?.average === undefined
         ? null
         : Number(pontuacao.average);
      const quantidade = Number(pontuacao?.review_count) || 0;
      const notaValida = media !== null && Number.isFinite(media);
      const progresso = notaValida
         ? Number(Math.min(Math.max(media / 5 * 100, 0), 100).toFixed(2))
         : 0;
      const nota = notaValida
         ? media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
         : "—";
      const textoAcessivel = notaValida
         ? `${nome}: ${nota} de 5, ${quantidade} avaliações`
         : `${nome}: sem avaliações`;

      return `
         <div class="avaliacao-grupo">
            <span class="avaliacao-grupo-nome">${nome}</span>
            <div class="avaliacao-grupo-trilho" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${notaValida ? media : 0}" aria-valuetext="${textoAcessivel}">
               <span style="--progresso: ${progresso}%"></span>
            </div>
            <span class="avaliacao-grupo-nota" title="${quantidade} ${quantidade === 1 ? "avaliação" : "avaliações"}">${nota}</span>
         </div>
      `;
   }).join("");
}

function criarReview(review) {
   const item = document.createElement("article");
   item.className = "review-familia";

   const cabecalho = document.createElement("div");
   cabecalho.className = "review-cabecalho";

   const avatar = document.createElement("span");
   avatar.className = "review-avatar";
   avatar.setAttribute("aria-hidden", "true");

   const identidade = document.createElement("div");
   identidade.className = "review-identidade";

   const nome = document.createElement("strong");
   nome.textContent = review.user_name || "anonimo";
   identidade.append(nome);

   if (review.created_at) {
      const data = new Date(review.created_at);
      if (!Number.isNaN(data.getTime())) {
         const dataElemento = document.createElement("time");
         dataElemento.dateTime = review.created_at;
         dataElemento.textContent = new Intl.DateTimeFormat("pt-BR").format(data);
         identidade.append(dataElemento);
      }
   }

   cabecalho.append(avatar, identidade);
   item.append(cabecalho);

   if (Array.isArray(review.scores) && review.scores.length) {
      const notas = document.createElement("p");
      notas.className = "review-notas";
      notas.textContent = review.scores.map(function (pontuacao) {
         return `${pontuacao.group}: ${pontuacao.score}/5`;
      }).join(" · ");
      item.append(notas);
   }

   if (review.observation) {
      const observacao = document.createElement("p");
      observacao.className = "review-observacao";
      observacao.textContent = review.observation;
      item.append(observacao);
   }

   return item;
}

async function carregarReviews(escolaId, idRequisicao) {
   listaReviews.replaceChildren();
   const carregando = document.createElement("p");
   carregando.className = "suave";
   carregando.textContent = "Carregando avaliações...";
   listaReviews.append(carregando);
   erroReviews.hidden = true;

   try {
      const response = await apiFetch(`/schools/${encodeURIComponent(escolaId)}/reviews`);
      const erro = await capturarErro(response);

      if (erro) {
         throw new Error(erro);
      }

      const dados = await response.json();

      if (idRequisicao !== requisicaoDetalheAtual) {
         return;
      }

      if (!Array.isArray(dados.items)) {
         throw new Error("A resposta de avaliações não está no formato esperado.");
      }

      listaReviews.replaceChildren();

      if (!dados.items.length) {
         const semReviews = document.createElement("p");
         semReviews.className = "suave";
         semReviews.textContent = "Ainda não há avaliações para esta escola.";
         listaReviews.append(semReviews);
         return;
      }

      dados.items.forEach(function (review) {
         listaReviews.append(criarReview(review));
      });
   } catch (erro) {
      if (idRequisicao !== requisicaoDetalheAtual) {
         return;
      }

      listaReviews.replaceChildren();
      erroReviews.textContent = erro.message;
      erroReviews.hidden = false;
   }
}

async function abrirEscola(id) {
   const requisicao = ++requisicaoDetalheAtual;
   erroDetalheEscola.hidden = true;

   try {
      const response = await apiFetch(`/schools/${encodeURIComponent(id)}`);
      const erro = await capturarErro(response);

      if (erro) {
         throw new Error(erro);
      }

      const escola = await response.json();

      if (requisicao !== requisicaoDetalheAtual) {
         return;
      }

      if (!escola || typeof escola !== "object" || escola.id === undefined) {
         throw new Error("A resposta da escola não está no formato esperado.");
      }

      exibirDetalheEscola(escola);
      escolaAtualId = escola.id;
      await carregarReviews(escola.id, requisicao);

      if (requisicao !== requisicaoDetalheAtual) {
         return;
      }

      secaoEscola.hidden = false;
      secaoAvaliacao.hidden = true;
      window.location.hash = "#escola";
      secaoEscola.scrollIntoView({ behavior: "smooth" });
   } catch (erro) {
      if (requisicao !== requisicaoDetalheAtual) {
         return;
      }

      erroDetalheEscola.textContent = erro.message;
      erroDetalheEscola.hidden = false;
   }
}

async function enviarAvaliacao(evento) {
   evento.preventDefault();
   erroAvaliacao.textContent = "";
   agradecimentoAvaliacao.textContent = "";

   if (escolaAtualId === null) {
      erroAvaliacao.textContent = "Selecione uma escola antes de enviar a avaliação.";
      return;
   }

   const scores = Array.from(formularioAvaliacao.querySelectorAll("fieldset[data-group]"))
      .map(function (grupo) {
         const selecionada = grupo.querySelector('input[type="radio"]:checked');

         return selecionada
            ? { group: grupo.dataset.group, score: Number(selecionada.value) }
            : null;
      })
      .filter(Boolean);
   const observation = formularioAvaliacao.elements.observation.value.trim();
   const botaoEnviar = formularioAvaliacao.querySelector('button[type="submit"]');
   botaoEnviar.disabled = true;

   try {
      const response = await apiFetch(`/schools/${encodeURIComponent(escolaAtualId)}/reviews`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ scores, observation })
      });
      const erro = await capturarErro(response);

      if (erro) {
         throw new Error(erro);
      }

      formularioAvaliacao.reset();
      agradecimentoAvaliacao.textContent = "Avaliação enviada com sucesso.";
      await abrirEscola(escolaAtualId);
   } catch (erro) {
      erroAvaliacao.textContent = erro.message;
   } finally {
      botaoEnviar.disabled = false;
   }
}

formularioAvaliacao.addEventListener("submit", enviarAvaliacao);

document.addEventListener("click", function (evento) {
   const link = evento.target.closest("a");

   if (!link) {
      return;
   }

   if (link.dataset.schoolId) {
      evento.preventDefault();
      abrirEscola(link.dataset.schoolId);
      return;
   }

   if (link.hasAttribute("data-abrir-avaliacao")) {
      evento.preventDefault();

      if (escolaSelecionada) {
         secaoAvaliacao.hidden = false;
         window.location.hash = "#avaliar";
         secaoAvaliacao.scrollIntoView({ behavior: "smooth" });
      }
      return;
   }

   if (link.getAttribute("href") === "#escola" && escolaSelecionada) {
      evento.preventDefault();
      secaoEscola.hidden = false;
      secaoAvaliacao.hidden = true;
      window.location.hash = "#escola";
      secaoEscola.scrollIntoView({ behavior: "smooth" });
   }
});
