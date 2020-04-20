import './style.css';
import Task from './task';

const addTaskBtn = document.getElementsByClassName('add-task-btn')[0];
const addTaskInput = document.getElementsByClassName('add-task')[0];
const openTaskListElement = document.getElementsByClassName(
  'todo-list-open',
)[0];
const doneTaskListElement = document.getElementsByClassName(
  'todo-list-done',
)[0];
const clearOpenList = document.getElementsByClassName('clear-open')[0];
const clearDoneList = document.getElementsByClassName('clear-done')[0];
const searchInput = document.getElementsByClassName('search')[0];
const openTaskFilter = document.getElementById('open-filter-options');
const doneTaskFilter = document.getElementById('done-filter-options');

const taskStorageId = 'tasksStorage';
const filterOptionStorageId = 'filterStorage';
const tasksMap = new Map();
let curOptionOpenTask = '';
let curOptionDoneTask = '';

const filterOptions = {
  't-asc': (a, b) => (a.text > b.text ? -1 : 1),
  't-desc': (a, b) => (a.text < b.text ? -1 : 1),
  'd-asc': (a, b) => {
    const field = a.isDone ? 'resolvedDate' : 'createdDate';
    return a[field] > b[field] ? -1 : 1;
  },
  'd-desc': (a, b) => {
    const field = a.isDone ? 'resolvedDate' : 'createdDate';
    return a[field] < b[field] ? -1 : 1;
  },
};

const updateList = (elements, list) => {
  list.innerHTML = '';
  elements.forEach(e => list.appendChild(e.html));
};

const splitTasksByStatus = records => {
  return records.reduce(
    (s, x) => {
      s[x.isDone].push(x);
      return s;
    },
    { true: [], false: [] },
  );
};

searchInput.addEventListener('input', event => {
  const text = event.target.value;
  const records = [...tasksMap.values()].filter(e => e.text.includes(text));
  const filtered_records = splitTasksByStatus(records);
  updateList(filtered_records[false], openTaskListElement);
  updateList(filtered_records[true], doneTaskListElement);
});

const sortElements = (option, status, list) => {
  const sortedTasks = [...tasksMap.values()]
    .filter(e => e.isDone === status)
    .sort(filterOptions[option]);
  updateList(sortedTasks, list);
};

openTaskFilter.addEventListener('change', event => {
  const option = event.target.value;
  sortElements(option, false, openTaskListElement);
  curOptionOpenTask = option;
  backUpFilterOption();
});

doneTaskFilter.addEventListener('change', event => {
  const option = event.target.value;
  sortElements(option, true, doneTaskListElement);
  curOptionDoneTask = option;
  backUpFilterOption();
});

const addTaskEvents = task => {
  task.trashIcon.addEventListener('click', event => {
    const taskElement = event.target.closest('li');
    const task_id = taskElement['taskId'];
    taskElement.remove();
    tasksMap.delete(task_id);
    backUpTasksToStorage();
  });
  task.checkBox.addEventListener('change', event => {
    const taskElement = event.target.closest('li');
    const task_id = taskElement['taskId'];
    const taskObj = tasksMap.get(task_id);
    if (event.target.checked) {
      taskObj.isDone = true;
      taskObj.finish();
      openTaskListElement.removeChild(taskElement);
      doneTaskListElement.appendChild(taskElement);
    } else {
      taskObj.isDone = false;
      taskObj.reOpen();
      doneTaskListElement.removeChild(taskElement);
      openTaskListElement.appendChild(taskElement);
    }
    const mouseEvent = new Event('mouseout');
    taskElement.dispatchEvent(mouseEvent);
    backUpTasksToStorage();
  });
  task.html.addEventListener('keyup', () => {
    const key = event.key;
    if (key === 'Enter') {
      backUpTasksToStorage();
    }
  });
};

addTaskBtn.addEventListener('click', event => {
  const task = new Task({
    id: 'id_' + Math.random(),
    text: addTaskInput.value,
  });
  const taskElement = task.getHTML();
  addTaskEvents(task);
  openTaskListElement.appendChild(taskElement);
  sortElements();
  tasksMap.set(task.id, task);
  backUpTasksToStorage();
});

const removeFromTaskList = filter => {
  tasksMap.forEach((value, key) => {
    if (
      (value.isDone && filter === 'done') ||
      (!value.isDone && filter === 'open')
    ) {
      tasksMap.delete(key);
      value.html.remove();
    }
  });
  backUpTasksToStorage();
};

clearOpenList.addEventListener('click', () => removeFromTaskList('open'));
clearDoneList.addEventListener('click', () => removeFromTaskList('done'));

const updateFilterOptionElement = () => {
  openTaskFilter.value = curOptionOpenTask;
  doneTaskFilter.value = curOptionDoneTask;
};

const backUpFilterOption = () => {
  window.localStorage.setItem(
    filterOptionStorageId,
    JSON.stringify({ open: curOptionOpenTask, done: curOptionDoneTask }),
  );
};

const restoreFilterOption = () => {
  const options = JSON.parse(
    window.localStorage.getItem(filterOptionStorageId),
  );
  curOptionOpenTask = options ? options['open'] : 't-asc';
  curOptionDoneTask = options ? options['done'] : 't-asc';
  updateFilterOptionElement();
};

const backUpTasksToStorage = () => {
  window.localStorage.setItem(
    taskStorageId,
    JSON.stringify([...tasksMap.entries()]),
  );
};

const restoreTasksFromStorage = () => {
  const prevMap = JSON.parse(window.localStorage.getItem(taskStorageId));
  if (prevMap === null) return;
  const newMap = new Map(prevMap);
  newMap.forEach((value, key) => {
    const task = new Task(value);
    task.getHTML();
    addTaskEvents(task);
    tasksMap.set(key, task);
  });
  const tasks = splitTasksByStatus([...tasksMap.values()]);
  updateList(tasks[false], openTaskListElement);
  updateList(tasks[true], doneTaskListElement);
};

restoreFilterOption();
restoreTasksFromStorage();
