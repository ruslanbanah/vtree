'use strict';

function editor($el, callback) {
  let $edit = document.createElement('input');

  let blurEdit = function() {
    $el.style.display = 'block';
    $edit.remove();
  };

  let keyupEdit = function(e) {
    e.stopPropagation();
    if (e.keyCode == 27 || e.keyCode == 13) {
      let result = $edit.value;
      switch (e.keyCode) {
        case 13:
          callback(result);
          break;
      }
      $el.style.display = 'block';
      $edit.removeEventListener('blur', blurEdit);
      $edit.remove();
    }
  }
  $edit.className = 'editable';
  $el.style.display = 'none';
  $el.parentNode.appendChild($edit);
  $edit.value = $el.text;
  $edit.focus();
  $edit.select();

  $edit.addEventListener('keyup', (e) => {
    keyupEdit(e)
  }, false);
  $edit.addEventListener('blur', blurEdit, false);
} 