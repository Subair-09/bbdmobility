const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const targetDir = path.resolve('public/assets/portal');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const uploadedDir = 'C:/Users/USER/.gemini/antigravity/brain/a8de8f11-f9d4-4588-979d-ff06ff6a097f/.user_uploaded';

  // Copy full files
  fs.copyFileSync(path.join(uploadedDir, 'media_1793209318406_a179b3db.png'), path.join(targetDir, 'admin-login-full.png'));
  fs.copyFileSync(path.join(uploadedDir, 'media_1793209335323_e3a1584a.jpg'), path.join(targetDir, 'rider-login-full.jpg'));
  fs.copyFileSync(path.join(uploadedDir, 'media_1793209408812_fd40c329.jpg'), path.join(targetDir, 'admin-dashboard-full.jpg'));
  fs.copyFileSync(path.join(uploadedDir, 'media_1793209424787_9675beac.png'), path.join(targetDir, 'admin-bookings-full.png'));
  fs.copyFileSync(path.join(uploadedDir, 'media_1793209450578_b17b5ef7.png'), path.join(targetDir, 'admin-riders-full.png'));

  // Also extract cropped hero backdrop and motorcycle widget using headless chrome canvas
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  // Read base64 of admin-login-full.png
  const adminLoginBase64 = fs.readFileSync(path.join(targetDir, 'admin-login-full.png')).toString('base64');
  const dashboardBase64 = fs.readFileSync(path.join(targetDir, 'admin-dashboard-full.jpg')).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;">
        <canvas id="c1" width="512" height="682"></canvas>
        <canvas id="c2" width="160" height="150"></canvas>
      </body>
    </html>
  `);

  const crops = await page.evaluate(async (adminB64, dashB64) => {
    function cropImage(b64, sx, sy, sw, sh, dw, dh) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = dw;
          canvas.height = dh;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    // Left login hero crop (0 to 512, full height)
    const loginHero = await cropImage(adminB64, 0, 0, 512, 682, 600, 800);
    // Sidebar motorcycle card from dashboard (x: 10, y: 520, w: 155, h: 140)
    const sidebarCard = await cropImage(dashB64, 10, 520, 155, 140, 310, 280);

    return { loginHero, sidebarCard };
  }, adminLoginBase64, dashboardBase64);

  // Write crops to public/assets/portal/
  fs.writeFileSync(
    path.join(targetDir, 'portal-hero-backdrop.png'),
    Buffer.from(crops.loginHero.split(',')[1], 'base64')
  );
  fs.writeFileSync(
    path.join(targetDir, 'sidebar-bike-card.png'),
    Buffer.from(crops.sidebarCard.split(',')[1], 'base64')
  );

  await browser.close();
  console.log('Successfully extracted portal assets!');
}

main().catch(console.error);


// Append bike crop
async function extractBikePreview() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const profileImgPath = 'C:/Users/USER/.gemini/antigravity/brain/a8de8f11-f9d4-4588-979d-ff06ff6a097f/.user_uploaded/media_1793210066548_85f31869.png';
  if (fs.existsSync(profileImgPath)) {
    const profileB64 = fs.readFileSync(profileImgPath).toString('base64');
    await page.setContent('<html><body></body></html>');
    const bikeCrop = await page.evaluate(async (b64) => {
      return new Promise(res => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = 300;
          c.height = 180;
          const ctx = c.getContext('2d');
          // In 1024x682: bike photo is located inside vehicle card: x: 456, y: 524, w: 145, h: 90
          ctx.drawImage(img, 456, 520, 145, 95, 0, 0, 300, 180);
          res(c.toDataURL('image/png'));
        };
        img.src = 'data:image/png;base64,' + b64;
      });
    }, profileB64);

    fs.writeFileSync('public/assets/portal/rider-bike-preview.png', Buffer.from(bikeCrop.split(',')[1], 'base64'));
    console.log('Successfully saved rider-bike-preview.png');
  }
  await browser.close();
}

extractBikePreview().catch(console.error);
