const departments = [
  { id: 100, name: 'Dept 1' },
  { id: 200, name: 'Dept 2' },
  { id: 300, name: 'Dept 3' },
];

const state = {
  // TODO: Remove this utility function
  show() {
    const exclude = ['show'];
    let line = `[STATE]
    last updated: ${new Date().toLocaleString()}
    ---
    data:`;

    for (const key in state)
      if (!exclude.includes(key))
        line += `\n${key}=${JSON.stringify(state[key], null, 2)}`;

    document.getElementById('debug-info').innerText = line;
  },

  personIdCounter: 0,
  editingInfo: null,
};

class Person {
  constructor(name, age, deptId) {
    if (!name) throw new Error('Person has no name');
    if (!age) throw new Error('Person has no age');
    if (deptId && !departments.find(d => d.id === deptId))
      throw new Error('Invalid department id: ' + deptId);

    this.name = name;
    this.age = age;
    this.deptId = deptId; /* can be null */
  }

  toString() {
    return `${this.name} of ${this.age} years`;
  }
}

const personRecords = [
  {
    id: ++state.personIdCounter,
    person: new Person('Ram', 29, 200),
  },
  {
    id: ++state.personIdCounter,
    person: new Person('Shyam', 22),
  },
  {
    id: ++state.personIdCounter,
    person: new Person('Jodu', 24, 100),
  },
  {
    id: ++state.personIdCounter,
    person: new Person('Modu', 21),
  },
];

const removeContent = (id = 'div-content') => {
  const node = document.getElementById(id);
  node?.parentNode?.removeChild(node);

  state.editingInfo = null;
};

const addPersonTableRow = ({ table, personId = null, person = null }) => {
  if (!personId) personId = ++state.personIdCounter;
  const trId = `tr-p${personId}`;
  const tr = createElement({
    type: 'tr',
    id: trId,
    ondblclick: () => editPerson(trId, personId),
  });

  [
    { id: `td-id-p${personId}`, value: personId },
    { id: `td-name-p${personId}`, value: person?.name || '' },
    { id: `td-age-p${personId}`, value: person?.age || 18 },
    {
      id: `td-dept-p${personId}`,
      value: departments.find(d => d.id === person?.deptId)?.name || 'None',
    },
  ].forEach(info =>
    tr.appendChild(
      createElement({
        id: info.id,
        type: 'td',
        text: info.value,
      })
    )
  );

  const tdCross = createElement({
    type: 'td',
    id: `td-delete-p${personId}`,
  });
  tdCross.className = 'td-buttons';
  tdCross.appendChild(
    createElement({
      type: 'img',
      id: `img-delete-${personId}`,
      alt: 'delete',
      height: 17,
      src: './resources/bin.png',
      onclick: () => deletePerson(personId),
    })
  );
  tr.appendChild(tdCross);

  table.appendChild(tr);

  /* enable editing mode if a new person is being added */
  if (!person) editPerson(trId, personId, true);
};

const addPerson = () => {
  if (state.editingInfo) {
    alert('Finish editing the other person first');
    return;
  }

  const table = document.getElementById('table-person');
  if (!table) {
    alert('Load table first');
    return;
  }

  addPersonTableRow({ table });
};

const updatePerson = data => {
  const item = personRecords.find(p => p.id === data.id);
  const deptId = departments.find(d => d.id === +data.deptId)?.id;

  if (item) item.person = new Person(data.name, data.age, deptId || null);
  else
    personRecords.push({
      id: data.id,
      person: new Person(data.name, data.age, deptId || null),
    });
};

const revertEditingPerson = (tr, personId) => {
  const person = personRecords.find(p => p.id === personId)?.person;

  /* in case of adding a new person, remove the whole row directly */
  if (!person) {
    tr.remove();
    state.editingInfo = null;
    return;
  }

  tr.childNodes.forEach(node => {
    if (node.id.startsWith('td-name-p')) node.innerText = person.name;
    else if (node.id.startsWith('td-age-p')) node.innerText = person.age;
    else if (node.id.startsWith('td-dept-p'))
      node.innerText = person.deptId
        ? departments.find(d => d.id === person.deptId)?.name || 'Unknown'
        : 'None';
    else if (node.id.startsWith('td-delete-p')) {
      const nodesToRemove = [];
      node.childNodes.forEach(childNode => {
        if (childNode.id.startsWith('img-delete-'))
          childNode.style = 'display: flex;';
        else if (childNode.id.startsWith('editing-'))
          nodesToRemove.push(childNode);
      });

      nodesToRemove.forEach(node => node.remove());
    }
  });

  state.editingInfo = null;
};

const editPerson = (trId, personId, adding = false) => {
  const tr = document.getElementById(trId);
  const updatedPersonValue = { id: personId };

  if (!state.editingInfo) {
    state.editingInfo = { personId, errors: {} };
  } else if (state.editingInfo.personId === personId) {
    return;
  } else if (state.editingInfo.personId !== personId) {
    alert('Finish editing the other person first');
    return;
  }

  let nameInput;

  tr.childNodes.forEach(node => {
    if (node.id.startsWith('td-name-p')) {
      updatedPersonValue.name = node.innerText;
      node.innerText = '';

      node.appendChild(
        (nameInput = createElement({
          type: 'input',
          id: `editing-${node.id}`,
          mode: 'text',
          value: updatedPersonValue.name,
          onchange: event => {
            if (event.target.value.match(/^[a-z ]{5,10}$/i)) {
              event.target.className = 'valid-input';
              delete state.editingInfo.errors['Name'];
              updatedPersonValue.name = event.target.value;
            } else {
              event.target.className = 'invalid-input';
              state.editingInfo.errors['Name'] = 'Invalid name';
            }
          },
        }))
      );
    } else if (node.id.startsWith('td-age-p')) {
      updatedPersonValue.age = node.innerText;
      node.innerText = '';

      node.appendChild(
        createElement({
          type: 'input',
          id: `editing-${node.id}`,
          mode: 'number',
          value: updatedPersonValue.age,
          min: 18,
          max: 60,
          onchange: event => {
            if (
              event.target.value &&
              +event.target.value >= 18 &&
              +event.target.value <= 60
            ) {
              delete state.editingInfo.errors['Age'];
              updatedPersonValue.age = event.target.value;
              event.target.className = 'valid-input';
            } else {
              state.editingInfo.errors['Age'] = 'Invalid age';
              event.target.className = 'invalid-input';
            }
          },
        })
      );
    } else if (node.id.startsWith('td-dept-p')) {
      updatedPersonValue.deptId =
        departments.find(d => d.name === node.innerText)?.id || 0;
      node.innerText = '';

      node.appendChild(
        createElement({
          type: 'select',
          id: `editing-${node.id}`,
          values: [{ id: 0, name: 'None' }, ...departments],
          value: updatedPersonValue.deptId,
          onchange: event => {
            updatedPersonValue.deptId = event.target.value;
          },
        })
      );
    } else if (node.id.startsWith('td-delete-p')) {
      node.childNodes[0].style = 'display: none;';

      node.appendChild(
        createElement({
          type: 'img',
          id: `editing-accept-${node.id}`,
          src: './resources/tick.png',
          alt: 'accept edit',
          height: 17,
          width: 17,
          onclick: () => {
            const errorLen = Object.keys(state.editingInfo.errors).length;
            let errorMessage;
            if (errorLen) {
              errorMessage = `${errorLen} error(s) in form:`;
              for (const key in state.editingInfo.errors)
                errorMessage += `\n${state.editingInfo.errors[key]}`;

              alert(errorMessage);
            } else {
              updatePerson(updatedPersonValue);
              state.editingInfo = null;

              loadPersonTable();

              document.getElementById(
                'label-status'
              ).innerText = `Person with ID ${personId} ${
                adding ? 'added' : 'updated'
              }`;
            }
          },
          className: 'edit-button',
        })
      );
      node.appendChild(
        createElement({
          type: 'img',
          id: `editing-decline-${node.id}`,
          src: './resources/cross.png',
          alt: 'decline edit',
          height: 15,
          width: 15,
          onclick: () => {
            if (confirm('Decline edit?')) revertEditingPerson(tr, personId);
          },
          className: 'edit-button',
        })
      );
    }
  });

  nameInput.focus();
};

const deletePerson = id => {
  if (confirm(`Delete person with ID ${id}?`)) {
    personRecords.splice(
      personRecords.findIndex(p => p.id === id),
      1
    );

    loadPersonTable();

    document.getElementById(
      'label-status'
    ).innerText = `Person with ID ${id} deleted`;
  }
};

const loadPersonTable = () => {
  removeContent();

  const contentDiv = createElement({ type: 'div', id: 'div-content' });

  const para = createElement({
    type: 'p',
    text: personRecords.length
      ? `Found ${personRecords.length} records`
      : 'No records found',
  });
  contentDiv.appendChild(para);

  if (personRecords.length) {
    const table = createElement({
      type: 'table',
      id: 'table-person',
      className: 'table',
    });

    const tr = createElement({ type: 'tr' });
    ['ID', 'Name', 'Age (in years)', 'Department'].forEach(title =>
      tr.appendChild(createElement({ type: 'th', text: title }))
    );
    table.appendChild(tr);

    personRecords.forEach(data =>
      addPersonTableRow({ table, personId: data.id, person: data.person })
    );

    contentDiv.appendChild(table);
  }

  document.getElementById('root').appendChild(contentDiv);
  document.getElementById('label-status').innerText =
    'Data loaded at ' + new Date().toLocaleString();
};

const clearContent = () => {
  removeContent();
  document.getElementById('label-status').innerText = 'Content cleared';
};

const clearInitiatingElements = () => {
  elementProps
    .filter(p => p.loadOnInit)
    .forEach(({ element }) => element.parentNode.removeChild(element));
};

const generateForm = () => {
  clearInitiatingElements();

  const fragment = document.createDocumentFragment();
  elementProps
    .filter(p => !p.loadOnInit)
    .forEach(prop => fragment.appendChild(createElement(prop)));
  document.getElementById('root').appendChild(fragment);
  document.getElementById('label-status').innerText = 'Form generated';
};

const elementProps = [
  /* intiating elements */
  {
    loadOnInit: true,
    type: 'button',
    id: 'button-generate_form',
    title: 'Generate Form',
    onclick: generateForm,
  },

  /* buttons */
  // TODO: Remove this, for debugging purpose only
  {
    type: 'button',
    id: 'button-show_state',
    title: 'Show State',
    onclick: state.show,
  },
  {
    type: 'button',
    id: 'button-fetch_data',
    title: 'Fetch',
    onclick: loadPersonTable,
  },
  {
    type: 'button',
    id: 'button-add_data',
    title: 'Add',
    onclick: addPerson,
  },
  {
    type: 'button',
    id: 'button-clear',
    title: 'Clear',
    onclick: clearContent,
  },

  /* labels */
  {
    type: 'label',
    id: 'label-status',
    sideInfo: 'Status',
  },
];

const createElement = prop => {
  let element;
  switch (prop.type) {
    case 'button':
      element = document.createElement('button');
      if (prop.id) element.id = prop.id;
      element.appendChild(document.createTextNode(prop.title));
      element.onclick = prop.onclick;
      element.className = 'button';
      break;

    case 'label':
      element = document.createElement('div');
      element.className = 'label-container';

      const infoLabel = document.createElement('span');
      infoLabel.innerText = prop.sideInfo;
      infoLabel.className = 'label-label';

      const label = document.createElement('span');
      label.id = prop.id;
      label.innerText = '-';
      label.className = 'label-data';

      element.appendChild(infoLabel);
      element.appendChild(label);
      break;

    case 'div':
    case 'p':
    case 'table':
    case 'tr':
    case 'th':
    case 'td':
      element = document.createElement(prop.type);
      if (prop.id) element.id = prop.id;
      if (prop.className) element.className = prop.className;
      else if (prop.type === 'tr' || prop.type === 'td' || prop.type === 'th')
        element.className = 'table-data';
      if (prop.text) element.innerText = prop.text;
      if (prop.ondblclick) element.ondblclick = prop.ondblclick;
      break;

    case 'img':
      element = document.createElement('img');
      if (prop.id) element.id = prop.id;
      element.src = prop.src;
      if (prop.alt) element.alt = prop.alt;
      if (prop.height) element.height = prop.height;
      if (prop.width) element.width = prop.width;
      if (prop.className) element.className = prop.className;
      if (prop.onclick) element.onclick = prop.onclick;
      break;

    case 'input':
      element = document.createElement('input');
      if (prop.id) element.id = prop.id;
      element.type = prop.mode;
      if (prop.min !== null && prop.min !== undefined) element.min = prop.min;
      if (prop.max !== null && prop.max !== undefined) element.max = prop.max;
      if (prop.value) element.value = prop.value;
      if (prop.onchange) element.onchange = prop.onchange;
      if (prop.className) element.className = prop.className;
      break;

    case 'select':
      element = document.createElement('select');
      if (prop.id) element.id = prop.id;
      if (prop.onchange) element.onchange = prop.onchange;
      prop.values.forEach(v => {
        const option = document.createElement('option');
        option.value = v.id;
        option.innerText = v.name;
        option.selected = prop.value === v.id;
        element.appendChild(option);
      });
      if (prop.className) element.className = prop.className;
      break;

    default:
      throw new Error('Invalid prop type: ' + prop.type);
  }

  return element;
};

const loadInitiatingElements = () => {
  const fragment = document.createDocumentFragment();
  elementProps
    .filter(p => p.loadOnInit)
    .forEach(prop => {
      prop.element = createElement(prop);
      fragment.appendChild(prop.element);
    });
  document.getElementById('root').appendChild(fragment);
};

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );

document.onload = setTimeout(loadInitiatingElements, 0);
