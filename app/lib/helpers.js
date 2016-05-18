Object.prototype.extend = function(source) {
  for (var property in source)
    this[property] = source[property];
  return this;
};

function serialize(obj){
  var str = "";
  for (var key in obj) {
    if (typeof obj[key] != 'function') {
      if (str != "") {
        str += "&";
      }
      str += key + "=" + encodeURIComponent(obj[key]);
    }
  }
  return str;
}

function http(type, url, params) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(type, url, true);
    if (['POST', 'PUT'].indexOf(type) + 1) {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    xhr.onload = function() {
      if (this.status == 200) {
        resolve(JSON.parse(this.response));
      } else {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(JSON.parse(error));
      }
    };

    xhr.onerror = function() {
      reject(JSON.parse(new Error("Network Error")));
    };

    xhr.send(serialize(params));
  });
}
