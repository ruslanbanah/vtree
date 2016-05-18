const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var extend = require('node.extend');

var Node = require('./server/models/vnode');
const port = process.env.PORT || 8080;
const app = express();
const oneDay = 86400000;
const api = express.Router();

mongoose.connect('mongodb://localhost/vtree');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/app', {maxAge: oneDay}));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

/**
 * API
 */
api.route('/node/:node_id')
    .get(function(req, res) {
      Node.findById(req.params.node_id, function(err, node) {
        if (err)
          res.send(err);
        res.json(node);
      });
    })
    .put(function(req, res) {
      Node.findById(req.params.node_id, function(err, node) {

        if (err)
          res.send(err);

        node = extend(node, req.body);
        node.save(function(err) {
          if (err)
            res.send(err);

          res.json(node);
        });

      });
    })
    .delete(function(req, res) {
      //Remove children
      var removeChildren = function(parent_id) {
        Node.find({parent: parent_id}, function(err, nodes) {
          nodes.forEach(function(node) {
            removeChildren(node._id);
            Node.remove({
              _id: node._id
            }, function(err) {
              if (err)
                res.send(err);
            });
          });
        });
      };

      removeChildren(req.params.node_id);
      Node.remove({
        _id: req.params.node_id
      }, function(err, node) {
        if (err)
          res.send(err);

        res.json({success: true, message: 'Delete node.'});
      });
    });

api.route('/node/parent/:parent_id/children')
    .get(function(req, res) {
      Node.find({parent: req.params.parent_id}, function(err, node) {
        if (err)
          res.send(err);
        res.json(node);
      });
    });

api.route('/node')
    .post(function(req, res) {
      var node = new Node();

      node.name = req.body.name;
      node.href = req.body.href;
      node.parent = req.body.parent;
      node.isOpen = req.body.isOpen;
      node.icon = req.body.icon;

      node.save(function(err) {
        if (err)
          res.send(err);
        console.log(node);
        res.json(node);
      });
    })
    .get(function(req, res) {
      Node.find(function(err, nodes) {
        if (err)
          res.send(err);

        res.json(nodes);
      });
    });
//---------------------------------------

app.use('/api', api);
app.listen(port, function() {
  console.log('Server started: http://localhost:' + port + '/');
});