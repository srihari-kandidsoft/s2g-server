'use strict';
var mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , logger = require('../logging').logger
  ;

exports.create = function (req, res, next) {
  var account = new Account({
    email: req.params.email,
    password: req.params.password
  });
  var reply = null;
  account.save( function (err) {
    if (err) {
      res.send(500, {
        status: 'error',
        message: err
      });
      return next();
    }
    res.send({
        status: 'success',
        data: {
          email: account.email,
          id: account.id
        }
      });
    return next();
  });
};