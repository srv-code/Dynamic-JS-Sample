const departments = [
  { id: 100, name: 'Dept1' },
  { id: 200, name: 'Dept2' },
  { id: 300, name: 'Dept3' },
];

class Person {
  constructor(name, age, deptId) {
    if (!name) throw new Error('Person has no name');
    if (!age) throw new Error('Person has no age');
    if (deptId && !departments.find(d => d.id === deptId))
      throw new Error('Invalid department id: ' + deptId);

    this.name = name;
    this.age = age;
    this.deptId = deptId; // can be null
  }

  toString() {
    return `${this.name} of ${this.age} years`;
  }
}

const personData = [
  {
    id: Date.now(),
    person: new Person('Ram', 29, 200),
  },
  {
    id: Date.now(),
    person: new Person('Shyam', 22),
  },
  {
    id: Date.now(),
    person: new Person('Jodu', 24, 100),
  },
  {
    id: Date.now(),
    person: new Person('Modu', 24),
  },
];

const removeContent = (id = 'div-content') => {
  let div = document.getElementById(id);
  div?.parentNode?.removeChild(div);
};

const insertPersonData = () => {};

const updatePersonData = () => {};

const deletePersonData = () => {};

const loadPersonTable = () => {
  removeContent();

  const contentDiv = createElement({ type: 'div', id: 'div-content' });

  const editDiv = createElement({ type: 'div', className: 'div-edit' });
  [
    { title: 'Insert', onclick: insertPersonData },
    { title: 'Update', onclick: updatePersonData },
    { title: 'Delete', onclick: deletePersonData },
  ].forEach(button =>
    editDiv.appendChild(
      createElement({
        type: 'button',
        title: button.title,
        onclick: button.onclick,
      })
    )
  );
  contentDiv.appendChild(editDiv);

  const para = createElement({
    type: 'p',
    text: personData.length
      ? `Found ${personData.length} records`
      : 'No records found',
  });
  contentDiv.appendChild(para);

  if (personData.length) {
    const table = createElement({
      type: 'table',
      id: 'table-person',
      className: 'table',
    });

    const tr = createElement({ type: 'tr', className: 'table-data' });
    ['ID', 'Name', 'Age (in years)', 'Department'].forEach(title =>
      tr.appendChild(
        createElement({ type: 'th', className: 'table-data', text: title })
      )
    );
    table.appendChild(tr);

    personData.forEach(data => {
      const tr = createElement({ type: 'tr', className: 'table-data' });

      [
        data.id,
        data.person.name,
        data.person.age,
        departments.find(d => d.id === data.person.deptId)?.name || 'None',
      ].forEach(info =>
        tr.appendChild(
          createElement({ type: 'td', className: 'table-data', text: info })
        )
      );

      table.appendChild(tr);
    });

    contentDiv.appendChild(table);
  }

  document.body.appendChild(contentDiv);
  document.getElementById('label-status').innerText =
    'Data loaded at ' + new Date().toLocaleString();
};

const clearData = () => {
  removeContent();
  document.getElementById('label-status').innerText = 'Content cleared';
};

// const showData = () => {};

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
  document.body.appendChild(fragment);
  document.getElementById('label-status').innerText = 'Form generated';
};

const elementProps = [
  // intiating elements
  {
    loadOnInit: true,
    type: 'button',
    id: 'button-generate-form',
    title: 'Generate Form',
    onclick: generateForm,
  },

  // buttons elements
  {
    type: 'button',
    id: 'button-load-data',
    title: 'Load Data',
    onclick: loadPersonTable,
  },
  // {
  //   type: 'button',
  //   id: 'button-show-data',
  //   title: 'Show Data',
  //   onclick: showData,
  // },
  // {
  //   type: 'button',
  //   id: 'button-show-status',
  //   title: 'Show Status',
  //   onclick: showStatus,
  // },
  {
    type: 'button',
    id: 'button-clear',
    title: 'Clear',
    onclick: clearData,
  },

  // labels
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
      if (prop.text) element.innerText = prop.text;
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
  document.body.appendChild(fragment);
};

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );

document.onload = setTimeout(loadInitiatingElements, 0);
