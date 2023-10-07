const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const exec = require('child_process');
const nodeWin = require('node-windows');


async function handleFileOpen (taskName) {

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

        const batScriptFileName = `folderVoider_${taskName}_voider.bat`;
        const batScriptDirectory = path.resolve(__dirname, 'voids');
        const batScriptPath = path.resolve(batScriptDirectory, batScriptFileName);

        if (!fs.existsSync(batScriptDirectory)) {
            fs.mkdirSync(batScriptDirectory);
        }
        
        fs.writeFileSync(batScriptPath, batScript);

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
    const { taskName, scheduleParameters, targetDir, timeExecution } = data;
    const modifiedTaskName = `folderVoider_${taskName}`

    const nodeScriptPath = targetDir; // Replace with the actual path to your Node.js script

    const psCommand = `
    schtasks /create /tn "${modifiedTaskName}" /tr "node '${nodeScriptPath}'" /sc "${scheduleParameters}" /st "${timeExecution}" /ru "SYSTEM"
  `;

    const scheduleBatScript = `folderVoider_${taskName}_schedule.bat`



    try {
        const scheduleDirectory = path.resolve(__dirname, 'schedules');

        if (!fs.existsSync(scheduleDirectory)) {
            fs.mkdirSync(scheduleDirectory);
        }

        const scheduleBatScriptPath = path.resolve(scheduleDirectory, scheduleBatScript);

        fs.writeFileSync(scheduleBatScriptPath, psCommand);

        await new Promise((resolve, reject) => {
            nodeWin.elevate(scheduleBatScriptPath, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error scheduling task: ${error.message}`);
                    reject(error);
                } else {
                    console.log(`Task scheduled successfully: ${stdout}`);
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('Unhandled promise rejection:', error);
    }
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

    win.loadFile('init.html')
}


app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', (event, taskName) => {
        return handleFileOpen(taskName);
    });
    createWindow()
})

// IPC communication to fetch running tasks
ipcMain.handle('getRunningTasks', async (event, args) => {
    return await listRunningTasks();
});

// Function to list running tasks
function listRunningTasks() {
    return new Promise((resolve, reject) => {
        nodeWin.elevate('schtasks /query /fo LIST /v', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            console.log(stdout);

            const tasks = parseTaskList(stdout);
            const folderVoiderTasks = tasks.filter(task => task.startsWith('folderVoider'));
            resolve(folderVoiderTasks);
        });
    });
}

function parseTaskList(output) {
    // Parse the output and extract relevant information
    // Modify this based on the actual output format of schtasks
    // For example, split by line breaks and extract necessary information
    const lines = output.split('\n');
    const tasks = [];

    for (const line of lines) {
        // Parse each line and extract relevant information
        // Example: Check if the line contains task name or other relevant details
        if (line.includes('TaskName:')) {
            tasks.push(line.trim().substring('TaskName:'.length));
        }
        // Add more conditions for other information as needed
    }

    return tasks;
}