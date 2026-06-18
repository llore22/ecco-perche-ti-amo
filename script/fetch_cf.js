window.WORKER_URL = window.WORKER_URL || "https://ecco-perche-ti-amo.p6kw2n4wh4.workers.dev";

// Inizializzazione variabili globali esplicite
window.dataFileSha = null;
window.appData = { nicknames: [], messages: {} };

async function loadData() {
  try {
    const res = await fetch(window.WORKER_URL, { method: 'GET' });
    
    if (res.status === 404) { 
      await createDataFile(); 
      return; 
    }
    
    const json = await res.json();
    
    window.dataFileSha = json.sha; 
    
    // CORREZIONE STRUTTURA: Se json ha un campo 'content' che è un oggetto, usa quello.
    // Se 'json' è già l'oggetto con i messaggi, usa direttamente json.
    if (json.content && typeof json.content === 'object' && !Array.isArray(json.content)) {
      window.appData = json.content;
    } else {
      window.appData = json || {};
    }

    // Normalizzazione di sicurezza
    if (!Array.isArray(window.appData.nicknames)) window.appData.nicknames = [];
    if (typeof window.appData.messages !== 'object' || Array.isArray(window.appData.messages)) window.appData.messages = {};
    if (!Array.isArray(window.appData.openedDates)) window.appData.openedDates = [];

    console.log("Dati scaricati e normalizzati:", window.appData);

    // CORREZIONE NOTIFICA: Controlla sia la funzione globale che quella appesa a window
    if (typeof window.renderAdmin === 'function') {
      window.renderAdmin();
    } else if (typeof renderAdmin === 'function') {
      renderAdmin();
    }
    
  } catch(e) {
    console.warn('Errore nel caricamento o nella decodifica:', e);
  }
}
