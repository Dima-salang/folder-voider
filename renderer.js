
const submitBtn = document.getElementById('submit');
const taskNameInput = document.getElementById('task-name');
const schedParams = document.getElementById('sched-params');

submitBtn.addEventListener('click', async () => {


    const taskName = taskNameInput.value;
    const scheduleParameters = schedParams.value;

    const targetDir = await window.electronAPI.openFile(taskName)   

    // Send task name and schedule parameters to the main process
    window.electronAPI.scheduleTask({ taskName, scheduleParameters });
})