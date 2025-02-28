const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Use contextIsolation for better security
      preload: path.join(__dirname, 'preload.js'), // Use a preload script
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
}

// Function to get local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Fallback to localhost
}

const localIP = getLocalIP();
const port = 3000; // Fixed port. Ensure server.js uses the same port.

function startServer() {
  exec('node server.js', (err, stdout, stderr) => {
    if (err) {
      console.error('Error starting server.js:', err);
      return;
    }
    if (stderr) {
      console.error('stderr:', stderr);
    }
    console.log(`Server running on http://${localIP}:${port}`);
    console.log('stdout:', stdout);
  });
}

// Start the server when Electron is ready
app.whenReady().then(() => {
  startServer(); // Start the server
  createWindow(); // Create the Electron window
});

// Handle window closing behavior
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
