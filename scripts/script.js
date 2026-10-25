// ==========================================================
// Enlace Digital — scripts da landing page
// São quatro coisas:
//   1. Abrir e fechar o menu no celular
//   2. Marcar no menu a seção que está na tela
//   3. Mostrar um "obrigado" depois de enviar a avaliação
//   4. Filtrar escolas pelo grupo, bairro e nome (scripts/escolas.js)
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
