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

    this.id = parent ? ([parent.id, parent.children.length].join('-')) : 0;
    this.$node = null;
    this.$wrapper = null;
  }

  appendChild(data) {
    let child = new VTree(this, data);
    this.isFolder = true;
    this.children.push(child);
    return child;
  }

  removeNode() {
    let children = this.parent.children,
        index = children.indexOf(this),
        result = children.splice(index, 1).shift();
    if (!children.length) {
      this.parent.isFolder = false;
    }
    return result;
  }

  parentRender() {
    if (this.parent) {
      this.$node = document.createElement('li');
      this.$node.appendChild(document.createTextNode(this.data.name));
    }else{
      this.$wrapper = document.createElement('ul');
      this.$node = document.createElement('li');
      this.$wrapper.appendChild(this.$node);
    }

    if (this.children.length) {
      this.childrenRender();
    }
    return this.$node
  }

  childrenRender() {
      this.$wrapper = document.createElement('ul');
      for(let node in this.children) {
        this.$wrapper.appendChild(this.children[node].parentRender());
      }
      this.$node.appendChild(this.$wrapper);
  }

  render(element) {
    this.root.parentRender();
    element.innerHTML = '';
    element.appendChild(this.root.$wrapper);
  }

}