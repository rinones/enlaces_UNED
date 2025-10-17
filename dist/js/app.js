(function(){
  // Versión simplificada para desplegar en GitHub Pages. Carga data/links.json y renderiza.
  var LINKS = [];

  function loadLinks(){
    return fetch('data/links.json').then(function(res){
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
    var grid = document.getElementById('links-grid');
    var emptyState = document.getElementById('empty-state');
    grid.innerHTML = '';
    if(!LINKS || LINKS.length === 0){
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    LINKS.forEach(function(item){
      var a = document.createElement('a');
      a.href = item.url;
      a.className = 'link-card';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

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
      grid.appendChild(a);
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

  loadLinks().then(function(){
    render();
  });
})();
