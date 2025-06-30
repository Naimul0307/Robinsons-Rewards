const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const QRCode = require('qrcode');

let mainWindow;
const port = 3000; // You can change this if needed

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

function startServer() {
  const serverApp = express();
  serverApp.use(express.json({ limit: '10mb' }));
  serverApp.use(express.static(path.join(__dirname, 'public')));

  const captureDir = path.join(__dirname, 'public', 'image', 'capture');
  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
  }

  serverApp.post('/save-image', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image data received' });

    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const fileName = `capture_${Date.now()}.png`;
    const filePath = path.join(captureDir, fileName);
    const imageUrl = `http://${localIP}:${port}/image/capture/${fileName}`;

    fs.writeFile(filePath, base64Data, 'base64', async (err) => {
      if (err) {
        console.error('Error saving image:', err);
        return res.status(500).json({ error: 'Failed to save the image' });
      }

      try {
        const qrCodeData = await QRCode.toDataURL(imageUrl);
        res.json({ message: 'Image saved', imageUrl, qrCode: qrCodeData });
      } catch (qrError) {
        console.error('QR Code Error:', qrError);
        res.status(500).json({ error: 'QR code generation failed' });
      }
    });
  });

  serverApp.listen(port, () => {
    console.log(`Server running at http://${localIP}:${port}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
}

app.whenReady().then(() => {
  startServer();     // Start express server directly
  createWindow();    // Create the window
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
