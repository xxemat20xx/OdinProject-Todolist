import { TaskHandler } from "../taskManager/tasks";
export class ProjectManager {
    constructor() {
        // DOM ELEMENT
        this.projectPopupContainer = document.getElementsByClassName('project-popup-container')[0];
        this.projectPopupBtn = document.getElementById('project-popupBtn');
        this.closeProjectPopupBtn = document.getElementById('closeProjectPopupBtn');
        this.projectInput = document.getElementById('projectInput');
        this.addProject = document.getElementById('addProjectBtn');
        this.projectList = document.getElementsByClassName('project-lists')[0];
        this.projectForm = document.getElementById('taskForm');
        this.projectModal = document.getElementById('taskModal');

        // project local storage
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        if (this.projects.length === 0) {
            this.projects.push({
                id: 123, // Assign a fixed ID
                projectTitle: "Default Project",
            });
            this.saveProjectToLocalStorage(); // Save the updated tasks array
        }   
        // Bind Event listener
        this.addEventListeners();

        // render project
        this.renderProjects();


    }
    addEventListeners() {
        this.projectPopupBtn.addEventListener('click', () => this.openProjectPopup());
        this.closeProjectPopupBtn.addEventListener('click', () => this.closeProjectPopup());
        this.addProject.addEventListener('click', () => this.saveNewProject());

        this.projectForm.onsubmit = (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const dueDate = document.getElementById('dueDate').value;
            const isImportant = document.getElementById('isImportant').checked;
            const projectTask = new TaskHandler();

            if (dueDate) {
                projectTask.addTask(title, description, dueDate, isImportant);
                projectTask.closeModal();
                this.projectForm.reset();
            }
        };
    }
    openProjectPopup() {
        this.projectPopupContainer.style.display = 'block';
    }
    closeProjectPopup() {
        this.projectPopupContainer.style.display = 'none';
    }
    saveProjectToLocalStorage() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }
    saveNewProject(projectTitle) {
        const projectTask = new TaskHandler();
        projectTitle = this.projectInput.value.trim();
        if (projectTitle === '') return alert('Please enter a new project.');
        const projectList = {
            id: Date.now(),
            projectTitle
        }
        this.projects.push(projectList);
        this.saveProjectToLocalStorage();
        this.renderProjects();
        this.projectInput.value = "";
        this.closeProjectPopup();
        projectTask.msNotif("added-task-msg", "+ Added new project. ")
    }
    renderProjects() {
        this.projectList.innerHTML = "";
        const currentProject = this.projects;

        currentProject.forEach(project => {
            const newProject = document.createElement('div');
            const maxLength = 25;
            const truncatedTitle = project.projectTitle.length > maxLength
                ? project.projectTitle.substring(0, maxLength) + '...'
                : project.projectTitle;
            newProject.className = "project-list";
            newProject.innerHTML = `
                        <span id="project-title" data-id='${project.id}'><i class='bx bxs-rocket'></i><span>${truncatedTitle}</span></span>
                        <button class='project-list-btn btn' id='deleteProjectBtn'><i class='bx bxs-trash'></i></button>
            `;
            this.projectList.appendChild(newProject);
        });
        const projectListBtn = document.querySelectorAll('#project-title');
        projectListBtn.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const projectId = event.target.parentElement.dataset.id;
                this.openProjectForm(projectId);
              
            });
        });
        const deleteProjectBtn = document.querySelectorAll('#deleteProjectBtn');
        deleteProjectBtn.forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteProject(index));
        });
    }
    openProjectForm(id) {
        const project = this.projects.find((t) => t.id === parseInt(id));
        if (project) {
            document.getElementById('title').value = project.projectTitle;
            this.projectModal.style.display = 'flex';
        }
    }
    deleteProject(index) {
        this.projects.splice(index, 1);
        this.saveProjectToLocalStorage();
        this.renderProjects();
    }
    
}
const projectApp = new ProjectManager();
