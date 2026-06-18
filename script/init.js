async function init() {
  let appData = { content: {} };
  
  try {
    // Chiamiamo il Worker con una semplice GET invece di GitHub
    const res = await fetch("https://ecco-perche-ti-amo.p6kw2n4wh4.workers.dev/", { method: 'GET' });
    
    if (res.ok) {
      const json = await res.json();
      // Il Worker ti restituisce già i dati decodificati dentro la proprietà .content
      appData = json.content;
    }
  } catch(e) { 
    console.warn("Errore durante l'inizializzazione:", e); 
  }

  // DA QUI IN POI IL CODICE RIMANE IDENTICO A PRIMA
  // Serve a gestire l'interfaccia grafica (HTML) del tuo sito
  document.getElementById('loading').style.display = 'none';

  const today = todayKey();
  const allKeys = Object.keys(appData.messages || {}).sort();
  const past = allKeys.filter(k => k < today && appData.messages[k]);

  if (!past.length) {
    document.getElementById('empty-state').style.display = 'block';
    return;
  }

  const list = document.getElementById('past-list');
  list.style.display = 'flex';

  [...past].reverse().forEach(k => {
    const idx = allKeys.indexOf(k) + 1;
    const el = document.createElement('div');
    el.className = 'past-item';
    el.innerHTML = `<div class="past-item-meta">Giorno ${idx} &middot; ${formatDate(k)}</div>
      <div class="past-item-text">${appData.messages[k]}</div>`;
    list.appendChild(el);
  });
}
function todayKey() { return new Date().toISOString().split('T')[0]; }
function formatDate(str) { const [y,m,d]=str.split('-'); return `${d}/${m}/${y}`; }
init()