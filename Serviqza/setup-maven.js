const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const url = 'https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip';
const targetDir = 'E:\\Serviqza\\.tools';
const zipPath = path.join(targetDir, 'maven.zip');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Downloading Apache Maven 3.9.9...');
const file = fs.createWriteStream(zipPath);

function download(downloadUrl) {
  https.get(downloadUrl, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      download(response.headers.location);
    } else if (response.statusCode === 200) {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => extract());
      });
    } else {
      console.error('Failed to download, status code:', response.statusCode);
      process.exit(1);
    }
  }).on('error', (err) => {
    console.error('Error downloading:', err.message);
    process.exit(1);
  });
}

download(url);

function extract() {
  console.log('Download complete. Extracting Maven...');
  try {
    execSync(`tar -xf "${zipPath}" -C "${targetDir}"`, { stdio: 'inherit' });
    console.log('Maven extracted successfully via tar!');
  } catch (e) {
    console.log('tar failed, trying powershell Expand-Archive...');
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`, { stdio: 'inherit' });
    console.log('PowerShell extract finished!');
  }
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  console.log('Setup finished.');
}
