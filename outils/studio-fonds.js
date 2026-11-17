// Casa Studio : enregistre les 4 fonds par défaut (dessinés par outils/studio-fonds.html) dans assets/studio/.
// Usage : node outils/studio-fonds.js   (nécessite Playwright + Chromium)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const racine = path.resolve(__dirname, '..');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(racine, 'outils/studio-fonds.html'));
  await p.waitForFunction(() => window.pret === true);
  fs.mkdirSync(path.join(racine, 'assets/studio'), { recursive: true });
  for (const id of ['gold-edition', 'classic-microphone', 'studio-session', 'warm-studio']) {
    for (const [suf, W, H] of [['portrait', 1080, 1920], ['paysage', 1920, 1080]]) {
      const url = await p.evaluate(([i, w, h]) => window.dessiner(i, w, h), [id, W, H]);
      const f = path.join(racine, 'assets/studio', id + '-' + suf + '.jpg');
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
      console.log(f, fs.statSync(f).size);
    }
  }
  await b.close();
})();
