window.WORKER_URL = window.WORKER_URL || "https://ecco-perche-ti-amo.p6kw2n4wh4.workers.dev";

window.dataFileSha = null;
window.appData = { nicknames: [], messages: {}, openedDates: [] };

async function loadData() {
  try {
    console.log("Tentativo di caricamento da:", window.WORKER_URL);
    const res = await fetch(window.WORKER_URL, { method: 'GET' });
    
    if (res.status === 404) { 
      console.log("File non trovato (404), creo un file vuoto...");
      await createDataFile(); 
      return; 
    }
    
    const json = await res.json();
    console.log("Risposta grezza ricevuta dal Worker:", json);
    
    // Salva lo SHA se presente
    window.dataFileSha = json.sha || (json.content && json.content.sha) || null; 
    
    // CASO 1: Il worker restituisce direttamente i dati puliti
    if (json && json.messages) {
      window.appData = json;
    } 
    // CASO 2: I dati sono dentro un oggetto 'content' già decodificato
    else if (json.content && typeof json.content === 'object') {
      window.appData = json.content;
    } 
    // CASO 3: I dati sono dentro 'content' ma codificati in Base64 (standard GitHub API)
    else if (json.content && typeof json.content === 'string') {
      try {
        const decoded = decodeURIComponent(escape(atob(json.content.replace(/\s/g, ''))));
        window.appData = JSON.parse(decoded);
      } catch(base64Err) {
        console.error("Errore decodifica Base64 di content:", base64Err);
      }
    }

    // Normalizzazione e strutture di sicurezza
    if (!window.appData) window.appData = {};
    if (!Array.isArray(window.appData.nicknames)) window.appData.nicknames = [];
    if (typeof window.appData.messages !== 'object' || Array.isArray(window.appData.messages)) window.appData.messages = {};
    if (!Array.isArray(window.appData.openedDates)) window.appData.openedDates = [];

    console.log("Dati finali pronti in window.appData:", window.appData);

    // Forza l'aggiornamento della UI su index o admin
    if (typeof window.renderAdmin === 'function') window.renderAdmin();
    if (typeof renderAdmin === 'function') renderAdmin();
    
  } catch(e) {
    console.error('Errore critico in loadData():', e);
  }
}

async function createDataFile() {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(window.appData, null, 2))));
  try {
    const res = await fetch(window.WORKER_URL, {  
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content }) 
    });
    const json = await res.json();
    window.dataFileSha = json.sha || (json.content && json.content.sha);
    console.log("Nuovo file inizializzato sul server!");
  } catch(e) { 
    console.warn("Errore durante la creazione del file:", e); 
  }
}
