'use strict';
class VTree {
  constructor(parent, data) {
    this.sort = parent ? parent.children.length : 0;
    this.isFolder = false;
    this.isOpen = false;
    this.data = data || {};
    this.parent = parent || null;
    this.root = parent ? parent.root : this;
    this.children = [];
    this.$wrapper = null;
    this.$node = null;

    this.id = parent ? ([parent.id, parent.children.length].join('-')) : 0;

    if (this.isRoot()) {
      this.$wrapper = document.createElement('ul');
    }

    this.render();
  }

  isRoot() {
    return !this.parent;
  }

  template(tpl, data) {
    var re = /<%([^%>]+)?%>/g, match;
    while (match = re.exec(tpl)) {
      tpl = tpl.replace(match[0], data[match[1]]);
    }
    return tpl;
  }

  appendChild(data) {
    let child = new VTree(this, data);

    this.isFolder = true;
    this.children.push(child);

    if (!this.$wrapper) {
      this.$wrapper = document.createElement('ul');
      this.$node.appendChild(this.$wrapper);
    }

    if (this.$node) {
      this.$node.addEventListener('click', function(e){
        e.stopPropagation();
        console.log(e.target);
        event.target.className = (event.target.className == 'close') ? 'open' : 'close';
      });

    }

    child.$node = document.createElement('li');
    child.$node.innerHTML = this.template('<%name%>', child.data);
    this.$wrapper.appendChild(child.$node);
    this.render();

    return child;
  }

  removeNode() {
    let children = this.parent.children,
        index = children.indexOf(this),
        result = children.splice(index, 1).shift();
    if (!children.length) {
      this.parent.isFolder = false;
    }
    result.$node.remove();
    this.render();
    return result;
  }

  render() {
    let element = document.getElementById('tree');
    element.appendChild(this.root.$wrapper);
  }

  http(type, url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(type, url, true);

      xhr.onload = function() {
        if (this.status == 200) {
          resolve(this.response);
        } else {
          var error = new Error(this.statusText);
          error.code = this.status;
          reject(error);
        }
      };

      xhr.onerror = function() {
        reject(new Error("Network Error"));
      };

      xhr.send();
    });
  }
  
  httpGetTree(url) {
    this.http('GET', url).then(
        response => console.log(response),
        reject => console.log(reject)
    );
  }
  
  }