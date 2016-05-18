'use strict';
const ARROW_RIGTH = 9658;
const ARROW_DOWN = 9660;

class VTree {
  constructor(parent, data) {
    this.sort = parent ? parent.children.length : 0;
    this._id = this.generateId(parent);
    this.isOpen = false;
    this.name = 'NoName';
    this.href = '';
    this.icon = '';
    this.root = parent ? parent.root : this;
    this.children = [];

    this.extend(data);

    this.parent = parent || null;
    this.template = {
      $node: null,
      $wrapper: null,
      $marker: null,
      $link: null
    };

    this.renderNode();
    this.events();

    this.render();
  }

  generateId(parent) {
    return parent ? ([parent._id, parent.children.length].join('-')) : '';
  }

  isRoot() {
    return !this.parent;
  }

  appendChild(data) {
    let child = new VTree(this, data);

    this.children.push(child);
    this.template.$marker.innerHTML = '&#' + ARROW_RIGTH + ';';
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
        name = document.createElement('a'),
        icon = document.createElement('img');

    this.template.$link = name;
    this.template.$marker = document.createElement('a');

    this.template.$marker.innerHTML = '&#9899;';
    this.template.$marker.setAttribute('href', '#');
    this.template.$marker.className = 'sc';
    p.appendChild(this.template.$marker);
    name.innerHTML = this.name;
    name.href = this.href;
    icon.src = this.icon;
    p.appendChild(icon);
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

  open() {
    this.isOpen = true;
    this.template.$marker.innerHTML = '&#' + ARROW_DOWN + ';';
    this.template.$marker.parentNode.parentNode.parentNode.className = '';
  }

  close() {
    this.isOpen = false;
    this.template.$marker.innerHTML = '&#' + ARROW_RIGTH + ';';
    this.template.$marker.parentNode.parentNode.parentNode.className = 'cl';
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  events() {
    let node = this,
        template = node.template,
        contextMenu = new ContextMenu([
          {name: 'Create', callback: this.createNode},
          {name: 'Edit', callback: this.editNode},
          {name: 'Delete', callback: this.removeNode}
        ]);

    template.$marker.addEventListener('click', (e) => {
      this.toggle();
    });

    template.$node.addEventListener('contextmenu', function(e) {
      e.stopPropagation();
      e.preventDefault();
      contextMenu.setPosition(e.clientX, e.clientY);
      contextMenu.show(node);
    });
  }

  createNode() {
    let self = this;
    let newNode = self.appendChild();

    self.open();
    editor(newNode.template.$link, function(result) {
      http('POST', '/api/node', {name: result, parent: self._id, isOpen: self.isOpen}).then(function(res) {
        newNode.template.$link.text = newNode.name = res.name;
        newNode._id = res._id;
      });
    });
  }

  editNode() {
    if (this.template.$link.style.display != 'none') {
      let self = this;
      editor(this.template.$link, function(result) {
        http('PUT', '/api/node/' + self._id, {name: result, isOpen: self.isOpen}).then(function(res) {
          self.template.$link.text = self.name = res.name;
        });

      });
    }
  }

  removeNode() {
    if (!confirm('Are you sure?')) {
      return false;
    }
    let self = this;
    http('DELETE', '/api/node/' + this._id).then(function(res) {
      let children = self.parent.children,
          index = children.indexOf(self),
          result = children.splice(index, 1).shift();
      result.template.$node.remove();
    });
  }

  render() {
    let elements = document.getElementsByClassName('vtree');
    elements[0].appendChild(this.root.template.$wrapper);
  }

  fetch() {
    let self = this;
    http('GET', 'api/node').then(
        function(res) {
          function children(tr, parent) {
            res.forEach(function(item) {
              if (item.parent == parent) {
                children(tr.appendChild(item), item._id);
              }
            });
          }

          if (res.length) {
            children(self, '');
          } else {
            self.createNode();
          }
        }
    );
  }
}