"use strict";

var Neighborhood = require('../model/neighborhood.js')
  , restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  ;

module.exports = function(server) {
  // server.use(restify.bodyParser());
  // server.use(restifyValidation.validationPlugin({errorsAsArray: false}));  
  server.get({
    url: '/v0/neighborhoods',
    swagger: {
      summary: 'Page through the neighborhoods',
      notes: 'Pagination api needed!',
      nickname: 'getNeighborhoods'
    },
    validation: {
        // email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        // password: { isRequired: true, scope: 'query', description: 'A new password for your account.'}
    }
  }, function(req, res, next) {
    Neighborhood.find().exec(function(err, d) {
      var reply = {
        status: 'success',
        data: d
      };
      if (err) {
        reply.status = 'error';
        reply.message = err;
      }
      res.send(reply);
      next();
    });
  });
};