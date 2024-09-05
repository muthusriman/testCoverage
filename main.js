const input = document.querySelector("#input");
const add = document.querySelector(".add");
const taskList = document.querySelector(".task-list");
const alert = document.querySelector(".alert");
const noTasksMessage = document.querySelector(".empty");
const taskCounter = document.querySelector("#task-counter");
const tabs = document.querySelectorAll(".status-btn");
const line = document.querySelector(".line");
const clearButton = document.querySelector(".clear-btn");

let todos = [];
let filter = "all";

// Load tasks from localStorage when the window loads
window.onload = () => {
  todos = JSON.parse(localStorage.getItem("todos")) || [];
  renderTasks();
  updateLine();
};

// Update the position and width of the active tab indicator on window resize
window.onresize = updateLine;

function updateLine() {
  const activeTab = document.querySelector(".status-btn.active");
  line.style.width = `${activeTab.offsetWidth}px`;
  line.style.left = `${activeTab.offsetLeft}px`;
}

// Event listeners for adding a task via button click or Enter key
add.addEventListener("click", taskInput);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){
    taskInput();
  }
  else{
    return;
  }
});

function taskInput() {
  if (input.value.trim() === "") {
    showAlert("Please enter a task before adding!", "red");
  } else {
    const taskName = input.value.trim();
    const newTask = { name: taskName, completed: false, id: Date.now() };
    todos.push(newTask);
    localStorage.setItem("todos", JSON.stringify(todos));
    showAlert("Task added successfully!", "green");
    input.value = "";
    filter = "all"; 
    renderTasks(); 
    tabs.forEach((tab) => tab.classList.remove("active")); 
    const allTab = Array.from(tabs).find((tab) => tab.textContent.trim() === "All");
    allTab.classList.add("active"); 
    updateLine(); 
  }
}

// Generate the HTML for a task item
function defaultTaskHTML(task) {
  const checkboxIcon = task.completed
    ? "images/marked.png"
    : "images/unmarked.png";
  return `
    <span class="task-name ${task.completed ? "completed" : ""}" maxlength= "150">${
    task.name
  } </span>
    <img src="${checkboxIcon}" class="checkbox-icon" id="check-${
    task.id
  }" title="Check-box">
    <img src="images/edit_icon.png" alt="Edit" class="edit" title="Edit">
    <img src="images/save_icon.png" alt="Save" class="save" style="display:none;">
    <img src="images/remove_icon.png" alt="Delete" class="rem" title="Delete">
  `;
}

// Generate the HTML for a task item in edit mode
function editTaskHTML(task) {
  const checkboxIcon = task.completed
    ? "images/marked.png"
    : "images/unmarked.png";
  return `
    <input type="text" class="edit-input" value="${task.name}" maxlength= "150">
    <img src="${checkboxIcon}" class="checkbox-icon" title="Check-box" id="check-${task.id}">
    <img src="images/save_icon.png" alt="Save" class="save" title="Save">
    <img src="images/remove_icon.png" alt="Delete" class="rem" title="Delete">
  `;
}

// Add a task item to the task list
function addTask(task) {
  const li = document.createElement("li");
  li.innerHTML = defaultTaskHTML(task);
  taskEventListeners(li, task.id);
  taskList.appendChild(li);
}

// Add event listeners to task item elements
function taskEventListeners(li, taskId) {
  const remBtn = li.querySelector(".rem");
  const editBtn = li.querySelector(".edit");
  const checkboxIcon = li.querySelector(".checkbox-icon");

  remBtn.addEventListener("click", () => removeTask(taskId));
  editBtn.addEventListener("click", () => editTask(li, taskId));
  checkboxIcon.addEventListener("click", () => toggleComplete(taskId));
}

// Find the index of a task in the todos array
function findTaskIndex(taskId) {
  return todos.findIndex((todo) => todo.id === taskId);
}

// Remove a task from the task list and localStorage
function removeTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    todos = todos.filter((todo) => todo.id !== taskId);
    localStorage.setItem("todos", JSON.stringify(todos));

    // Remove blur from all tasks
    Array.from(taskList.children).forEach((taskItem) => {
      taskItem.classList.remove("task-blur");
    });
    clearButton.disabled = false; // Enable the clear button
    clearButton.classList.remove("disabled-button"); // Remove disabled-button class
    add.disabled = false; // Enable the add button
    add.classList.remove("disabled-button"); // Remove disabled-button class
    renderTasks();
    setTimeout(() => showAlert("Task removed successfully!", "green"), 0);
  } else {
    setTimeout(() => showAlert("Task removal canceled!", "red"), 0);
  }
}

// Disable or enable features during editing
function disableFeatures(disable = true) {
  // Disable or enable status buttons and delete buttons
  tabs.forEach((tab) => {
    tab.disabled = disable;
    tab.classList.toggle("disabled-button", disable);
  });

  const deleteButtons = document.querySelectorAll(".rem");
  deleteButtons.forEach((button) => {
    button.disabled = disable;
    button.classList.toggle("disabled-button", disable);
  });

  // Disable or enable add button
  add.disabled = disable;
  add.classList.toggle("disabled-button", disable);

  // Disable or enable clear button
  clearButton.disabled = disable;
  clearButton.classList.toggle("disabled-button", disable);

  // Add or remove event listener for add button
  if (disable) {
    add.removeEventListener("click", taskInput);
  } else {
    add.addEventListener("click", taskInput);
  }
}

// Edit a task item
function editTask(li, taskId) {
  const taskIndex = findTaskIndex(taskId);
  const currentTask = todos[taskIndex];

  li.innerHTML = editTaskHTML(currentTask);

  input.disabled = true;
  disableFeatures(); // Disable features during editing

  li.classList.add("task-highlight"); // Highlight the selected task

  const editInput = li.querySelector(".edit-input");
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);


  const remBtn = li.querySelector(".rem");
  const saveBtn = li.querySelector(".save");
  const enterBtn = li.querySelector(".edit-input");

  remBtn.disabled = true; // Disable remove button during edit

  saveBtn.addEventListener("click", () => saveTask(li, taskId));
  enterBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){
      saveTask(li, taskId);
    }
    else{
      return;
    }
  });

  // Blur all other tasks except the one being edited
  Array.from(taskList.children).forEach((taskItem) => {
    if (taskItem !== li) {
      taskItem.classList.add("task-blur");
    }
  });
}

// Save the edited task item
function saveTask(li, taskId) {
  const inputField = li.querySelector(".edit-input");
  const newTaskName = inputField.value.trim();

  if (newTaskName === "") {
    showAlert("Task cannot be empty!", "red");
    return;
  }

  const taskIndex = findTaskIndex(taskId);
  todos[taskIndex].name = newTaskName;
  localStorage.setItem("todos", JSON.stringify(todos));

  li.innerHTML = defaultTaskHTML(todos[taskIndex]);
  taskEventListeners(li, taskId);

  input.disabled = false;
  disableFeatures(false); // Re-enable features after editing

  li.classList.remove("task-highlight"); // Remove highlight from the selected task

  showAlert("Task updated successfully!", "green");
  renderTasks();

  // Remove blur from all tasks
  Array.from(taskList.children).forEach((taskItem) => {
    taskItem.classList.remove("task-blur");
  });

  // Re-enable remove button after saving
  const remBtn = li.querySelector(".rem");
  remBtn.disabled = false;
}

// Toggle the completion status of a task item
function toggleComplete(taskId) {
  const taskIndex = findTaskIndex(taskId);
  todos[taskIndex].completed = !todos[taskIndex].completed;
  localStorage.setItem("todos", JSON.stringify(todos));
  showAlert(
    todos[taskIndex].completed
      ? "Task marked as completed!"
      : "Task marked as incomplete!",
    "green"
  );
  renderTasks();
}

// Render the task list based on the current filter
function renderTasks() {
  taskList.innerHTML = "";
  let filteredTodos = todos;
  
  if (filter === "assigned") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (filter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  filteredTodos.forEach((todo) => addTask(todo));
  noTasks();
  updateCounter();
}

// Clear all tasks based on the current filter
function clearAllTasks() {
  let tasksToRemove = [];

  if (filter === "assigned") {
    tasksToRemove = todos.filter((todo) => !todo.completed);
  } else if (filter === "completed") {
    tasksToRemove = todos.filter((todo) => todo.completed);
  } else {
    tasksToRemove = todos.slice();
  }

  if (tasksToRemove.length === 0) {
    showAlert("No tasks to clear in this section!", "red");
    return;
  }

  if (confirm("Are you sure you want to clear these tasks?")) {
    todos = todos.filter((todo) => !tasksToRemove.includes(todo));
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTasks();

    clearButton.disabled = false; // Enable the clear button
    clearButton.classList.remove("disabled-button"); // Remove disabled-button class
    add.disabled = false; // Enable the add button
    add.classList.remove("disabled-button"); // Remove disabled-button class
    setTimeout(() => showAlert("Tasks cleared successfully!", "green"), 0);
  } else {
    setTimeout(() => showAlert("Task clearing canceled!", "red"), 0);
  }
}

// Show an alert message
function showAlert(message, color) {
  alert.textContent = message;
  alert.className = `alert ${color}`;
  alert.style.visibility = "visible";
  setTimeout(() => {
    alert.style.visibility = "hidden";
  }, 3000);
}

// Event listeners for status tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    tabs.forEach((tab) => tab.classList.remove("active"));
    e.target.classList.add("active");
    updateLine();
  });
});

// Filter tasks based on the selected status
function filterTasks(type) {
  filter = type;
  renderTasks();
}

// Update the "no tasks" message visibility
function noTasks() {
  noTasksMessage.style.display = taskList.children.length === 0 ? "" : "none";
}

// Update the task counter
function updateCounter() {
  const assignedTasks = todos.filter((todo) => !todo.completed).length;
  taskCounter.textContent = assignedTasks;
}

// Export functions
module.exports = {
  updateLine,
  taskInput,
  defaultTaskHTML,
  editTaskHTML,
  addTask,
  taskEventListeners,
  findTaskIndex,
  removeTask,
  disableFeatures,
  editTask,
  saveTask,
  toggleComplete,
  renderTasks,
  clearAllTasks,
  showAlert,
  filterTasks,
  noTasks,
  updateCounter
};