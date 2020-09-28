// #region Used by dragAndDrop.js

var showLoader = () => {
  $("#loader-screen").removeClass("d-none");
  $("#loader-screen").addClass("d-flex");
};

var hideLoader = () => {
  $("#loader-screen").removeClass("d-flex");
  $("#loader-screen").addClass("d-none");
};

var setFileData = (file, id) => {
  const fr = new FileReader();

  fr.onload = (e) => {
    try {
      data = JSON.parse(e.target.result);
      const formattedData = JSON.stringify(data, null, 2);
      const currentTab = $("#data-drop-area").children(".active.show").attr("id");

      isDataLoaded = false;
      isSchemaLoaded = false;
      isTextareaLoaded = false;

      data = {};
      schema = {};

      if (currentTab === "data-JSON") {
        setData(data, "json");
        isDataLoaded = true;
      } else if (currentTab === "data-schema") {
        setSchema(data);
        isSchemaLoaded = true;
      } else {
        $("#" + id).val(formattedData);
        isTextareaLoaded = true;
      }
      hideLoader();
    } catch (err) {
      console.error(err);
      hideLoader();
      alert(err);
    }
  };

  fr.readAsText(file);
};
// #endregion

try {
  const generateMock = (harData = {}, resourceTypeFilters = [], callback) => {
    try {
      const entries = harData?.log?.entries || [];
      const resourceFilteredEntries = resourceTypeFilters.length ? entries.filter((e) => resourceTypeFilters.indexOf(e._resourceType) >= 0) : entries;
      const mimeTypeFilteredEntries = resourceFilteredEntries.filter(
        (e) => e?.response?.content?.mimeType === "application/json" || e?.response?.content?.mimeType === "text/plain"
      );
      const mock = mimeTypeFilteredEntries.reduce((result, entry) => {
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
      hideLoader();
      alert(err);
    }
  };

  const filterBySchema = (_data = {}, _schema = {}) => {
    if (isPlainObject(_data)) {
      const filteredObj = Object.entries(_data).reduce((result, [key, val]) => {
        const schemaKeys = Object.keys(_schema);
        if (schemaKeys.indexOf(key) >= 0) {
          if (isPlainObject(_schema[key])) {
            if (isPlainObject(val) || isArray(val)) {
              const value = filterBySchema(val, _schema[key]);
              if (!isEmpty(value)) {
                return { ...result, [key]: value };
              }
            } else {
              return result;
            }
          } else if (_schema[key] === true) {
            return { ...result, [key]: val };
          }
          return result;
        }
        return result;
      }, {});

      return filteredObj;
    } else if (isArray(_data)) {
      const filteredArray = _data.map((j) => filterBySchema(j, _schema)).filter((fa) => !isEmpty(fa));
      return filteredArray.length ? filteredArray : [];
    }
    return _data;
  };

  const setDownloadData = (mock) => {
    setData(mock, "mock");
    const formattedMock = JSON.stringify(mock, null, 2);
    $("#mockText").val(formattedMock);
    const dataStr = "data:text/jso;charset=utf-8," + encodeURIComponent(formattedMock);
    $("#download").attr("href", dataStr);
    $("#download").attr("download", "mock.json");
    $("#download").removeClass("d-none");
    $("#download").addClass("d-inline-block");
    hideLoader();
  };

  function onDataFileUploadHandler() {
    const filePath = $(this).val();
    if (!isEmpty(filePath)) {
      showLoader();
      $("#dataFileName").val(filePath);
      const file = document.getElementById("dataFile").files[0];
      console.log(file);
      setFileData(file, "data");
    } else {
      hideLoader();
    }
  }

  $(document).ready(function () {
    $("#data").val(JSON.stringify({}, null, 2));

    $("#dataFile").on("change", onDataFileUploadHandler);

    $("#filterData").on("click", () => {
      showLoader();

      setTimeout(() => {
        try {
          const mock = filterBySchema(data, schema);
          setDownloadData(mock);
          hideLoader();
        } catch (err) {
          console.error("Filter Error : ");
          console.error(err);
          hideLoader();
          alert("Filter Error : \n" + err);
        }
      }, 10);
    });

    $("#generateMock").on("click", () => {
      const dataStr = $("#data").val();
      showLoader();
      setTimeout(() => {
        try {
          const mock = generateMock(data, ["xhr", "document"]);
          setDownloadData(mock);
        } catch (err) {
          console.error("Generate Mock Error : ");
          console.error(err);
          hideLoader();
          alert("Generate Mock : \n" + err);
        }
      }, 10);
    });

    $("#data-Schema-tab").on("click", () => {
      if (!isSchemaLoaded) {
        showLoader();
        setTimeout(() => {
          setSchema(data);
          hideLoader();
          isSchemaLoaded = true;
        }, 10);
      }
    });

    $("#data-JSON-tab").on("click", () => {
      if (!isDataLoaded) {
        showLoader();
        setTimeout(() => {
          setData(data, "json");
          hideLoader();
          isDataLoaded = true;
        }, 10);
      }
    });

    $("#data-textarea-tab").on("click", () => {
      console.log("setting Textarea");
      if (!isTextareaLoaded) {
        showLoader();
        setTimeout(() => {
          const formattedData = JSON.stringify(data, null, 2);
          $("#data").val(formattedData);
          hideLoader();
        }, 10);
        isTextareaLoaded = true;
      }
    });

    $("#data").on("change", () => {
      try {
        schema = {};
        data = {};
        isDataLoaded = false;
        isSchemaLoaded = false;
        console.log("setting Data obj");
        const dataStr = $("#data").val();
        data = JSON.parse(dataStr);
      } catch {}
    });
  });
} catch (err) {
  console.error(err);
  hideLoader();
  alert(err);
}
