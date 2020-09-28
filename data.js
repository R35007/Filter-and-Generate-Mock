const setData = (data, id) => {
  console.log("setting data");
  const jsonForm = switchValueType(data, id);
  document.getElementById(id).innerHTML = jsonForm;
};

const switchValueType = (val, _id) => {
  if (isArray(val)) {
    return iterateArray(val, _id);
  } else if (isPlainObject(val)) {
    return iterateObject(val, _id);
  } else {
    return keyValue(key, val);
  }
};

const iterateArray = (arr, _key, _id) => {
  return arr.reduce((res, val, i) => {
    const id = !isEmpty(_key) ? `${_key}[${i}]` : `[${i}]`;
    if (isPlainObject(val)) {
      return res.concat(getObject(`[${i}]`, val, id, _id));
    } else if (isArray(val)) {
      return res.concat(getArray(`[${i}]`, val, id, _id));
    }
    return res.concat(keyValue(`[${i}]`, val));
  }, "");
};

const iterateObject = (data, _key, _id) => {
  return Object.entries(data).reduce((res, [key, val]) => {
    const id = !isEmpty(_key) ? _key + "." + key : key;
    if (isArray(val)) {
      return res.concat(getArray(key, val, id, _id));
    } else if (isPlainObject(val)) {
      return res.concat(getObject(key, val, id, _id));
    }
    return res.concat(keyValue(key, val));
  }, "");
};

const getObject = (key, val, id, _id) => {
  return `
    <div style="position: relative">
        <input type="checkbox" class="open d-none" id="${_id + id}">
        <label class="handle" for="${_id + id}"></label>
        <div class="m-2">
          <label>${key}</label><label class="count">{${Object.entries(val).length}}</label>
        </div>
        <div class="nested">
            ${iterateObject(val, id)}
        </div>
    </div>
  `;
};

const getArray = (key, val, id, _id) => {
  return `
        <div style="position: relative">
          <input type="checkbox" class="open d-none" id="${_id + id}">
          <label class="handle" for="${_id + id}"></label>
          <div class="m-2">
            <label>${key}</label><label class="count">[${val.length}]</label>
          </div>
          <div class="nested">
              ${iterateArray(val, id)}
          </div>
        </div>
        `;
};

const keyValue = (key, val) => {
  return `
            <div class="m-2">
                <label class="key">${key}</label> : <label class="val">${val}</label>
            </div>
          `;
};
