'use strict';
const ARROW_RIGHT = '&#9658;';
const ARROW_DOWN = '&#9660;';
const POINT = '&#9899;';
const apiURL = '/api/';

class VTree {
  constructor(parent, data) {
    this.sort = parent ? parent.children.length : 0;
    this._id = this._generateId(parent);
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
    this._events();

    this.render();
  }

  _generateId(parent) {
    return parent ? ([parent._id, parent.children.length].join('-')) : '';
  }

  isRoot() {
    return !this.parent;
  }

  appendNode(data) {
    let child = new VTree(this, data);

    this.children.push(child);
    this.template.$marker.setInnerHTML(ARROW_RIGHT);
    this.render();

    return child;
  }

  renderNode() {
    let tpl = this.template,
        parentTpl = this.parent ? this.parent.template : null;

    if (this.isRoot()) {
      tpl.$wrapper = document.createElement('ul').addClass(tree);
    }

    tpl.$node = document.createElement('li').addClass('cl');
    tpl.$link = document.createElement('a')
        .setInnerHTML(this.name)
        .attr('href', this.href);
    tpl.$marker = document.createElement('a')
        .setInnerHTML(POINT)
        .attr('href', '#')
        .addClass('sc');

    let icon = document.createElement('img')
            .attr('src', this.icon),
        p = document.createElement('p')
            .append(tpl.$marker)
            .append(icon)
            .append(tpl.$link),
        div = document.createElement('div')
            .append(p);

    tpl.$node.append(div);

    if (parentTpl) {
      if (!parentTpl.$wrapper) {
        parentTpl.$wrapper = document.createElement('ul');
        parentTpl.$node.append(parentTpl.$wrapper);
      }
      parentTpl.$wrapper.append(tpl.$node);
    }
  }

  open() {
    this.isOpen = true;
    this.template.$marker.setInnerHTML(ARROW_DOWN)
        .parentNode
        .parentNode
        .parentNode
        .removeClass('cl');
  }

  close() {
    this.isOpen = false;
    this.template.$marker.setInnerHTML(ARROW_RIGHT)
        .parentNode
        .parentNode
        .parentNode
        .addClass('cl');
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  _events() {
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

    template.$node.addEventListener('contextmenu', (e) => {
      e.stopPropagation();
      e.preventDefault();
      contextMenu.setPosition(e.clientX, e.clientY);
      contextMenu.show(node);
    });
  }

  createNode() {
    let newNode = this.appendNode(),
        tpl = newNode.template;

    this.open();
    editor(tpl.$link, (result) => {
      http('POST', apiURL + 'node', {name: result, parent: this._id, isOpen: this.isOpen}).then(function(res) {
        tpl.$link.text = newNode.name = res.name;
        newNode._id = res._id;
      });
    });
  }

  editNode() {
    let tpl = this.template;
    
    if (tpl.$link.style.display != 'none') {
      editor(tpl.$link, (result) => {
        http('PUT', apiURL + 'node/' + this._id, {name: result, isOpen: this.isOpen}).then((res) => {
          tpl.$link.text = this.name = res.name;
        });
      });
    }
  }

  removeNode() {
    if (!confirm('Are you sure?')) {
      return false;
    }

    http('DELETE', apiURL + 'node/' + this._id).then((res) => {
      let children = this.parent.children,
          index = children.indexOf(this),
          result = children.splice(index, 1).shift();
      result.template.$node.remove();
    });
  }

  render() {
    let elements = document.getElementsByClassName('vtree');
    elements[0].append(this.root.template.$wrapper);
  }

  fetch() {
    let self = this;
    http('GET', apiURL + 'node').then(
        function(res) {
          function children(tr, parent) {
            res.forEach(function(item) {
              if (item.parent == parent) {
                children(tr.appendNode(item), item._id);
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