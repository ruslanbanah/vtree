'use strict';
const ARROW_RIGTH = 9658;
const ARROW_DOWN = 9660;
const POINT = 9899;

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

  appendNode(data) {
    let child = new VTree(this, data);

    this.children.push(child);
    this.template.$marker.setInnerHTML('&#' + ARROW_RIGTH + ';');
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
        .setInnerHTML('&#'+ POINT +';')
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
    this.template.$marker.setInnerHTML('&#' + ARROW_DOWN + ';')
        .parentNode
        .parentNode
        .parentNode
        .removeClass('cl');
  }

  close() {
    this.isOpen = false;
    this.template.$marker.setInnerHTML('&#' + ARROW_RIGTH + ';')
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
    let newNode = self.appendNode(),
        tpl = newNode.template;

    self.open();
    editor(tpl.$link, function(result) {
      http('POST', '/api/node', {name: result, parent: self._id, isOpen: self.isOpen}).then(function(res) {
        tpl.$link.text = newNode.name = res.name;
        newNode._id = res._id;
      });
    });
  }

  editNode() {
    let self = this,
        tpl = this.template;
    
    if (tpl.$link.style.display != 'none') {
      editor(tpl.$link, function(result) {
        http('PUT', '/api/node/' + self._id, {name: result, isOpen: self.isOpen}).then(function(res) {
          tpl.$link.text = self.name = res.name;
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
    elements[0].append(this.root.template.$wrapper);
  }

  fetch() {
    let self = this;
    http('GET', 'api/node').then(
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