const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf8");
const Chance = require("chance");
const chance = new Chance();

describe("To-Do List", () => {
  let input,
    add,
    taskList,
    alert,
    noTasksMessage,
    taskCounter,
    tabs,
    clearButton;

  beforeEach(() => {
    // Load the HTML file and set up DOM elements
    document.documentElement.innerHTML = html.toString();
    document.body.innerHTML = html;

    input = document.querySelector("#input");
    add = document.querySelector(".add");
    taskList = document.querySelector(".task-list");
    alert = document.querySelector(".alert");
    noTasksMessage = document.querySelector(".empty");
    statusButtons = document.querySelectorAll(".status-row button");
    taskCounter = document.querySelector("#task-counter");
    tabs = document.querySelectorAll(".status-btn");
    line = document.querySelector(".line");
    clearButton = document.querySelector(".clear-btn");

    // Reset modules and load the main JavaScript file
    jest.resetModules();
    ({
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
      updateCounter,
    } = require("./main.js"));

    // Mock localStorage
    const mockLocalStorage = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => (store[key] = value.toString()),
        clear: () => (store = {}),
        removeItem: (key) => delete store[key],
      };
    })();
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    localStorage.clear();
    window.onload();
  });

  afterEach(() => {
    localStorage.clear();   
  });

  const getTasks = () => document.querySelectorAll(".task-list li");
  const getStoredTodos = () => JSON.parse(localStorage.getItem("todos")) || [];

  const generateInputs = () => {
    const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialCharacters = "!@#$%^&*()_+-=~`[]{}|;:,.<>?/\\";
    const length = 15; //Math.floor(Math.random() * 150) + 1
  
    const generateInput = (type) => {
      switch (type) {
        case "alphabets":
          return chance.string({ length, pool: alphabets });
        case "numbers":
          return chance.string({ length, pool: numbers });
        case "special":
          return chance.string({ length, pool: specialCharacters });
        case "alphabets_numbers":
          return chance.string({ length, pool: alphabets + numbers });
        case "alphabets_special":
          return chance.string({ length, pool: alphabets + specialCharacters });
        case "numbers_special":
          return chance.string({ length, pool: numbers + specialCharacters });
        case "all":
          return chance.string({ length, pool: alphabets + numbers + specialCharacters });
        case "empty":
          return "";
        case "spaces":
          return " ".repeat(length);
        default:
          return "";
      }
    };
  
    const inputTypes = ["alphabets", "numbers", "special", "alphabets_numbers", "alphabets_special", "numbers_special", "all"];
    const invalidTypes = ["empty", "spaces"];
  
    const validInputs = generateInput(chance.pickone(inputTypes));
    const invalidInputs = generateInput(chance.pickone(invalidTypes));
  
    return { validInputs, invalidInputs };
  };

  describe("HTML Structure", () => {
    it("should verify the structure and attributes of the HTML document", () => {
      // General Elements
      const alert = document.querySelector(".alert");
      expect(alert).toBeTruthy();

      const container = document.querySelector(".container");
      expect(container).toBeTruthy();

      // Header Section
      const head = document.querySelector(".head");
      const header = head.querySelector("h1");
      expect(head).toBeTruthy();
      expect(header).toBeTruthy();
      expect(header.textContent).toBe("To-Do List");

      // Input Row
      const inputRow = document.querySelector(".input-row");
      expect(inputRow).toBeTruthy();

      const input = document.querySelector("#input");
      expect(input).toBeTruthy();
      expect(input.disabled).toBeFalsy();
      expect(input.getAttribute("placeholder")).toBe("Enter a new task");
      expect(input.textContent).toBe("");
      expect(input.getAttribute("maxlength")).toBe("150");
      expect(input.getAttribute("autocomplete")).toBe("off");

      const add = document.querySelector(".add");
      const addButton = window.getComputedStyle(add);
      expect(add).toBeTruthy();
      expect(add.disabled).toBeFalsy();
      expect(addButton.getPropertyValue("display")).not.toBe("none");
      expect(addButton.getPropertyValue("visibility")).not.toBe("hidden");
      expect(add.getAttribute("src")).toBe("images/add_icon.png");
      expect(add.getAttribute("alt")).toBe("Add");
      expect(add.getAttribute("title")).toBe("Add Task");

      // Status Row
      const status = document.querySelector(".status-row");
      expect(status).toBeTruthy();

      const buttons = status.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.type).toBe("submit");
        expect(button.disabled).toBeFalsy();
      });

      const allBtn = document.querySelector("#allBtn");
      const assignedBtn = document.querySelector("#assignedBtn");
      const completedBtn = document.querySelector("#completedBtn");
      expect(allBtn).toBeTruthy();
      expect(allBtn.textContent).toBe("All");
      expect(allBtn.getAttribute("title")).toBe("All Tasks");
      expect(assignedBtn).toBeTruthy();
      expect(assignedBtn.textContent).toBe("Assigned");
      expect(assignedBtn.getAttribute("title")).toBe("Assigned Tasks");
      expect(completedBtn).toBeTruthy();
      expect(completedBtn.textContent).toBe("Completed");
      expect(completedBtn.getAttribute("title")).toBe("Completed Tasks");

      const line = document.querySelector(".line");
      expect(line).toBeTruthy();

      // Task List
      const taskWrap = document.querySelector(".task-wrap");
      expect(taskWrap).toBeTruthy();

      const empty = document.querySelector(".empty");
      const def = document.querySelector(".default");
      const emptyImg = empty.querySelector("img");
      const emptyImage = window.getComputedStyle(emptyImg);
      expect(empty).toBeTruthy();
      expect(emptyImg).toBeTruthy();
      expect(def).toBeTruthy();
      expect(emptyImage.getPropertyValue("display")).not.toBe("none");
      expect(emptyImage.getPropertyValue("visibility")).not.toBe("hidden");
      expect(emptyImg.getAttribute("src")).toBe("images/empty.png");
      expect(emptyImg.getAttribute("alt")).toBe("No tasks found");

      const taskList = document.querySelector(".task-list");
      expect(taskList).toBeTruthy();
      expect(taskList.textContent).toBe("");

      // Footer Section
      const foot = document.querySelector(".foot");
      expect(foot).toBeTruthy();

      const taskCounter = document.querySelector(".task-counter");
      expect(taskCounter).toBeTruthy();
      expect(taskCounter.textContent).toBe("You have 0 task to complete!");

      const clearBtn = document.querySelector(".clr");
      const clear = document.querySelector(".clear-btn");
      expect(clearBtn).toBeTruthy();
      expect(clearBtn.disabled).toBeFalsy();
      expect(clear.textContent).toBe("Clear");
      expect(clear.getAttribute("title")).toBe("Clear Tasks");
      expect(clear.type).toBe("submit");
    });
  });

  describe("Adding tasks", () => {
    let validInputs, invalidInputs;
  
    beforeEach(() => {
      const inputs = generateInputs();
      validInputs = inputs.validInputs;
      invalidInputs = inputs.invalidInputs;
    });
  
    afterEach(() => {
      input.value = "";
      taskList.innerHTML = "";
      localStorage.removeItem("todos");
    });

    const preChecks = () => {
      expect(getTasks().length).toBe(0);
      expect(getStoredTodos().length).toBe(0);
      expect(input.value).toBe("");
      expect(alert.textContent).toBe("");
    };
  
    const postChecksValidTask = (taskName) => {
      const tasks = getTasks();
      const storedTodos = getStoredTodos();
      
      expect(tasks.length).toBe(1);
      expect(tasks[0].textContent.trim()).toBe(taskName);
      expect(storedTodos.length).toBe(1);
      expect(storedTodos[0].name).toBe(taskName);
      expect(input.value).toBe("");
      expect(alert.textContent).toBe("Task added successfully!");
    };
  
    const postChecksInvalidTask = () => {
      const tasks = getTasks();
      const storedTodos = getStoredTodos();
  
      expect(tasks.length).toBe(0);
      expect(storedTodos.length).toBe(0);
      expect(alert.textContent).toBe("Please enter a task before adding!");
    };
  
    const postChecksNoTask = () => {
      expect(getTasks().length).toBe(0);
      expect(getStoredTodos().length).toBe(0);
      expect(alert.textContent).toBe("");
    };
  
    const addTaskValidate = (taskName, triggerEvent, postChecks) => {
      preChecks();
  
      input.value = taskName;
      expect(add.disabled).toBeFalsy();
  
      if (triggerEvent === "click") {
        add.click();
      } else if (triggerEvent === "Enter") {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      } else {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: triggerEvent }));
      }
  
      postChecks(taskName);
    };
  
    it("should add a new task and show the success alert when the Add button is clicked for valid inputs", () => {
      addTaskValidate(validInputs, "click", postChecksValidTask);
    });
  
    it("should add a new task and show the success alert when the Enter key is pressed for valid inputs", () => {
      addTaskValidate(validInputs, "Enter", postChecksValidTask);
    });
  
    it("should show an alert when trying to add an invalid task via Add button", () => {
      addTaskValidate(invalidInputs, "click", postChecksInvalidTask);
    });
  
    it("should show an alert when trying to add an invalid task via Enter key", () => {
      addTaskValidate(invalidInputs, "Enter", postChecksInvalidTask);
    });
  
    it("should not trigger task addition when a non-'Enter' key is pressed in the input field", () => {
      addTaskValidate("", "Escape", postChecksNoTask);
    });
  });

  describe("Toggle task", () => {
    let validInputs;
  
    beforeEach(() => {
      const inputs = generateInputs();
      validInputs = inputs.validInputs;
    });
  
    const checkTaskHTML = (task, isDefault) => {
      const html = isDefault ? defaultTaskHTML(task) : editTaskHTML(task);
      const container = document.createElement('ul');
      container.innerHTML = `<li>${html}</li>`;
  
      const taskElement = container.querySelector(".task-name");
      const checkboxIcon = container.querySelector(".checkbox-icon");
      const editIcon = container.querySelector(".edit");
      const saveIcon = container.querySelector(".save");
      const removeIcon = container.querySelector(".rem");
      const listItem = container.querySelector("li");
      const editInput = container.querySelector(".edit-input");
      expect(listItem).toBeTruthy();
  
      if (isDefault) {
        expect(taskElement).toBeTruthy();
        expect(taskElement.textContent.trim()).toBe(task.name);
        expect(taskElement.classList.contains("completed")).toBe(task.completed);
  
        expect(checkboxIcon).toBeTruthy();
        expect(checkboxIcon.src).toContain(task.completed ? "marked.png" : "unmarked.png");
  
        expect(editIcon).toBeTruthy();
        expect(editIcon.alt).toBe("Edit");
        expect(editIcon.title).toBe("Edit");
  
        expect(saveIcon.style.display).toBe("none");
  
        expect(removeIcon).toBeTruthy();
        expect(removeIcon.alt).toBe("Delete");
        expect(removeIcon.title).toBe("Delete");
      } else {
        expect(editInput).toBeTruthy();
        expect(editInput.value).toBe(task.name);
        expect(editInput.maxLength).toBe(150);
  
        expect(checkboxIcon).toBeTruthy();
        expect(checkboxIcon.src).toContain(task.completed ? "marked.png" : "unmarked.png");
  
        expect(saveIcon).toBeTruthy();
        expect(saveIcon.alt).toBe("Save");
        expect(saveIcon.title).toBe("Save");
  
        expect(removeIcon).toBeTruthy();
        expect(removeIcon.alt).toBe("Delete");
        expect(removeIcon.title).toBe("Delete");
      }
    };
  
    const toggleTask = (taskName, initialCompletionStatus, expectedCompletionStatus, expectedAlert) => {
      const task = { name: taskName, completed: initialCompletionStatus, id: 1 };
      localStorage.setItem("todos", JSON.stringify([task]));
  
      window.onload();
  
      const checkbox = document.querySelector(".checkbox-icon");
      expect(checkbox.disabled).toBeFalsy();
      checkbox.click();
  
      let updatedTasks = JSON.parse(localStorage.getItem("todos"));
      expect(updatedTasks[0].completed).toBe(expectedCompletionStatus);
      expect(alert.textContent).toBe(expectedAlert);
    };
  
    it("should generate correct HTML for a default task", () => {
      const task = { name: validInputs[0], completed: false, id: 1 };
      checkTaskHTML(task, true);
    });
  
    it("should generate correct HTML for a completed task", () => {
      const task = { name: validInputs[1], completed: true, id: 2 };
      checkTaskHTML(task, false);
    });
  
    it("should show an alert and update localStorage when task completion status is toggled to completed", () => {
      toggleTask(validInputs[0], false, true, "Task marked as completed!");
    });
  
    it("should show an alert and update localStorage when task completion status is toggled back to incomplete", () => {
      toggleTask(validInputs[0], true, false, "Task marked as incomplete!");
    });
  });  

  describe("Editing tasks", () => {
    let validInputs, invalidInputs, initialStoredTodos, originalTaskName;
  
    beforeAll(() => {
      const inputs =  generateInputs();
      validInputs = inputs.validInputs;
      invalidInputs = inputs.invalidInputs;
    });
  
    beforeEach(() => {
      initialStoredTodos = JSON.parse(localStorage.getItem("todos")) || [];
      expect(initialStoredTodos.length).toBe(0);
      expect(document.querySelectorAll(".task-list li").length).toBe(0);
      expect(alert.textContent).toBe("");
  
      originalTaskName = validInputs;
      const todos = [{ name: originalTaskName, completed: false, id: 1 }];
      localStorage.setItem("todos", JSON.stringify(todos));
      window.onload();
    });
  
    afterEach(() => {
      alert.textContent = "";
      document.querySelectorAll(".task-list li").forEach(li => li.remove());
    });
  
    const preChecks = () => {
      expect(getTasks().length).toBe(1);
      expect(getStoredTodos().length).toBe(1);
      expect(alert.textContent).toBe("");
    };
  
    const postChecksValidTask = (newTaskName) => {
      const tasks = getTasks();
      const updatedTodos = getStoredTodos();
      
      expect(tasks.length).toBe(1);
      expect(tasks[0].textContent).toContain(newTaskName);
      expect(updatedTodos[0].name).toBe(newTaskName);
      expect(alert.textContent).toBe("Task updated successfully!");
    };
  
    const postChecksInvalidTask = () => {
      expect(alert.textContent).toBe("Task cannot be empty!");
    };
  
    const postChecksNoSave = () => {
      const updatedTodos = getStoredTodos();
      expect(updatedTodos[0].name).toBe(originalTaskName);
    };
  
    const editTaskValidate = (newTaskName, triggerEvent, postCheckCallback) => {
      preChecks();
  
      document.querySelector(".edit").click();
      const editInput = document.querySelector(".edit-input");
      editInput.value = newTaskName;
  
      if (triggerEvent === "click") {
        expect(document.querySelector(".save").disabled).toBeFalsy();
        document.querySelector(".save").click();
      } else if (triggerEvent === "Enter") {
        editInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      } else {
        editInput.dispatchEvent(new KeyboardEvent("keydown", { key: triggerEvent }));
      }
  
      if (postCheckCallback) {
        postCheckCallback(newTaskName);
      }
    };
  
    it("should update task and show success alert when save button is clicked for valid inputs", () => {
      editTaskValidate(validInputs, "click", postChecksValidTask);
    });
  
    it("should update task and show success alert when Enter key is pressed for valid inputs", () => {
      editTaskValidate(validInputs, "Enter", postChecksValidTask);
    });
  
    it("should show an alert when saving a task with invalid input", () => {
      editTaskValidate(invalidInputs, "click", postChecksInvalidTask);
    });

    it("should show an alert when saving a task with invalid input", () => {
      editTaskValidate(invalidInputs, "Enter", postChecksInvalidTask);
    });
  
    it("should not save task on non-Enter key press", () => {
      editTaskValidate(validInputs, "Escape", postChecksNoSave);
    });
  
    it("should add 'task-blur' class to other tasks when editing a task", () => {
      const todos = [
        { name: validInputs, completed: false },
        { name: validInputs, completed: false },
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      window.onload();
  
      const editButtons = document.querySelectorAll(".edit");
      editButtons[0].click();
  
      const tasks = document.querySelectorAll(".task-list li");
      expect(tasks[1].classList).toContain("task-blur");
    });
  });
  
  describe("Removing tasks", () => {
    let taskName, todos;
  
    beforeAll(() => {
      const inputs = generateInputs();
      taskName = inputs.validInputs;
    });
  
    beforeEach(() => {
      todos = [{ name: taskName, completed: false, id: 1 }];
      localStorage.setItem("todos", JSON.stringify(todos));
      window.onload();
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
      alert.textContent = "";
    });
  
    const preChecks = () => {
      const taskListItems = getTasks();
      expect(taskListItems.length).toBe(1);
  
      const initialStoredTodos = getStoredTodos();
      expect(initialStoredTodos.length).toBe(1);
  
      expect(alert.textContent).toBe("");
    };
  
    const postCheckRemoveSuccess = () => {
      const taskListItems = getTasks();
      expect(taskListItems.length).toBe(0);
  
      const todosAfterRemoval = getStoredTodos();
      expect(todosAfterRemoval).toEqual([]);
  
      expect(alert.textContent).toBe("Task removed successfully!");
    };
  
    const postCheckRemoveCancel = (originalTodos) => {
      const taskListItems = getTasks();
      expect(taskListItems.length).toBe(1);
  
      const todosAfterCancellation = getStoredTodos();
      expect(todosAfterCancellation).toEqual(originalTodos);
  
      expect(alert.textContent).toBe("Task removal canceled!");
    };
  
    const removeTaskValidate = (confirmReturnValue, postCheckCallback) => {
      preChecks();
  
      jest.spyOn(window, "confirm").mockReturnValue(confirmReturnValue);
  
      const removeButton = document.querySelector(".task-list .rem");;
      removeButton.click();
  
      return new Promise((resolve) => setTimeout(() => {
        postCheckCallback(todos);
        resolve();
      }, 300));
    };
  
    it("should remove a task and show a success alert", async () => {
      await removeTaskValidate(true, postCheckRemoveSuccess);
    });
  
    it("should show alert when task removal is canceled", async () => {
      await removeTaskValidate(false, postCheckRemoveCancel);
    });
  });

  describe("Filtering tasks", () => {
    let todos;
    let validInputs;
  
    beforeEach(() => {
      const inputs = generateInputs();
      validInputs = inputs.validInputs;
      todos = [
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true }
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      window.onload();
    });
  
    afterEach(() => {
      alert.textContent = "";
    });
  
    const preChecks = () => {
      expect(getTasks().length).toBe(2);
      expect(alert.textContent).toBe("");
    };
  
    const postChecks = (expectedCount, expectedNames) => {
      const tasks = getTasks();
      expect(tasks.length).toBe(expectedCount);
  
      tasks.forEach((task, index) => {
        expect(task.textContent).toContain(expectedNames[index]);
      });
    };
  
    it("should filter tasks correctly by 'All', 'Assigned', and 'Completed'", () => {
      preChecks();

      document.querySelector("#allBtn").click();
      postChecks(2, validInputs);
  
      document.querySelector("#assignedBtn").click();
      postChecks(1, [validInputs[0]]);
  
      document.querySelector("#completedBtn").click();
      postChecks(1, [validInputs[1]]);
    });
  });
  
  describe("Clearing tasks", () => {
    let validInputs;

    beforeEach(() => {
      const inputs = generateInputs();
      validInputs = inputs.validInputs;
    });
  
    const setupTasks = (tasks) => {
      localStorage.setItem("todos", JSON.stringify(tasks));
      window.onload();
    };
  
    const clearTasks = async (tabIndex, confirmResponse, expectedCount, expectedAlert, expectedLocalStorage) => {
      tabs[tabIndex].click();
      jest.spyOn(window, "confirm").mockReturnValue(confirmResponse);
      clearButton.click();
      await new Promise((resolve) => setTimeout(resolve, 300));
  
      expect(getTasks().length).toBe(expectedCount);
      expect(alert.textContent).toBe(expectedAlert);
  
      if (expectedLocalStorage !== undefined) {
        expect(localStorage.getItem("todos")).toBe(expectedLocalStorage);
      }
    };
  
    it("should handle various scenarios for clearing tasks", async () => {
      setupTasks([
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true }
      ]);
      await clearTasks(0, true, 0, "Tasks cleared successfully!", "[]");

      setupTasks([
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true }
      ]);
      await clearTasks(0, false, 2, "Task clearing canceled!");
  
      setupTasks([]);
      await clearTasks(0, true, 0, "No tasks to clear in this section!");

      setupTasks([
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: false },
        { name: validInputs[2], completed: true }
      ]);
      await clearTasks(1, true, 0, "Tasks cleared successfully!", JSON.stringify([{ name: validInputs[2], completed: true }]));
  
      setupTasks([
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true }
      ]);
      await clearTasks(1, false, 1, "Task clearing canceled!");
  
      setupTasks([{ name: validInputs[2], completed: true }]);
      await clearTasks(1, true, 0, "No tasks to clear in this section!");
  
      setupTasks([
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true },
        { name: validInputs[2], completed: true }
      ]);
      await clearTasks(2, true, 0, "Tasks cleared successfully!", JSON.stringify([{ name: validInputs[0], completed: false }]));
  
      setupTasks([
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true }
      ]);
      await clearTasks(2, false, 1, "Task clearing canceled!");
  
      setupTasks([{ name: validInputs[0], completed: false }]);
      await clearTasks(2, true, 0, "No tasks to clear in this section!");
    });
  });

  describe("No tasks", () => {
    let validInputs;
  
    beforeEach(() => {
      const inputs = generateInputs();
      validInputs = inputs.validInputs;
      window.onload();
    });
  
    afterEach(() => {
      localStorage.clear();
      document.body.innerHTML = '';
    });
  
    it("should show 'No tasks available' message when there are no tasks", () => {
      expect(localStorage.getItem("todos")).toBeNull();
      expect(noTasksMessage.style.display).toBe("");
    });
  
    it("should hide 'No tasks available' message when tasks are present", () => {
      const todos = [{ name: validInputs[0], completed: false }];
      localStorage.setItem("todos", JSON.stringify(todos));
      window.onload();
      expect(noTasksMessage.style.display).toBe("none");
    });
  });
  
  describe("Task counter", () => {
    let todos, validInputs;
  
    beforeEach(async () => {
      const inputs = generateInputs();
      validInputs = inputs.validInputs;
    });
  
    afterEach(() => {
      localStorage.removeItem("todos");
    });
  
    const preChecks = () => {
      expect(taskCounter.textContent).toBe("0");
    };
  
    const postChecksCounter = () => {
      const counter = parseInt(taskCounter.textContent);
      expect(counter).toBe(1);
    };
  
    it("should update task counter correctly", () => {
      preChecks();
      todos = [
        { name: validInputs[0], completed: false },
        { name: validInputs[1], completed: true },
        { name: validInputs[2], completed: true },
      ];
      localStorage.setItem("todos", JSON.stringify(todos));
      window.onload();
      postChecksCounter();
    });
  });
});