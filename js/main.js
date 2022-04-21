const departments = [
  { id: 100, name: 'Dept 1' },
  { id: 200, name: 'Dept 2' },
  { id: 300, name: 'Dept 3' },
];

/* state management */
const state = {
  personIdCounter: 0,
  editingPerson: null,
};

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
  let div = document.getElementById(id);
  div?.parentNode?.removeChild(div);
};

const addPerson = () => {};

const decodeHiddenRowValue = string => {
  const attrs = {};

  string.split(';').forEach(ln => {
    if (ln) {
      const [k, v] = ln.split('=');
      attrs[k] = v;
    }
  });

  return attrs;
};

const updatePerson = data => {
  const item = personData.find(p => p.id === data.id);
  const deptId = departments.find(d => d.id === data.deptId)?.id;

  if (item) item.person = new Person(data.name, data.age, deptId || null);
  else
    personData.push({
      id: ++state.personIdCounter,
      person: new Person(data.name, data.age, deptId || null),
    });

  console.log('updated person:', { personData, item, deptId, data });
};

const encodeHiddenRowValue = attrs => {
  let string = '';

  for (const key in attrs) string += `${key}=${attrs[key]};`;

  return string;
};

const editPerson = (trId, personId) => {
  // alert(`edit tr=${trId}, personId=${personId}`);
  const tr = document.getElementById(trId);
  const updatedPersonValue = { id: personId };
  let hiddenAttrs;
  if (tr.childNodes[0].id.startsWith('td-hidden-p'))
    hiddenAttrs = decodeHiddenRowValue(tr.childNodes[0].value);

  if (hiddenAttrs.mode === 'editing') return false;
  tr.childNodes.forEach(node => {
    console.log('node:', node);

    if (!node.id.startsWith('td-id-p')) {
      if (node.id.startsWith('td-hidden-p')) {
        hiddenAttrs.mode = 'editing';
        node.value = encodeHiddenRowValue(hiddenAttrs);
      } else if (node.id.startsWith('td-name-p')) {
        updatedPersonValue.name = node.innerText;
        node.innerText = '';

        node.appendChild(
          createElement({
            type: 'input',
            id: `editing-${node.id}`,
            mode: 'text',
            value: updatedPersonValue.name,
            onchange: event => {
              console.log(
                'value:',
                event.target.value,
                ', valid:',
                !!event.target.value.match(/^[a-z ]{5,10}$/i)
              );
              if (event.target.value.match(/^[a-z ]{5,10}$/i)) {
                event.target.className = 'valid-input';
                hiddenAttrs.error = '';
                tr.childNodes[0].value = encodeHiddenRowValue(hiddenAttrs);
                updatedPersonValue.name = event.target.value;
              } else {
                event.target.className = 'invalid-input';
                hiddenAttrs.error = 'Invalid name';
                tr.childNodes[0].value = encodeHiddenRowValue(hiddenAttrs);
              }
            },
            // onkeypress: event => {
            //   let value = event.target.value;
            //   if (event.key !== 'Enter') value += event.key;

            //   event.target.className =
            //     event.key === 'a' ? 'invalid-input' : 'valid-input';

            //   console.log(
            //     'onkeypress:',
            //     value,
            //     event,
            //     event.key,
            //     event.target.value,
            //     // document.getElementById(`editing-${node.id}`).value,
            //     'accept button:',
            //     document.getElementById(`editing_accept-${node.id}`)
            //   );
            // },
          })
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
                hiddenAttrs.error = '';
                tr.childNodes[0].value = encodeHiddenRowValue(hiddenAttrs);
                updatedPersonValue.age = event.target.value;
                event.target.className = 'valid-input';
              } else {
                hiddenAttrs.error = 'Invalid age';
                tr.childNodes[0].value = encodeHiddenRowValue(hiddenAttrs);
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
        console.log('delete img tr:', node, node.childNodes);
        node.childNodes[0].remove();

        // const wrapperDiv = createElement({
        //   type: 'div',
        //   id: `editing-${node.id}`,
        // });
        node.appendChild(
          createElement({
            type: 'img',
            id: `editing_accept-${node.id}`,
            src: './resources/tick.png',
            alt: 'accept edit',
            height: 17,
            width: 17,
            onclick: () => {
              if (hiddenAttrs.error)
                alert(
                  `Error in person data with ID ${personId}: ${hiddenAttrs.error}`
                );
              else {
                updatePerson(updatedPersonValue);

                hiddenAttrs.mode = 'show';
                hiddenAttrs.error = '';
                tr.childNodes[0].value = encodeHiddenRowValue(hiddenAttrs);

                loadPersonTable();

                document.getElementById(
                  'label-status'
                ).innerText = `Person with ID ${personId} updated`;
              }
            },
            className: 'edit-button',
          })
        );
        node.appendChild(
          createElement({
            type: 'img',
            id: `editing_decline-${node.id}`,
            src: './resources/cross.png',
            alt: 'decline edit',
            height: 15,
            width: 15,
            onclick: () => alert('decline edit'),
            className: 'edit-button',
          })
        );

        // node.appendChild(wrapperDiv);
      }
    }
  });
};

const deletePerson = id => {
  if (confirm(`Delete person with ID ${id}?`)) {
    personData.splice(
      personData.findIndex(p => p.id === id),
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

    const tr = createElement({ type: 'tr' });
    ['ID', 'Name', 'Age (in years)', 'Department'].forEach(title =>
      tr.appendChild(createElement({ type: 'th', text: title }))
    );
    table.appendChild(tr);

    personData.forEach(data => {
      const trId = `tr-p${data.id}`;
      const tr = createElement({
        type: 'tr',
        id: trId,
        ondblclick: () => editPerson(trId, data.id),
      });

      [
        {
          id: `td-hidden-p${data.id}`,
          hidden: true,
          value: 'mode=show;error=;',
        },
        { id: `td-id-p${data.id}`, value: data.id },
        { id: `td-name-p${data.id}`, value: data.person.name },
        { id: `td-age-p${data.id}`, value: data.person.age },
        {
          id: `td-dept-p${data.id}`,
          value:
            departments.find(d => d.id === data.person.deptId)?.name || 'None',
        },
      ].forEach(info =>
        tr.appendChild(
          createElement(
            (() => {
              const prop = { id: info.id };

              if (info.hidden) {
                prop.type = 'input';
                prop.mode = 'hidden';
                prop.value = info.value;
              } else {
                prop.type = 'td';
                prop.text = info.value;
              }

              return prop;
            })()
          )
        )
      );

      const tdCross = createElement({
        type: 'td',
        id: `td-delete-p${data.id}`,
      });
      tdCross.className = 'td-buttons';
      tdCross.appendChild(
        createElement({
          type: 'img',
          id: `img-delete-${data.id}`,
          alt: 'delete',
          height: 17,
          src: './resources/bin.png',
          onclick: () => deletePerson(data.id),
        })
      );
      tr.appendChild(tdCross);

      table.appendChild(tr);
    });

    contentDiv.appendChild(table);
  }

  document.body.appendChild(contentDiv);
  document.getElementById('label-status').innerText =
    'Data loaded at ' + new Date().toLocaleString();
};

const clearContent = () => {
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
    id: 'button-fetch-data',
    title: 'Fetch',
    onclick: loadPersonTable,
  },
  {
    type: 'button',
    id: 'button-add-data',
    title: 'Add',
    onclick: addPerson,
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
    onclick: clearContent,
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

    // case 'textbox':
    //   element = document.createElement('div');
    //   if (prop.id) element.id = prop.id;
    //   element.className = prop.className || 'textbox-container';

    //   const input = document.createElement('input');
    //   input.id = `input-text-${prop.id}`;
    //   input.type = 'text';
    //   input.value = prop.value;
    //   if (prop.onkeypress) element.onkeypress = prop.onkeypress;
    //   if (prop.onchange) element.onchange = prop.onchange;

    //   const img = document.createElement('img');
    //   img.id = `img-status-${prop.id}`;
    //   img.src = './resources/red-warn.png';
    //   img.height = 15;
    //   img.width = 15;
    //   img.alt = 'input-error';

    //   element.appendChild(input);
    //   element.appendChild(img);
    //   break;

    case 'input':
      element = document.createElement('input');
      if (prop.id) element.id = prop.id;
      element.type = prop.mode;
      if (prop.min !== null || prop.min !== undefined) element.min = prop.min;
      if (prop.max !== null || prop.max !== undefined) element.max = prop.max;
      if (prop.value) element.value = prop.value;
      // if (prop.onkeypress) element.onkeypress = prop.onkeypress;
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
  document.body.appendChild(fragment);
};

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );

document.onload = setTimeout(loadInitiatingElements, 0);
