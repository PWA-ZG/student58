navigator.serviceWorker.register('./sw.js')
.then(reg => console.log('SW registered!', reg))
.catch(err => console.log('Error priliko registracije SW-a', err));

async function handleSubmit(event){
    // ZAUSTAVIT CE SLANJE FORME PREMA BACKEND-U
    event.preventDefault();

    let taskTitle = document.getElementById('taskTitle').value;
    let taskDescription = document.getElementById('taskDescription').value;
    let dueDateTime = document.getElementById('dueDateTime').value;
    await getImageString();
    let imageInput = localStorage.getItem('imageDataUrl');
    localStorage.removeItem('imageDataUrl');
    
    if (typeof Storage !== "undefined") {
        let tasks = [];
        
        if (localStorage.tasks) {
            tasks = JSON.parse(localStorage.tasks);
        }
        
        let newTask = {
            taskTitle: taskTitle,
            taskDescription: taskDescription,
            dueDateTime: dueDateTime,
            imageInput: imageInput
        };
        
        tasks.push(newTask);
        
        // SPREMA OSVJEZENE TASKOVE U LOCAL STORAGE
        localStorage.tasks = JSON.stringify(tasks);
    } else {
        console.log("Web preglednik ne podržava HTML5 Web Storage API");
    }

    // PODACI IZ LOCAL STORAGE-A SE SALJU SERVICE WORKER-U
    await sendDataToServiceWorker();

    // TREBA NAPRAVITI BACKGROUND SYNC KADA SE DODA NOVI TASK U STORAGE
    if ("serviceWorker" in navigator && "SyncManager" in window){
        navigator.serviceWorker.ready.then(function(swRegistration) {
            return swRegistration.sync.register('sync-tasks');
        });
    }else{
        alert("TODO - vaš preglednik ne podržava bckg sync...");
    }
    

    location.reload();
}


// SALJE PODATKE PREMA SERVICE WORKER-U
function sendDataToServiceWorker() {
    navigator.serviceWorker.controller.postMessage({
      type: 'localStorageData',
      data: localStorage.tasks
    });
  }


async function listTasks() {
    let tasks = [];

    if (localStorage.tasks) {
        tasks = JSON.parse(localStorage.tasks);
    }

    const tableContainer = document.getElementById('tableContainer');

    const table = document.createElement('table');
    table.className = "table-data";
    table.id = "dataTable";

    const headerRow = table.insertRow();
    headerRow.className = "table-row-header";

    const headerCell1 = headerRow.insertCell(0);
    const headerCell2 = headerRow.insertCell(1);
    const headerCell3 = headerRow.insertCell(2);
    const headerCell4 = headerRow.insertCell(3);
    const headerCell5 = headerRow.insertCell(4);
    const headerCell6 = headerRow.insertCell(5);

    headerCell1.innerHTML = 'Task Title';
    headerCell2.innerHTML = 'Task Description';
    headerCell3.innerHTML = 'Due Date and Time';
    headerCell4.innerHTML = 'Image Input';
    headerCell5.innerHTML = 'Edit';
    headerCell6.innerHTML = 'Delete';


    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        const row = table.insertRow();
        row.className = "table-row-data";

        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);
        const cell5 = row.insertCell(4);
        const cell6 = row.insertCell(5);

        cell1.innerHTML = task['taskTitle'];
        cell2.innerHTML = task['taskDescription'];
        cell3.innerHTML = task['dueDateTime'];

        const imageTag = document.createElement('img');
        imageTag.id = 'imageTag';
        imageTag.src = task['imageInput'];
        imageTag.alt = 'image ' + (i + 1);
        imageTag.style.maxWidth = '10%';
        imageTag.style.maxHeight = '10%';

        cell4.appendChild(imageTag);

        // KREIRA EDIT GUMB
        const editButton = document.createElement('button');
        editButton.className = "editButton";

        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
            let taskIDTag = document.getElementById('taskID');
            taskIDTag.value = i;
            var popupTag = document.getElementById("popup");
            document.getElementById('editTaskTitle').value = task['taskTitle'];
            document.getElementById('editTaskDescription').value = task['taskDescription'];
            document.getElementById('editDueDateTime').value = task['dueDateTime'];
            popupTag.style.visibility = "visible";

            console.log('Edit clicked for task:', task);
        });
        cell5.appendChild(editButton);

        // KREIRA DELETE GUMB
        const deleteButton = document.createElement('button');
        deleteButton.className = "delButton";

        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async function() {
            let storageTasks = [];
            if (localStorage.tasks) {
                storageTasks = JSON.parse(localStorage.tasks);
            }

            console.log(`tasks_before => ${storageTasks}`);
            storageTasks.splice(i, 1);
            localStorage.tasks = JSON.stringify(storageTasks);
            console.log('Delete clicked for task:', task);

            await sendDataToServiceWorker();

            if ("serviceWorker" in navigator && "SyncManager" in window){
                navigator.serviceWorker.ready.then(function(swRegistration) {
                    return swRegistration.sync.register('sync-tasks');
                });
            }else{
                alert("TODO - vaš preglednik ne podržava bckg sync...");
            }


            location.reload();
        });
        cell6.appendChild(deleteButton);
    }

    if (tasks.length > 0){
        const taskListHeader = document.createElement('h2');
        taskListHeader.className = "body-container-header";
        taskListHeader.innerHTML = "All tasks";
        let tableContainerTag = document.getElementById('tableContainer');
        document.body.insertBefore(taskListHeader, tableContainerTag);
        tableContainer.appendChild(table);
    }
}


function hidePopup(){
    var commentPopup = document.getElementById("popup");
    commentPopup.style.visibility = "hidden";
}


async function saveTaskEdit(event){
    // ZAUSTAVIT CE SLANJE FORME PREMA BACKEND-U
    event.preventDefault();

    console.log('spremam task edit...')
    let editTaskTitle = document.getElementById('editTaskTitle').value;
    let editTaskDescription = document.getElementById('editTaskDescription').value;
    let editDueDateTime = document.getElementById('editDueDateTime').value;
    let taskID = parseInt(document.getElementById('taskID').value);

    let tasks = JSON.parse(localStorage.tasks);
    let savedTask = tasks[taskID];
    savedTask['taskTitle'] = editTaskTitle;
    savedTask['taskDescription'] = editTaskDescription;
    savedTask['dueDateTime'] = editDueDateTime;
    tasks[taskID] = savedTask;
    localStorage.tasks = JSON.stringify(tasks);

    // PODACI IZ LOCAL STORAGE-A SE SALJU SERVICE WORKER-U
    await sendDataToServiceWorker();

    if ("serviceWorker" in navigator && "SyncManager" in window){
        navigator.serviceWorker.ready.then(function(swRegistration) {
            return swRegistration.sync.register('sync-tasks');
        });
    }else{
        alert("TODO - vaš preglednik ne podržava bckg sync...");
    }


    location.reload();
}


function handleFileSelection(event) {
    const fileInput = event.target;
    const imagePreview = document.getElementById('imagePreview');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result;
        };

        reader.readAsDataURL(fileInput.files[0]);
    }
}





//SPREMA base64 STRING KOJI ODGOVARA SLICI
async function getImageString() {
    return new Promise((resolve, reject) => {
      const input = document.getElementById('imageInput');

      if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
          const imageDataUrl = e.target.result;
          localStorage.setItem('imageDataUrl', imageDataUrl);
          resolve(imageDataUrl);
        };

        reader.readAsDataURL(input.files[0]);
      } else {
        reject(new Error('No file selected'));
      }
    });
}


