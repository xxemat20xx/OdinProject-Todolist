
import { format, isToday, isThisWeek, parseISO, startOfWeek, endOfWeek, parse } from "date-fns";
import 'boxicons';

export class TaskHandler {
    constructor() {
        this.format = format;
        this.isToday = isToday;
        this.startOfWeek = startOfWeek;
        this.endOfWeek = endOfWeek;
        this.parse = parse;
        this.isTaskCompleted = false;

        // DOM ELEMENTS
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskModal = document.getElementById('taskModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.taskForm = document.getElementById('taskForm');
        this.todoList = document.getElementById('todoList');
        this.currentTaskEl = document.getElementById('currentTaskHead');
        this.taskBtn = document.getElementById('taskBtn');
        this.msgContainer = document.getElementsByClassName('message-notif-content')[0];

        // Side nav buttons
        this.allTasksBtn = document.getElementById('allTasksBtn');
        this.todaysTasksBtn = document.getElementById('todaysTasksBtn');
        this.weekTasksBtn = document.getElementById('weekTasksBtn');
        this.importantTasksBtn = document.getElementById('importantTasksBtn');
        this.completedTaskBtn = document.getElementById('completedTaskBtn');

        // Initialize tasks local storage
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        if (this.tasks.length === 0) {
            this.tasks.push({
                id: 1, // Assign a fixed ID
                title: "Default Task",
                description: "This is a default task",
                dueDate: this.format(new Date(), 'MM/dd/yyyy'), // Today's date
                isImportant: true,
                markAsDone: false
            });
            this.saveTasksToLocalStorage(); // Save the updated tasks array
        }   
        // Bind event listeners
        this.addEventListeners();

        // Initial render
        this.renderTasks();
    }
    addEventListeners() {
        this.addTaskBtn.addEventListener('click', () => {
            this.openModal();
            this.taskBtn.innerText = "Add Task"; // Reset to "Add Task"
            this.taskForm.onsubmit = this.addTaskHandler; // Restore "Add Task" functionality
        });

        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.allTasksBtn.addEventListener('click', () => this.filterAllTasks());
        this.todaysTasksBtn.addEventListener('click', () => this.filterTodaysTasks());
        this.weekTasksBtn.addEventListener('click', () => this.filterWeekTasks());
        this.importantTasksBtn.addEventListener('click', () => this.filterImportantTasks());
        this.completedTaskBtn.addEventListener('click', () => this.filterCompletedTask());

        // "Add Task" logic
        this.addTaskHandler = (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const dueDate = document.getElementById('dueDate').value;
            const isImportant = document.getElementById('isImportant').checked;
            const markAsDoneBtn = document.getElementById('markAsDoneBtn');
            if (dueDate) {
                this.addTask(title, description, dueDate, isImportant, markAsDoneBtn);
                this.closeModal();
                this.taskForm.reset();
            }

        };

        // Assigning the "Add Task" logic
        this.taskForm.onsubmit = this.addTaskHandler;
    }

    openModal() {
        this.taskModal.style.display = 'flex';
    }
    closeModal() {
        this.taskModal.style.display = 'none';
    }
    saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    addTask(title, description, dueDate, isImportant, markAsDone) {
        const task = {
            id: Date.now(),
            title,
            description,
            dueDate: this.format(new Date(dueDate), 'MM/dd/yyyy'),
            isImportant: isImportant || false,
            markAsDone: this.isTaskCompleted
        };
        this.tasks.push(task);
        this.msNotif("added-task-msg", "+ Added to the task. ");
        this.saveTasksToLocalStorage();
        this.renderTasks();
    }
    msNotif(name, msg) {
        this.msgContainer.innerHTML = `
         <div class="msg-notif-text ${name}">${msg}</div>
      `;
        setTimeout(() => {
            this.msgContainer.innerHTML = '';
        }, 3000);
    }

    renderTasks(filteredTasks = this.tasks) {
        this.todoList.innerHTML = '';

        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            li.dataset.id = task.id; // Add a data-id attribute for identification
            li.innerHTML = `
                <div>
                    <h3 id="taskTitle" class="${task.markAsDone ? "taskCompleted" : ""}">${task.title}</h3>
                    <p class="${task.markAsDone ? "taskCompleted" : ""}">${task.description}</p>
                    <p class="${task.markAsDone ? "taskCompleted" : ""}">Due: ${task.dueDate}</p>
                    ${task.isImportant ? '<strong>Important</strong>' : ''}
                    <br>
                    <sub id="markAsDoneBtn">${task.markAsDone ? 'Not completed' : 'Mark as completed'}</sub>
                </div>
                <div class="button-task-container">
                    <button class="edit-btn btn"><i class='bx bxs-pencil'></i></button>
                    <button class="delete-btn btn"><i class='bx bxs-trash' ></i></button>
                </div>
            `;
            this.todoList.appendChild(li);
            this.currentTaskEl.textContent = this.allTasksBtn.textContent;

        });

        // Attach the event listener to the todoList
        this.todoList.addEventListener('click', (event) => {
            const taskId = event.target.closest('li')?.dataset.id;
            if (!taskId) return;

            if (event.target.classList.contains('edit-btn')) {
                this.editTask(parseInt(taskId));
            } else if (event.target.classList.contains('delete-btn')) {
                this.deleteTask(parseInt(taskId));


            }
            const markAsDoneBtn = document.querySelectorAll('#markAsDoneBtn');
            markAsDoneBtn.forEach(btn => {
                btn.onclick = event => {
                    const taskId = event.target.parentElement.parentElement.dataset.id;
                    this.isTaskDone(parseInt(taskId));
                }
            });
        });
    }
    isTaskDone(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.markAsDone = !task.markAsDone;
            this.renderTasks();
            this.saveTasksToLocalStorage();
        }
    }
    editTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {

            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description;
            document.getElementById('dueDate').value = this.format(new Date(task.dueDate), 'yyyy-MM-dd');
            document.getElementById('isImportant').checked = task.isImportant;

            this.openModal();
            this.taskBtn.innerText = "Update"; // Indicate update mode

            // Temporarily override "Add Task" logic
            this.taskForm.onsubmit = (e) => {
                e.preventDefault();
                task.title = document.getElementById('title').value;
                task.description = document.getElementById('description').value;
                task.dueDate = this.format(new Date(document.getElementById('dueDate').value), 'MM/dd/yyyy');
                task.isImportant = document.getElementById('isImportant').checked;

                this.saveTasksToLocalStorage();
                this.renderTasks();
                this.closeModal();
                this.taskForm.reset();

                // Once close Restore "Add Task" functionality
                this.taskForm.onsubmit = this.addTaskHandler;
                this.taskBtn.innerText = "Add Task"; // Reset button text
                this.msNotif("updated-task-msg", "Task updated. ");
            };
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.saveTasksToLocalStorage();
        this.renderTasks();
        this.msNotif("deleted-task-msg", "<i class='bx bxs-trash'></i> Deleted to the task. ");
    }

    filterAllTasks() {
        this.renderTasks();
        this.currentTaskEl.textContent = this.allTasksBtn.textContent;
    }
    filterTodaysTasks() {
        const todaysTasks = this.tasks.filter((task) => {
            const taskDate = this.parse(task.dueDate, 'MM/dd/yyyy', new Date());
            return this.isToday(taskDate);
        });
        this.renderTasks(todaysTasks);
        this.currentTaskEl.textContent = this.todaysTasksBtn.textContent;
    }
    filterWeekTasks() {
        const startOfCurrentWeek = this.startOfWeek(new Date(), { weekStartsOn: 1 });
        const endOfCurrentWeek = this.endOfWeek(new Date(), { weekStartsOn: 1 });

        const weekTasks = this.tasks.filter((task) => {
            const taskDate = this.parse(task.dueDate, 'MM/dd/yyyy', new Date());
            return taskDate >= startOfCurrentWeek && taskDate <= endOfCurrentWeek;
        });

        this.renderTasks(weekTasks);
        this.currentTaskEl.textContent = this.weekTasksBtn.textContent;
    }
    filterImportantTasks() {
        const importantTasks = this.tasks.filter((task) => task.isImportant);
        this.renderTasks(importantTasks);
        this.currentTaskEl.textContent = this.importantTasksBtn.textContent;
    }
    filterCompletedTask() {
        const completedTask = this.tasks.filter((task) => task.isTaskCompleted = true);
        this.renderTasks(completedTask);
        this.currentTaskEl.textContent = this.completedTaskBtn.textContent;
    }

}
const todoApp = new TaskHandler();
