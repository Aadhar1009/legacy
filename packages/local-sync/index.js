const fs = require('fs');
const path = require('path');

const DROPZONE = path.join(require('os').homedir(), 'DukaanOS_Dropzone');
console.log(`[DukaanOS Daemon] Initializing Local OS Integration...`);
console.log(`[DukaanOS Daemon] Watching local directory: ${DROPZONE}`);

if (!fs.existsSync(DROPZONE)) {
  fs.mkdirSync(DROPZONE, { recursive: true });
}

// Simple polling loop to mimic a chokidar file watcher
// In a real hackathon, this would hit the API Gateway to upload the file to S3
setInterval(() => {
  const files = fs.readdirSync(DROPZONE);
  const newFiles = files.filter(f => !f.startsWith('.processed_'));
  
  if (newFiles.length > 0) {
    newFiles.forEach(file => {
      console.log(`[DukaanOS Daemon] Detected new local file: ${file}`);
      console.log(`[DukaanOS Daemon] Simulating API upload and Entity extraction...`);
      
      // Simulate processing
      setTimeout(() => {
        const processedName = `.processed_${file}`;
        fs.renameSync(path.join(DROPZONE, file), path.join(DROPZONE, processedName));
        console.log(`[DukaanOS Daemon] Successfully indexed ${file} into Business Memory!`);
      }, 2000);
    });
  }
}, 3000);

console.log(`[DukaanOS Daemon] Daemon is active. Drop any PDF or Image into the dropzone to sync with LORE.`);
