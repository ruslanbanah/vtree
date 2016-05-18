'use strict';
let contextMenuInstance = null;

class ContextMenu {
  constructor(config) {
    if (!contextMenuInstance) {
      this.node = null;
      this.defaultConfig = [
        {name: 'Create', callback: (e) => console.log(arguments)},
        {name: 'Edit', callback: (e) => console.log(arguments)},
        {name: 'Delete', callback: (e) => console.log(arguments)},
        {name: 'Info', callback: (e) => console.log(arguments)}
      ];

      this.config = config || this.defaultConfig;
      this.createMenuItem = function(item) {
        let li = document.createElement('li');
        li.innerHTML = item.name;
        li.addEventListener('click', (e) => {
          this.hide();
          item.callback.apply(this.node, arguments);
        });
        this.ul.appendChild(li);
        return li;
      };

      this.contextMenu = document.createElement('div');
      this.ul = document.createElement('ul');

      this.li = this.config.map((item) => this.createMenuItem(item));

      this.contextMenu.id = 'contextMenu';
      this.contextMenu.appendChild(this.ul);
      document.body.appendChild(this.contextMenu);

      document.body.addEventListener('click', function() {
        contextMenuInstance.hide();
      });

      contextMenuInstance = this;
    }
    return contextMenuInstance;
  }

  show(node) {
    this.node = node;
    this.contextMenu.style.display = 'block';
  }

  hide() {
    this.contextMenu.style.display = 'none';
  }

  setPosition(left, top) {
    this.contextMenu.style.top = top + 'px';
    this.contextMenu.style.left = left + 'px';
  }
}