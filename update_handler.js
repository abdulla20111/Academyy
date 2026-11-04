const fs = require('fs');
const content = fs.readFileSync('C:/Users/Abdulla/.gemini/antigravity/scratch/ai-it-academy/app.js', 'utf8');

const oldBlock = `    // Rasm va kichik fayllar uchun base64 (5MB gacha)\r
    if (file.size <= 5 * 1024 * 1024) {\r
      try {\r
        const base64 = await fileToBase64(file);\r
        addMediaAttachmentRow(type, base64, file.name);\r
      } catch (err) {\r
        showToast('Fayl o\\'qishda xatolik ❌');\r
      }\r
    } else {\r
      showToast(\`\${file.name} juda katta (5MB dan oshmasin) ⚠️\`);\r
    }`;

const newBlock = `    // 50MB gacha fayllarni qo'llab-quvvatlash (IndexedDB orqali)
    if (file.size <= 50 * 1024 * 1024) {
      try {
        if (file.size <= 2 * 1024 * 1024) {
          // Kichik fayllar: base64 (localStorage)
          const base64 = await fileToBase64(file);
          addMediaAttachmentRow(type, base64, file.name);
        } else {
          // Katta fayllar: IndexedDB (Blob sifatida)
          showToast(\`\${file.name} yuklanmoqda... ⏳\`);
          const idbUrl = await saveMediaBlob(file);
          addMediaAttachmentRow(type, idbUrl, file.name);
          showToast(\`\${file.name} saqlandi ✅\`);
        }
      } catch (err) {
        console.error('Media save error:', err);
        showToast('Fayl saqlashda xatolik ❌');
      }
    } else {
      showToast(\`\${file.name} juda katta (50MB dan oshmasin) ⚠️\`);
    }`;

if (!content.includes(oldBlock)) {
  console.error('OLD BLOCK NOT FOUND!');
  process.exit(1);
}

const newContent = content.replace(oldBlock, newBlock);
fs.writeFileSync('C:/Users/Abdulla/.gemini/antigravity/scratch/ai-it-academy/app.js', newContent, 'utf8');
console.log('File handler updated successfully!');
