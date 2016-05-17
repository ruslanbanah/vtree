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

    this.template = {
      $node: null,
      $wrapper: null,
      $marker: null,
      $link: null
    };

    this.id = parent ? ([parent.id, parent.children.length].join('-')) : 0;

    this.renderNode();
    this.events();

    this.render();
  }

  isRoot() {
    return !this.parent;
  }

  appendChild(data) {
    let child = new VTree(this, data);

    this.isFolder = true;
    this.children.push(child);
    this.template.$marker.innerHTML = '&#9658;';
    this.render();

    return child;
  }

  renderNode() {
    if (this.isRoot()) {
      this.template.$wrapper = document.createElement('ul');
      this.template.$wrapper.className = 'tree';
    }

    this.template.$node = document.createElement('li');
    this.template.$node.className = 'cl';

    let tpl = document.createElement('div'),
        p = document.createElement('p'),
        name = document.createElement('a');
    this.template.$link = name;
    this.template.$marker = document.createElement('a');

    this.template.$marker.innerHTML = '&#9899;';
    this.template.$marker.setAttribute('href', '#');
    this.template.$marker.className = 'sc';
    p.appendChild(this.template.$marker);
    name.innerHTML = this.data.name;
    p.appendChild(name);
    tpl.appendChild(p);
    this.template.$node.appendChild(tpl);

    let parent = this.parent;
    if (parent) {
      if (!parent.template.$wrapper) {
        parent.template.$wrapper = document.createElement('ul');
        parent.template.$node.appendChild(parent.template.$wrapper);
      }
      parent.template.$wrapper.appendChild(this.template.$node);
    }
  }

  events() {
    let node = this,
        template = node.template,
        contextMenu = new ContextMenu([
          {name: 'Edit', callback: this.editNode},
          {name: 'Delete', callback: this.removeNode}
        ]);

    template.$marker.addEventListener('click', function(e) {
      let el = e.target;
      if (el.innerHTML.charCodeAt(0) == 9658) {
        el.innerHTML = '&#9660;';
        el.parentNode.parentNode.parentNode.className = '';
      } else {
        el.innerHTML = '&#9658;';
        el.parentNode.parentNode.parentNode.className = 'cl';
      }
    });

    template.$node.addEventListener('contextmenu', function(e) {
      e.stopPropagation();
      e.preventDefault();
      contextMenu.setPosition(e.clientX, e.clientY);
      contextMenu.show(node);
    });
  }

  editNode() {
    if (this.template.$link.style.display != 'none') {
      this.showEditor().then(
          (n) => {this.data.name=n.changes; this.template.$link.text=n.changes;},
          reject => console.log('Reject: ', reject)
      );
    }
  }

  showEditor() {
    var node = this;
    return new Promise(function(resolved, reject) {

      function blurEdit(e) {
        node.template.$link.style.display = 'block';
        edit.remove();
        reject(e);
      }

      function keyupEdit(e) {
        e.stopPropagation();
        let result = edit.value;

        if (e.keyCode == 27 || e.keyCode == 13) {
          switch (e.keyCode) {
            case 27:
              reject(e);
              break;
            case 13:
              resolved({node: node, changes: result});
              break;
          }
          node.template.$link.style.display = 'block';
          edit.removeEventListener('blur', blurEdit, false);
          edit.remove();
        }
      }

      let edit = document.createElement('input');
      edit.className = 'editable';
      node.template.$link.style.display = 'none';
      node.template.$link.parentNode.appendChild(edit);
      edit.value = node.template.$link.text;
      edit.focus();
      edit.select();

      edit.addEventListener('keyup', keyupEdit, false);
      edit.addEventListener('blur', blurEdit, false);

    });
  }

  removeNode() {
    if (!confirm('Are you sure?')) {
      return false;
    }
    let children = this.parent.children,
        index = children.indexOf(this),
        result = children.splice(index, 1).shift();
    if (!children.length) {
      this.parent.isFolder = false;
    }
    result.template.$node.remove();
    this.render();
    return result;
  }

  render() {
    let elements = document.getElementsByClassName('vtree');
    elements[0].appendChild(this.root.template.$wrapper);
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