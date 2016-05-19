Object.prototype.extend = function(source) {
  for (var property in source)
    this[property] = source[property];
  return this;
};

Object.prototype.serialize = function() {
  var str = "",
      self = this;
  for (var key in self) {
    if (typeof self[key] != 'function') {
      if (str != "") {
        str += "&";
      }
      str += key + "=" + encodeURIComponent(self[key]);
    }
  }
  return str;
};

Element.prototype.hide = function() {
  this.style.display = 'none';
  return this;
};

Element.prototype.show = function() {
  this.style.display = '';
  return this;
};

Element.prototype.hasClass = function(className) {
  if (this.classList) {
    return this.classList.contains(className);
  } else {
    var newElementClass = ' ' + this.className + ' ',
        newClassName = ' ' + className + ' ';
    return newElementClass.indexOf(newClassName) !== -1;
  }
};

Element.prototype.addClass = function(className) {
  if (this.classList) {
    this.classList.add(className);
  } else {
    if (!this.hasClass(className)) this.className += " " + className
  }
  return this;
};

Element.prototype.removeClass = function(className) {
  if (this.classList) {
    this.classList.remove(className);
  } else {
    if (this.hasClass(className)) {
      var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
      this.className = this.className.replace(reg, ' ');
    }
  }
  return this;
};

Element.prototype.toggleClass = function(className) {
  if (this.hasClass(className)) {
    this.removeClass(className);
  } else {
    this.addClass(className);
  }
  return this;
};

Element.prototype.attr = function(attrName, attrValue) {
  this.setAttribute(attrName, attrValue);
  return this;
};

Element.prototype.setInnerHTML = function(html) {
  this.innerHTML = html;
  return this;
};

Element.prototype.append = function(node) {
  this.appendChild(node);
  return this;
};

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

    xhr.send(params ? params.serialize() : '');
  });
}
