const departments = [
  { id: 100, name: 'Dept1' },
  { id: 200, name: 'Dept2' },
  { id: 300, name: 'Dept3' },
];

class Person {
  constructor(name, age, deptId) {
    if (!name) throw new Error('Person has no name');
    if (!age) throw new Error('Person has no age');
    if (deptId && departments.find(d => deptId === d.id) === null)
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

const loadData = () => {
  removeContent();

  const contentDiv = document.createElement('div');
  contentDiv.id = 'div-content';

  const para = document.createElement('p');
  para.innerText = personData.length
    ? `Found ${personData.length} records`
    : 'No records found';
  contentDiv.appendChild(para);

  if (personData.length) {
    const table = document.createElement('table');
    table.id = 'table-person';
    table.className = 'table';

    const tr = document.createElement('tr');
    tr.className = 'table-data';
    ['ID', 'Name', 'Age (in years)', 'Department', 'Comment'].forEach(title => {
      let th = document.createElement('th');
      th.className = 'table-data';
      th.innerText = title;
      tr.appendChild(th);
    });
    table.appendChild(tr);

    personData.forEach(data => {
      const tr = document.createElement('tr');
      tr.className = 'table-data';

      [
        data.id,
        data.person.name,
        data.person.age,
        departments.find(d => d.id === data.person.deptId)?.name || 'None',
        data.person.toString(),
      ].forEach(info => {
        const td = document.createElement('td');
        td.className = 'table-data';
        td.innerText = info;
        tr.appendChild(td);
      });

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
  document.getElementById('label-status').innerText = 'All cleared';
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
    .forEach(prop => fragment.appendChild(generateElement(prop)));
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
    onclick: loadData,
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

const generateElement = prop => {
  let element;
  switch (prop.type) {
    case 'button':
      element = document.createElement('button');
      element.id = prop.id;
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
      prop.element = generateElement(prop);
      fragment.appendChild(prop.element);
    });
  document.body.appendChild(fragment);
};

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error })
  );

document.onload = setTimeout(loadInitiatingElements, 0);
