const WORKER_URL = "https://ecco-perche-ti-amo.p6kw2n4wh4.workers.dev/";
var dataFileSha = null;

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

    if (!Array.isArray(appData.nicknames)) {
      appData.nicknames = Object.values(appData.nicknames || {});
    }
    if (!appData.messages) appData.messages = {};
    if (!Array.isArray(appData.openedDates)) appData.openedDates = [];

    console.log("Dati caricati!");
    try { renderAdmin(); } catch(e) {}

  } catch(e) {
    console.warn('Offline o errore:', e);
  }
}

async function createDataFile() {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(appData, null, 2))));
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const json = await res.json();
    dataFileSha = json.content?.sha;
    console.log("File creato con successo!");
  } catch(e) {
    console.warn("Errore durante la creazione:", e);
  }
}
async function saveData(statusId) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(appData, null, 2))));
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${DATA_FILE}`,
      {
        method: 'PUT',
        headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'update data', content, sha: dataFileSha })
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    dataFileSha = json.content.sha;
    showStatus(statusId, 'Salvato', 'ok');
  } catch(e) { showStatus(statusId, 'Errore nel salvataggio', 'err'); }
}
