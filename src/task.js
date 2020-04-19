export default class Task {
  constructor({
    id,
    text = '',
    isDone = false,
    createdDate = new Date(),
    resolvedDate = null,
  }) {
    this.id = id;
    this.text = text;
    this.isDone = isDone;
    this.createdDate = new Date(createdDate);
    this.resolvedDate = resolvedDate ? new Date(resolvedDate) : null;
  }

  finish = () => {
    this.isDone = true;
    this.resolvedDate = new Date();
    this.timeTable.appendChild(this.createTimeTableRow(this.resolvedDate));
  };

  reOpen = () => {
    this.isDone = false;
    this.resolvedDate = null;
    this.timeTable.lastChild.remove();
  };

  updateText = newText => {
    this.text = newText;
  };

  getTimeStr = time => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  createTimeTableRow = time => {
    const timeRow = document.createElement('li');
    timeRow.textContent = this.getTimeStr(time);
    return timeRow;
  };

  getHTML = () => {
    const newElement = document.createElement('li');
    newElement['taskId'] = this.id;

    const wrapper = document.createElement('div');
    wrapper.classList.add('d-flex', 'justify-content-between');
    newElement.appendChild(wrapper);

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group-text';

    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = this.isDone;
    this.checkBox = checkBox;
    inputGroup.appendChild(checkBox);
    wrapper.appendChild(inputGroup);

    const textElement = document.createElement('div');
    textElement.classList.add('text');
    this.innerDiv = textElement;
    textElement.innerText = this.text;
    wrapper.appendChild(textElement);

    const innerTextarea = document.createElement('textarea');
    innerTextarea.classList.add('form-control');
    innerTextarea.style.display = 'none';
    this.innerTextarea = innerTextarea;
    wrapper.appendChild(innerTextarea);

    const timeTable = document.createElement('ul');
    timeTable.className = 'task-time-list';
    this.timeTable = timeTable;
    const timeTableCreatedDateRow = this.createTimeTableRow(this.createdDate);
    timeTable.appendChild(timeTableCreatedDateRow);
    if (this.resolvedDate) {
      const timeTableResolvedDateRow = this.createTimeTableRow(
        this.resolvedDate,
      );
      timeTable.appendChild(timeTableResolvedDateRow);
    }
    wrapper.appendChild(timeTable);

    const trashIcon = document.createElement('i');
    this.trashIcon = trashIcon;
    trashIcon.classList.add('fa', 'fa-trash');
    wrapper.appendChild(trashIcon);

    newElement.addEventListener('mouseover', () => {
      trashIcon.style.display = 'block';
      timeTable.classList.add('delete-icon-show');
    });

    newElement.addEventListener('mouseout', () => {
      trashIcon.style.display = 'none';
      timeTable.classList.remove('delete-icon-show');
    });

    newElement.addEventListener('dblclick', () => {
      this.innerTextarea.value = this.innerDiv.innerText;
      this.innerDiv.style.display = 'none';
      this.innerTextarea.style.display = 'block';
    });

    newElement.addEventListener('keyup', event => {
      const key = event.key;
      if (key === 'Enter') {
        return (() => {
          const newText = this.innerTextarea.value;
          this.innerTextarea.value = '';
          this.updateText(newText);
          this.innerDiv.innerText = newText;
          this.innerTextarea.style.display = 'none';
          this.innerDiv.style.display = 'block';
        })();
      } else if (key === 'Escape') {
        return (() => {
          this.innerDiv.style.display = 'block';
          this.innerTextarea.style.display = 'none';
        })();
      }
    });
    this.html = newElement;
    return newElement;
  };
}
