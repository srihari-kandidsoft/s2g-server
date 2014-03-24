'use strict';

var mongoose = require('mongoose'),
  Neighborhood = mongoose.model('Neighborhood');

exports.get = function(req, res, next) {
  Neighborhood.find().exec(function(err, d) {
    var reply = {
      status: 'success',
      data: d
    };
    if (err) {
      res.status(400);
      reply.status = 'error';
      reply.message = err;
    }
    res.send(reply);
    next();
  });
};