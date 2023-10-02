const filePathBtn = document.getElementById('filebutton');
const filePathElement = document.getElementById('filepath');
const submitBtn = document.getElementById('submit');
const taskNameInput = document.getElementById('task-name');
const schedParams = document.getElementById('sched-params');

filePathBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    filePathElement.innerText = filePath;
})


submitBtn.addEventListener('click', async () => {
    const targetDir = await window.electronAPI.openFile()   
    filePathElement.innerText = targetDir;

    const taskName = taskNameInput.value;
    const scheduleParameters = schedParams.value;

    // Send task name and schedule parameters to the main process
    window.electronAPI.scheduleTask({ taskName, scheduleParameters });
})