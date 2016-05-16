
var tree = new Node();

var bob = tree.appendChild({name:"Bob"});
tree.appendChild({name: "Peter"}).appendChild({name: "Peter_m1"});
tree.appendChild({name: "Julia"});
tree.appendChild({name: "Susan"});
bob.appendChild({name: "Bob_m1"});
bob.appendChild({name: "Bob_m2"});
bob.appendChild({name: "Bom_m3"});

let div = document.getElementById('tree');
tree.render(div);