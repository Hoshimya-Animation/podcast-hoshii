// Botones
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');

// Detectar preferencias del navegador
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const browserLang = navigator.language.startsWith('en') ? 'en' : 'es';

// Recuperar valores guardados o usar los del navegador
let currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
let currentLang = localStorage.getItem('lang') || browserLang;

// --- Tema ---
function applyTheme(mode){
  currentTheme = mode;
  document.documentElement.classList.toggle('dark', mode === 'dark');
  themeToggle.textContent = mode === 'dark' ? '🌞' : '🌙';
  localStorage.setItem('theme', mode);
}

// Inicializar tema
applyTheme(currentTheme);

// Toggle tema
themeToggle.addEventListener('click', () => {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

// --- Idioma ---
function applyLang(lang){
  currentLang = lang;
  langToggle.textContent = lang === 'es' ? 'EN' : 'ES';
  localStorage.setItem('lang', lang);

  // Redirige según idioma (URLs limpias en GitHub Pages)
  if(lang === 'en'){
    window.location.href = "index-en.html"; // versión en inglés
  } else if(lang === 'es'){
    window.location.href = "/";    // versión en español
  }
}





//Normilizar busqueda
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos
}

async function buscarEnPaginas(term, paginas) {
  let resultados = [];

  for (const pagina of paginas) {
    try {
      const res = await fetch(pagina);
      if (!res.ok) continue; // si la página no existe, saltar
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const articles = doc.querySelectorAll('article.card');
      

      articles.forEach(article => {
        const tagsAttr = normalizar(article.getAttribute('data-tags') || '');
        const text = normalizar(article.textContent);

        if (tagsAttr.includes(term) || text.includes(term)) {
          resultados.push(article.outerHTML);
        }
      });
    } catch (err) {
      console.error("Error al leer", pagina, err);
    }
  }

  return resultados;
}

// Datos de ejemplo de episodios dinámicos
const episodes = [
  { id: 1, title: "Mangakas que hicieron historia", desc: "Este episodio profundiza en las vidas y obras de mangakas influyentes.", image: "../img/ai-generated5.webp", published: "Ene 2026", duration: "45 min", link:"https://google.com" },
  //{ id: 2, title: "Puentes Japón-México", desc: "Intercambios culturales y profesionales", image: "img/ep2.webp", published: "Feb 2026", duration: "50 min" },
  // ... más episodios
];

// Configuración
const ITEMS_PER_PAGE = 6;
let currentPage = 1;

// Elementos
const episodesListEl = document.getElementById("episodes-list");
const paginationEl = document.getElementById("pagination");

// Renderizar episodios dinámicos
function renderEpisodes(page = 1) {
  if (!episodesListEl) return;
  episodesListEl.innerHTML = "";

  const start = (page - 1) * ITEMS_PER_PAGE;
  const slice = episodes.slice(start, start + ITEMS_PER_PAGE);

  slice.forEach(ep => {
    const card = document.createElement("article");
    card.className = "episode-card";
    card.innerHTML = `
      <a href="${ep.link}" class="episode-link">
        <img src="${ep.image}" alt="Portada ${ep.title}">
        <div class="episode-body">
          <h3 class="episode-title">${ep.title}</h3>
          <p class="episode-desc">${ep.desc}</p>
          <div class="card-meta">
            <span>Publicado: ${ep.published}</span>
            <span>Duración: ${ep.duration}</span>
          </div>
        </div>
      </a>
    `;
    episodesListEl.appendChild(card);
  });

  renderPagination(page);
}


// Renderizar paginación
function renderPagination(activePage) {
  if (!paginationEl) return;
  paginationEl.innerHTML = "";
  const totalPages = Math.ceil(episodes.length / ITEMS_PER_PAGE);

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-number" + (p === activePage ? " active" : "");
    btn.textContent = p;
    btn.addEventListener("click", () => {
      currentPage = p;
      renderEpisodes(currentPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    paginationEl.appendChild(btn);
  }
}

// Inicializar grid dinámico
document.addEventListener('DOMContentLoaded', () => {
  if (episodesListEl && paginationEl) {
    renderEpisodes(currentPage);
  }
});

//  Buscador que combina artículos estáticos y episodios dinámicos
document.addEventListener('DOMContentLoaded', () => {
  const q = document.getElementById('q');
  const searchBtn = document.getElementById('searchBtn');
  const articlesContainer = document.querySelector('.articles-container');
  const contenidoOriginal = articlesContainer ? articlesContainer.innerHTML : "";

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const term = normalizar(q.value.trim());
      if (!term) {
        if (articlesContainer) articlesContainer.innerHTML = contenidoOriginal;
        if (episodesListEl) renderEpisodes(currentPage);
        return;
      }

      // Buscar en episodios dinámicos
      const resultadosGrid = episodes.filter(ep =>
      normalizar(ep.title).includes(term) ||
      normalizar(ep.desc).includes(term)
      ).map(ep => `
        <article class="episode-card">
          <a href="${ep.link}" class="episode-link">
            <img src="${ep.image}" alt="Portada ${ep.title}">
            <div class="episode-body">
              <h3 class="episode-title">${ep.title}</h3>
              <p class="episode-desc">${ep.desc}</p>
              <div class="card-meta">
                <span>Publicado: ${ep.published}</span>
                <span>Duración: ${ep.duration}</span>
              </div>
            </div>
          </a>
        </article>
    `);


      // Buscar en artículos estáticos
      let resultadosStatic = [];
      if (articlesContainer) {
        articlesContainer.querySelectorAll('article.card').forEach(article => {
          const text = normalizar(article.textContent);
          if (text.includes(term)) {
            resultadosStatic.push(article.outerHTML);
          }
        });
      }

      // Combinar resultados
      const todosResultados = [...resultadosStatic, ...resultadosGrid];

      if (articlesContainer) {
        articlesContainer.innerHTML = todosResultados.length
          ? todosResultados.join('')
          : `<p>No se encontraron resultados para "${term}"</p>`;
      } else if (episodesListEl) {
        episodesListEl.innerHTML = todosResultados.length
          ? todosResultados.join('')
          : `<p>No se encontraron resultados para "${term}"</p>`;
      }
    });
  }
});




// Renderizar paginación
function renderPagination(activePage) {
  if(!paginationEl) return; // evita error en otras páginas
    paginationEl.innerHTML = "";
  const totalPages = Math.ceil(episodes.length / ITEMS_PER_PAGE);

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-number" + (p === activePage ? " active" : "");
    btn.textContent = p;
    btn.addEventListener("click", () => {
      currentPage = p;
      renderEpisodes(currentPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    paginationEl.appendChild(btn);
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  if (episodesListEl && paginationEl) {
    renderEpisodes(currentPage);
  }
});
// Toggle idioma manual (redirige al hacer clic)
if (langToggle) {
  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    applyLang(nextLang);
  });
}
