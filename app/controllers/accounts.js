'use strict';
var mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , logger = require('../logging').logger
  ;

exports.create = function(req, res, next) {
  var account = new Account({
    email: req.params.email,
    password: req.params.password
  });
  var reply = null;
  account.save(function(err) {
    if (err) {
      reply = {
        status: 'error',
        message: err
      };
      res.status(500);
    } else {
      reply = {
        status: 'success',
        data: {
          email: account.email,
          id: account.id
        }
      };
    }
    res.send(reply);
    return next();
  });
};