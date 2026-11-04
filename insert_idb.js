const fs = require('fs');
const content = fs.readFileSync('C:/Users/Abdulla/.gemini/antigravity/scratch/ai-it-academy/app.js', 'utf8');

const idbHelpers = `
// ============================================================
// IndexedDB — katta media fayllarni saqlash (50MB gacha)
// ============================================================
function openMediaDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('AcademyMediaDB', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('media_files');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveMediaBlob(blob) {
  const id = 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media_files', 'readwrite');
    tx.objectStore('media_files').put(blob, id);
    tx.oncomplete = () => resolve('idb://' + id);
    tx.onerror = () => reject(tx.error);
  });
}

async function getMediaBlob(idbUrl) {
  const id = idbUrl.replace('idb://', '');
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media_files', 'readonly');
    const req = tx.objectStore('media_files').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteMediaBlob(idbUrl) {
  if (!idbUrl || !idbUrl.startsWith('idb://')) return;
  const id = idbUrl.replace('idb://', '');
  const db = await openMediaDB();
  return new Promise((resolve) => {
    const tx = db.transaction('media_files', 'readwrite');
    tx.objectStore('media_files').delete(id);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

`;

const lines = content.split('\n');
const hapticIdx = lines.findIndex(l => l.includes('// Haptic feedback helper'));
console.log('Inserting at line index:', hapticIdx);
lines.splice(hapticIdx, 0, idbHelpers);
const newContent = lines.join('\n');
fs.writeFileSync('C:/Users/Abdulla/.gemini/antigravity/scratch/ai-it-academy/app.js', newContent, 'utf8');
console.log('Done. Total lines:', newContent.split('\n').length);
