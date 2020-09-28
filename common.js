var data = {};
var schema = {};
var isDataLoaded = false;
var isSchemaLoaded = false;
var isTextareaLoaded = false;

var isFunction = (val) => {
  return typeof val === "function";
};

var isPlainObject = (val) => {
  return typeof val === "object" && val !== null && !Array.isArray(val);
};

var isArray = (val) => {
  return Array.isArray(val);
};

var getValidRoute = (route) => {
  if (typeof route === "object") return undefined;
  const validRoute = `${route}`.startsWith("/") ? `${route}` : "/" + route;
  return validRoute;
};

var isEmpty = (val) => {
  if (typeof val === "string" && val.length === 0) return true;
  if (val === null) return true;
  if (val === undefined) return true;
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  if (typeof val === "object" && Array.isArray(val) && val.length === 0) return true;

  return false;
};

function setValue(obj, path, value) {
  var a = path.split(".");
  var o = obj;
  while (a.length - 1) {
    var n = a.shift();
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = value || {};
}
