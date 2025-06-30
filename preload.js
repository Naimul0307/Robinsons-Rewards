const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getServerPort: () => 3000
});
