'use strict';
class Node {
  constructor(parent, data) {
    this.id = parent ? ([parent.id, parent.children.length].join('-')) : 0;
    this.sort = parent ? parent.children.length : 0;
    this.data = data || {};
    this.parent = parent || null;
    this.$node = null;
    this.$wrapper = null;
    this.root = parent ? parent.root : this;
    this.children = [];
  }

  appendChild(data) {
    let child = new Node(this, data);
    this.children.push(child);
    return child;
  }

  removeNode(node) {
    if (node instanceof Node) {
      var children = node.parent.children;
      for(var i = 0; i < children.length; i++) {
        if (children[i] === node) {
          return children.splice(i, 1).shift();
        }
      }
      throw new Error("Invalid argument.");
    }
  }

  isRoot() {
    return !this.parent;
  }

  _render() {
    if (!this.parent) {
      let $children = document.createElement('ul');
      let $item = document.createElement('li');
      $children.appendChild($item);
      this.$wrapper = $children;
      this.$node = $item;
    }else{
      let $item = document.createElement('li');
      let $text = document.createTextNode(this.data.name);
      $item.appendChild($text);
      this.$node = $item;
    }

    if (this.children.length) {
      let $wrapper = document.createElement('ul');
      for(let node in this.children) {
        $wrapper.appendChild(this.children[node]._render());
      }
      this.$node.appendChild($wrapper);
      this.$wrapper = $wrapper;
    }
    return this.$node
  }

  render(element) {
    this.root._render();
    element.appendChild(this.root.$wrapper);
  }

}