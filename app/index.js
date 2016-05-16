
var tree = new VTree();
var bob = tree.appendChild({name:"Bob", href:'/#'});

tree.appendChild({name: "Peter", href:'/#'}).appendChild({name: "Peter_m1", href:'/#'}).  appendChild({name: "Peter_m1_mm22", href:'/#'});
tree.appendChild({name: "Julia", href:'/#'});
tree.appendChild({name: "Susan", href:'/#'});
bob.appendChild({name: "Bob_m1", href:'/#'});
bob.appendChild({name: "Bob_m2", href:'/#'});
bob.appendChild({name: "Bom_m3", href:'/#'});

// tree.httpGetTree('tree.json');
