const { contextBridge } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  getLocalIP: () => {
    return fetch('/local-ip').then(response => response.json());
  },
  getPort: () => {
    return fetch('/port.json').then(response => response.json());
  }
});

