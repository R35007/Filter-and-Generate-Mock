const setSchema = (obj) => {
  console.log("setting schema");
  setSchemaObject(obj);
  const schemaForm = getSchemaForm(schema);
  document.getElementById("schema").innerHTML = schemaForm;
  onCheckboxChangeListener();
};

const setSchemaObject = (value, path = "") => {
  if (isArray(value)) {
    value.forEach((v) => {
      setSchemaObject(v, path);
    });
  } else if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, val]) => {
      const _path = isEmpty(path) ? key : `${path}.${key}`;
      setSchemaObject(val, _path);
    });
  } else {
    setValue(schema, path, false);
  }
};

const getSchemaForm = (value, _key = "") => {
  if (isPlainObject(value)) {
    return Object.entries(value).reduce((res, [key, val]) => {
      const id = !isEmpty(_key) ? _key + "." + key : key;
      if (isPlainObject(val) && !isEmpty(val)) {
        return res.concat(getSchemaObject(key, val, id));
      }
      return res.concat(schemaKeyValue(key, val, id));
    }, "");
  }
};

const getSchemaObject = (key, val, id) => {
  return `
    <div style="position: relative">
        <input type="checkbox" class="open d-none" id="${"schema_" + id}">
        <label class="handle" for="${"schema_" + id}"></label>
        <div class="m-2">
          <label for="${id}">${key}</label>
          ${getCheckBox(val, id)}
        </div>
        <div class="nested">
            ${getSchemaForm(val, id)}
        </div>
    </div>
  `;
};

const schemaKeyValue = (key, val, id) => {
  return `
          <div class="m-2">
            <label for="${id}">${key}</label>
            ${getCheckBox(val, id)}
          </div>
        `;
};

const getCheckBox = (val, id) => {
  if (val === true) {
    return `<input type="checkbox" checked class="filter" name="${id}" id="${id}" value="true"></input>`;
  }
  return `<input type="checkbox" class="filter" name="${id}" id="${id}" value="true"></input>`;
};

const onCheckboxChangeListener = () => {
  $(".filter").on("change", function () {
    console.log("Setting schema Value");
    const path = $(this).attr("id");
    const value = this.checked;
    setValue(schema, path, value);

    $(this).parent().parent().find(".nested .filter").prop("checked", this.checked);
    console.log(schema);
  });
};
