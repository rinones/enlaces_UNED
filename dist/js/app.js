(function(){
  // Versión simplificada para desplegar en GitHub Pages. Carga data/uned-links.json y renderiza.
  var LINKS = [];
  var filtered = [];
  var gridEl = null;
  var searchInputEl = null;
  var emptyStateEl = null;
  var ADDITIONAL_DATA_FILES = ['data/uned-links.json', 'data/travel-links.json', 'data/home-links.json', 'data/content-links.json'];

  function loadLinks(){
  var path = (window && window.LINKS_PATH) ? window.LINKS_PATH : 'data/uned-links.json';
    return fetch(path).then(function(res){
      if(!res.ok) return [];
      return res.json();
    }).then(function(json){
      if(Array.isArray(json)) LINKS = json;
    }).catch(function(){
      // silently ignore; LINKS may remain empty
      LINKS = LINKS || [];
    });
  }

  function render(){
    gridEl = gridEl || document.getElementById('links-grid');
    emptyStateEl = emptyStateEl || document.getElementById('empty-state');
    if(!gridEl) return;
    gridEl.innerHTML = '';
    var pageItems = filtered || [];
    if(!pageItems || pageItems.length === 0){
      if(emptyStateEl) emptyStateEl.hidden = false;
      return;
    }
    if(emptyStateEl) emptyStateEl.hidden = true;
    pageItems.forEach(function(item){
      var a = document.createElement('a');
      a.href = item.url;
  a.className = 'link-card';
  // Open links in the same window by default (no target _blank)

      var content = document.createElement('div');
      content.className = 'link-content';

      var icon = document.createElement('div');
      icon.className = 'link-icon';
      icon.innerHTML = item.icon || '';

      var title = document.createElement('div');
      title.className = 'link-title';
      title.textContent = item.title;

      var desc = document.createElement('div');
      desc.className = 'link-desc';
      desc.textContent = item.description || '';

      content.appendChild(icon);
      content.appendChild(title);
      if(item.description) content.appendChild(desc);

      if(item.section){
        var slug = item.section.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
        a.classList.add('section-' + slug);
        var badge = document.createElement('div');
        badge.className = 'section-badge';
        badge.textContent = item.section;
        a.appendChild(badge);
      }

      a.appendChild(content);
      gridEl.appendChild(a);
    });
  }

  // theme
  function loadTheme(){
    var stored = localStorage.getItem('theme');
    if(stored === 'dark') document.documentElement.classList.add('dark');
  }
  function bindThemeToggle(){
    var btn = document.getElementById('theme-toggle');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var isDark = document.documentElement.classList.toggle('dark');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  loadTheme();
  bindThemeToggle();

  // bind search input if present
  searchInputEl = document.getElementById('search-input');
  if(searchInputEl){
    searchInputEl.addEventListener('input', function(){
      var q = (searchInputEl.value || '').trim().toLowerCase();
      if(!q) filtered = LINKS.slice();
      else {
        // if we're on the home page (index.html), also load additional data files and search across all
        var isHome = (location.pathname || '').split('/').pop() === 'index.html' || (location.pathname || '') === '/';
        if(isHome){
          // fetch additional files in parallel, then filter combined list
          Promise.all(ADDITIONAL_DATA_FILES.map(function(p){
            return fetch(p).then(function(r){ if(r.ok) return r.json(); return []; }).catch(function(){ return []; });
          })).then(function(arrs){
            var combined = (LINKS || []).slice();
            arrs.forEach(function(a){ if(Array.isArray(a)) combined = combined.concat(a); });
            filtered = combined.filter(function(l){
              return ((l.title || '') + ' ' + (l.description || '')).toLowerCase().indexOf(q) !== -1;
            });
            render();
          });
        } else {
          filtered = LINKS.filter(function(l){
            return ((l.title || '') + ' ' + (l.description || '')).toLowerCase().indexOf(q) !== -1;
          });
          render();
        }
      }
    });
  }

  loadLinks().then(function(){
    // initialize filtered list and render
    filtered = Array.isArray(LINKS) ? LINKS.slice() : [];
    render();
    markActiveNav();
  });

  // Marca el enlace del nav como activo comparando location.pathname
  function markActiveNav(){
    try{
      var links = document.querySelectorAll('.main-nav .nav-link');
      if(!links || !links.length) return;
      var path = (location.pathname || '').split('/').pop() || 'index.html';
      // normalizar: si es vacío tratar como index.html
      links.forEach(function(el){
        try{
          var raw = el.getAttribute('href') || '';
          // If the href is an absolute URL or a protocol-relative URL, skip marking it active
          var url = new URL(raw, location.href);
          if(url.origin !== location.origin){
            el.classList.remove('active');
            return;
          }
          var href = (url.pathname || '').split('/').pop();
          if(!href) href = 'index.html';
          if(href === path || (path === '' && href === 'index.html')){
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        }catch(e){
          // On error (malformed URL), fall back to simple behavior
          el.classList.remove('active');
        }
      });
    }catch(e){/* ignore */}
  }
})();
