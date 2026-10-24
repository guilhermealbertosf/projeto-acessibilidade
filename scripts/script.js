// ==========================================================
// Enlace Digital — scripts da landing page
// São quatro coisas:
//   1. Abrir e fechar o menu no celular
//   2. Marcar no menu a seção que está na tela
//   3. Mostrar um "obrigado" depois de enviar a avaliação
//   4. Filtrar a lista de escolas por bairro e por nome
// ==========================================================


// ----------------------------------------------------------
// 1. Menu do celular
// ----------------------------------------------------------
const botaoMenu = document.getElementById("icone-menu");
const menu = document.getElementById("navbar");
const linksDoMenu = menu.querySelectorAll("a");

function abrirOuFecharMenu() {
   // toggle liga a classe "aberto" se ela não existe e desliga se existe
   const estaAberto = menu.classList.toggle("aberto");

   // Avisa os leitores de tela se o menu está aberto ou fechado
   botaoMenu.setAttribute("aria-expanded", estaAberto);
   botaoMenu.setAttribute("aria-label", estaAberto ? "Fechar menu" : "Abrir menu");
}

botaoMenu.addEventListener("click", abrirOuFecharMenu);

// Ao tocar em um item, o menu fecha para a página aparecer
linksDoMenu.forEach(function (link) {
   link.addEventListener("click", function () {
      if (menu.classList.contains("aberto")) {
         abrirOuFecharMenu();
      }
   });
});


// ----------------------------------------------------------
// 2. Marcar no menu a seção que está na tela
// Cada seção grande da página (Início, Achar escola, Sobre nós)
// tem um id. Quando uma delas passa pelo meio da tela, o link
// do menu com o mesmo nome ganha o risco laranja.
// ----------------------------------------------------------
const secoes = document.querySelectorAll("main > section[id]");

function marcarLinkDaSecao(idDaSecao) {
   linksDoMenu.forEach(function (link) {
      if (link.getAttribute("href") === "#" + idDaSecao) {
         link.setAttribute("aria-current", "location");
      } else {
         link.removeAttribute("aria-current");
      }
   });
}

// O "observador" avisa quando uma seção entra ou sai da faixa do meio da tela
const observador = new IntersectionObserver(
   function (entradas) {
      entradas.forEach(function (entrada) {
         if (entrada.isIntersecting) {
            marcarLinkDaSecao(entrada.target.id);
         }
      });
   },
   { rootMargin: "-40% 0px -55% 0px" }
);

secoes.forEach(function (secao) {
   observador.observe(secao);
});


// ----------------------------------------------------------
// 3. Formulário de avaliação
// Ainda não existe um servidor para guardar as respostas,
// então o formulário só limpa os campos e agradece.
// ----------------------------------------------------------
const formulario = document.getElementById("formulario-avaliacao");
const agradecimento = document.getElementById("agradecimento");

formulario.addEventListener("submit", function (evento) {
   evento.preventDefault(); // impede a página de recarregar
   formulario.reset();
   agradecimento.textContent = "Obrigado! Sua avaliação ajuda a próxima família.";
});


// ----------------------------------------------------------
// 4. Filtrar a lista de escolas
// Cada cartão da lista tem data-bairro="...". O bairro escolhido
// e o texto digitado na busca escondem os cartões que não servem.
// ----------------------------------------------------------
const seletorBairro = document.getElementById("bairro");
const campoBusca = document.getElementById("busca-escola");
const cartoesDeEscola = document.querySelectorAll("#lista-escolas > article");
const totalEscolas = document.getElementById("total-escolas");
const semResultado = document.getElementById("sem-resultado");

// Deixa "Água" e "agua" iguais: tira acentos e maiúsculas
function simplificar(texto) {
   return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filtrarEscolas() {
   const bairro = seletorBairro.value;
   const busca = simplificar(campoBusca.value.trim());
   let visiveis = 0;

   cartoesDeEscola.forEach(function (cartao) {
      const nome = simplificar(cartao.querySelector("h3").textContent);
      const mostrar = (bairro === "" || cartao.dataset.bairro === bairro) && nome.includes(busca);
      cartao.hidden = !mostrar;
      if (mostrar) visiveis++;
   });

   totalEscolas.textContent = visiveis + (visiveis === 1 ? " escola" : " escolas");
   semResultado.hidden = visiveis > 0;
}

seletorBairro.addEventListener("change", filtrarEscolas);
campoBusca.addEventListener("input", filtrarEscolas);
