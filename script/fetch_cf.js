
const WORKER_URL = "https://ecco-perche-ti-amo.p6kw2n4wh4.workers.dev/"; 
async function loadData() {
  try {
    const res = await fetch(WORKER_URL, { method: 'GET' });
    
    if (res.status === 404) { 
      await createDataFile(); 
      return; 
    }
    
    const json = await res.json();
    dataFileSha = json.sha; 
    appData = json.content;

  // Normalizza la struttura
  if (!Array.isArray(appData.nicknames)) appData.nicknames = [];
  if (typeof appData.messages !== 'object' || Array.isArray(appData.messages)) appData.messages = {};

console.log("Dati caricati!");
   if (typeof renderAdmin === 'function') renderAdmin();
  } catch(e) {
    console.warn('Offline o errore:', e);
  }
}

async function createDataFile() {
  // Prepariamo il contenuto da salvare (questo rimane uguale)
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(appData, null, 2))));
  
  try {
    // Chiamiamo il Worker inviando il contenuto nel body della richiesta
    const res = await fetch(WORKER_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content }) 
    });
    
    const json = await res.json();
    dataFileSha = json.content?.sha;
    console.log("File salvato con successo!");
  } catch(e) { 
    console.warn("Errore durante il salvataggio:", e); 
  }
}

//window.addEventListener('DOMContentLoaded', loadData);
