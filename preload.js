const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: (taskName) => ipcRenderer.invoke('dialog:openFile', taskName),
    scheduleTask: (data) => ipcRenderer.send('scheduleTask', data),
    getRunningTasks: () => ipcRenderer.invoke('getRunningTasks'),
})

