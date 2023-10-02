const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const exec = require('child_process');
const nodeWin = require('node-windows');


async function handleFileOpen () {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (!canceled) {
        const batScript = `
        @echo off
        if exist "${filePaths[0]}" (
            del /q "${filePaths[0]}\\*.*"
        ) else (
            echo Directory not found at "${filePaths[0]}"
        )

        pause
        `;

        const batScriptFileName = 'voider.bat';
        const batScriptPath = path.resolve(__dirname, batScriptFileName);
        
        fs.writeFileSync(batScriptPath, batScript);

        nodeWin.elevate(batScriptPath, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing batch script: ', error);
                return;
            }
            console.log(`Script output: ${stdout}`);
            console.error(`Script errors: ${stderr}`);
        })
        console.log('batch script created.')

        // Listen for the 'scheduleTask' message from the renderer process
        ipcMain.once('scheduleTask', (event, data) => {
            data.targetDir = batScriptPath
            console.log('Received task data: ', data);
            scheduleTask(data);
        });

        return filePaths[0]
    }
}

async function scheduleTask(data) {
    const { taskName, scheduleParameters, targetDir } = data;

    const nodeScriptPath = targetDir; // Replace with the actual path to your Node.js script

    const psCommand = `
    schtasks /create /tn "${taskName}" /tr "node '${nodeScriptPath}'" /sc "${scheduleParameters}" /st "12:00" /ru "SYSTEM"
  `;

    const scheduleBatScript = 'schedule.bat'
    const scheduleBatScriptPath = path.resolve(__dirname, scheduleBatScript);

    fs.writeFileSync(scheduleBatScriptPath, psCommand)

  console.log(psCommand)

    nodeWin.elevate(scheduleBatScriptPath, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error scheduling task: ${error.message}`);
            return;
        }
        console.log(`Task scheduled successfully: ${stdout}`);
    });
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}


app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    createWindow()
})