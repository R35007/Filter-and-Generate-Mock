try {
  const isFunction = (val) => {
    return typeof val === "function";
  };

  const isPlainObject = (val) => {
    return typeof val === "object" && !Array.isArray(val);
  };

  const isArray = (val) => {
    return Array.isArray(val);
  };

  const getValidRoute = (route) => {
    if (typeof route === "object") return undefined;
    const validRoute = `${route}`.startsWith("/") ? `${route}` : "/" + route;
    return validRoute;
  };

  const isEmpty = (val) => {
    if (typeof val === "string" && val.length === 0) return true;
    if (val === null) return true;
    if (val === undefined) return true;
    if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return true;
    if (typeof val === "object" && Array.isArray(val) && val.length === 0) return true;

    return false;
  };

  transformHar = (harData = {}, resourceTypeFilters = [], callback) => {
    try {
      const entries = harData?.log?.entries || [];
      const resourceFilteredEntries = resourceTypeFilters.length ? entries.filter((e) => resourceTypeFilters.indexOf(e._resourceType) >= 0) : entries;
      const mock = resourceFilteredEntries.reduce((result, entry) => {
        const route = new URL(entry?.request?.url).pathname;
        const valid_Route = getValidRoute(route);
        const responseText = entry?.response?.content?.text || "";

        let response;
        try {
          response = JSON.parse(responseText);
        } catch {
          response = responseText;
        }

        let obj = { [valid_Route]: response };

        if (isFunction(callback)) {
          obj = callback(entry, valid_Route, response);
        }

        return {
          ...result,
          ...obj,
        };
      }, {});

      const valid_Mock = Object.entries(mock).reduce((res, [key, val]) => ({ ...res, [getValidRoute(key)]: val }), {});

      return valid_Mock;
    } catch (err) {
      console.log(err);
      alert(err);
    }
  };

  filterBySchema = (data = {}, schema = {}) => {
    if (isPlainObject(data)) {
      const filteredObj = Object.entries(data).reduce((result, [key, val]) => {
        const schemaKeys = Object.keys(schema);
        if (schemaKeys.indexOf(key) >= 0) {
          if (isPlainObject(schema[key])) {
            if (isPlainObject(val)) {
              return { ...result, [key]: filterBySchema(val, schema[key]) };
            } else if (isArray(val)) {
              return { ...result, [key]: filterBySchema(val, schema[key]) };
            } else {
              return result;
            }
          } else if (schema[key] === true) {
            return { ...result, [key]: val };
          }
          return result;
        }
        return result;
      }, {});

      return filteredObj;
    } else if (isArray(data)) {
      const filteredArray = data.map((j) => filterBySchema(j, schema)).filter((fa) => !isEmpty(fa));
      return filteredArray.length ? filteredArray : [];
    }
    return data;
  };

  $(document).ready(function () {
    const sample_schema = {
      log: {
        entries: {
          _resourceType: true,
          request: {
            method: true,
            url: true,
            queryString: true,
            postData: true,
          },
          response: {
            status: true,
            content: {
              text: true,
            },
          },
        },
      },
    };

    $("#data").val(JSON.stringify({}, null, 2));
    $("#schema").val(JSON.stringify(sample_schema, null, 2));

    const setFileData = (file, id) => {
      const fr = new FileReader();

      fr.onload = (e) => {
        const result = JSON.parse(e.target.result);
        var formattedData = JSON.stringify(result, null, 2);
        $("#" + id).val(formattedData);
        $("#loader-screen").removeClass("d-flex");
        $("#loader-screen").addClass("d-none");
      };

      fr.readAsText(file);
    };

    $(document).delegate("textarea", "keydown", function (e) {
      var keyCode = e.keyCode || e.which;

      if (keyCode == 9) {
        e.preventDefault();
        var start = selectionStart;
        var end = selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

        // put caret at right position again
        selectionStart = selectionEnd = start + 1;
      }
    });

    $("#dataFile").on("change", function () {
      $("#loader-screen").removeClass("d-none");
      $("#loader-screen").addClass("d-flex");
      const filePath = $(this).val();
      $("#dataFileName").val(filePath);
      const file = document.getElementById("dataFile").files[0];
      setFileData(file, "data");
    });

    $("#schemaFile").on("change", function () {
      const filePath = $(this).val();
      $("#schemaFileName").val(filePath);
      const file = document.getElementById("schemaFile").files[0];
      setFileData(file, "schema");
    });

    $("#filterData").on("click", () => {
      const data = $("#data").val();
      const schema = $("#schema").val();
      const mock = filterBySchema(JSON.parse(data), JSON.parse(schema));
      setDownloadData(mock);
    });

    $("#generateMock").on("click", () => {
      const data = $("#data").val();
      const mock = transformHar(JSON.parse(data), ["xhr", "document"]);
      setDownloadData(mock);
    });

    const setDownloadData = (mock) => {
      const formattedMock = JSON.stringify(mock, null, 2);
      $("#generatedData").val(formattedMock);
      const dataStr = "data:text/jso;charset=utf-8," + encodeURIComponent(formattedMock);
      $("#download").attr("href", dataStr);
      $("#download").attr("download", "mock.json");
      $("#download").removeClass("d-none");
      $("#download").addClass("d-inline-block");
    };
  });
} catch (err) {
  console.log(err);
  alert(err);
}
