// partials.js
// Charge des fragments HTML référencés par l'attribut `data-include`.
// Usage: <div data-include="./partials/header.html"></div>
(function () {
  'use strict';

  async function fetchText(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    return response.text();
  }

  // Exécute les scripts trouvés dans un conteneur après insertion.
  function executeInlineScripts(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const script = document.createElement('script');
      // Copier les attributs (type, src, async, etc.)
      for (let i = 0; i < oldScript.attributes.length; i++) {
        const attr = oldScript.attributes[i];
        script.setAttribute(attr.name, attr.value);
      }

      if (oldScript.src) {
        // Pour les scripts externes, on s'assure qu'ils sont chargés en séquence
        script.src = oldScript.src;
        script.async = false;
        document.head.appendChild(script);
      } else {
        script.textContent = oldScript.textContent;
        document.head.appendChild(script);
        document.head.removeChild(script);
      }
      // Supprimer l'ancien <script> pour éviter une double exécution si ré-inclusion
      oldScript.parentNode && oldScript.parentNode.removeChild(oldScript);
    });
  }

  // Charge et insère les partials
  async function loadPartials(root = document) {
    const nodes = Array.from(root.querySelectorAll('[data-include]'));
    if (!nodes.length) return;

    await Promise.all(nodes.map(async (node) => {
      const rawPath = node.getAttribute('data-include');
      if (!rawPath) return;
      try {
        // Résolution du chemin relatif depuis la page courante
        const resolved = new URL(rawPath, document.baseURI).href;
        const html = await fetchText(resolved);
        node.innerHTML = html;
        executeInlineScripts(node);
      } catch (err) {
        console.error('[partials.js] Échec de chargement du partial', rawPath, err);
        // Afficher un message minimal pour le debug
        node.innerHTML = '<!-- partial non chargé: ' + rawPath + ' -->';
      }
    }));
  }

  // On charge au DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadPartials());
  } else {
    // Si le script est chargé de façon différée, tenter d'exécuter immédiatement
    setTimeout(() => loadPartials(), 0);
  }

  // Exposer pour usage manuel si besoin
  window.loadPartials = loadPartials;

  // Aide au debug : avertissement si la page est ouverte en file:// (les fetch peuvent échouer)
  if (location.protocol === 'file:') {
    console.warn('[partials.js] Vous ouvrez la page via file:// — certains navigateurs bloquent fetch() pour les fichiers locaux. Servez le dossier via un serveur local pour un fonctionnement fiable.');
  }

})();
