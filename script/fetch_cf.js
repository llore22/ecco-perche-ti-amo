window.WORKER_URL = window.WORKER_URL || "https://ecco-perche-ti-amo.p6kw2n4wh4.workers.dev";

// Inizializzazione variabili globali esplicite
window.dataFileSha = null;
window.appData = { nicknames: [], messages: {} };

async function loadData() {
  try {
    const res = await fetch(WORKER_URL, { method: 'GET' });
    
    if (res.status === 404) { 
      await createDataFile(); 
      return; 
    }
    
    const json = await res.json();
    
    // Assegnazione all'oggetto globale window
    window.dataFileSha = json.sha; 
    window.appData = json.content || {};

    // Normalizza la struttura
    if (!Array.isArray(window.appData.nicknames)) window.appData.nicknames = [];
    if (typeof window.appData.messages !== 'object' || Array.isArray(window.appData.messages)) window.appData.messages = {};

    console.log("Dati caricati con successo!", window.dataFileSha);
    if (typeof renderAdmin === 'function') renderAdmin();
  } catch(e) {
    console.warn('Offline o errore nel caricamento:', e);
  }
}

async function createDataFile() {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(window.appData, null, 2))));
  
  try {
    const res = await fetch(WORKER_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content }) 
    });
    
    const json = await res.json();
    window.dataFileSha = json.content?.sha || json.sha;
    console.log("Nuovo file creato sul server!");
  } catch(e) { 
    console.warn("Errore durante la creazione del file:", e); 
  }
}
