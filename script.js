$(document).ready(function () {

    const sample_schema = {
        log: {
            entries: {
                _resourceType: true,
                request: {
                    method: true,
                    url: true,
                    queryString: true,
                    postData: true
                },
                response: {
                    status: true,
                    content: {
                        text: true
                    }
                }
            }
        }
    }

    $("#data").val(JSON.stringify({}, null, 2))
    $("#schema").val(JSON.stringify(sample_schema, null, 2))

    const isPlainObject = (val) => {
        return typeof val === 'object' && !Array.isArray(val)
    }

    const isArray = (val) => {
        return Array.isArray(val)
    }

    const getValidRoute = (route) => {
        if (typeof route === 'object') return undefined;
        const validRoute = `${route}`.startsWith("/") ? `${route}` : "/" + route;
        return validRoute;
    };

    const transformHar = (harData = {}, filters = []) => {
        try {
            const entries = harData.log ? harData.log.entries ? harData.log.entries : [] : [];
            const xhrFiltered = entries.filter((e) => filters.indexOf(e._resourceType) >= 0);
            const statusFiltered = xhrFiltered.filter((x) => x.response.status >= 200 && x.response.status < 400);

            const mock = statusFiltered.reduce((result, data) => {
                const route = new URL(data.request.url).pathname;
                const valid_Route = getValidRoute(route);
                const responseText = data.response ?
                    data.response.content ?
                    data.response.content.text ?
                    data.response.content.text : "" : "" : "";

                let response;
                try {
                    response = JSON.parse(responseText);
                } catch {
                    response = responseText;
                }

                return {
                    ...result,
                    [valid_Route]: response,
                };
            }, {});

            return mock;
        } catch (err) {
            console.error(err.message);
        }
    };

    const filterBySchema = (data = {}, schema = {}) => {
        if (isPlainObject(data)) {
            const filteredObj = Object.entries(data).reduce((result, [key, val]) => {
                const schemaKeys = Object.keys(schema);
                if (schemaKeys.indexOf(key) >= 0) {
                    if (isPlainObject(schema[key])) {
                        if (isPlainObject(val)) {
                            return {
                                ...result,
                                [key]: filterBySchema(val, schema[key])
                            };
                        } else if (isArray(val)) {
                            return {
                                ...result,
                                [key]: filterBySchema(val, schema[key])
                            };
                        } else {
                            return result;
                        }
                    } else if (schema[key] === true) {
                        return {
                            ...result,
                            [key]: val
                        };
                    }
                    return result;
                }
                return result;
            }, {});

            return filteredObj;
        } else if (isArray(data)) {
            const filteredArray = data.map((j) => filterBySchema(j, schema)).filter((fa) => fa);
            return filteredArray.length ? filteredArray : [];
        }
        return data;
    };

    const setFileData = (file, id) => {
        const fr = new FileReader();

        fr.onload = (e) => {
            const result = JSON.parse(e.target.result);
            var formattedData = JSON.stringify(result, null, 2);
            $("#" + id).val(formattedData)
        }

        fr.readAsText(file);
    }


    $(document).delegate('textarea', 'keydown', function (e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode == 9) {
            e.preventDefault();
            var start = this.selectionStart;
            var end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            $(this).val($(this).val().substring(0, start) +
                "\t" +
                $(this).val().substring(end));

            // put caret at right position again
            this.selectionStart =
                this.selectionEnd = start + 1;
        }
    });

    $("#dataFile").on('change', function () {
        const filePath = $(this).val();
        $("#dataFileName").val(filePath);
        const file = document.getElementById("dataFile").files[0];
        setFileData(file, "data");
    })

    $("#schemaFile").on('change', function () {
        const filePath = $(this).val();
        $("#schemaFileName").val(filePath);
        const file = document.getElementById("schemaFile").files[0];
        setFileData(file, "schema");
    })

    $("#filterData").on('click', () => {
        const data = $("#data").val();
        const schema = $("#schema").val();
        const mock = filterBySchema(JSON.parse(data), JSON.parse(schema))
        setDownloadData(mock);
    })

    $("#generateMock").on('click', () => {
        const data = $("#data").val();
        const mock = transformHar(JSON.parse(data), ['xhr', "document"]);
        setDownloadData(mock);
    })

    const setDownloadData = (mock) => {
        const formattedMock = JSON.stringify(mock, null, 2);
        $("#generatedData").val(formattedMock);
        const dataStr = "data:text/jso;charset=utf-8," + encodeURIComponent(formattedMock);
        $("#download").attr("href", dataStr);
        $("#download").attr("download", "mock.json");
        $("#download").removeClass("d-none");
        $("#download").addClass("d-inline-block");
    }
});