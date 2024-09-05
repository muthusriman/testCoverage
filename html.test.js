const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(filePath, 'utf-8');

describe('HTML Structure', () => {

  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  it('should verify the structure and attributes of the HTML document', () => {
    // General Elements
    const alert = document.querySelector('.alert');
    expect(alert).toBeTruthy();

    const container = document.querySelector('.container');
    expect(container).toBeTruthy();

    // Header Section
    const head = document.querySelector('.head');
    const header = head.querySelector('h1');
    expect(head).toBeTruthy();
    expect(header).toBeTruthy();
    expect(header.textContent).toBe('To-Do List');

    // Input Row
    const inputRow = document.querySelector('.input-row');
    expect(inputRow).toBeTruthy();

    const input = document.querySelector('#input');
    expect(input).toBeTruthy();
    expect(input.disabled).toBeFalsy();
    expect(input.getAttribute('placeholder')).toBe('Enter a new task');
    expect(input.textContent).toBe('');
    expect(input.getAttribute('maxlength')).toBe('150');
    expect(input.getAttribute('autocomplete')).toBe('off');

    const add = document.querySelector('.add');
    const addButton = window.getComputedStyle(add);
    expect(add).toBeTruthy();
    expect(add.disabled).toBeFalsy();
    expect(addButton.getPropertyValue('display')).not.toBe('none');
    expect(addButton.getPropertyValue('visibility')).not.toBe('hidden');
    expect(add.getAttribute('src')).toBe('images/add_icon.png');
    expect(add.getAttribute('alt')).toBe('Add');
    expect(add.getAttribute('title')).toBe('Add Task');

    // Status Row
    const status = document.querySelector('.status-row');
    expect(status).toBeTruthy();

    const buttons = status.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      expect(button.type).toBe('submit');
      expect(button.disabled).toBeFalsy();
    });

    const allBtn = document.querySelector('#allBtn');
    const assignedBtn = document.querySelector('#assignedBtn');
    const completedBtn = document.querySelector('#completedBtn');
    expect(allBtn).toBeTruthy();
    expect(allBtn.textContent).toBe('All');
    expect(allBtn.getAttribute('title')).toBe('All Tasks');
    expect(assignedBtn).toBeTruthy();
    expect(assignedBtn.textContent).toBe('Assigned');
    expect(assignedBtn.getAttribute('title')).toBe('Assigned Tasks');
    expect(completedBtn).toBeTruthy();
    expect(completedBtn.textContent).toBe('Completed');
    expect(completedBtn.getAttribute('title')).toBe('Completed Tasks');

    const line = document.querySelector('.line');
    expect(line).toBeTruthy();

    // Task List
    const taskWrap = document.querySelector('.task-wrap');
    expect(taskWrap).toBeTruthy();

    const empty = document.querySelector('.empty');
    const def = document.querySelector('.default');
    const emptyImg = empty.querySelector('img');
    const emptyImage = window.getComputedStyle(emptyImg);
    expect(empty).toBeTruthy();
    expect(emptyImg).toBeTruthy();
    expect(def).toBeTruthy();
    expect(emptyImage.getPropertyValue('display')).not.toBe('none');
    expect(emptyImage.getPropertyValue('visibility')).not.toBe('hidden');
    expect(emptyImg.getAttribute('src')).toBe('images/empty.png');
    expect(emptyImg.getAttribute('alt')).toBe('No tasks found');

    const taskList = document.querySelector('.task-list');
    expect(taskList).toBeTruthy();
    expect(taskList.textContent).toBe('');

    // Footer Section
    const foot = document.querySelector('.foot');
    expect(foot).toBeTruthy();

    const taskCounter = document.querySelector('.task-counter');
    expect(taskCounter).toBeTruthy();
    expect(taskCounter.textContent).toBe('You have 0 task to complete!');

    const clearBtn = document.querySelector('.clr');
    const clear = document.querySelector('.clear-btn');
    expect(clearBtn).toBeTruthy();
    expect(clearBtn.disabled).toBeFalsy();
    expect(clear.textContent).toBe('Clear');
    expect(clear.getAttribute('title')).toBe('Clear Tasks');
    expect(clear.type).toBe('submit');
  });
});
